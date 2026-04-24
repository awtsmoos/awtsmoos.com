
// B"H
/**
 * @module levelSelect
 * @description
 * The grand portal interface where souls choose which dimension to manifest into.
 * A striking UI offering the paths to various pre-defined worlds, including the Garden.
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
            
            // Generate full path
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

            // B"H: If it's a built-in module (like 'garden.js' locally mapped), we can fetch it directly
            // from the local server to bypass potential API missing files during dev.
            if (worldPath === 'garden.js') {
                const localUrl = `/games/mitzvahWorld/tochen/worlds/${worldPath}`;
                fetch(localUrl)
                    .then(r => r.text())
                    .then(txt => {
                        const blobUrl = URL.createObjectURL(new Blob([txt], { type: "application/javascript" }));
                        loadWorld(blobUrl, true);
                    })
                    .catch(err => {
                        console.error("Local fetch failed, trying API...", err);
                        loadWorld(fullPath, false); // Fallback
                    });
            } else {
                loadWorld(fullPath, false);
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
                            onclick(e, $, ui) { ui.peula($("levelSelectScreen"), { launch: "garden.js" }); },
                            children: [
                                { className: "ls-icon", textContent: "🌿" },
                                { className: "ls-card-title", textContent: "First: The Garden" },
                                { className: "ls-card-desc", textContent: "A lush, procedurally generated paradise. Custom bark, sand, and intense spiritual entities await." }
                            ]
                        },
                        {
                            className: "ls-card city",
                            onclick(e, $, ui) { ui.peula($("levelSelectScreen"), { launch: "city1.js" }); },
                            children: [
                                { className: "ls-icon", textContent: "🏙️" },
                                { className: "ls-card-title", textContent: "The Yeeshoov" },
                                { className: "ls-card-desc", textContent: "A sprawling city filled with mitzvahs and encounters." }
                            ]
                        },
                        {
                            className: "ls-card desert",
                            onclick(e, $, ui) { ui.peula($("levelSelectScreen"), { launch: "desert1.js" }); },
                            children: [
                                { className: "ls-icon", textContent: "🏜️" },
                                { className: "ls-card-title", textContent: "Midbar Hawawmeem" },
                                { className: "ls-card-desc", textContent: "The vast desert of potential. Hot air balloons and ancient gates." }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};
