
// B"H
/**
 * @file iframe-injector.js
 * @brief The Breath of Life into the Empty Sandbox.
 * 
 * CHAPTER XIX: THE FAIL-SOFT MANIFESTATION
 * Even if a spark is broken, the vessel should still hold form.
 * This injector wraps the preview creation in a protective layer.
 * It ensures the Network Interceptor is the first to arrive,
 * catching all future errors without blocking the visual paint.
 */

import { InjectionAssembler } from './injections/index.js';

export const IframeInjector = {
    /**
     * B"H
     * Injects the shielded HTML into the sandbox iframe.
     */
    inject(doc, iframe, identity, tabId) {
        try {
            // Apply the Sacred Sandboxed Bounds
            iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-modals allow-popups');

            // 1. Prepare the Divine Interceptor
            const scriptStr = InjectionAssembler.getNetworkInterceptorScript(identity.workspaceId, identity.path, tabId);
            const shield = `<script data-merkava-internal="true">${scriptStr}</script>`;
            
            let htmlText = doc.documentElement.outerHTML;
            
            // 2. Inject the Shield at the Keter (Head)
            if (htmlText.match(/<head>/i)) {
                htmlText = htmlText.replace(/<head>/i, () => `<head>\n${shield}\n`);
            } else {
                htmlText = shield + htmlText;
            }
            
            // 3. Manifest into the physical Iframe
            const frameWindow = iframe.contentWindow;
            const frameDoc = iframe.contentDocument || frameWindow.document;
            
            frameDoc.open(); 
            // We prepend a script to catch immediate synchronous errors during write
            frameDoc.write("<!DOCTYPE html>\n" + htmlText); 
            frameDoc.close();
            
            console.log(`%cB"H [IframeInjector] Vision manifested for Tab ${tabId}.`, "color: #a8ff00; font-weight: bold;");
        } catch (e) { 
            console.error(`B"H [IframeInjector] Critical Failure:`, e);
            this.writeError(iframe, `Manifestation failed: ${e.message}`); 
        }
    },

    /**
     * @function writeError
     * @description Renders a diagnostic fallback if the entire iframe crashes.
     */
    writeError(iframe, msg) {
        const d = iframe.contentDocument || iframe.contentWindow.document;
        d.open(); 
        d.write(`
            <body style="background:#050505;color:#f75d65;padding:40px;font-family:monospace;line-height:1.8;border:2px solid #f75d65;">
                <h3 style="border-bottom:1px solid #f75d65;padding-bottom:12px;margin-top:0;">B"H - Dimensional Shift Failure</h3>
                <p><strong>The essence could not be solidified:</strong></p>
                <div style="background:rgba(0,0,0,0.5);padding:15px;border-radius:4px;color:#fff;">\${msg}</div>
                <p style="font-size:0.8em;opacity:0.7;margin-top:20px;">Review the Console for deep diagnostics.</p>
            </body>
        `); 
        d.close();
    }
};

