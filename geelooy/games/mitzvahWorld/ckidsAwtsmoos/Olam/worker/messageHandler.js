// B"H
/**
 * @file messageHandler.js
 * @description
 * Chapter 137: The Browser Handler imports the fresh centered NPC UI, enlarged
 * walk-in-house message path, and old lava reset behavior. Future AI: if NPC UI
 * looks left-clipped, first check this cache seal before inventing another UI.
 */
import coreHandlers from "./handlers/core.js?v=village-fix-20260531-bh108";
import htmlHandlers from "./handlers/html.js?v=village-fix-20260531-bh108";
import uiHandlers from "./handlers/ui.js?v=centered-npc-big-house-20260602-bh137";
import worldHandlers from "./handlers/world.js?v=village-fix-20260531-bh108";
import inputHandlers from "./handlers/input.js?v=lava-countdown-feet-20260602-bh8";

export default function setupMessageHandler(manager) {
  const promiseMap = new Map();
  manager.promiseMap = promiseMap;
  manager.registerPromise = id => new Promise((resolve, reject) => promiseMap.set(id, { resolve, reject }));
  const dispatcher = { ...coreHandlers(manager), ...htmlHandlers(manager), ...uiHandlers(manager), ...worldHandlers(manager), ...inputHandlers(manager) };
  manager.tawfeekim = dispatcher;
  manager.handleMessageEvent = async event => {
    const data = event.data;
    if (typeof data !== "object" || data === null) return;
    if (data.type && typeof data.type === "string") {
      const task = dispatcher[data.type];
      if (typeof task === "function") {
        try { await task.call(dispatcher, data.payload || data); }
        catch (e) { console.error(`B"H - Type-handler [${data.type}] crashed:`, e); }
      }
      if (data.id && promiseMap.has(data.id)) {
        promiseMap.get(data.id).resolve(data);
        promiseMap.delete(data.id);
      }
      return;
    }
    for (const key of Object.keys(data)) {
      const task = dispatcher[key];
      const payload = data[key];
      if (typeof task === "function") {
        try { await task.call(dispatcher, payload); }
        catch (e) { console.error(`B"H - Task [${key}] shattered during processing:`, e); }
      }
      if (payload?.id && promiseMap.has(payload.id)) {
        promiseMap.get(payload.id).resolve(payload);
        promiseMap.delete(payload.id);
      }
    }
  };
}
