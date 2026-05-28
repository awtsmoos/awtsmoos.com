// B"H
/**
 * @file messageHandler.js
 * @description Chapter 20: Main-thread worker dispatcher with bh24 UI and input cache keys.
 */
import coreHandlers from "./handlers/core.js";
import htmlHandlers from "./handlers/html.js";
import uiHandlers from "./handlers/ui.js?v=lean-l1-20260528-bh28";
import worldHandlers from "./handlers/world.js";
import inputHandlers from "./handlers/input.js?v=lean-l1-20260528-bh28";

export default function setupMessageHandler(manager) {
  const promiseMap = new Map();

  function registerPromise(id) {
    return new Promise((resolve, reject) => promiseMap.set(id, { resolve, reject }));
  }

  manager.promiseMap = promiseMap;
  manager.registerPromise = registerPromise;

  const dispatcher = {
    ...coreHandlers(manager),
    ...htmlHandlers(manager),
    ...uiHandlers(manager),
    ...worldHandlers(manager),
    ...inputHandlers(manager)
  };

  manager.tawfeekim = dispatcher;

  manager.handleMessageEvent = async event => {
    const data = event.data;
    if (typeof data !== 'object' || data === null) return;

    if (data.type && typeof data.type === 'string') {
      const task = dispatcher[data.type];
      if (typeof task === 'function') {
        try {
          const result = await task.call(dispatcher, data.payload || data);
          const finalResponse = result !== undefined && result !== null ? result : {};
          if (finalResponse?.id) window.postMessage?.({ [data.type + "Response"]: finalResponse });
        } catch (e) {
          console.error(`B"H - Type-handler [${data.type}] crashed:`, e);
        }
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
      if (typeof task === 'function') {
        try {
          const result = await task.call(dispatcher, payload);
          const finalResponse = result !== undefined && result !== null ? result : {};
          if (payload?.id && !finalResponse.id) finalResponse.id = payload.id;
        } catch (e) {
          console.error(`B"H - Task [${key}] shattered during processing:`, e);
        }
      }
      if (payload?.id && promiseMap.has(payload.id)) {
        promiseMap.get(payload.id).resolve(payload);
        promiseMap.delete(payload.id);
      }
    }
  };
}
