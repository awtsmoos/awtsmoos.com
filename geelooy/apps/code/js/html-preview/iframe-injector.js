
// B"H
// FILE: js/html-preview/iframe-injector.js

import { getNetworkInterceptorScript } from './html-preview-templates.js';

export const IframeInjector = {
    inject(doc, iframe, identity) {
        try {
            const shield = `<script data-merkava-internal="true">${getNetworkInterceptorScript(identity.workspaceId, identity.path)}</script>`;
            let htmlText = doc.documentElement.outerHTML;
            
            htmlText = htmlText.includes('<head>') ? htmlText.replace('<head>', `<head>${shield}`) : shield + htmlText;
            
            const frameDoc = iframe.contentDocument || iframe.contentWindow.document;
            frameDoc.open(); 
            frameDoc.write("<!DOCTYPE html>\n" + htmlText); 
            frameDoc.close();
            console.log(`%c[IframeInjector] B"H - VISION ESTABLISHED IN FRAME.`, "color: #a8ff00; font-weight: bold;");
        } catch (e) { 
            this.writeError(iframe, `Final Manifestation failed: ${e.message}`); 
        }
    },

    writeError(iframe, msg) {
        const d = iframe.contentDocument || iframe.contentWindow.document;
        d.open(); 
        d.write(`<body style="background:#050505;color:#f75d65;padding:40px;font-family:monospace;line-height:1.8;">
            <h3 style="border-bottom:1px solid #f75d65;padding-bottom:12px;">B"H - Preview Failed</h3>
            <p>${msg}</p>
        </body>`); 
        d.close();
    }
};
