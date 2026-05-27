
/**
 * B"H
 * World Logic Methods for Worker
 */
import Utils from "../../../utils.js";

export default function(me, OlamClass) {
    return {
        async heescheel(options = {}) {
            if (!OlamClass) {
                return { tawchlees: { message: "Olam Class not loaded", code: "ERROR" } };
            }
            me.olam = new OlamClass();
            await me.olam.init();
            
            // Re-attach listeners
            me.olam.on("update minimap scroll", async ({ center, minimapCamera }) => {
                var id = Math.random().toString();
                var resultPromise = me.registerPromise(id);
                try {
                    postMessage({ updateMinimapScroll: { center, minimapCamera, id } });
                } catch(e) { return null; }
                return await resultPromise;
            });

            me.olam.on("hide loading screen", () => postMessage({ hideLoadingScreen: true }));
            
            me.olam.on("increased percentage", (info = {}) => {
                try { postMessage({ increasedOlamLoading: info }); } catch(e) {}
            });

            me.olam.on("error", er => postMessage({ error: er }));
            me.olam.on("reset loading percentage", () => postMessage({ resetPercentage: true }));

            me.olam.on("htmlCreate", async (info={}) => {
                var dayuh = Utils.stringifyFunctions(info);
                dayuh.id = Math.random().toString();
                var resultPromise = me.registerPromise(dayuh.id);
                postMessage({ htmlCreate: dayuh });
                return await resultPromise;
            });

            me.olam.on("switchWorlds", async (worldDayuh) => {
                var dayuh = Utils.stringifyFunctions(worldDayuh);
                postMessage({ switchWorlds: dayuh });
            });
            
            me.olam.on("htmlDelete", async (info={}) => postMessage({ htmlDelete: info }));
            me.olam.on("setup map", async () => postMessage({ startMapSetup: true }));
            
            me.olam.on("updateProgress", (data) => postMessage({ updateProgress: data }));
            
            me.olam.on("send ui event", async (shaym, ob) => {
                var id = Math.random().toString();
                var resultPromise = me.registerPromise(id);
                postMessage({ sendUiEvent: { shaym, ob, id } });
                return await resultPromise;
            });

            me.olam.on("setHtml", async ({shaym,info={}}={}) => {
                var dayuh = Utils.stringifyFunctions(info);
                info.id = Math.random().toString();
                var resultPromise = me.registerPromise(info.id);
                postMessage({ setHtml: { shaym, dayuh } });
                return await resultPromise;
            });

            me.olam.on("htmlAction", async (info={}) => {
                info.id = Math.random().toString();
                var dayuh = Utils.stringifyFunctions(info);
                var resultPromise = me.registerPromise(info.id);
                postMessage({ htmlAction: dayuh });
                return await resultPromise;
            });

            me.olam.on("get window size", async () => {
                var id = Math.random().toString();
                var resultPromise = me.registerPromise(id);
                postMessage({ getWindowSize: id });
                return await resultPromise;
            });

            me.olam.on("htmlActions", async (info={}) => {
                var id = Math.random().toString();
                var dayuh = Utils.stringifyFunctions(info);
                var resultPromise = me.registerPromise(id);
                postMessage({ htmlActions: { ar: dayuh, id } });
                return await resultPromise;
            });

            me.olam.on("htmlAppend", async (info={}) => {
                var dayuh = Utils.stringifyFunctions(info);
                info.id = Math.random().toString();
                var resultPromise = me.registerPromise(info.id);
                postMessage({ htmlAppend: dayuh });
                return await resultPromise;
            });

            me.olam.on("ready to start game", () => {
                postMessage({ "game started": true });
                postMessage({ loadedWorld: true });
            });

            me.olam.on("htmlGet", async (info={}) => {
                info.id = Math.random().toString();
                var resultPromise = me.registerPromise(info.id);
                postMessage({ htmlGet: info });
                return await resultPromise;
            });

            me.olam.on("mouseLock", () => postMessage({ lockMouse: true }));
            me.olam.on("mouseRelease", () => postMessage({ lockMouse: false }));

            var result;
            try {
                result = await me.olam.tzimtzum(options);
            } catch(e) {
                return { tawchlees: { message: "Error", code: "ERROR", error: e.stack } };
            }
            
            if(result) {
                return { tawchlees: { message: "Successfully made me.olam", code: "OLAM_GOOD" } };
            }
        },
        async destroyWorld(e) {
            if(me.olam) {
                await me.olam.ayshPeula("destroy");
            }
            postMessage({ deleteCanvas: true });
        },
        async downloadWorld(a) {
            try {
                var olamStringed = me?.olam?.getCompiledNivrayimInfo?.();
                var str = `//B"H\n//Downloaded the world at ${new Date()}!\n\nexport default ${JSON.stringify(olamStringed, null, "\t")}\n\n//Blessings and Success`;
                postMessage({ downloadWorld: { text: str } });
            } catch(e){ console.log("Issue saving world: ",e); }
        },
        async activeObjectAction(a) {
            await me.olam.ayshPeula("activeObjectAction", a);
        },
        async updateLiveEntity({ id, data }) {
            if (me.olam && me.olam.nivrayim) {
                const entity = me.olam.nivrayim.find(n => n.id === id);
                if (entity && entity.type === 'customNpc') {
                    if(data.name) entity.name = data.name;
                    if(data.customData) {
                        entity.customData = data.customData;
                        if(data.customData.shopInventory) entity.shopInventory = data.customData.shopInventory;
                        if(data.customData.balance !== undefined) entity.balance = data.customData.balance;
                        if(data.customData.contractPercentage !== undefined) entity.contractPercentage = data.customData.contractPercentage;
                    }
                }
            }
        },
        async awtsmoosEval(code) {
            if(typeof(code) == "string") {
                var result = eval(code);
                return { tawchlees: { message: "Got result of code", code: "SUCCESS", codeResult: result + "" } };
            }
        }
    };
}
