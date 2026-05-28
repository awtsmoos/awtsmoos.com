
/**
 * @file core.js
 * @description
 * ⚙️ CHAPTER 3: CORE COMMAND HANDLERS ⚙️
 * 
 * Corrected the dimensional imprinted logic to ensure that even 
 * on mobile browsers that withhold measurements, we use safe defaults 
 * before the Tzimtzum (transferControlToOffscreen).
 */

export default function coreHandlers(manager) {
    const { eved, myUi } = manager;

    return {
        async awtsmoosEval(code) {
             // B"H: silent

             try {
                const func = new Function('manager', 'me', 'olam', `return eval(\`${code}\`);`);
                const result = func(manager, manager, manager.olam);
                return { tawchlees: { code: "SUCCESS", codeResult: String(result) } };
             } catch(e) {
                return { tawchlees: { code: "ERROR", codeResult: e.toString() } };
             }
        },

        lockMouse(doIt) {
            // B"H: silent

            if (doIt) document.body.requestPointerLock();
            else document.exitPointerLock();
        },

        async takeInCanvas(data) {
            // B"H: silent

        },

        async heescheel(options) {
            if (manager._canvasTransferred) {
                console.warn("B\"H - ⚠️ Logic re-entry prevented: The world is already offscreen.");
                return;
            }

            if (!manager.canvasElement) {
                console.error("B\"H - 🚨 THE VESSEL IS MISSING! heescheel cannot proceed.");
                return;
            }

            try {
                // 1. Purge physical remnants safely using pure DOM
                manager.canvasElement.style.outline = "none";
                manager.canvasElement.style.border = "none";

                // 2. Measure the void with absolute truth
                const dpr = window.devicePixelRatio || 1;
                const w = window.innerWidth || 1024;
                const h = window.innerHeight || 768;
                const rect = manager.canvasElement.getBoundingClientRect?.();
                console.info("B\"H | MAIN_CANVAS_TRACE | heescheel:measured", {
                    windowWidth: w,
                    windowHeight: h,
                    devicePixelRatio: dpr,
                    canvasClientWidth: manager.canvasElement.clientWidth,
                    canvasClientHeight: manager.canvasElement.clientHeight,
                    canvasRect: rect ? {
                        width: rect.width,
                        height: rect.height,
                        left: rect.left,
                        top: rect.top
                    } : null
                });
                
                manager.canvasElement.width = w * dpr;
                manager.canvasElement.height = h * dpr;

                // B"H: silent

                const offscreen = manager.canvasElement.transferControlToOffscreen();
                manager._canvasTransferred = true;

                // 3. Emit the vessel into the angel's thread
                eved.postMessage({
                    takeInCanvas: {
                        canvas: offscreen,
                        devicePixelRatio: dpr,
                        width: w,
                        height: h
                    }
                }, [offscreen]);

                // B"H: silent


            } catch(e) {
                console.error("B\"H - 🆘 Physical Tzimtzum failed:", e);
            }
        },

        alert(ms) { window.alert(String(ms)); },

        getWindowSize(id) {
            const size = { width: innerWidth, height: innerHeight };
            eved.postMessage({ sized: { size, id } });
        }
    };
}
