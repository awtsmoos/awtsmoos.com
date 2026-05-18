// B"H
/**
 * @file StaticPreviewBuilder.js
 * @brief Builds offline browser previews from virtual filesystem text.
 */
import { parentVirtualPath } from './RuntimePath.js';
import { readTextIfExists } from './RuntimeProviderIO.js';

function injectBase(html, basePath) {
    if (html.includes('<base ')) return html;
    const base = `<base data-vibe-virtual-base="${basePath}">`;
    return html.includes('<head>') ? html.replace('<head>', `<head>${base}`) : `${base}\n${html}`;
}

export const StaticPreviewBuilder = {
    async build(ws, coreType, manifest) {
        const html = await readTextIfExists(ws, coreType, manifest.entry);
        if (html === null) throw new Error(`Static entry not found: ${manifest.entry}`);

        const basePath = parentVirtualPath(manifest.entry);
        const finalHtml = injectBase(html, basePath);
        const blob = new Blob([finalHtml], { type: 'text/html' });
        const objectUrl = URL.createObjectURL(blob);

        return {
            url: objectUrl,
            objectUrl,
            basePath,
            entry: manifest.entry,
            logs: [`Static virtual preview generated for ${manifest.entry}`]
        };
    }
};
