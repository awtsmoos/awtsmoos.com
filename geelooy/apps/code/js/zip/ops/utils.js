
// B"H
import { Tabs } from '../../tabs/index.js';

export const ZipUtils = {
    async normalizeContent(content) {
        if (content instanceof Uint8Array) return content;
        if (content instanceof ArrayBuffer) return new Uint8Array(content);
        if (content instanceof Blob) return new Uint8Array(await content.arrayBuffer());
        if (typeof content === 'string') return new TextEncoder().encode(content);
        return new Uint8Array(0);
    },

    markDirty(tab) {
        if (!tab.isDirty) {
            tab.isDirty = true;
            Tabs.render();
        }
    }
};
