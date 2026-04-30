
// B"H
/**
 * @module uiHandlers
 * @description
 * * Chapter 32: The Orchestration of the Interface
 * Gathers the disparate modular handlers of the UI and binds them 
 * into a single unified map for the Worker Manager.
 */
import setupVeilDissolver from "./ui/VeilDissolver.js";

export default function uiHandlers(manager) {
    const veil = setupVeilDissolver(manager);

    return {
        ...veil,

        /**
         * @function increasedOlamLoading
         * @description Updates the visual state of the progress bar during emanation.
         */
        increasedOlamLoading(data) {
            const { amount, action, subAction } = data || {};
            const percent = amount + "%";
            
            manager.myUi.htmlAction({ 
                shaym: "loading bar", 
                properties: { style: { width: percent } } 
            });
            
            if (action) {
                manager.myUi.htmlAction({ 
                    shaym: "action loading", 
                    properties: { textContent: action } 
                });
            }
            if (subAction) {
                manager.myUi.htmlAction({ 
                    shaym: "sub action loading", 
                    properties: { textContent: subAction } 
                });
            }
        },

        /**
         * @function sendUiEvent
         * @description Bridges a generic event from the worker to the Main UI.
         */
        sendUiEvent(data) {
            const { shaym, ob, id } = data || {};
            if (shaym) manager.myUi.peula(shaym, ob, id);
            if (id) manager.eved.postMessage({ uiEvented: { id } });
        }
    };
}
