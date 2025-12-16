

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
            
            // 1. New Parameter Logic: alias + level
            const alias = urlParams.get('alias');
            const level = urlParams.get('level');
            let path = urlParams.get('path');

            // Construct path from alias + level if provided
            if (alias && level && !path) {
                // Ensure .js extension
                const filename = level.endsWith('.js') ? level : level + '.js';
                // Encode the internal path
                const internalPath = encodeURIComponent(`desktop.folder/game data.folder/worlds/${filename}`);
                path = `/api/social/aliases/${alias}/fileSystem/readFile?path=${internalPath}`;
                console.log("B\"H: Constructed path from level param:", path);
            }

            // Helper to get UI elements safely
            const getUI = () => {
                 // B"H: Use the UI Manager's internal map via the global mana instance.
                 // The 'shaym' property is an internal key, NOT a DOM attribute.
                 let ikar = null;
                 let menu = null;

                 if (window.mana && window.mana.ui && typeof window.mana.ui.$g === 'function') {
                     ikar = window.mana.ui.$g("ikar");
                     menu = window.mana.ui.$g("menu") || window.mana.ui.$g("main menu");
                 }

                 // Fallback DOM check (only works if classNames happen to match, mostly for menu)
                 if (!menu) {
                     menu = document.querySelector(".gameMenu") || document.querySelector(".menu");
                 }
                 
                 return { ikar, menu };
            };

            if (path) {
                console.log("B\"H: Auto-loading from path:", path);
                
                let attempts = 0;
                const checkReady = setInterval(() => {
                    attempts++;
                    // Timeout after 20 seconds
                    if(attempts > 200) { 
                        clearInterval(checkReady); 
                        console.error("B\"H: Auto-load timed out. UI State check failed.", {
                            hasMana: !!window.mana,
                            hasUI: !!(window.mana && window.mana.ui),
                            hasGameUI: !!window.awtsmoosGameUI
                        });
                        return;
                    }

                    const { ikar } = getUI();
                    
                    // B"H: Wait for global Game UI config AND the ikar element to be ready
                    if (ikar && window.awtsmoosGameUI) {
                        clearInterval(checkReady);
                        console.log("B\"H: UI Ready. Starting auto-load sequence.");

                        // Hide Main Menu manually
                        const { menu } = getUI();
                        if(menu) {
                            menu.classList.add("hidden");
                            menu.classList.add("offscreen");
                            menu.classList.remove("onscreen");
                        }
                        
                        // Show Loading Screen
                        let loading = null;
                        if(window.mana && window.mana.ui && window.mana.ui.$g) {
                            loading = window.mana.ui.$g("loading");
                        }
                        if(!loading) loading = document.querySelector(".loading");
                        
                        if(loading) loading.classList.remove("hidden");

                        // 2. Fetch Code
                        fetch(path)
                            .then(r => {
                                if(!r.ok) throw new Error("Failed to fetch world file: " + r.statusText);
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
                                            gameUiHTML: window.awtsmoosGameUI // Use globally exposed UI
                                        }
                                    })
                                );
                            })
                            .catch(e => {
                                console.error("B\"H Auto-load failed:", e);
                                alert("Failed to load world.\n" + e.message);
                                if(menu) menu.classList.remove("hidden");
                                if(loading) loading.classList.add("hidden");
                            });
                    }
                }, 100);

            } else if (alias) {
                console.log("B\"H: Auto-loading alias browser:", alias);
                
                let attempts = 0;
                const checkReady = setInterval(() => {
                    attempts++;
                    if(attempts > 100) { clearInterval(checkReady); return; }
                    
                    const { ikar, menu } = getUI();
                    // We need the 'ui' object to be ready on window
                    if (ikar && window.ui) {
                        clearInterval(checkReady);
                        
                        // Hide main menu
                        if(menu) {
                            menu.classList.add("hidden");
                        }
                        
                        // Find and show "Find Worlds" screen
                        const fwScreen = window.mana.ui.$g("find worlds") || document.querySelector(".findWorlds");
                        if (fwScreen) {
                            fwScreen.classList.remove("hidden");
                            
                            // Trigger the load logic via UI event
                            window.ui.peula(fwScreen, { 
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
