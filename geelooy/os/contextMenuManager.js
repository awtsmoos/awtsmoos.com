/**
 * Creates and displays a context menu for a file or folder.
 */
import System from "./system.js";

export async function showContextMenu({ os, event, path, title, isFolder, onRefresh, onOpen, onEnterSelectionMode }) {
    event.preventDefault();
    event.stopPropagation();
    
    // Ensure we have a system instance for the UI
    const sys = new System({ os }); 

    const existingMenu = document.querySelector(".contextMenu");
    if (existingMenu) existingMenu.remove();

    const fullPath = path === '/' ? title : `${path}/${title}`;

    const actions = {
        Select: () => {
            if (onEnterSelectionMode) onEnterSelectionMode();
        },
        Open: async () => {
            if (isFolder) {
                if (onOpen) onOpen();
                else os.addWindow({ title: title, path: fullPath, os: os, programName: 'awtsmoosFileExplorer' });
            } else {
                const content = await os.db.Laynin(path, title);
                os.addWindow({ title, content, path, os });
            }
        },
    };
    
    const getPublicUrl = () => {
        if (!window.curAlias) {
            sys.makeToast("Not logged in with an alias!", "error");
            return null;
        }
        return `${location.origin}/api/social/aliases/${window.curAlias}/fileSystem/readFile?${new URLSearchParams({ path: fullPath })}`;
    };

    if (isFolder) {
        actions['Open in New Window'] = () => {
            os.addWindow({ title: title, path: fullPath, os: os, programName: 'awtsmoosFileExplorer' });
        };
        actions['Open folder in Advanced Editor'] = () => {
            const folderInfo = { osPath: fullPath, osFolderName: title };
            os.addWindow({ title, content: folderInfo, os, programName: 'advancedCodeEditor' });
        };
    } else {
        actions['Open with...'] = () => {
            const fileExtension = title.substring(title.lastIndexOf('.'));
            os.addWindow({
                title: `Open ${title} with...`,
                content: { filePath: path, fileTitle: title },
                os,
                programName: 'openWithSelector',
                extension: fileExtension 
            });
        };
        
        actions['Open in New Tab'] = () => {
            const publicUrl = getPublicUrl();
            if (publicUrl) window.open(publicUrl);
        };
    
        actions['Copy Public URL'] = async () => {
            const publicUrl = getPublicUrl();
            if (publicUrl) {
                await navigator.clipboard.writeText(publicUrl);
                sys.makeToast("Public URL copied to clipboard!", "success");
            }
        };
    }

   

    
    
     // --- COPY (Duplicate) ---
    actions.Copy = () => {
        os.clipboard = { action: 'copy', path: fullPath, name: title };
        sys.makeToast(`Copied "${title}"`, "info");
    };

    // --- CUT (Move) ---
    actions.Cut = () => {
        os.clipboard = { action: 'cut', path: fullPath, name: title };
        sys.makeToast(`Cut "${title}"`, "info");
        if (onRefresh) onRefresh(); 
    };
    
    // --- RENAME (Custom Prompt) ---
    actions.Rename = async () => {
        // Use the new System Prompt
        const newName = await sys.prompt(`Rename ${title} to:`, title);
        
        if (newName && newName !== title) {
            try {
                const oldP = path === '/' ? title : `${path}/${title}`;
                const newP = path === '/' ? newName : `${path}/${newName}`;
                
                await os.db.rename(oldP, newP);
                sys.makeToast(`Renamed to "${newName}"`, "success");
                
                if (onRefresh) onRefresh(); 
                else os.showFilesAtPath({ path: os.currentPathForRefresh || 'desktop.folder' });
            } catch (e) {
                sys.makeToast("Rename failed: " + e.message, "error");
            }
        }
    };

    // --- DELETE (Custom Confirm) ---
    actions.Delete = async () => {
        const confirmed = await sys.confirm(`Are you sure you want to delete ${title}?`);
        if (confirmed) {
            try {
                await os.db.deleteFile(path, title); 
                sys.makeToast(`Deleted "${title}"`, "success");
                
                if (onRefresh) onRefresh(); 
                else os.showFilesAtPath({ path: os.currentPathForRefresh || 'desktop.folder' });
            } catch(e) {
                sys.makeToast("Delete failed: " + e.message, "error");
            }
        }
    };

    const menu = document.createElement("div");
    menu.className = "contextMenu";
    Object.keys(actions).forEach(actionName => {
        const menuItem = document.createElement("div");
        menuItem.className = "menuItem";
        menuItem.textContent = actionName;
        menuItem.onclick = async () => {
            menu.remove();
            await actions[actionName]();
        };
        menu.appendChild(menuItem);
    });
    
   
   
    const separator = document.createElement("div");
    separator.style.height = "1px";
    separator.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
    separator.style.margin = "5px 0";
    menu.appendChild(separator);
    
    const cancelItem = document.createElement("div");
    cancelItem.className = "menuItem";
    cancelItem.textContent = "Cancel";
    cancelItem.onclick = () => menu.remove(); 
    menu.appendChild(cancelItem);

    menu.style.left = `${event.pageX}px`;
    menu.style.top = `${event.pageY}px`;
    document.body.appendChild(menu); 

    const closeHandler = () => {
        menu.remove();
        document.removeEventListener('click', closeHandler);
    };
    setTimeout(() => document.addEventListener('click', closeHandler), 0);
}

/**
 * Creates and displays a generic context menu from a map of actions.
 */
export function showGenericContextMenu({ event, menuItems, os, currentPath, onRefresh }) {
    event.preventDefault();
    event.stopPropagation();
    const sys = new System({ os });

    const existingMenu = document.querySelector(".contextMenu");
    if (existingMenu) existingMenu.remove();

    if (os && os.clipboard && (os.clipboard.path || os.clipboard.paths) && currentPath) {
        menuItems.set(`Paste (${os.clipboard.action})`, async () => {
            const sources = os.clipboard.paths || [os.clipboard.path];
            let successCount = 0;
            let errors = [];

            for (const src of sources) {
                if (!src) continue;
                const fileName = src.split('/').pop();
                const dest = currentPath === '/' ? fileName : `${currentPath}/${fileName}`;
                
                if (src === dest) continue;

                try {
                    if (os.clipboard.action === 'cut') {
                        await os.db.move(src, dest);
                        successCount++;
                    } else if (os.clipboard.action === 'copy') {
                        await os.db.copy(src, dest);
                        successCount++;
                    }
                } catch (innerErr) {
                    console.error(innerErr);
                    errors.push(fileName);
                }
            }

            if (os.clipboard.action === 'cut' && errors.length === 0) {
                os.clipboard = { action: null, path: null, paths: null, name: null };
            }

            if (successCount > 0) sys.makeToast(`Pasted ${successCount} item(s)`, "success");
            if (errors.length > 0) sys.makeToast(`Failed to paste: ${errors.join(', ')}`, "error");

            if (onRefresh) onRefresh();
        });
    }

    const menu = document.createElement("div");
    menu.className = "contextMenu";

    menuItems.forEach((action, label) => {
        const menuItem = document.createElement("div");
        menuItem.className = "menuItem";
        menuItem.textContent = label;
        menuItem.onclick = () => {
            menu.remove();
            action();
        };
        menu.appendChild(menuItem);
    });
    
    // ... Separator and Cancel ...
    const separator = document.createElement("div");
    separator.style.height = "1px";
    separator.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
    separator.style.margin = "5px 0";
    menu.appendChild(separator);
    
    const cancelItem = document.createElement("div");
    cancelItem.className = "menuItem";
    cancelItem.textContent = "Cancel";
    cancelItem.onclick = () => menu.remove();
    menu.appendChild(cancelItem);

    menu.style.left = `${event.pageX}px`;
    menu.style.top = `${event.pageY}px`;
    document.body.appendChild(menu);

    const closeHandler = () => {
        menu.remove();
        document.removeEventListener('click', closeHandler);
    };
    setTimeout(() => document.addEventListener('click', closeHandler), 0);
}