
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
        
        // B"H: Check for World Path in URL
        const urlParams = new URLSearchParams(window.location.search);
        const path = urlParams.get('path');
        
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
        }
        
        console.log("Loaded!",m)
    }
} catch(e) {
    console.log("Issue!", e)
}
