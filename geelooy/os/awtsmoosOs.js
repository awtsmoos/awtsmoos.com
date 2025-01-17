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
        window.addEventListener("click", (e) => {
            if(!hasParentWithProperty(e.target, 
                "awtsmoosFile",
                true
            )) {
                window.clickedMenu = 0;
              
                const existingMenu = document.querySelector(".contextMenu");
                if (existingMenu) existingMenu.remove();
            }
           
        });
    }
    addWindow(...args) {
        this.windowHandler.addWindow(...args)
    }

    async createFile({path, title, content=""}) {
        await this.db.Koysayv(path, title, content);
        await this.showFilesAtPath({
            path
        });
    }

    async createFolder({path, title}) {
        await this.db.Koysayv(path, title+".folder", "");
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
        if(!window.clickedMenu) {
            window.clickedMenu = 0;
        }
        window.clickedMenu++;
        
        // Prevent default behavior
        event.preventDefault();
       
    
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

        // Remove any existing context menus
        const existingMenu = document.querySelector(".contextMenu");
        if (existingMenu) existingMenu.remove()

        if(window.clickedMenu > 1) {
            await actions.Open();
            window.clickedMenu  = 0;
            return;
        }


         
     
         // Create the context menu
         const menu = document.createElement("div");
         menu.className = "contextMenu";

    
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
        f.awtsmoosFile = true;
        f.classList.add("awtsmoosIcon")
        var isFolder = false;
        var adjustedTitle = title
        if(title.endsWith(".folder")) {
            f.classList.add("folder")
            isFolder = true;
            adjustedTitle = title.substring
                (0, title.length - ".folder".length)
        } else {
            f.classList.add("file")
        }
        var icon = document.createElement("div")
        icon.className = "icon"
        f.appendChild(icon);

        var nm = document.createElement("div")
        nm.textContent = adjustedTitle;

        if(isFolder) {
            nm.className = "folderName"
        } else
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
        gotFiles = sortFoldersFirst(gotFiles);
        console.log(gotFiles)
        gotFiles.forEach(w => {
            this.renderFile({
                path,
                fileHolder: fileArea,
                title: w
            })
        });

        makeDraggable(".awtsmoosIcon");
    }
    
}

function makeDraggable(selector) {
    document.querySelectorAll(selector).forEach(div => {
        let isDragging = false;
        let startX, startY, initialX, initialY;
        let placeholder;
    
        div.addEventListener('mousedown', (e) => {
            // Prevent text selection
            e.preventDefault();
    
            // Record the starting position of the mouse
            isDragging = false;
            startX = e.clientX;
            startY = e.clientY;
    
            // Get the current position of the element
            const rect = div.getBoundingClientRect();
            initialX = rect.left + window.scrollX;
            initialY = rect.top + window.scrollY;
    
            const createPlaceholder = () => {
                placeholder = document.createElement('div');
                placeholder.classList.add('placeholder');
                placeholder.style.width = `${rect.width}px`;
                placeholder.style.height = `${rect.height}px`;
                placeholder.style.backgroundColor = 'rgba(200, 200, 200, 0.5)';
                placeholder.style.border = '2px dashed #ccc';
                div.parentNode.insertBefore(placeholder, div.nextSibling);
            };
    
            const removePlaceholder = () => {
                if (placeholder) {
                    placeholder.remove();
                    placeholder = null;
                }
            };
    
            const onMouseMove = (moveEvent) => {
                // Calculate distance moved
                const dx = moveEvent.clientX - startX;
                const dy = moveEvent.clientY - startY;
    
                // If the mouse moves beyond a small threshold, it's a drag
                if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                    if (!isDragging) {
                        isDragging = true;
                        createPlaceholder();
    
                        // Change to absolute positioning and set initial position
                        const computedStyle = getComputedStyle(div);
                        div.style.position = 'absolute';
                        div.style.left = `${initialX}px`;
                        div.style.top = `${initialY}px`;
                        div.style.width = computedStyle.width; // Retain original width
                        div.style.height = computedStyle.height; // Retain original height
                        div.style.zIndex = '1000';
                    }
    
                    // Update position during drag
                    div.style.left = `${initialX + dx}px`;
                    div.style.top = `${initialY + dy}px`;
    
                    // Check for nearest sibling and update placeholder position
                    const siblings = Array.from(div.parentNode.children).filter(el => el !== div && el !== placeholder);
                    let closest = null;
                    let closestDistance = Infinity;
    
                    siblings.forEach(sibling => {
                        const siblingRect = sibling.getBoundingClientRect();
                        const distance = Math.abs(moveEvent.clientY - (siblingRect.top + siblingRect.height / 2));
                        if (distance < closestDistance) {
                            closest = sibling;
                            closestDistance = distance;
                        }
                    });
    
                    if (closest) {
                        const siblingRect = closest.getBoundingClientRect();
                        if (moveEvent.clientY < siblingRect.top + siblingRect.height / 2) {
                            div.parentNode.insertBefore(placeholder, closest);
                        } else {
                            div.parentNode.insertBefore(placeholder, closest.nextSibling);
                        }
                    }
                }
            };
    
            const onMouseUp = () => {
                if (isDragging) {
                    // Replace placeholder with the dragged element
                    placeholder.parentNode.insertBefore(div, placeholder);
                    removePlaceholder();
    
                    // Reset styles
                    div.style.position = '';
                    div.style.left = '';
                    div.style.top = '';
                    div.style.width = '';
                    div.style.height = '';
                    div.style.zIndex = '';
    
                    console.log('Drag ended and placed in new position');
                } else {
                    console.log('Clicked on', div);
                    // Add your click menu logic here
                }
    
                // Cleanup event listeners
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };
    
            // Attach move and up listeners
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    });
    
}

function sortFoldersFirst(arr) {
    // Separate strings ending in '.folder'
    const folders = arr.filter(item => item.endsWith('.folder')).sort();
    
    // Get the remaining strings in their original order
    const others = arr.filter(item => !item.endsWith('.folder'));

    // Combine the sorted folders with the rest of the strings
    return [...folders, ...others];
}

function hasParentWithProperty(element, property, value = null) {
    let current = element;
  
    while (current) {
      if (property in current) {
        if (value === null || current[property] === value) {
          return true;
        }
      }
  
      current = current.parentElement; // Move to the parent element
    }
  
    return false;
  }