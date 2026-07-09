
// B"H
import ShlichusHandler from "../../../shleechoosHandler.js?compact=true&v=full-chain-cache-bust-20260708-bh10";

/**
 * @file utils.js
 * Chapter 3: The Interaction Matrix.
 */
export default {
    startShlichusHandler() {
        this.shlichusHandler = new ShlichusHandler(this); 
    },

    /**
     * searchForProperty - Climbing the tree of Sefirot to find human intention.
     */
    searchForProperty(event, propertyName, returnIt = false) {
        let el = event.target;
        const isDomPresent = typeof document !== 'undefined';
        
        while (el && isDomPresent && el !== document.body && el !== document.documentElement) {
            if (el[propertyName] !== undefined) {
                // B"H: silent

                return returnIt ? el : el[propertyName];
            }
            if (el.getAttribute && el.getAttribute(propertyName)) {
                return returnIt ? el : el.getAttribute(propertyName);
            }
            el = el.parentElement; 
        }
        return null;
    },

    go(ob, id=this.official) {
        if(!Array.isArray(ob)) return ob;
        var f = ob.find(w => (w ? w[id] : null));
        if(f) delete f[id];
        return f;
    },

    async fetchWithProgress(url, options = {}, otherOptions) {
        const { onProgress } = otherOptions || {};
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response;
    }
};
