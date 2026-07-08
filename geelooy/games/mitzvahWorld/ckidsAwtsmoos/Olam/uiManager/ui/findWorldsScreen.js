// B"H
function awtsmoosNotice(message) {
  const text = String(message ?? "");
  console.warn('B"H | NOTICE_NO_BLOCKING_DIALOG', text);
  globalThis.__AWTSMOOS_SUPPRESSED_ALERTS__ ||= [];
  globalThis.__AWTSMOOS_SUPPRESSED_ALERTS__.push({ at: Date.now(), text, source: import.meta?.url || "unknown" });
  globalThis.__AWTSMOOS_SUPPRESSED_ALERTS__ = globalThis.__AWTSMOOS_SUPPRESSED_ALERTS__.slice(-80);
}


//B"H

const FEATURED_ALIASES = ["awtsmoos"]; // You can add more hardcoded ones here
import findWorldsStyle from "./skins/2/findWorldsStyle.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export default {
    shaym: "find worlds",
    className: "findWorlds hidden menu",
    children: [
        {
            tag: "style",
            innerHTML: findWorldsStyle 
        },
        // --- HEADER ---
        {
            className: "fw-header",
            children: [
                {
                    tag: "button",
                    className: "fw-back-btn",
                    textContent: "⬅ Back",
                    onclick(e, $, ui) {
                        // Logic: If in "Results View", go back to "Dashboard".
                        // If in "Dashboard", go back to "Main Menu".
                        const dashboard = $("fw-dashboard");
                        const results = $("fw-results");
                        
                        if (!results.classList.contains("hidden")) {
                            // Go back to dashboard
                            results.classList.add("hidden");
                            dashboard.classList.remove("hidden");
                            $("fw-results-grid").innerHTML = ""; // Clear results
                            $("fw-results-title").textContent = "Results";
                            
                            // Reset URL
                            const url = new URL(window.location);
                            url.searchParams.delete("alias");
                            window.history.pushState({}, "", url);
                        } else {
                            // Go back to main menu
                            $("main menu").classList.remove("hidden");
                            $("find worlds").classList.add("hidden");
                        }
                    }
                },
                { className: "fw-title", textContent: "World Browser" }
            ]
        },

        // --- MAIN CONTENT WRAPPER ---
        {
            className: "fw-content",
            children: [
                
                // --- SEARCH BAR ---
                {
                    className: "fw-search-container",
                    children: [
                        {
                            tag: "input",
                            shaym: "fw-search-input",
                            className: "fw-input",
                            placeholder: "Enter Alias to search..."
                        },
                        {
                            tag: "button",
                            className: "fw-search-btn",
                            textContent: "Search",
                            onclick(e, $, ui) {
                                const alias = $("fw-search-input").value;
                                if(alias) {
                                    ui.peula($("find worlds"), { loadAliasWorlds: { alias, title: `Search: ${alias}` } });
                                }
                            }
                        }
                    ]
                },

                // --- DASHBOARD VIEW (Featured + My Levels) ---
                {
                    shaym: "fw-dashboard",
                    children: [
                        
                        // FEATURED SECTION
                        {
                            className: "fw-section",
                            children: [
                                { className: "fw-section-title", textContent: "🌟 Featured Creators" },
                                {
                                    className: "fw-grid",
                                    ready(el, $, ui) {
                                        // Populate featured creators
                                        FEATURED_ALIASES.forEach(alias => {
                                            ui.html({
                                                parent: el,
                                                className: "fw-card",
                                                onclick: () => {
                                                     ui.peula($("find worlds"), { loadAliasWorlds: { alias, title: `Featured: ${alias}` } });
                                                },
                                                children: [
                                                    { className: "fw-card-icon", textContent: "👑" },
                                                    { className: "fw-card-title", textContent: alias },
                                                    { className: "fw-card-sub", textContent: "Official Content" }
                                                ]
                                            });
                                        });
                                    }
                                }
                            ]
                        },

                        // MY LEVELS SECTION
                        {
                            className: "fw-section",
                            children: [
                                { className: "fw-section-title", textContent: "🏠 My Levels" },
                                {
                                    className: "fw-grid",
                                    shaym: "fw-my-levels-grid",
                                    ready(el, $, ui) {
	                                setTimeout(() => {
	                                        // use window.curAlias
	                                        const myAlias = window.curAlias;
	                                        if (myAlias) {
	                                            ui.html({
	                                                parent: el,
	                                                className: "fw-card",
	                                                style: { background: "rgba(71, 79, 255, 0.2)", borderColor: "#474FFF" },
	                                                onclick: () => {
	                                                     ui.peula($("find worlds"), { loadAliasWorlds: { alias: myAlias, title: "My Personal Worlds" } });
	                                                },
	                                                children: [
	                                                    { className: "fw-card-icon", textContent: "📂" },
	                                                    { className: "fw-card-title", textContent: "Browse My Files" },
	                                                    { className: "fw-card-sub", textContent: myAlias }
	                                                ]
	                                            });
	                                        } else {
	                                            el.innerHTML = "<div style='grid-column: 1/-1; color: #aaa; font-size:18px;'>You are not logged in. <br>Please log in using the button at the top to see your levels.</div>";
	                                        }
                                        
                                        }, 100)
                                    }
                                }
                            ]
                        }
                    ]
                },

                // --- RESULTS VIEW (Hidden by default) ---
                {
                    shaym: "fw-results",
                    className: "hidden",
                    children: [
                         { className: "fw-section-title", shaym: "fw-results-title", textContent: "Levels" },
                         { className: "fw-grid", shaym: "fw-results-grid" },
                         { className: "fw-message hidden", shaym: "fw-loading-msg", textContent: "Loading worlds..." },
                         { className: "fw-message hidden", shaym: "fw-empty-msg", textContent: "No worlds found." }
                    ]
                }
            ]
        }
    ],
    
    // --- LOGIC ---
    on: {
        /**
         * Reusable function to fetch worlds for ANY alias and display them in the results grid.
         */
        async loadAliasWorlds(e, $, ui) {
            const { alias, title } = e.detail;
            
            // B"H: Update URL for deep linking
            const url = new URL(window.location);
            url.searchParams.set("alias", alias);
            window.history.pushState({ alias: alias }, "", url);

            // 1. UI State Management
            $("fw-dashboard").classList.add("hidden");
            $("fw-results").classList.remove("hidden");
            $("fw-results-title").textContent = title;
            
            const grid = $("fw-results-grid");
            grid.innerHTML = ""; // Clear previous
            
            const loading = $("fw-loading-msg");
            const empty = $("fw-empty-msg");
            loading.classList.remove("hidden");
            empty.classList.add("hidden");

            try {
                // 2. Fetch Data
                // Note: path is "desktop.folder/game data.folder/worlds"
                const response = await fetch(
                    `/api/social/aliases/${alias}/fileSystem/readFolder?${
                        new URLSearchParams({
                            path: `desktop.folder/game data.folder/worlds`
                        })
                    }`
                );
                
                var worldData = await response.json();
                var worlds = worldData.map(w => w.name);
                loading.classList.add("hidden");

                // 3. Process Results
                if (Array.isArray(worlds) && worlds.length > 0) {
                    // Filter for .js files
                    const validWorlds = worlds.filter(w => w.endsWith(".js"));

                    if (validWorlds.length === 0) {
                        empty.textContent = "No .js world files found in this folder.";
                        empty.classList.remove("hidden");
                        return;
                    }

                    // 4. Render Cards
                    validWorlds.forEach(filename => {
                        const worldName = filename.replace(".js", ""); // Strip extension for display
                        
                        ui.html({
                            parent: grid,
                            className: "fw-card",
                            onclick: async () => {
                                // --- LOAD WORLD LOGIC ---
                                try {
                                    const filePath = `desktop.folder/game data.folder/worlds/${filename}`;
                                    const sourcePathUrl = `/api/social/aliases/${alias}/fileSystem/readFile?${new URLSearchParams({ path: filePath })}`;
                                    
                                    const fileRes = await fetch(sourcePathUrl);
                                    const worldCode = await fileRes.text();
                                    
                                    // Create Blob URL
                                    const blobUrl = URL.createObjectURL(
                                        new Blob([worldCode], { type: "application/javascript" })
                                    );
                                    
                                    // Launch Game
                                    const ikar = $("ikar");
                                    const mm = $("main menu");
                                    
                                    if(ikar && mm) {
                                        ikar.dispatchEvent(
                                            new CustomEvent("start", {
                                                detail: {
                                                    worldDayuhURL: blobUrl,
                                                    sourcePath: sourcePathUrl, // B"H: Pass source path for URL history
                                                    gameUiHTML: mm.gameUiHTML
                                                }
                                            })
                                        );
                                        
                                        // Transition UI
                                        $("find worlds").classList.add("hidden");
                                        const ld = $("loading");
                                        if(ld) ld.classList.remove("hidden");
                                        
                                        mm.classList.add("hidden");
                                        mm.isGoing = false;
                                    }
                                } catch(err) {
                                    console.error(err);
                                    awtsmoosNotice("Error loading world file.");
                                }
                            },
                            children: [
                                { className: "fw-card-icon", textContent: "🌍" }, // Generic world icon
                                { className: "fw-card-title", textContent: worldName },
                                { className: "fw-card-sub", textContent: "Click to Play" }
                            ]
                        });
                    });

                } else {
                    empty.textContent = "No worlds found for this alias.";
                    empty.classList.remove("hidden");
                }

            } catch (err) {
                console.error(err);
                loading.classList.add("hidden");
                empty.textContent = "Error fetching worlds. User might not exist or folder is private.";
                empty.classList.remove("hidden");
            }
        }
    }
}
