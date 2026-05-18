// B\"H

import { PREVIEW_CONTROL_ACTIONS } from './actions.js';

export const PreviewControlRegistry = {
    nextId: 1,
    pending: new Map(),

    iframeFor(tabId) {
        return document.querySelector(`iframe[data-tab-id="${tabId}"]`);
    },

    send(tabId, action, payload = {}, timeoutMs = 5000) {
        if (!PREVIEW_CONTROL_ACTIONS.includes(action)) {
            return Promise.resolve({ ok: false, error: 'unsupported_preview_action', action });
        }
        const iframe = this.iframeFor(tabId);
        if (!iframe?.contentWindow) return Promise.resolve({ ok: false, error: 'preview_frame_not_found', tabId });

        const id = this.nextId++;
        const message = { source: 'preview-control-parent', id, action, payload };

        return new Promise(resolve => {
            const timer = setTimeout(() => {
                this.pending.delete(id);
                resolve({ ok: false, error: 'preview_control_timeout', action, id });
            }, timeoutMs);

            this.pending.set(id, { resolve, timer });
            iframe.contentWindow.postMessage(message, '*');
        });
    },

    handleMessage(event) {
        const d = event.data;
        if (!d || d.source !== 'preview-control-frame') {return; }
        const pending = this.pending.get(d.id);
        if (!pending) {return; }
        clearTimeout(pending.timer);
        this.pending.delete(d.id);
        pending.resolve(d.result || { ok: false, error: 'empty_result' });
    }
};

window.addEventListener('message', event => PreviewControlRegistry.handleMessage(event));
