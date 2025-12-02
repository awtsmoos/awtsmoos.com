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
        
        //  OS CLIPBOARD ---
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
        
        // B"H - DESKTOP REPLACEMENT
        // Removed old icon rendering. Now launching Fullscreen Explorer.
        this.makeDesktop(); // Still needed for background styles
        
        this.addWindow({
            title: "Desktop",
            path: "desktop.folder",
            os: this,
            programName: "awtsmoosFileExplorer",
            hideTitleBar: true, // New option to look like a desktop
            isFullscreen: true  // Start maximized
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
        
        // Kept for robustness, though window likely covers it
        this.getDesktop().addEventListener('contextmenu', e => {
	    // Ensure the click is on the background, not an icon
	    if (e.target.classList.contains('desktop') || e.target.classList.contains('fileHolder')) {
	        const menuItems = new Map([
	            ['Toggle Full Screen', () => this.toggleFullScreen()]
	        ]);
	        showGenericContextMenu({ event: e, menuItems });
	    }
	});
    }
    
    // Updated addWindow to accept options
    addWindow(options) {
        this.windowHandler.addWindow(options)
    }

    async createFile({path, title, content=""}) {
	console.log("writing FILE",path);
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

    // Renamed/Simplified for internal use mostly, since Explorer handles its own view
    async showFilesAtPath({ path }) {
        // We still track this for global refreshes
        this.currentPathForRefresh = path;
    }
    
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