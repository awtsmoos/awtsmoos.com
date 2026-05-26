
/**
 * B"H
 * @module levelSelect
 * @description
 * 🚪 THE RECTIFIED PORTAL OF WORLDS 🚪
 * 
 * Chapter 56: The Direct Path.
 * "I will make the darkness light before them, and crooked things straight." (Yeshayahu 42:16)
 * 
 * This module has been further refined to ensure local files are found.
 * We use absolute-relative paths from the site root to bypass dynamic routing illusions.
 */
import { LevelDataMap } from "./levelSelect/LevelDataMap.js";
import { LevelCardGenerator } from "./levelSelect/LevelCardGenerator.js";
import { MINIMAL_GRASS_WORLD } from "../../../../../levelData.js";

export default {
    shaym: "levelSelectScreen",
    className: "level-select-container hidden",
    awtsmoosClick: true,
    
    on: {
        open(e, $, ui) {
            $("levelSelectScreen").classList.remove("hidden");
            const mm = $("main menu");
            if(mm) {
                mm.classList.add("hidden");
                mm.classList.add("offscreen");
            }
        },
        close(e, $, ui) {
            $("levelSelectScreen").classList.add("hidden");
            const mm = $("main menu");
            if(mm) {
                mm.classList.remove("hidden");
                mm.classList.remove("offscreen");
            }
        },
        async launch(e, $, ui) {
            const worldPath = e.detail;
            // B"H: silent


            const ikar = $("ikar");
            const mm = $("main menu");
            const gameUiHTML = mm ? mm.gameUiHTML : null;

            /**
             * @function sparkWorld
             * @description Bridges the data to the Engine.
             */
            const sparkWorld = (url, worldData, sourcePath = null) => {
                if (!worldData) {
                    console.error("B\"H - 🚨 Cannot spark world: Missing the Or (Data).");
                }
                
                ikar.dispatchEvent(
                    new CustomEvent("start", {
                        detail: {
                            worldDayuhURL: url,
                            worldDayuh: worldData,
                            sourcePath: sourcePath,
                            gameUiHTML: gameUiHTML
                        }
                    })
                );
                
                $("levelSelectScreen").classList.add("hidden");
                const ld = $("loading");
                if(ld) ld.classList.remove("hidden");
            };

            // --- B"H: THE DESERT TEST TIKKUN ---
            if (worldPath === 'desertTest.js') {
                return sparkWorld(null, MINIMAL_GRASS_WORLD, 'desertTest.js');
            }

            // --- B"H: THE EMERALD TIKKUN ---
            if (worldPath === 'emerald.js') {
                const module = await import(`/games/mitzvahWorld/ckidsAwtsmoos/tochen/worlds/emerald.js`);
                return sparkWorld(`/games/mitzvahWorld/ckidsAwtsmoos/tochen/worlds/emerald.js`, module.default);
            }

            // --- B"H: THE LOCAL WORLD ROUTE ---
            const localWorldFiles =[
                'village.js', 'garden.js', 'forestOfGeometry.js', 
                'mountainOfTorah.js', 'floatingIslands.js', 'labyrinth.js'
            ];
            
            if (localWorldFiles.includes(worldPath)) {
                // Using an absolute path from root to ensure the server finds it!
                const localUrl = `/games/mitzvahWorld/ckidsAwtsmoos/tochen/worlds/${worldPath}`;
                
                try {
                    // B"H: silent

                    const module = await import(localUrl);
                    if (module && module.default) {
                        return sparkWorld(localUrl, module.default);
                    } else {
                        throw new Error("Module lacked a default export.");
                    }
                } catch (importErr) {
                    console.warn(`B"H - ⚠️ Direct import failed for ${worldPath}. Trying secondary fetch.`, importErr);
                    
                    try {
                        const res = await fetch(localUrl);
                        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
                        const txt = await res.text();
                        const blob = new Blob([txt], { type: "application/javascript" });
                        const blobUrl = URL.createObjectURL(blob);
                        const blobMod = await import(blobUrl);
                        return sparkWorld(blobUrl, blobMod.default);
                    } catch (fetchErr) {
                        console.error(`B"H - 🚨 ALL LOCAL PATHS BLOCKED for ${worldPath}.`, fetchErr);
                        return sparkWorld(null, MINIMAL_GRASS_WORLD); // Safety fallback
                    }
                }
            } else {
                // --- B"H: THE REMOTE/API ROUTE ---
                const apiPath = `/api/social/aliases/awtsmoos/fileSystem/readFile?path=${encodeURIComponent('desktop.folder/game data.folder/worlds/' + worldPath)}`;
                try {
                    const response = await fetch(apiPath);
                    const scriptText = await response.text();
                    const blob = new Blob([scriptText], { type: "application/javascript" });
                    const blobUrl = URL.createObjectURL(blob);
                    const module = await import(blobUrl);
                    sparkWorld(blobUrl, module.default, apiPath);
                } catch (err) {
                    console.error(`B"H - 🚨 API FETCH FAILED: ${worldPath}`, err);
                    sparkWorld(null, MINIMAL_GRASS_WORLD);
                }
            }
        }
    },
    
    children: [
        {
            className: "ls-glass-panel",
            children:[
                {
                    className: "ls-header",
                    children:[
                        { className: "ls-title", textContent: "CHOOSE YOUR REALM" },
                        { tag: "button", className: "ls-close-btn", textContent: "X", onclick(e, $, ui) { ui.peula($("levelSelectScreen"), { close: true }); } }
                    ]
                },
                {
                    className: "ls-body",
                    children: LevelCardGenerator.generate(LevelDataMap)
                }
            ]
        }
    ]
};
