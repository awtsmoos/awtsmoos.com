/*B"H*/
/*B"H*/
import {
    createElement
} from "/scripts/awtsmoos/ui/basic.js"
import myStyles from "./styles.js";
import {
    loadFiles,
    importFiles
} from  "/os/helpers/scripts.js"
export default ({
    os,
    path,
    title,
    system
} = {}) => {
    
    path = path + "/" + title;
    var self = {
        div: createFileExplorer()
    }
    
    function createFileExplorer () {
        // Main container
        const container = createElement({
            tag: "div",
            attributes: { class: "file-explorer" },
        });

        // Header with menu
        const header = createElement({
            tag: "div",
            attributes: { class: "file-explorer-header" },
            children: [
                { tag: "button", html: "New File", on: { click: async () => {
                    const name = prompt("Enter file name:");
                    if (name) {
                        await os.createFile({ path, title: name, content:`//B"H
                        `});
                        await os.showFilesAtPath({ path, holder: body });
                    }
                    populateSidebar();
                }}},
                { tag: "button", html: "New Folder", on: { click: async () => {
                    const name = prompt("Enter folder name:");
                    if (name) {
                        await os.createFolder({ path, title: name });
                        await os.showFilesAtPath({ path, holder: body });
                    }
                    populateSidebar();
                }}},
                { tag: "button", html: "New Window", on: { click: () => {
                    os.addWindow({ title: "File Explorer", content: createFileExplorer(), path, os });
                }}},
                { tag: "button", html: "Import Files", on: { click: async () => {
                    await importFiles({
                        os,
                        path
                    })
                }}}
            ]
        });

        // Sidebar for folders
        const sidebar = createElement({
            tag: "div",
            attributes: { class: "file-explorer-sidebar" },
        });

        const populateSidebar = async () => {
            var parentPath = path;
            var parentElement = sidebar
            const items = await os.db.getAllKeys(parentPath);
            parentElement.innerHTML = "";
            items.forEach(item => {
                const folderItem = createElement({
                    tag: "div",
                    attributes: { class: "folder-item" },
                    children: [
                        { tag: "span", html: item, on: { click: async () => {
                            await os.showFilesAtPath({ path: `${parentPath}/${item}`, holder: body });
                        }}}
                    ]
                });
                parentElement.appendChild(folderItem);
            });
        };

        // Main body for files
        const body = createElement({
            tag: "div",
            attributes: { class: "file-explorer-body" },
        });
        body.appendChild(header);
        // Show files in the main body
        os.showFilesAtPath({ path, holder: body });
        container.appendChild(sidebar);
        // Append all sections to container
        
        
        container.appendChild(body);

        // Populate the sidebar
        populateSidebar();

        return container;
    };

    // Add CSS dynamically
    const style = document.createElement("style");
    style.innerHTML = myStyles
    document.head.appendChild(style);

    return self;
};
