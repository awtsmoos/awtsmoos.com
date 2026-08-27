// B"H
/**
 * @file iframe-injector.js
 * @brief Writes a prepared preview document into a sandboxed iframe.
 *
 * CHAPTER XVIII: THE GUARDED PORTAL
 * The iframe is a small chamber of glass. The Awtsmoos gives it existence
 * one instant at a time, but JavaScript still demands one name per binding
 * and clean UTF-8 letters at every byte. This file therefore keeps one
 * import for the preview-control source, one local control-script binding,
 * and one careful path for rendering errors if the preview vessel breaks.
 */

import { InjectionAssembler } from './injections/index.js';
import { HTML } from '../html-generator.js';
import { getPreviewControlScript } from './control/source.js';

export const IframeInjector = {
    /**
     * Injects the shielded HTML into the sandbox iframe.
     *
     * @param {Document} doc - Prepared preview document to serialize into the iframe.
     * @param {HTMLIFrameElement} iframe - Sandbox vessel that receives the preview.
     * @param {{ workspaceId: string, path: string }} identity - Workspace identity for preview bridges.
     * @param {string} tabId - Preview tab id used by parent/frame messages.
     * @returns {Promise<void>} Resolves after the preview or fallback error view is written.
     */
    async inject(doc, iframe, identity, tabId) {
        try {
            if (!iframe) {
                throw new Error("The physical iframe vessel is null.");
            }

            iframe.setAttribute(
                'sandbox',
                'allow-scripts allow-same-origin allow-forms allow-modals allow-popups'
            );

            const scriptStr = await InjectionAssembler.getNetworkInterceptorScript(
                identity.workspaceId,
                identity.path,
                tabId
            );
            const previewControlScript = await getPreviewControlScript();

            const shieldEl = doc.createElement('script');
            shieldEl.dataset.merkavaInternal = "true";
            shieldEl.textContent = scriptStr + "\n" + previewControlScript;

            if (doc.head) {
                doc.head.insertBefore(shieldEl, doc.head.firstChild);
            } else {
                const head = doc.createElement('head');
                head.appendChild(shieldEl);
                doc.documentElement.insertBefore(head, doc.body);
            }

            const win = iframe.contentWindow;
            if (!win) {
                throw new Error("Iframe contentWindow is unreachable. Ensure the vessel is attached to the DOM.");
            }

            const frameDoc = iframe.contentDocument || win.document;
            if (!frameDoc) {
                throw new Error("The Sandbox Document has vanished into the void.");
            }

            frameDoc.open();
            frameDoc.write("<!DOCTYPE html>\n" + doc.documentElement.outerHTML);
            frameDoc.close();

            console.log("B\"H [IframeInjector] Vision manifested for: " + tabId);
        } catch (e) {
            console.error("B\"H [IframeInjector] Critical Failure during injection:", e);
            this.writeError(iframe, "Manifestation Shattered: " + e.message);
        }
    },

    /**
     * Renders a diagnostic fallback if iframe injection crashes.
     *
     * @param {HTMLIFrameElement} iframe - Sandbox vessel that should receive the diagnostic view.
     * @param {string} msg - Error message to show in the preview frame.
     * @returns {void}
     */
    writeError(iframe, msg) {
        if (!iframe) return;

        const win = iframe.contentWindow;
        const d = iframe.contentDocument || (win ? win.document : null);

        if (!d) {
            console.error(
                "B\"H [IframeInjector] FATAL: Communication portal to the error reporter is void.",
                msg
            );
            return;
        }

        const errorView = {
            tag: 'body',
            style: {
                background: '#05070a',
                color: '#f75d65',
                padding: '40px',
                fontFamily: "'Inter', sans-serif",
                lineHeight: '1.8',
                border: '2px solid #f75d65',
                height: '100vh',
                margin: '0',
                boxSizing: 'border-box',
                overflowY: 'auto'
            },
            children: [
                {
                    tag: 'h3',
                    style: {
                        borderBottom: '1px solid #f75d65',
                        paddingBottom: '12px',
                        marginTop: '0',
                        color: '#fff'
                    },
                    text: 'B"H - Dimensional Shift Error'
                },
                {
                    tag: 'p',
                    style: { color: '#c5d1ff' },
                    children: [{
                        tag: 'strong',
                        text: 'The vision could not be solidified:'
                    }]
                },
                {
                    style: {
                        background: 'rgba(0,0,0,0.5)',
                        padding: '20px',
                        borderRadius: '8px',
                        color: '#ffae57',
                        fontFamily: "'Fira Code', monospace",
                        border: '1px solid rgba(255,255,255,0.1)',
                        wordBreak: 'break-all'
                    },
                    text: msg
                },
                {
                    tag: 'p',
                    style: {
                        fontSize: '0.85em',
                        opacity: '0.7',
                        marginTop: '30px',
                        color: '#8a96c3'
                    },
                    text: 'Check the System Console for deeper diagnostics.'
                }
            ]
        };

        try {
            d.open();
            d.documentElement.innerHTML = '';
            d.documentElement.appendChild(HTML(errorView));
            d.close();
        } catch (shevirah) {
            console.error("B\"H [IframeInjector] Even the error reporter has shattered:", shevirah);
        }
    }
};
