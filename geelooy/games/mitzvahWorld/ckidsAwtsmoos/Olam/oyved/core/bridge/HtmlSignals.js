
/**
 * B"H
 * @module HtmlSignals
 * @description
 * 🕸️ THE WEB OF CREATION 🕸️
 * Maps the complex HTML generation requests into Promises, transmitting them
 * across the void and awaiting their physical fulfillment in the DOM.
 */
export class HtmlSignals {
    static bind(olam, promiseMap, UtilsClass) {
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
    }
}
