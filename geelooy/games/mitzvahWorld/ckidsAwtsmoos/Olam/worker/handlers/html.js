
/**
 * B"H
 * HTML Worker Handlers
 * Handles creation, modification, and deletion of DOM elements via worker commands.
 */
import Utils from "../../../utils.js";

export default function htmlHandlers(manager) {
    const { eved, myUi } = manager;

    return {
        async htmlAction(dayuh, noSocket) {
            if (typeof dayuh !== "object" || !dayuh) return null;
            
            const parsed = Utils.evalStringifiedFunctions(dayuh);
            const { shaym, selector, properties, methods, id } = parsed;

            const ac = myUi.htmlAction({ shaym, selector, properties, methods });
            if (!ac) return null;

            const ps = ac.propertiesSet ? Utils.stringifyFunctions(ac.propertiesSet) : null;
            const mc = ac.methodsCalled ? Utils.stringifyFunctions(ac.methodsCalled) : null;

            const res = {
                htmlActioned: {
                    shaym, methodsCalled: mc, propertiesSet: ps, selector, id
                }
            };

            if (!noSocket) eved.postMessage(res);
            return res;
        },

        htmlActions(dayuh) {
            const { ar, id } = dayuh || {};
            const done = [];
            if (Array.isArray(ar)) {
                ar.filter(Boolean).forEach(m => {
                    // Use the main manager dispatcher to find the htmlAction handler
                    done.push(manager.tawfeekim.htmlAction(m, true));
                });
            }
            eved.postMessage({ htmlActioned: { ar, done, id } });
        },

        htmlCreate(info) {
             try {
                 // B"H: Wrap in try-catch to prevent worker hang if eval or html() fails
                 const parsed = Utils.evalStringifiedFunctions(info || {});
                 myUi.html(parsed);
                 // Always reply success to unblock worker, even if partial failure
                 eved.postMessage({ htmlCreated: { shaym: info?.shaym, id: info?.id } });
             } catch (e) {
                 console.error("B\"H Error in htmlCreate handler:", e);
                 // Send response anyway to unblock, but maybe with error flag if needed
                 eved.postMessage({ htmlCreated: { shaym: info?.shaym, id: info?.id, error: e.toString() } });
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

            function getProperties(htmlElement, propsObj) {
                const result = {};
                for (const prop in propsObj) {
                    if (propsObj.hasOwnProperty(prop)) {
                        if (typeof propsObj[prop] === 'object' && propsObj[prop] !== null) {
                            result[prop] = getProperties(htmlElement[prop], propsObj[prop]);
                        } else {
                            result[prop] = htmlElement[prop];
                        }
                    }
                }
                return result;
            }

            function executeMethods(htmlElement, methodsObj) {
                const results = {};
                for (const methodName in methodsObj) {
                    if (methodsObj.hasOwnProperty(methodName) && typeof htmlElement[methodName] === 'function') {
                        const args = methodsObj[methodName];
                        results[methodName] = htmlElement[methodName](...args);
                    }
                }
                return results;
            }

            let propertiesGot = getProperties(html, properties);
            let methodsGot = executeMethods(html, methods);

            propertiesGot = Utils.stringifyFunctions(propertiesGot);
            methodsGot = Utils.stringifyFunctions(methodsGot);

            eved.postMessage({ htmlGot: { shaym, propertiesGot, methodsGot, id } });
        },
        
        setHtml(data) {
             const {shaym, dayuh} = data || {};
             const parsed = Utils.evalStringifiedFunctions(dayuh || {});
             myUi.setHtmlByShaym(shaym, parsed);
             eved.postMessage({ htmlSet: { shaym } });
        },
        
        // Alias for setHtml
        htmlSet(data) {
             this.setHtml(data);
        },
        
        htmlActioned(info) {
            // Callback handler
        },

        htmlPeula(obj) {
            if(!obj) return;
            
            // B"H: Forward generic HTML peulas directly to the Olam event system
            // instead of trying to run them as HTML actions.
            // This allows Dialogue.js to listen for "htmlPeula toggleToOption".
            for(var k in obj) {
                 manager.olam.ayshPeula("htmlPeula " + k, obj[k]);
            }
        },

        htmlAppend(data) {
            const {shaym, child} = data || {};
            if(child && typeof(child) == "object") {
                var parsed = Utils.evalStringifiedFunctions(child);
                parsed.parent = shaym;
                myUi.html(parsed);
            }
        },
    };
}
