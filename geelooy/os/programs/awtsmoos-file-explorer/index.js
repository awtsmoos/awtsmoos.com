/*B"H*/
/*B"H*/
import {
    createElement
} from "/scripts/awtsmoos/ui/basic.js"
export default ({
    os,
    path,
    system
} = {}) => {
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
                        await os.createFile({ path, title: name });
                        await os.showFilesAtPath({ path, holder: body });
                    }
                }}},
                { tag: "button", html: "New Folder", on: { click: async () => {
                    const name = prompt("Enter folder name:");
                    if (name) {
                        await os.createFolder({ path, title: name });
                        await os.showFilesAtPath({ path, holder: body });
                    }
                }}},
                { tag: "button", html: "New Window", on: { click: () => {
                    os.addWindow({ title: "File Explorer", content: createFileExplorer(), path, os });
                }}},
                { tag: "button", html: "Toggle View", on: { click: () => {
                    body.classList.toggle("list-view");
                }}}
            ]
        });

        // Sidebar for folders
        const sidebar = createElement({
            tag: "div",
            attributes: { class: "file-explorer-sidebar" },
        });

        const populateSidebar = async (parentPath, parentElement) => {
            const items = await os.db.getAllKeys(parentPath);
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

        // Show files in the main body
        os.showFilesAtPath({ path, holder: body });

        // Append all sections to container
        container.appendChild(header);
        container.appendChild(sidebar);
        container.appendChild(body);

        // Populate the sidebar
        populateSidebar(path, sidebar);

        return container;
    };

    // Add CSS dynamically
    const style = document.createElement("style");
    style.innerHTML = /*css*/`
        .file-explorer {
            display: flex;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, #1e3c72, #2a5298);
            font-family: Arial, sans-serif;
            color: #fff;
        }

        .file-explorer-header {
            display: flex;
            gap: 10px;
            padding: 10px;
            background: rgba(0, 0, 0, 0.8);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
        }

        .file-explorer-header button {
            background: #4caf50;
            color: #fff;
            border: none;
            border-radius: 4px;
            padding: 10px 15px;
            cursor: pointer;
            font-weight: bold;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .file-explorer-header button:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
        }

        .file-explorer-sidebar {
            width: 200px;
            padding: 10px;
            background: rgba(0, 0, 0, 0.6);
            overflow-y: auto;
        }

        .folder-item {
            margin: 5px 0;
            cursor: pointer;
            padding: 5px;
            border-radius: 4px;
            transition: background 0.2s;
        }

        .folder-item:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        .file-explorer-body {
            flex-grow: 1;
            padding: 10px;
            overflow-y: auto;
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }

        .file-explorer-body.list-view {
            flex-direction: column;
        }

        .file-item {
            background: #3e64ff;
            padding: 10px;
            border-radius: 4px;
            color: white;
            cursor: pointer;
            transition: transform 0.2s, background 0.3s;
        }

        .file-item:hover {
            background: #567bff;
            transform: translateY(-3px);
        }
    `;
    document.head.appendChild(style);

    return self;
};
