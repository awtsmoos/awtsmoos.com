//B"H
console.log("B\"H");

(async () => {
    try {
        // Fix circular dependency: ensure utils.js is imported first.
        // This makes utils.js the initiator, so aiService.js (which imports utils.js)
        // can fully evaluate and define AIServiceHandler before utils.js tries to use it.
        await import("/scripts/awtsmoos/api/utils.js");

        // Dynamically import AI Service
        const { default: AIServiceHandler } = await import("/ai/aiService.js");
        
        // Initialize real AI Service
        var service = new AIServiceHandler();
        window.awtsmoosAi = async (...args) => await service.awtsmoosAi(...args);
        window.AIServiceHandler = AIServiceHandler;

        var pth = location.pathname.split("/");
        window.parentSeries = pth[4];

        // Load application logic
        const { startItAll } = await import("./logic/core.js");
        const { setupUIListeners, setupHighlightingLogic } = await import("./logic/listeners.js");
        const { loadFontSize, scrollToActiveEl } = await import("/heichelos/post/postFunctions.js");
        const { indexSwitch } = await import("/heichelos/post/commentLogic.js");

        await startItAll();
        setupUIListeners();
        loadFontSize();
        scrollToActiveEl();
        setupHighlightingLogic();
        await indexSwitch();	
    } catch (e) {
        var realPost = document.querySelector("#realPost");
        if(realPost) realPost.innerHTML = "Problem loading! Check console (CTRL+SHIFT+I)"
        console.error("Awtsmoos Post Logic Error:", e);
    }
})();