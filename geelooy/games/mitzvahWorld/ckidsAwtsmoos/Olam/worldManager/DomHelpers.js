
/**
 * B"H
 * @module DomHelpers
 * @description
 * Purely structural utilities injected into the global window, granting it the power 
 * to climb the tree of DOM elements and seek properties hidden within.
 */
export default class DomHelpers {
    static setupGlobalFunctions() {
        function searchForProperty(event, propertyName, returnIt = false) {
            let el = event.target;
            var pr = null;
            var element = null;
            
            while (!pr && el && el !== document.body && el !== document.documentElement) {
                if(pr) break;
                var prop = el[propertyName];
                if(prop !== undefined) {
                    pr = prop;
                    element = el;
                    break;
                }
                el = el.parentElement; 
            }

            if(returnIt) {
                return element;
            }
            return pr; 
        }
        window.searchForProperty = searchForProperty;
    }
}
