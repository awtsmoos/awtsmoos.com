// B"H
/**
 * @file html.js
 * @description
 * Chapter 108: the worker HTML bridge stops screaming when ancient dialogue
 * vessels are missing. Village NPCs now use direct HTML overlays; legacy
 * dialogue-vessel actions are swallowed as harmless ghosts instead of console
 * wounds, while real DOM commands still pass through.
 */
import Utils from "../../../utils.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

const QUIET_MISSING_SHAYM = new Set(["dialogue-vessel", "openNpcChallengeOverlay", "levelSelectScreen"]);

function quietMissing(shaym) {
  return QUIET_MISSING_SHAYM.has(String(shaym || ""));
}

export default function htmlHandlers(manager) {
  const { eved, myUi } = manager;
  return {
    async htmlAction(dayuh, noSocket) {
      if (typeof dayuh !== "object" || !dayuh) return null;
      const parsed = Utils.evalStringifiedFunctions(dayuh);
      const { shaym, selector, properties, methods, id } = parsed;
      let ac = null;
      try {
        ac = myUi.htmlAction({ shaym, selector, properties, methods });
      } catch (error) {
        if (quietMissing(shaym)) return { htmlActioned: { shaym, selector, id, quietMissing: true } };
        throw error;
      }
      if (!ac) {
        const res = { htmlActioned: { shaym, selector, id, missing: true } };
        if (!noSocket) eved.postMessage(res);
        return res;
      }
      const ps = ac.propertiesSet ? Utils.stringifyFunctions(ac.propertiesSet) : null;
      const mc = ac.methodsCalled ? Utils.stringifyFunctions(ac.methodsCalled) : null;
      const res = { htmlActioned: { shaym, methodsCalled: mc, propertiesSet: ps, selector, id } };
      if (!noSocket) eved.postMessage(res);
      return res;
    },

    async htmlActions(dayuh) {
      const { ar, id } = dayuh || {};
      const done = [];
      if (Array.isArray(ar)) for (const m of ar.filter(Boolean)) done.push(await manager.tawfeekim.htmlAction(m, true));
      eved.postMessage({ htmlActioned: { ar, done, id } });
    },

    htmlCreate(info) {
      try {
        const parsed = Utils.evalStringifiedFunctions(info || {});
        myUi.html(parsed);
        eved.postMessage({ htmlCreated: { shaym: info?.shaym, id: info?.id } });
      } catch (error) {
        if (!quietMissing(info?.shaym)) console.error("B\"H Error in htmlCreate handler:", error);
        eved.postMessage({ htmlCreated: { shaym: info?.shaym, id: info?.id, error: quietMissing(info?.shaym) ? null : error.toString() } });
      }
    },

    htmlDelete(info) {
      const { shaym, id } = info || {};
      const result = myUi.deleteHtml(shaym);
      eved.postMessage({ htmlDeleted: { shaym, result, id } });
    },

    htmlGet(data) {
      const { shaym, properties = {}, methods = {}, id } = data || {};
      const html = myUi.getHtml(shaym);
      if (!html) return;
      const getProperties = (el, propsObj) => {
        const result = {};
        for (const prop in propsObj) if (Object.hasOwn(propsObj, prop)) result[prop] = typeof propsObj[prop] === "object" && propsObj[prop] !== null ? getProperties(el[prop], propsObj[prop]) : el[prop];
        return result;
      };
      const executeMethods = (el, methodsObj) => {
        const results = {};
        for (const methodName in methodsObj) if (Object.hasOwn(methodsObj, methodName) && typeof el[methodName] === "function") results[methodName] = el[methodName](...methodsObj[methodName]);
        return results;
      };
      eved.postMessage({ htmlGot: { shaym, propertiesGot: Utils.stringifyFunctions(getProperties(html, properties)), methodsGot: Utils.stringifyFunctions(executeMethods(html, methods)), id } });
    },

    setHtml(data) {
      const { shaym, dayuh } = data || {};
      const parsed = Utils.evalStringifiedFunctions(dayuh || {});
      myUi.setHtmlByShaym(shaym, parsed);
      eved.postMessage({ htmlSet: { shaym } });
    },

    htmlSet(data) { this.setHtml(data); },
    htmlActioned() {},

    htmlPeula(obj) {
      if (!obj) return;
      for (const k in obj) manager.olam.ayshPeula("htmlPeula " + k, obj[k]);
    },

    htmlAppend(data) {
      const { shaym, child } = data || {};
      if (child && typeof child === "object") {
        const parsed = Utils.evalStringifiedFunctions(child);
        parsed.parent = shaym;
        myUi.html(parsed);
      }
    }
  };
}
