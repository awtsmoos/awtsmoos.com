//B"H
import AwtsmoosDB from "/scripts/awtsmoos/api/fileSystem/fileSystemDB.js";
import WindowHandler from "./windowHandler.js";
import osStyles from "./styles/os-base.js";
import { SettingsManager } from "./settingsManager.js";
import { defaultPrograms, initialDefaultPrograms } from "./basicPrograms.js";


import { showContextMenu, showGenericContextMenu } from './contextMenuManager.js';

console.log(`B"H


`)
export default class AwtsmoosOS {
    constructor() {
         
        this.windowHandler = new WindowHandler(); 
        
        this.db = new AwtsmoosDB();
        window.os = this;
        
        this.currentPathForRefresh = 'desktop.folder';
        
        this.clipboard = {
            action: null, // 'cut' or 'copy'
            path: null,   // The source path
            name: null    // The filename/foldername
        };
    }
    
	toggleFullScreen() {
	    if (!document.fullscreenElement) {
	        document.querySelector(".main")?.requestFullscreen?.().catch(err => {
	            alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
	        });
	    } else {
	        if (document.exitFullscreen) {
	            document.exitFullscreen();
	        }
	    }
	}

    async start() {
        var utils = await import("/scripts/awtsmoos/api/utils.js")
        var k = Object.keys(utils)
        k.forEach(q => {
            window[q] = utils[q]
        })
        await this.db.init("awtsmoos-os");
        
        // Pass our single source of truth to the settings manager.
    const loadedDefaults = await SettingsManager.load(this.db, initialDefaultPrograms);
    
    // This dynamically populates the 'defaultPrograms' object for the whole OS to use.
    Object.assign(defaultPrograms, loadedDefaults);
        this.makeDesktop();
        await this.showFilesAtPath({
            path: "desktop.folder"
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
        
        
        this.getDesktop().addEventListener('contextmenu', e => {
	    // Ensure the click is on the background, not an icon
	    if (e.target.classList.contains('desktop') || e.target.classList.contains('fileHolder')) {
	        const menuItems = new Map([
	            ['Toggle Full Screen', () => this.toggleFullScreen()]
	            // You can add more items here in the future!
	        ]);
	        showGenericContextMenu({ event: e, menuItems });
	    }
	});
    }
    addWindow(...args) {
        this.windowHandler.addWindow(...args)
    }

     async createFile({path, title, content=""}) {
        console.log("writing FILE", path, title);
        // Explicitly pass 'file' type so empty content is allowed
        await this.db.Koysayv(path, title, content, 'file');
        await this.showFilesAtPath({
            path
        });
    }
    
    
    // 
async updateDefaultProgram(extension, programName) {
    if (!extension || !programName) return;

    console.log(`Setting default for ${extension} to ${programName}`);
    
    // 1. Update the live settings object
    defaultPrograms[extension] = programName;

    // 2. Save the entire updated object back to the file
    await SettingsManager.save(this.db, defaultPrograms);
}

    async createFolder({path, title}) {
        // Pass 'directory' type explicitly
        
        await this.db.Koysayv(path, title, null, 'directory');
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



async onFileClick({ path, title, event, isFolder }) {
    event.stopPropagation();

    if (isFolder) {
        // If it's a folder, we always open the File Explorer program
        // The 'title' of the window becomes the folder name
        // The 'path' property is the folder's full path, which the explorer will use as its starting view.
        this.addWindow({
            title: title,
            path: `${path}/${title}`, // Pass the full path of the folder to navigate to
            os: this,
            programName: 'awtsmoosFileExplorer'
        });
    } else {
        // For files, we use the original logic to find the default program
        const content = await this.db.Laynin(path, title);
        this.addWindow({ title, content, path, os: this });
    }
}
 
    // In awtsmoosOs.js

    // REPLACEMENT for renderFile
    async renderFile({
        path, 
        fileHolder,
        fileObj // Changed from 'title' to accepting the whole object
    } = {}) {
        var title = fileObj.name || fileObj; // Fallback for legacy strings
        var type = fileObj.type; // "directory" or "file"
        
        var f = document.createElement("div");
        f.awtsmoosFile = true;
        f.classList.add("awtsmoosIcon")
        
        var isFolder = false;
        var adjustedTitle = title;

        // Check new type property OR legacy naming convention
        if(type === "directory" || title.endsWith(".folder")) {
            f.classList.add("folder")
            isFolder = true;
            // Clean up legacy folder names if they still have the extension
            adjustedTitle = title//.replace(".folder", "");
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
        
        f.oncontextmenu = async event => {
            event.preventDefault();
            showContextMenu({ os: this, event, path, title, isFolder });
        }
        f.onclick = async (event) => {
            await this.onFileClick({
                path,
                title,
                event,
                isFolder
            })
        };

        fileHolder.appendChild(f);
    }

    
    

   
    
    
    // In awtsmoosOs.js

    async showFilesAtPath({
        path,
        holder
    }) {
        this.currentPathForRefresh = path;
        if(path == "desktop.folder" || 
        path != "desktop") {
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
        
        // Get the array of objects from the DB/API
        var gotFiles = await this.db.getAllKeys(path);
        
        // Sort using the new object-aware sorter
        gotFiles = sortFoldersFirst(gotFiles);
        
        gotFiles.forEach(fileObj => {
            this.renderFile({
                path,
                fileHolder: fileArea,
                fileObj: fileObj // Pass the full object
            })
        });

        var dropDiv = fileArea;
      
        const overlay = document.createElement('div');
        overlay.id = 'drag-overlay';
        overlay.className = 'drag-overlay';
        overlay.textContent = 'Drop files here!';
        dropDiv.appendChild(overlay);

        dropDiv.addEventListener('dragover', (event) => {
            event.preventDefault();
            dropDiv.classList.add('drag-over');
            overlay.classList.add('visible');
        });

        dropDiv.addEventListener('dragleave', (event) => {
            dropDiv.classList.remove('drag-over');
            overlay.classList.remove('visible');
        });

        dropDiv.addEventListener('drop', async (event) => {
            event.preventDefault();
            dropDiv.classList.remove('drag-over');
            overlay.classList.remove('visible');

            const files = Array.from(event.dataTransfer.files);
            if (files.length === 0) return;

            for (const file of files) {
                const content = file.type.startsWith('text/') 
                    ? await file.text() 
                    : await file.arrayBuffer(); 
                await os.createFile({path, title:file.name, content});
            }
            alert(`${files.length} file(s) uploaded successfully!`);
        });

        makeDraggable(".awtsmoosIcon");
    }
    
}
function sortFoldersFirst(arr) {
    if(!Array.isArray(arr)) return [];
    return arr.sort((a, b) => {
        // Handle both new object format and old string format
        const aName = a.name || a;
        const bName = b.name || b;
        const aType = a.type || (aName.endsWith('.folder') ? 'directory' : 'file');
        const bType = b.type || (bName.endsWith('.folder') ? 'directory' : 'file');

        // Folders always come first
        if (aType === 'directory' && bType !== 'directory') return -1;
        if (aType !== 'directory' && bType === 'directory') return 1;

        // Alphabetical sort for same types
        return aName.localeCompare(bName);
    });
}
function makeDraggable(selector) {
    document.querySelectorAll(selector).forEach(div => {
        let isDragging = false;
        let startX, startY, initialX, initialY;
        let placeholder;
        let folderPopup;
    
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
    
            const createFolderPopup = (folderElement) => {
                if (!folderPopup) {
                    folderPopup = document.createElement('div');
                    folderPopup.classList.add('folder-popup');
                    folderPopup.textContent = 'Move to folder?';
                    folderPopup.style.position = 'absolute';
                    folderPopup.style.padding = '10px';
                    folderPopup.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                    folderPopup.style.color = '#fff';
                    folderPopup.style.borderRadius = '5px';
                    folderPopup.style.pointerEvents = 'none';
                    document.body.appendChild(folderPopup);
                }
                const folderRect = folderElement.getBoundingClientRect();
                folderPopup.style.left = `${folderRect.left + window.scrollX}px`;
                folderPopup.style.top = `${folderRect.top + window.scrollY - 30}px`;
            };
    
            const removeFolderPopup = () => {
                if (folderPopup) {
                    folderPopup.remove();
                    folderPopup = null;
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
                     //   createPlaceholder();
    
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
    
                    /*
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
                    */
    
                    // Check for folder hover and display popup
                    const folderUnderCursor = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY)?.closest('.folder');
                    if (folderUnderCursor) {
                        createFolderPopup(folderUnderCursor);
                    } else {
                        removeFolderPopup();
                    }
                }
            };
    
            const onMouseUp = () => {
                if (isDragging) {
                    const folderUnderCursor = document.elementFromPoint(startX, startY)?.closest('.folder');
                    if (folderUnderCursor && folderPopup) {
                     //onsole.log('Clicked on', div);   console.log('Dropped into folder:', folderUnderCursor);
                        // Add logic here to handle dropping into a folder
                    } else {
                        // Replace placeholder with the dragged element
                        placeholder.parentNode.insertBefore(div, placeholder);
                    }
                    removePlaceholder();
                    removeFolderPopup();
    
                    // Reset styles
                    div.style.position = '';
                    div.style.left = '';
                    div.style.top = '';
                    div.style.width = '';
                    div.style.height = '';
                    div.style.zIndex = '';
    
                    console.log('Drag ended and placed in new position');
                } else {
                   // concl
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