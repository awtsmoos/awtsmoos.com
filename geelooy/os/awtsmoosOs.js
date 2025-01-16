//B"H
import AwtsmoosDB from "/ai/IndexedDBHandler.js";
import WindowHandler from "./windowHandler.js";
import osStyles from "./styles/os-base.js";
console.log(`B"H


`)
export default class AwtsmoosOS {
    constructor() {
         
        this.windowHandler = new WindowHandler(); 
        
        this.db = new AwtsmoosDB();
        window.os = this;
    }

    async start() {
        var utils = await import("/scripts/awtsmoos/api/utils.js")
        var k = Object.keys(utils)
        k.forEach(q => {
            window[q] = utils[q]
        })
        await this.db.init("awtsmoos-os");
        this.makeDesktop();
        await this.showFilesAtPath({
            path: "desktop"
        });    
        this.listeners()
    }

    listeners() {
        // Add event listener to close the menu if clicking elsewhere
        window.addEventListener("click", () => {
            const existingMenu = document.querySelector(".contextMenu");
            if (existingMenu) existingMenu.remove();
        });
    }
    addWindow(...args) {
        this.windowHandler.addWindow(...args)
    }

    async createFile(path, title, content="") {
        await this.db.Koysayv(path, title, content);
        await this.showFilesAtPath({
            path
        });
    }

    async createFolder(path, title) {
        await this.db.Koysayv(path, title+".folder", content);
        await this.showFilesAtPath({
            path
        });
    }

    makeDesktop() {
        if(!window.madeDesk) {
            window.madeDesk = "BH-"+Date.now();
            
            this.md = window.madeDesk;
            var sty = document.createElement("style");
            document.head.appendChild(sty);
            sty.innerHTML = osStyles(this.md);
        }
    }

    getDesktop() {
         
        var desk = document.querySelector(".desktop");
        this.desktop = desk;
        return desk;
    }

    async onFileClick({
        path,
        title,
        event
    }) {
        
        // Prevent default behavior
        event.preventDefault();
        // Remove any existing context menus
        const existingMenu = document.querySelector(".contextMenu");
        if (existingMenu) existingMenu.remove();
    
        // Create the context menu
        const menu = document.createElement("div");
        menu.className = "contextMenu";
    
        // Define menu options with actions
        const actions = {
            Open: async () => {
                const content = await this.db.Laynin(path, title);
                this.addWindow({ title, content, path, os: this });
            },
            Rename: async () => {
                const newName = prompt("Enter new name:", title);
                if (newName) {
                    await this.db.renameFile(path, title, newName);
                    await this.showFilesAtPath({
                        path
                    });
                }
            },
            Copy: async () => {
                const copyName = `${title}_copy`;
                await this.db.Koysayv(path, copyName, await this.db.Laynin(path, title));
                await this.showFilesAtPath({
                    path
                });
            },
            Delete: async () => {
                if (confirm(`Are you sure you want to delete ${title}?`)) {
                    await this.db.deleteFile(path, title);
                    await this.showFilesAtPath({
                        path
                    });;
                }
            }
        };
    
        // Create menu items dynamically from actions
        Object.keys(actions).forEach(action => {
            const menuItem = document.createElement("div");
            menuItem.className = "menuItem";
            menuItem.textContent = action;
            menuItem.onclick = async () => {
                menu.remove(); // Remove the menu after an option is clicked
                await actions[action]();
            };
            menu.appendChild(menuItem);
        });
    
        // Position the menu at the mouse location
        menu.style.left = `${event.pageX}px`;
        menu.style.top = `${event.pageY}px`;
        document.body.appendChild(menu);
    }
 
    async renderFile({
        path, 
        fileHolder,
        title
    } = {}) {
        var f = document.createElement("div");
        if(title.endsWith(".folder")) {
            f.className = "folder"
        } else {
            f.className = "file"
        }
        var icon = document.createElement("div")
        icon.className = "icon"
        f.appendChild(icon);

        var nm = document.createElement("div")
        nm.textContent = title;
        nm.className = "fileName";
        f.appendChild(nm);

        f.onclick = async (event) => {
            
            await this.onFileClick({
                path,
                title,
                event
            })
        };
        
        

        fileHolder.appendChild(f);
    }

    async showFilesAtPath({
        path,
        holder
    }) {
        if(path == "desktop") {
            holder = this.getDesktop();
        }
        if(!holder) return;
        if(this.desktop) {
            this.desktop.classList.add(this.md)
        }
        var fileArea = holder.querySelector(".fileHolder")
        if(!fileArea) {
            fileArea = document.createElement("div")
            fileArea.className="fileHolder"
            holder.appendChild(fileArea);
        }
        fileArea.innerHTML = "";
        var gotFiles = await this.db.getAllKeys(path);
        console.log(gotFiles)
        gotFiles.forEach(w => {
            this.renderFile({
                path,
                fileHolder: fileArea,
                title: w
            })
        })
    }
    
}
