
// B"H
export default {
    async htmlActions(ar) {
        return await this.ayshPeula("htmlActions", ar);
    },
    
    async htmlAction(shaym, properties, methods, selector) {
        if(typeof(shaym) == "object") {
            properties = shaym.properties;
            methods = shaym.methods;
            selector = shaym.selector;
            shaym = shaym.shaym;
        }
        return await this.ayshPeula("htmlAction", {
            shaym,
            properties,
            methods,
            selector
        });
    }
};
