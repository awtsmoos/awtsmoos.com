
// B"H
/**
 * @module uiHandlers
 * @description
 * 🖼️ CHAPTER 32: THE LIGHT REFLECTED IN THE MIRROR 🖼️
 */
import VeilController from "../../uiManager/logic/VeilController.js";

export default function uiHandlers(manager) {
    return {
        /**
         * @function hideLoadingScreen
         * @description The final command to Reveal the World.
         */
        hideLoadingScreen() {
            // B"H: silent

            VeilController.lift();
            document.body.style.overflow = 'hidden';
        },

        /**
         * @function increasedOlamLoading
         * @description Incremental updates for the progress bar.
         */
        increasedOlamLoading(data) {
            const { amount, action } = data || {};
            const percent = (amount || 0) + "%";
            
            manager.myUi.htmlAction({ 
                shaym: "loading bar", 
                properties: { style: { width: percent } } 
            });

            // Absolute Physical Force to update progress instantly
            const bar = document.getElementById('genesisProgressBar');
            if (bar) bar.style.width = percent;

            const textVessel = document.getElementById('genesisActionText') || document.querySelector('[shaym="action loading"]');
            if (textVessel && action) {
                textVessel.textContent = action;
            }
        },

        resetPercentage() {
            const bar = document.getElementById('genesisProgressBar');
            if (bar) bar.style.width = "0%";
        },

        sendUiEvent(data) {
            const { shaym, ob, id } = data || {};
            if (shaym && manager.myUi) {
                manager.myUi.peula(shaym, ob, id);
            }
            if (id && manager.eved) {
                manager.eved.postMessage({ type: 'uiEvented', id });
            }
        }
    };
}
