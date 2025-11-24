// B"H
// FILE: /Remember/awtsmoos.com/geelooy/os/contextMenuManager.js

/**
 * Creates and displays a context menu for a file or folder.
 * This is the single source of truth for all context menus in the OS.
 * @param {object} options - Configuration for the menu.
 * @param {AwtsmoosOS} options.os - The main OS instance.
 * @param {MouseEvent} options.event - The original click event.
 * @param {string} options.path - The path of the item's parent folder.
 * @param {string} options.title - The name of the item (file or folder).
 * @param {boolean} options.isFolder - True if the item is a folder.
 */
export async function showContextMenu({ os, event, path, title, isFolder }) {
    event.preventDefault();
    event.stopPropagation();

    // Clean up any previously existing menu
    const existingMenu = document.querySelector(".contextMenu");
    if (existingMenu) existingMenu.remove();

    const actions = {
        Open: async () => {
            const content = await os.db.Laynin(path, title);
            os.addWindow({ title, content, path, os });
        },
    };
    
    
    const fullPath = `${path}/${title}`;

	// Helper function for creating the public URL
	const getPublicUrl = () => {
	    // This check ensures the user is logged in
	    if (!window.curAlias) {
	        alert("Not logged in with an alias!"); // Using alert as a simple notification
	        return null;
	    }
	    return `${location.origin}/api/social/aliases/${window.curAlias}/fileSystem/readFile?${new URLSearchParams({ path: fullPath })}`;
	};
	
	
    // Add folder-specific or file-specific actions
    if (isFolder) {
	     actions['Open in New Window'] = () => {
        os.addWindow({
            title: title,
            path: `${path}/${title}`, // The full path to the folder
            os: os,
            programName: 'awtsmoosFileExplorer'
        });
    };
        actions['Open folder in Advanced Editor'] = () => {
            const folderInfo = { osPath: `${path}/${title}`, osFolderName: title };
            os.addWindow({ title, content: folderInfo, os, programName: 'advancedCodeEditor' });
        };
    } else {
        actions['Open with...'] = () => {
	    // Get the real file extension from the original file's title
	    const fileExtension = title.substring(title.lastIndexOf('.'));
	
	    os.addWindow({
	        title: `Open ${title} with...`,
	        content: { filePath: path, fileTitle: title },
	        os,
	        programName: 'openWithSelector',
	        extension: fileExtension // <-- PASS THE REAL EXTENSION HERE
	    });
	};
        
        actions['Open in New Tab'] = () => {
	    const publicUrl = getPublicUrl();
	    if (publicUrl) {
	        window.open(publicUrl);
	    }
	};
	
	actions['Copy Public URL'] = async () => {
	    const publicUrl = getPublicUrl();
	    if (publicUrl) {
	        await navigator.clipboard.writeText(publicUrl);
	        alert("Public URL copied to clipboard!");
	    }
	};

    }

    // Add universal actions
    actions.Rename = async () => { /* ... rename logic ... */ };
    actions.Copy = async () => { /* ... copy logic ... */ };
    actions.Delete = async () => {
        if (confirm(`Are you sure you want to delete ${title}?`)) {
            await os.db.deleteFile(path, title); // Note: Assumes a unified delete method
            // The OS needs to refresh the view where this happened.
            // This is a simple way; a more robust system might use events.
            os.showFilesAtPath({ path: os.currentPathForRefresh || 'desktop.folder' });
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
	
	// Add the Cancel button
	const cancelItem = document.createElement("div");
	cancelItem.className = "menuItem";
	cancelItem.textContent = "Cancel";
	cancelItem.onclick = () => menu.remove(); // Simply remove the menu
	menu.appendChild(cancelItem);

    menu.style.left = `${event.pageX}px`;
    menu.style.top = `${event.pageY}px`;
    document.getElementById("desktop")?.appendChild?.(menu);

    // Add a one-time listener to close the menu when clicking elsewhere
    const closeHandler = () => {
        menu.remove();
        document.removeEventListener('click', closeHandler);
    };
    setTimeout(() => document.addEventListener('click', closeHandler), 0);
}


/**
 * Creates and displays a generic context menu from a map of actions.
 * @param {object} options - Configuration for the menu.
 * @param {MouseEvent} options.event - The original click event.
 * @param {Map<string, function>} options.menuItems - A map where keys are labels and values are onClick functions.
 */
export function showGenericContextMenu({ event, menuItems }) {
    event.preventDefault();
    event.stopPropagation();

    // Clean up any previously existing menu
    const existingMenu = document.querySelector(".contextMenu");
    if (existingMenu) existingMenu.remove();

    const menu = document.createElement("div");
    menu.className = "contextMenu";

    // Create menu items from the provided map
    menuItems.forEach((action, label) => {
        const menuItem = document.createElement("div");
        menuItem.className = "menuItem";
        menuItem.textContent = label;
        menuItem.onclick = () => {
            menu.remove();
            action(); // Execute the action
        };
        menu.appendChild(menuItem);
    });
    
    const separator = document.createElement("div");
	separator.style.height = "1px";
	separator.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
	separator.style.margin = "5px 0";
	menu.appendChild(separator);
	
	// Add the Cancel button
	const cancelItem = document.createElement("div");
	cancelItem.className = "menuItem";
	cancelItem.textContent = "Cancel";
	cancelItem.onclick = () => menu.remove(); // Simply remove the menu
	menu.appendChild(cancelItem);
	

    menu.style.left = `${event.pageX}px`;
    menu.style.top = `${event.pageY}px`;
    document.body.appendChild(menu);

    // Add a one-time listener to close the menu when clicking elsewhere
    const closeHandler = () => {
        menu.remove();
        document.removeEventListener('click', closeHandler);
    };
    setTimeout(() => document.addEventListener('click', closeHandler), 0);
}
