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

    // Add folder-specific or file-specific actions
    if (isFolder) {
        actions['Open folder in Advanced Editor'] = () => {
            const folderInfo = { osPath: `${path}/${title}`, osFolderName: title };
            os.addWindow({ title, content: folderInfo, os, programName: 'advancedCodeEditor' });
        };
    } else {
        actions['Open with...'] = () => {
            os.addWindow({
                title: `Open ${title} with...`,
                content: { filePath: path, fileTitle: title },
                os,
                programName: 'openWithSelector'
            });
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