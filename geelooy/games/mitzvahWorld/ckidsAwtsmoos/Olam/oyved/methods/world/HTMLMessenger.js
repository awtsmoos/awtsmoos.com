
/**
 * B"H
 * @module HTMLMessenger
 */
import Utils from "../../../../utils.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class HTMLMessenger {
    static bind(me) {
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
    }
}
