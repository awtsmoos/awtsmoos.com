
// B"H
/**
 * @module levelSelect
 * @description
 * The grand portal interface where souls choose which dimension to manifest into.
 * A striking UI offering the paths to various pre-defined worlds, including the new procedural tests.
 */
export default {
    shaym: "levelSelectScreen",
    className: "level-select-container hidden",
    awtsmoosClick: true,
    
    on: {
        open(e, $, ui) {
            $("levelSelectScreen").classList.remove("hidden");
            // Hide main menu
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
        launch(e, $, ui) {
            const worldPath = e.detail;
            
            // Generate full path for API lookup (used for legacy worlds)
            const internalPath = encodeURIComponent(`desktop.folder/game data.folder/worlds/${worldPath}`);
            const fullPath = `/api/social/aliases/awtsmoos/fileSystem/readFile?path=${internalPath}`;
            
            const ikar = $("ikar");
            const gameUiHTML = $("main menu").gameUiHTML;
            
            const loadWorld = (url, isDirect) => {
                 ikar.dispatchEvent(
                    new CustomEvent("start", {
                        detail: {
                            worldDayuhURL: url,
                            sourcePath: isDirect ? null : fullPath,
                            gameUiHTML: gameUiHTML
                        }
                    })
                );
                
                $("levelSelectScreen").classList.add("hidden");
                const ld = $("loading");
                if(ld) ld.classList.remove("hidden");
            };

            // B"H: If it's one of our new pure built-in procedural worlds, fetch it directly locally!
            const localWorlds = [
                'garden.js', 
                'forestOfGeometry.js', 
                'mountainOfTorah.js', 
                'floatingIslands.js', 
                'labyrinth.js'
            ];
            
            if (localWorlds.includes(worldPath)) {
                const localUrl = `/games/mitzvahWorld/tochen/worlds/${worldPath}`;
                fetch(localUrl)
                    .then(r => r.text())
                    .then(txt => {
                        const blobUrl = URL.createObjectURL(new Blob([txt], { type: "application/javascript" }));
                        loadWorld(blobUrl, true);
                    })
                    .catch(err => {
                        console.error("Local fetch failed, trying API fallback...", err);
                        loadWorld(fullPath, false); 
                    });
            } else {
                loadWorld(fullPath, false); // For city1.js, desert1.js, etc.
            }
        }
    },
    
    children: [
        {
            className: "ls-glass-panel",
            children: [
                {
                    className: "ls-header",
                    children: [
                        { className: "ls-title", textContent: "CHOOSE YOUR REALM" },
                        { tag: "button", className: "ls-close-btn", textContent: "X", onclick(e, $, ui) { ui.peula($("levelSelectScreen"), { close: true }); } }
                    ]
                },
                {
                    className: "ls-body",
                    children: [
                        {
                            className: "ls-card garden",
                            onclick(e, $, ui) { ui.peula($("levelSelectScreen"), { launch: "floatingIslands.js" }); },
                            children: [
                                { className: "ls-icon", textContent: "☁️" },
                                { className: "ls-card-title", textContent: "Floating Islands" },
                                { className: "ls-card-desc", textContent: "Massive chunks of earth suspended in the void. Test the new Grass Shader and Island generator!" }
                            ]
                        },
                        {
                            className: "ls-card desert",
                            onclick(e, $, ui) { ui.peula($("levelSelectScreen"), { launch: "labyrinth.js" }); },
                            children: [
                                { className: "ls-icon", textContent: "🧱" },
                                { className: "ls-card-title", textContent: "The Infinite Labyrinth" },
                                { className: "ls-card-desc", textContent: "A sprawling procedural maze generated in a single draw call. Find the wandering spark." }
                            ]
                        },
                        {
                            className: "ls-card garden",
                            onclick(e, $, ui) { ui.peula($("levelSelectScreen"), { launch: "forestOfGeometry.js" }); },
                            children: [
                                { className: "ls-icon", textContent: "📐" },
                                { className: "ls-card-title", textContent: "Forest of Geometry" },
                                { className: "ls-card-desc", textContent: "A procedural world testing Domes, Pyramids, and GPU Grass Shaders." }
                            ]
                        },
                        {
                            className: "ls-card desert",
                            onclick(e, $, ui) { ui.peula($("levelSelectScreen"), { launch: "mountainOfTorah.js" }); },
                            children: [
                                { className: "ls-icon", textContent: "⛰️" },
                                { className: "ls-card-title", textContent: "Mountain of Torah" },
                                { className: "ls-card-desc", textContent: "A massive procedural mountain sculpted using proportional editing math. Climb to the top!" }
                            ]
                        },
                        {
                            className: "ls-card city",
                            onclick(e, $, ui) { ui.peula($("levelSelectScreen"), { launch: "garden.js" }); },
                            children: [
                                { className: "ls-icon", textContent: "🌿" },
                                { className: "ls-card-title", textContent: "Gan Eden (Garden)" },
                                { className: "ls-card-desc", textContent: "A rolling procedural landscape with extruded procedural Houses and intense NPCs." }
                            ]
                        },
                        {
                            className: "ls-card city",
                            onclick(e, $, ui) { ui.peula($("levelSelectScreen"), { launch: "city1.js" }); },
                            children: [
                                { className: "ls-icon", textContent: "🏙️" },
                                { className: "ls-card-title", textContent: "The Yeeshoov (Legacy)" },
                                { className: "ls-card-desc", textContent: "The original city filled with mitzvahs and encounters." }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};
