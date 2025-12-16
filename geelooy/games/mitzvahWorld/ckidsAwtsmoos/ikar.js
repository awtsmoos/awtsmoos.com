
/**
 * B"H

 */

/**
 * import data for world
 */

console.log("B\"H",
"\n","Starting the Ikar JS!\"")

import ManagerOfAllWorlds from "./Olam/worldManager.js";
import config from "../tochen/config/config.awtsmoos.js";

try {
    if(!window.invalid) {
        var m = new ManagerOfAllWorlds('/oyvedEdom.js');
        window.mana =  m;
        
        // B"H: Check for URL Parameters
        const urlParams = new URLSearchParams(window.location.search);
        const path = urlParams.get('path');
        const alias = urlParams.get('alias');
        
        if (path) {
            console.log("B\"H: Loading world from URL path:", path);
            fetch(path)
                .then(r => r.text())
                .then(txt => {
                    const blobUrl = URL.createObjectURL(
                        new Blob([txt], { type: "application/javascript" })
                    );
                    
                    // Wait for UI to be ready then start
                    const checkUI = setInterval(() => {
                        const ikar = document.getElementById("ikar");
                        const mm = document.querySelector(".menu"); // main menu class
                        if (ikar && mm && mm.gameUiHTML) {
                            clearInterval(checkUI);
                            
                            // Hide Main Menu initially since we are auto-loading
                            if(window.ui && window.ui.getHtml) {
                                const menuEl = window.ui.getHtml("main menu");
                                if(menuEl) menuEl.classList.add("hidden");
                            }

                            ikar.dispatchEvent(
                                new CustomEvent("start", {
                                    detail: {
                                        worldDayuhURL: blobUrl,
                                        sourcePath: path, // Pass source path for saving/URL logic
                                        gameUiHTML: mm.gameUiHTML
                                    }
                                })
                            );
                        }
                    }, 100);
                })
                .catch(e => {
                    console.error("B\"H: Failed to load world from URL path", e);
                    alert("Could not load world from URL.");
                });
        } else if (alias) {
            // B"H: Deep link to Alias in World Browser
            console.log("B\"H: Opening World Browser for alias:", alias);
            const checkUI = setInterval(() => {
                const ikar = document.getElementById("ikar");
                const fw = document.querySelector(".findWorlds");
                if (ikar && window.ui) {
                    clearInterval(checkUI);
                    
                    // Hide Main Menu, Show Find Worlds
                    const mm = window.ui.getHtml("main menu");
                    if(mm) mm.classList.add("hidden");
                    
                    const fwEl = window.ui.getHtml("find worlds");
                    if(fwEl) {
                        fwEl.classList.remove("hidden");
                        // Trigger the load
                        window.ui.peula(fwEl, { 
                            loadAliasWorlds: { 
                                alias: alias, 
                                title: `Deep Link: ${alias}` 
                            } 
                        });
                    }
                }
            }, 100);
        }
        
        console.log("Loaded!",m)
    }
} catch(e) {
    console.log("Issue!", e)
}
