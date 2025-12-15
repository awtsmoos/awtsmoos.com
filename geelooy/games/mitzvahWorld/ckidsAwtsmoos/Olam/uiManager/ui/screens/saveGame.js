
// B"H
// Extreme Save Game UI

export default {
    shaym: "saveGameScreen",
    className: "save-game-container hidden",
    awtsmoosClick: true,
    
    currentWorldName: null,
    isOwner: false,
    
    on: {
        open(e, $, ui) {
            const screen = $("saveGameScreen");
            screen.classList.remove("hidden");
            
            // Detect World Info
            const currentSourcePath = window.currentWorldSourcePath || ""; 
            const myAlias = window.curAlias;
            
            screen.isOwner = false;
            screen.currentWorldName = "New World";
            
            // Check ownership logic based on source path structure
            // Example Path: /api/social/aliases/ALIAS/fileSystem...
            if (myAlias && currentSourcePath.includes(`/aliases/${myAlias}/`)) {
                screen.isOwner = true;
                // Extract filename from URL params
                try {
                    const urlObj = new URL(currentSourcePath, window.location.origin);
                    const pathParam = urlObj.searchParams.get('path');
                    if (pathParam) {
                        const parts = pathParam.split('/');
                        const filename = parts[parts.length-1];
                        screen.currentWorldName = filename.replace('.js', '');
                    }
                } catch(e) {}
            }
            
            // Update UI State
            const title = screen.querySelector(".sg-title");
            const nameInput = $("sg-name-input");
            const saveBtn = $("sg-save-btn");
            const saveAsBtn = $("sg-save-as-btn");
            const statusText = $("sg-status-text");

            nameInput.value = screen.currentWorldName;
            
            if (screen.isOwner) {
                title.textContent = "UPDATE WORLD";
                saveBtn.classList.remove("disabled");
                saveBtn.disabled = false;
                statusText.innerHTML = "You own this world. <br>Overwrite or Save as New?";
            } else {
                title.textContent = "SAVE COPY";
                saveBtn.classList.add("disabled");
                saveBtn.disabled = true;
                statusText.innerHTML = "You are viewing someone else's world (or a template). <br>Please 'Save As' to create your own copy.";
            }
        },
        
        doSave(e, $, ui) {
            const screen = $("saveGameScreen");
            const name = $("sg-name-input").value;
            const desc = $("sg-desc-input").value;
            
            if(!name) {
                alert("Please enter a world name!");
                return;
            }
            
            ui.peula("ikar", {
                olamPeula: {
                    downloadWorld: {
                        name: name,
                        description: desc,
                        overwrite: true 
                    }
                }
            });
            
            $("saveGameScreen").classList.add("hidden");
        },
        
        doSaveAs(e, $, ui) {
            const name = $("sg-name-input").value;
            const desc = $("sg-desc-input").value;
            
            if(!name) {
                alert("Please enter a new world name!");
                return;
            }
            
            // Force unique name logic handling on server/worker side usually, 
            // but here we just send the flag to create new
            ui.peula("ikar", {
                olamPeula: {
                    downloadWorld: {
                        name: name,
                        description: desc,
                        overwrite: false
                    }
                }
            });
            
            $("saveGameScreen").classList.add("hidden");
        },
        
        close(e, $) {
            $("saveGameScreen").classList.add("hidden");
        }
    },
    
    children: [
        {
            className: "sg-glass-panel",
            children: [
                {
                    className: "sg-header",
                    children: [
                        { className: "sg-title", textContent: "SAVE WORLD" },
                        { 
                            tag: "button", className: "sg-close-btn", textContent: "X",
                            onclick(e, $) { $("saveGameScreen").classList.add("hidden"); }
                        }
                    ]
                },
                {
                    className: "sg-body",
                    children: [
                        {
                            className: "sg-info-section",
                            children: [
                                { shaym: "sg-status-text", className: "sg-status", innerHTML: "Checking permissions..." }
                            ]
                        },
                        {
                            className: "sg-form",
                            children: [
                                { className: "sg-label", textContent: "WORLD NAME" },
                                { 
                                    tag: "input", shaym: "sg-name-input", className: "sg-input", type: "text", placeholder: "My Awesome World"
                                },
                                { className: "sg-label", textContent: "DESCRIPTION / NOTES" },
                                { 
                                    tag: "textarea", shaym: "sg-desc-input", className: "sg-input textarea", placeholder: "Describe this version..."
                                }
                            ]
                        },
                        {
                            className: "sg-actions",
                            children: [
                                {
                                    tag: "button", shaym: "sg-save-btn", className: "sg-btn primary", textContent: "SAVE (OVERWRITE)",
                                    onclick(e, $, ui) { ui.peula($("saveGameScreen"), { doSave: true }); }
                                },
                                {
                                    tag: "button", shaym: "sg-save-as-btn", className: "sg-btn secondary", textContent: "SAVE AS NEW",
                                    onclick(e, $, ui) { ui.peula($("saveGameScreen"), { doSaveAs: true }); }
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};
