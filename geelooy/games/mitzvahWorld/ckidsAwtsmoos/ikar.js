

/**
 * B"H
 * Ikar (Main Entry Point)
 */

console.log("B\"H", "\n", "Starting the Ikar JS!");

import ManagerOfAllWorlds from "./Olam/worldManager.js";
import config from "../tochen/config/config.awtsmoos.js";

try {
    if (!window.invalid) {
        var m = new ManagerOfAllWorlds('/oyvedEdom.js');
        window.mana = m;

        // B"H: Logic to handle Deep Linking / Auto-loading
        const handleAutoLoad = () => {
            const urlParams = new URLSearchParams(window.location.search);
            const path = urlParams.get('path');
            const alias = urlParams.get('alias');

            // Helper to get UI elements safely
            const getUI = () => {
                 // Check if UI Manager has created elements
                 if (!window.ui || !window.ui.getHtml) return null;
                 const ikar = document.getElementById("ikar");
                 // Use querySelector for elements that might not be registered in UI map yet
                 const menu = document.querySelector(".menu"); 
                 return { ikar, menu, ui: window.ui };
            };

            if (path) {
                console.log("B\"H: Auto-loading from path:", path);
                
                // Polling for UI readiness
                const checkReady = setInterval(() => {
                    const { ikar, menu, ui } = getUI() || {};
                    
                    if (ikar && menu && menu.gameUiHTML) {
                        clearInterval(checkReady);

                        // 1. Hide Main Menu
                        if(ui.getHtml("main menu")) ui.getHtml("main menu").classList.add("hidden");
                        
                        // 2. Fetch Code
                        fetch(path)
                            .then(r => {
                                if(!r.ok) throw new Error("Failed to fetch world file");
                                return r.text();
                            })
                            .then(txt => {
                                const blobUrl = URL.createObjectURL(
                                    new Blob([txt], { type: "application/javascript" })
                                );

                                // 3. Start Game
                                ikar.dispatchEvent(
                                    new CustomEvent("start", {
                                        detail: {
                                            worldDayuhURL: blobUrl,
                                            sourcePath: path,
                                            gameUiHTML: menu.gameUiHTML
                                        }
                                    })
                                );
                            })
                            .catch(e => {
                                console.error("B\"H Auto-load failed:", e);
                                alert("Failed to load world from URL.\n" + e.message);
                                // Show menu if fail
                                if(ui.getHtml("main menu")) ui.getHtml("main menu").classList.remove("hidden");
                            });
                    }
                }, 100);

            } else if (alias) {
                console.log("B\"H: Auto-loading alias browser:", alias);
                
                const checkReady = setInterval(() => {
                    const { ikar, ui } = getUI() || {};
                    if (ikar && ui) {
                        const fwScreen = ui.getHtml("find worlds");
                        const menuScreen = ui.getHtml("main menu");
                        
                        if (fwScreen && menuScreen) {
                            clearInterval(checkReady);
                            
                            menuScreen.classList.add("hidden");
                            fwScreen.classList.remove("hidden");
                            
                            ui.peula(fwScreen, { 
                                loadAliasWorlds: { 
                                    alias: alias, 
                                    title: `Deep Link: ${alias}` 
                                } 
                            });
                        }
                    }
                }, 100);
            }
        };

        // Initialize Auto-Load
        if (document.readyState === 'complete') {
            handleAutoLoad();
        } else {
            window.addEventListener('load', handleAutoLoad);
        }

        console.log("Loaded!", m);
    }
} catch (e) {
    console.log("Issue!", e);
}
