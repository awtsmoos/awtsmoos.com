

// B"H
export default {
    shaym: "saveGameScreen",
    className: "save-game-container hidden",
    awtsmoosClick: true,
    
    on: {
        open(e, $, ui) {
            // Helper function to safely get elements
            const $get = (id) => document.querySelector(`[shaym="${id}"]`);

            // B"H: Check if logged in via global window.curAlias
            if (!window.curAlias) {
                // Not logged in!
                if(ui && ui.peula) {
                    ui.peula("ikar", {
                        olamPeula: {
                            htmlPeula: {
                                effectsOverlay: { 
                                    text: "Please Log In to Save!", 
                                    color: "#ff4757" 
                                }
                            }
                        }
                    });
                }
                
                // Highlight the Login Button to guide them
                const loginBtn = document.querySelector(".loginStatus");
                if (loginBtn) {
                    loginBtn.style.transition = "all 0.5s";
                    loginBtn.style.transform = "scale(1.2)";
                    loginBtn.style.border = "3px solid #ff4757";
                    loginBtn.style.zIndex = "5000";
                    
                    // Cleanup highlight after animation
                    setTimeout(() => {
                        loginBtn.style.transform = "scale(1)";
                        loginBtn.style.border = "";
                        loginBtn.style.zIndex = "";
                    }, 1000);
                }
                
                return; // Do not open the screen
            }

            const screen = $get("saveGameScreen");
            if(screen) screen.classList.remove("hidden");
            
            // B"H: Auto-Populate from World State
            const nameInput = $get("sg-name-input");
            const descInput = $get("sg-desc-input");
            
            // Try to guess name from URL
            let defaultName = "My New World";
            const urlParams = new URLSearchParams(window.location.search);
            
            // Check 'level' param first (cleaner name)
            const levelParam = urlParams.get('level');
            const pathParam = urlParams.get('path') || window.currentWorldSourcePath;
            
            if (levelParam) {
                 defaultName = levelParam;
            } else if (pathParam) {
                // Extract filename from path
                const parts = pathParam.split('/');
                const file = parts[parts.length - 1];
                defaultName = file.replace('.js', '').replace(/_/g, ' ').replace('.folder', '');
            } else if (window.mana && window.mana.gameState && window.mana.gameState.shaym) {
                defaultName = window.mana.gameState.shaym;
            }
            
            if (nameInput) nameInput.value = defaultName;
            if (descInput) descInput.value = "A wonderful world built in Mitzvah World.";
        },
        doSave(e, $, ui) {
             const $get = (id) => document.querySelector(`[shaym="${id}"]`);
             
             const nameInput = $get("sg-name-input");
             const descInput = $get("sg-desc-input");
             const editorsInput = $get("sg-editors-input");
             
             if(!nameInput) return;

             const name = nameInput.value;
             const desc = descInput.value;
             const editors = editorsInput.value; // CSV
             
             ui.peula("ikar", {
                olamPeula: {
                    downloadWorld: {
                        name, description: desc, editors: editors.split(',').map(s=>s.trim()), overwrite: true
                    }
                }
            });
            const screen = $get("saveGameScreen");
            if(screen) screen.classList.add("hidden");
        },
        doSaveAs(e, $, ui) {
             const $get = (id) => document.querySelector(`[shaym="${id}"]`);
             
             const nameInput = $get("sg-name-input");
             const descInput = $get("sg-desc-input");

             const name = nameInput.value;
             const desc = descInput.value;
             // Force overwrite false for "Save As"
             ui.peula("ikar", {
                olamPeula: {
                    downloadWorld: {
                        name, description: desc, overwrite: false
                    }
                }
            });
            const screen = $get("saveGameScreen");
            if(screen) screen.classList.add("hidden");
        }
    },
    
    children: [
        {
            className: "sg-glass-panel",
            children: [
                {
                    className: "sg-header",
                    children: [
                        { className: "sg-title", textContent: "WORLD SETTINGS" },
                        { 
                            tag: "button", 
                            className: "sg-close-btn", 
                            textContent: "X", 
                            onclick(e, $) { 
                                // B"H: Manual DOM lookup to prevent reference errors
                                const el = document.querySelector(".save-game-container");
                                if(el) el.classList.add("hidden");
                            } 
                        }
                    ]
                },
                {
                    className: "sg-body",
                    children: [
                         { className: "sg-label", textContent: "NAME" },
                         { tag: "input", shaym: "sg-name-input", className: "sg-input", type: "text" },
                         
                         { className: "sg-label", textContent: "DESCRIPTION" },
                         { tag: "textarea", shaym: "sg-desc-input", className: "sg-input textarea" },
                         
                         { className: "sg-label", textContent: "EDITORS (Aliases, comma separated)" },
                         { tag: "input", shaym: "sg-editors-input", className: "sg-input", type: "text", placeholder: "friend1, friend2" },
                         
                         {
                             className: "sg-actions",
                             children: [
                                 { 
                                     tag: "button", className: "sg-btn primary", textContent: "SAVE", 
                                     onclick(e,$,ui){ 
                                         // Pass custom logic manually to ensure it runs correctly
                                         const saveGame = window.ui.getHtml("saveGameScreen");
                                         if(saveGame) window.ui.peula(saveGame, { doSave: true });
                                     } 
                                 },
                                 { 
                                     tag: "button", className: "sg-btn secondary", textContent: "SAVE AS COPY", 
                                     onclick(e,$,ui){ 
                                         const saveGame = window.ui.getHtml("saveGameScreen");
                                         if(saveGame) window.ui.peula(saveGame, { doSaveAs: true });
                                     } 
                                 }
                             ]
                         }
                    ]
                }
            ]
        }
    ]
};
