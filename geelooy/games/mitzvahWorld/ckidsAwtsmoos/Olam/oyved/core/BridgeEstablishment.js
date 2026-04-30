
/**
 * B"H
 * @file BridgeEstablishment.js
 * @module BridgeEstablishment
 * @description
 * 🌉 THE COVENANT OF COMMUNICATION (BRIT) 🌉
 * 
 * Every command the engine executes inside the isolated void (Worker) must be echoed 
 * to the DOM (Main Thread). This class binds the 10 statements of UI creation 
 * securely across the gap, wrapping them in mathematical IDs and unresolved Promises,
 * returning them perfectly synchronized once the "Amen" comes back from the screen!
 */

export class BridgeEstablishment {
    /**
     * @method bindBridges
     * @description Hooks Olam UI signals to postMessage dispatches and catalogs their Promises.
     * @param {Object} olam - The active Universe.
     * @param {Map} promiseMap - The sacred ledger of pending creations.
     * @param {Object} UtilsClass - Tools for turning life into JSON logic.
     */
    static bindBridges(olam, promiseMap, UtilsClass) {
        console.log('B"H - ⚡ Forging the Covenant of UI Communication across the Void.');

        olam.on("hide loading screen", () => {
            self.postMessage({ type: "hideLoadingScreen" });
        });

        olam.on("increased percentage", (info = {}) => {
            self.postMessage({ type: "increasedOlamLoading", payload: info });
        });

        const formulateMessage = (eventType, info) => {
            const req = UtilsClass.stringifyFunctions(info);
            req.id = Math.random().toString();
            const p = new Promise(r => promiseMap.set(req.id, r));
            self.postMessage({ type: eventType, payload: req });
            return p;
        };

        olam.on("htmlCreate", async (info={}) => {
            return await formulateMessage("htmlCreate", info);
        });
        
        olam.on("htmlAction", async (info={}) => {
            return await formulateMessage("htmlAction", info);
        });

        olam.on("htmlDelete", async (info={}) => {
            const req = { ...info, id: Math.random().toString() };
            const p = new Promise(r => promiseMap.set(req.id, r));
            self.postMessage({ type: "htmlDelete", payload: req });
            return await p;
        });
        
        olam.on("htmlActions", async (ar) => {
            const id = Math.random().toString();
            const p = new Promise(r => promiseMap.set(id, r));
            self.postMessage({ type: "htmlActions", payload: { ar: ar.map(UtilsClass.stringifyFunctions), id } });
            return await p;
        });

        olam.on("send ui event", async (shaym, ob) => {
            const id = Math.random().toString();
            const p = new Promise(r => promiseMap.set(id, r));
            self.postMessage({ type: "sendUiEvent", payload: { shaym, ob, id } });
            return await p;
        });

        console.log('B"H - ✅ Bridges Secured.');
    }
}
