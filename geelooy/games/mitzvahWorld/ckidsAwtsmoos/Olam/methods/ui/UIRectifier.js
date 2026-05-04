
// B"H
/**
 * @file UIRectifier.js
 * @description
 * "He who weighs the mountains in scales." 
 */
 
export default class UIRectifier {
 
    /**
     * @method rectify
     * @description Synchronizes the UI layer with the physical monitor.
     */
    static async rectify(olam, width, height) {
        if (!olam || !width || !height) return;
 
        // B"H: silent

 
        const actions = [
            {
                shaym: "main av",
                properties: {
                    style: {
                        position: "fixed", top: "0px", left: "0px",
                        width: `${width}px`, height: `${height}px`,
                        overflow: "hidden"
                    }
                }
            },
            {
                shaym: "gameID",
                properties: {
                    style: {
                        position: "absolute", top: "0px", left: "0px",
                        width: "100%", height: "100%",
                        pointerEvents: "none"
                    }
                }
            }
        ];
 
        await olam.ayshPeula("htmlActions", actions);
 
        let rect = { left: 0, top: 0, width, height };
 
        /**
         * B"H: THE BINDING TIKKUN
         * In a Worker architecture, olam.renderer.domElement may refer to 
         * an OffscreenCanvas which lacks getBoundingClientRect.
         * We verify that the vessel is a true HTML element before probing.
         */
        const targetElement = olam.canvasElement || (olam.renderer ? olam.renderer.domElement : null);

        if (targetElement && typeof targetElement.getBoundingClientRect === 'function') {
            try {
                const actualRect = targetElement.getBoundingClientRect();
                if (actualRect && actualRect.width > 0) {
                    rect = {
                        left: actualRect.left,
                        top: actualRect.top,
                        width: actualRect.width,
                        height: actualRect.height
                    };
                }
            } catch (err) {
                 // Silemt fallback to calculated values
            }
        }
 
        olam.boundingRect = rect;
    }
}
