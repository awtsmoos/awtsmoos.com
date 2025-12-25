
//B"H
console.log("%c B\"H - postLogic.js Loaded", "background: #000; color: #0f0; font-size: 14px;");

/**
 * Main Entry Point for the Post Application.
 */
(async () => {
    console.log("%c B\"H - Async Initialization Loop Starting", "color: #00bcd4;");
    
    // 1. Setup UI Listeners (Safe, no deep deps)
    try {
        const { setupUIListeners, setupHighlightingLogic } = await import("./logic/listeners.js");
        setupUIListeners();
        window._setupHighlighting = setupHighlightingLogic;
        console.log("%c B\"H - UI Listeners Setup Complete", "color: #8bc34a;");
    } catch (e) {
        console.error("%c B\"H - Critical Error in listeners setup:", "color: red;", e);
    }

    // 2. Setup Utilities and AI
    try {
        await import("/scripts/awtsmoos/api/utils.js").catch(e => {
            console.warn("B\"H - Standard utils not present.");
        });

        const { loadFontSize, scrollToActiveEl } = await import("/heichelos/post/postFunctions.js");
        loadFontSize();

        try {
            const { default: AIServiceHandler } = await import("/ai/aiService.js");
            const service = new AIServiceHandler();
            window.awtsmoosAi = async (...args) => await service.awtsmoosAi(...args);
        } catch(aiError) {
            console.log("%c B\"H - AI Service Offline", "color: #9e9e9e;");
        }

        // 3. Import Core Logic - The Critical Path
        try {
            const { startItAll } = await import("./logic/core.js");
            const { indexSwitch } = await import("/heichelos/post/commentLogic.js");

            console.log("%c B\"H - Invoking startItAll()", "color: #ffc107; font-weight: bold;");
            await startItAll();
            
            if(window._setupHighlighting) window._setupHighlighting();
            scrollToActiveEl();
            await indexSwitch();	
            
            console.log("%c B\"H - Final Initialization Sequence Finished", "background: #4caf50; color: white; padding: 5px;");
            
        } catch (coreError) {
            // Enhanced Diagnostic Trace
            console.error("%c B\"H - FATAL ERROR loading Core Logic", "background: red; color: white; font-size: 16px;", coreError);
            
            const modulesToCheck = [
                "./logic/core.js",
                "./logic/api.js",
                "/heichelos/post/commentLogic.js",
                "/heichelos/post/comments/panel.js",
                "/heichelos/post/comments/render.js",
                "/heichelos/post/comments/render/ai/structure.js",
                "/heichelos/post/comments/render/ai/nodes.js",
                "/heichelos/post/parsing.js"
            ];

            const failedModules = [];
            for (const mod of modulesToCheck) {
                try {
                    // Try to fetch to see if it's a 404 (Network Error)
                    const resp = await fetch(mod);
                    if (!resp.ok) {
                        failedModules.push(`${mod} (HTTP ${resp.status})`);
                    } else {
                        // If network is OK, maybe it's a syntax error.
                        // We can't easily check syntax without eval, but we can log that it exists.
                        // console.log(`Module ${mod} found.`);
                    }
                } catch (netErr) {
                    failedModules.push(`${mod} (Network/Fetch Error)`);
                }
            }

            const realPost = document.querySelector("#realPost");
            if(realPost) {
                realPost.innerHTML = `<div style="color:white; background: #330000; padding:20px; border:2px solid red;">
                    <h3 style="margin-top:0;">B"H - Revelation Interrupted</h3>
                    <p><strong>Error:</strong> ${coreError.message}</p>
                    ${failedModules.length > 0 ? 
                        `<p><strong>Missing Modules (404/Error):</strong><br>${failedModules.join('<br>')}</p>` : 
                        `<p>All modules are reachable. Likely a Syntax Error or Circular Dependency in imports.</p>`
                    }
                    <p>Please check console for stack trace.</p>
                </div>`;
            }
        }
        
    } catch (e) {
        console.error("%c B\"H - Unexpected Global Error:", "background: red; color: white;", e);
    }
})();
