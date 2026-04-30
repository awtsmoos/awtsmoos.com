
// B"H
/**
 * @module worldMethods
 * @description
 * * Chapter 35: The Decree of Transmission
 * Bridges the spiritual events of the Olam inside the worker back to 
 * the physical world of the Main Thread.
 */
import Utils from "../../../utils.js";

export default function(me, OlamClass) {
    return {
        async heescheel(options = {}) {
            if (!OlamClass) return { tawchlees: { message: "Class Nullified", code: "ERROR" } };
            
            me.olam = new OlamClass();
            if (options.set) Object.assign(me.olam, options.set);

            await me.olam.init();
            
            // --- Handshake Listeners ---
            
            me.olam.on("hide loading screen", () => {
                console.log("B\"H - 📡 Worker -> Main: Command LIFT_VEIL.");
                postMessage({ type: 'hideLoadingScreen' });
            });

            me.olam.on("increased percentage", (info = {}) => {
                postMessage({ type: 'increasedOlamLoading', payload: info });
            });

            me.olam.on("ready to start game", () => {
                postMessage({ type: 'game started', payload: true });
                postMessage({ type: 'loadedWorld', payload: true });
            });

            // --- Generic HTML Bridge ---

            me.olam.on("htmlCreate", async (info={}) => {
                const dayuh = Utils.stringifyFunctions(info);
                dayuh.id = Math.random().toString();
                const resPromise = me.registerPromise(dayuh.id);
                postMessage({ type: 'htmlCreate', payload: dayuh });
                return await resPromise;
            });

            me.olam.on("htmlAction", async (info={}) => {
                info.id = Math.random().toString();
                const dayuh = Utils.stringifyFunctions(info);
                const resPromise = me.registerPromise(dayuh.id);
                postMessage({ type: 'htmlAction', payload: dayuh });
                return await resPromise;
            });

            me.olam.on("send ui event", async (shaym, ob) => {
                const id = Math.random().toString();
                const resPromise = me.registerPromise(id);
                postMessage({ type: 'sendUiEvent', payload: { shaym, ob, id } });
                return await resPromise;
            });

            // Start the Tzimtzum!
            const result = await me.olam.tzimtzum(options);
            if (result) {
                return { tawchlees: { message: "Olam good", code: "OLAM_GOOD" } };
            }
        },

        async updateLiveEntity({ id, data }) {
            if (me.olam) {
                const ent = me.olam.nivrayim.find(n => n.id === id);
                if (ent) Object.assign(ent, data);
            }
        }
    };
}
