//B"H
console.log("%c B\"H - postLogic.js Loaded", "background: #000; color: #0f0; font-size: 14px;");

// Diagnostic alert to verify script execution in the browser
// If you see this popup, the script is definitely running.
// window.alert("B\"H - Awtsmoos Post Logic Starting...");

/**
 * Main Entry Point for the Post Application.
 */
(async () => {
    console.log("%c B\"H - Async Initialization Loop Starting", "color: #00bcd4;");
    
    try {
        const { setupUIListeners, setupHighlightingLogic } = await import("./logic/listeners.js");
        setupUIListeners();
        window._setupHighlighting = setupHighlightingLogic;
        console.log("%c B\"H - UI Listeners Setup Complete", "color: #8bc34a;");
    } catch (e) {
        console.error("%c B\"H - Critical Error in listeners setup:", "color: red;", e);
    }

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

        const { startItAll } = await import("./logic/core.js");
        const { indexSwitch } = await import("/heichelos/post/commentLogic.js");

        console.log("%c B\"H - Invoking startItAll()", "color: #ffc107; font-weight: bold;");
        await startItAll();
        
        if(window._setupHighlighting) window._setupHighlighting();
        scrollToActiveEl();
        await indexSwitch();	
        
        console.log("%c B\"H - Final Initialization Sequence Finished", "background: #4caf50; color: white; padding: 5px;");
        
    } catch (e) {
        console.error("%c B\"H - FATAL ERROR in postLogic loop:", "background: red; color: white; font-size: 16px;", e);
        const realPost = document.querySelector("#realPost");
        if(realPost) {
            realPost.innerHTML = `<div style="color:red; padding:20px; border:2px solid red;">
                <h3>B"H - Revelation Interrupted</h3>
                <p>Error: ${e.message}</p>
                <p>Please check console for details.</p>
            </div>`;
        }
    }
})();