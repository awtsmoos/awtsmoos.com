// B"H
/**
 * @file messageHandler.js
 * @description Chapter 75: Worker dispatcher drinks from current UI/input
 * handlers. The Awtsmoos keeps reset and enable messages in the same boot
 * covenant as the platform-size repair.
 */
import coreHandlers from "./handlers/core.js?v=wide-platform-real-boot-chain-20260529-bh75";
import htmlHandlers from "./handlers/html.js?v=wide-platform-real-boot-chain-20260529-bh75";
import uiHandlers from "./handlers/ui.js?v=wide-platform-real-boot-chain-20260529-bh75";
import worldHandlers from "./handlers/world.js?v=wide-platform-real-boot-chain-20260529-bh75";
import inputHandlers from "./handlers/input.js?v=wide-platform-real-boot-chain-20260529-bh75";

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
