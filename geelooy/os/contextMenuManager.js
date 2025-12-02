/**
 * Creates and displays a context menu for a file or folder.
 */
export async function showContextMenu({ os, event, path, title, isFolder, onRefresh, onOpen, onEnterSelectionMode }) {
    event.preventDefault();
    event.stopPropagation();

    const existingMenu = document.querySelector(".contextMenu");
    if (existingMenu) existingMenu.remove();

    const fullPath = path === '/' ? title : `${path}/${title}`;

    const actions = {
        Select: () => {
            if (onEnterSelectionMode) onEnterSelectionMode();
        },
        Open: async () => {
	        if (isFolder) {
	            // If we have a specific way to open (like navigating current explorer), use it
	            if (onOpen) {
	                onOpen();
	            } else {
	                // Otherwise open a new Explorer window
	                os.addWindow({
	                    title: title,
	                    path: fullPath,
	                    os: os,
	                    programName: 'awtsmoosFileExplorer'
	                });
	            }
	        } else {
	            // It is a file, read content and open
	            const content = await os.db.Laynin(path, title);
	            os.addWindow({ title, content, path, os });
	        }
	    },
    };
    
    // Helper function for creating the public URL
	const getPublicUrl = () => {
	    if (!window.curAlias) {
	        alert("Not logged in with an alias!"); 
	        return null;
	    }
	    return `${location.origin}/api/social/aliases/${window.curAlias}/fileSystem/readFile?${new URLSearchParams({ path: fullPath })}`;
	};

    if (isFolder) {
	     actions['Open in New Window'] = () => {
            os.addWindow({
                title: title,
                path: fullPath, 
                os: os,
                programName: 'awtsmoosFileExplorer'
            });
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
                alert("Public URL copied to clipboard!");
            }
        };
    }

    // --- RENAME ---
    actions.Rename = async () => {
        const newName = prompt(`Rename ${title} to:`, title);
        if (newName && newName !== title) {
            try {
                const oldP = path === '/' ? title : `${path}/${title}`;
                const newP = path === '/' ? newName : `${path}/${newName}`;
                
                await os.db.rename(oldP, newP);
                
                // Refresh logic
                if (onRefresh) onRefresh(); 
                else os.showFilesAtPath({ path: os.currentPathForRefresh || 'desktop.folder' });
            } catch (e) {
                alert("Rename failed: " + e.message);
            }
        }
    };

    // --- CUT (Move) ---
    actions.Cut = () => {
        // Store intent in OS clipboard
        os.clipboard = {
            action: 'cut',
            path: fullPath, // Source path
            name: title
        };
        
        // Refresh immediately to apply the .cut-ghost CSS class
        if (onRefresh) onRefresh(); 
    };

    // --- DELETE ---
    actions.Delete = async () => {
        if (confirm(`Are you sure you want to delete ${title}?`)) {
            await os.db.deleteFile(path, title); 
            
            // Refresh logic
            if (onRefresh) onRefresh(); 
            else os.showFilesAtPath({ path: os.currentPathForRefresh || 'desktop.folder' });
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
 * Used for background clicks (Paste).
 */
export function showGenericContextMenu({ event, menuItems, os, currentPath, onRefresh }) {
    event.preventDefault();
    event.stopPropagation();

    const existingMenu = document.querySelector(".contextMenu");
    if (existingMenu) existingMenu.remove();

    // Add Paste option if something is in clipboard and we have context
    if (os && os.clipboard && (os.clipboard.path || os.clipboard.paths) && currentPath) {
        menuItems.set(`Paste (${os.clipboard.action})`, async () => {
            
            // Handle multiple sources from 'paths'
            const sources = os.clipboard.paths || [os.clipboard.path];
            let successCount = 0;
            let errors = [];

            for (const src of sources) {
                if (!src) continue;
                
                const fileName = src.split('/').pop();
                const dest = currentPath === '/' ? fileName : `${currentPath}/${fileName}`;
                
                // Prevent moving to self
                if (src === dest) continue;

                try {
                    if (os.clipboard.action === 'cut') {
                        await os.db.move(src, dest);
                        successCount++;
                    }
                    // Future 'copy' logic here
                } catch (innerErr) {
                    console.error(innerErr);
                    errors.push(fileName);
                }
            }

            if (os.clipboard.action === 'cut' && errors.length === 0) {
                // Clear clipboard only if all moved successfully
                os.clipboard = { action: null, path: null, paths: null, name: null };
            }

            if (errors.length > 0) {
                alert(`Failed to paste: ${errors.join(', ')}`);
            }

            // Refresh view immediately
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