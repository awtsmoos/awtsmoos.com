
// B"H
import { FileSystemProvider } from '../fs-provider.js';
import { getNetworkInterceptorScript } from './html-preview-templates.js';
import { VirtualBundler } from './bundler.js';

export const HTMLPreviewProcessor = {
    async orchestrate(baseItem, iframe, contentOverride = null) {
        if (!iframe || !iframe.parentNode) return;
        console.log(`%c[PreviewProcessor] B"H - COMMENCING: ${baseItem.path}`, "color:#00f6ff; font-weight:bold;");
        VirtualBundler.reset();

        let html = contentOverride;
        if (html === null) {
            try {
                const raw = await FileSystemProvider.read(baseItem);
                html = (raw instanceof Blob) ? await raw.text() : (raw.base64Content ? atob(raw.base64Content) : String(raw));
            } catch (e) { return this._err(iframe, e.message); }
        }
        if (!html) return this._err(iframe, "Vessel is empty.");

        const doc = new DOMParser().parseFromString(html, 'text/html');
        await this._processAssets(doc, baseItem);
        await this._processStyles(doc, baseItem);

        const scripts = Array.from(doc.querySelectorAll('script'));
        for (let i = 0; i < scripts.length; i++) {
            const script = scripts[i];
            if (script.hasAttribute('data-merkava-internal')) continue;
            script.setAttribute('type', 'module');
            try {
                const src = script.getAttribute('src');
                if (src) {
                    const abs = VirtualBundler.resolvePath(baseItem.path, src);
                    script.setAttribute('src', await VirtualBundler.build(abs, baseItem, null));
                } else if (script.textContent.trim()) {
                    const virtual = `${baseItem.path}/__inline_${Math.random().toString(36).substr(2, 5)}.js`;
                    script.setAttribute('src', await VirtualBundler.build(virtual, baseItem, script.textContent));
                    script.textContent = "";
                }
            } catch (e) { console.error(`Script ${i} Shevirah`, e); }
        }

        try {
            let final = doc.documentElement.outerHTML;
            const interceptor = `<script data-merkava-internal="true">${getNetworkInterceptorScript(baseItem.workspaceId, baseItem.path)}</script>`;
            final = final.includes('<head>') ? final.replace('<head>', `<head>${interceptor}`) : interceptor + final;
            const ifDoc = iframe.contentDocument || iframe.contentWindow.document;
            ifDoc.open(); ifDoc.write("<!DOCTYPE html>\n" + final); ifDoc.close();
            console.log(`%c[PreviewProcessor] B"H - REALITY STABILIZED.`, "color:#a8ff00; font-weight:bold;");
        } catch (e) { this._err(iframe, e.message); }
    },

    async _processAssets(doc, item) {
        const assets = Array.from(doc.querySelectorAll('img[src], video[src], audio[src]'));
        await Promise.all(assets.map(async (el) => {
            const raw = el.getAttribute('src');
            if (!raw || raw.startsWith('http') || raw.startsWith('blob:') || raw.startsWith('data:')) return;
            try {
                const abs = VirtualBundler.resolvePath(item.path, raw);
                const content = await FileSystemProvider.read({ ...item, path: abs, kind: 'file' });
                const blob = (content instanceof Blob) ? content : new Blob([content]);
                el.setAttribute('src', URL.createObjectURL(blob));
            } catch (e) {}
        }));
    },

    async _processStyles(doc, item) {
        const links = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));
        for (const link of links) {
            const href = link.getAttribute('href');
            if (!href || href.startsWith('http')) continue;
            try {
                const abs = VirtualBundler.resolvePath(item.path, href);
                const raw = await FileSystemProvider.read({ ...item, path: abs, kind: 'file' });
                const text = (raw instanceof Blob) ? await raw.text() : (raw.base64Content ? atob(raw.base64Content) : String(raw));
                link.setAttribute('href', URL.createObjectURL(new Blob([text], { type: 'text/css' })));
            } catch (e) {}
        }
    },

    _err(iframe, msg) {
        const d = iframe.contentDocument || iframe.contentWindow.document;
        d.open(); d.write(`<body style="background:#000;color:#f75d65;padding:20px;font-family:monospace;"><h3>B"H - Manifestation Error</h3><p>${msg}</p></body>`); d.close();
    }
};
