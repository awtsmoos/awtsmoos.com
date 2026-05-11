
// B"H
/**
 * @file index.js
 * @brief The Assembler of the Shield.
 */

export const InjectionAssembler = {
    _cache: new Map(),

    async _fetchScript(name) {
        if (this._cache.has(name)) return this._cache.get(name);
        try {
            const response = await fetch("assets/injections/" + name + ".js");
            if (!response.ok) throw new Error("Vessel missing: " + name);
            const text = await response.text();
            this._cache.set(name, text);
            return text;
        } catch (e) {
            console.error("B\"H [InjectionAssembler] Fetch Failed:", e);
            return "/* B\"H - Script Load Failed: " + name + " */";
        }
    },

    async getNetworkInterceptorScript(workspaceId, referrerPath, tabId) {
        const scripts = await Promise.all([
            this._fetchScript('console'),
            this._fetchScript('click'),
            this._fetchScript('contextmenu'),
            this._fetchScript('fetch')
        ]);

        return [
            "(function() {",
            "    window._AWTSMOOS_WID = " + JSON.stringify(workspaceId) + ";",
            "    window._AWTSMOOS_REF = " + JSON.stringify(referrerPath) + ";",
            "    window._AWTSMOOS_TAB_ID = " + JSON.stringify(tabId) + ";",
            "",
            "    window.parent.postMessage({",
            "        source: 'html-preview-bridge', type: 'status', ",
            "        previewTabId: window._AWTSMOOS_TAB_ID, payload: { status: 'ready' }",
            "    }, '*');",
            "",
            scripts.join("\n"),
            "})();"
        ].join("\n");
    }
};
