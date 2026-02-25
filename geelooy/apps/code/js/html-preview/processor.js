// B"H
// FILE: js/html-preview/processor.js

import { FileSystemProvider } from '../fs-provider.js';
import { getNetworkInterceptorScript } from '../html-preview-templates.js';
import { VirtualBundler } from './bundler.js';

/**
 * @class HTMLPreviewProcessor
 * @description The highest level of the rendering hierarchy. It reads the master HTML document 
 * and commands the Bundler to process all script tags.
 */
export const HTMLPreviewProcessor = {
    async orchestrate(baseItem, iframe, contentOverride = null) {
        if (!iframe.parentNode) return;

        console.log(`[PreviewProcessor] Starting orchestration for ${baseItem.path}`);
        VirtualBundler.reset();

        let htmlContent = contentOverride;
        if (htmlContent === null) {
            try {
                console.log(`[PreviewProcessor] Reading content from disk for ${baseItem.path}`);
                const raw = await FileSystemProvider.read(baseItem);
                htmlContent = (raw instanceof Blob) ? await raw.text() : (raw.base64Content ? atob(raw.base64Content) : String(raw));
            } catch (e) { 
                console.error("[Preview Processor] Failed to read source HTML:", e);
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                iframeDoc.open();
                iframeDoc.write(`<h3 style="color:red; font-family:monospace; padding:20px;">Awtsmoos Error: Could not read HTML source file.<br>${e.message}</h3>`);
                iframeDoc.close();
                return; 
            }
        }
        
        if (!htmlContent) {
             const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
             iframeDoc.open();
             iframeDoc.write(`<h3 style="color:gray; font-family:monospace; padding:20px;">Empty HTML File</h3>`);
             iframeDoc.close();
             return;
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        
        // 1. Process Static Assets (Images, Videos)
        await this._processAssets(doc, baseItem);

        // 2. Process Stylesheets (CSS)
        const links = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));
        console.log(`[PreviewProcessor] Found ${links.length} stylesheets.`);
        
        for (const link of links) {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('data:')) {
                const absPath = VirtualBundler.resolvePath(baseItem.path, href);
                try {
                    const fsItem = { ...baseItem, path: absPath, kind: 'file' };
                    const content = await FileSystemProvider.read(fsItem);
                    
                    let blob;
                    if (content instanceof Blob) blob = content;
                    else {
                        const text = (typeof content === 'string') ? content : await new Response(content).text();
                        blob = new Blob([text], { type: 'text/css' });
                    }
                    link.setAttribute('href', URL.createObjectURL(blob));
                    console.log(`[PreviewProcessor] Stylesheet bundled: ${absPath}`);
                } catch(e) {
                    console.warn(`[PreviewProcessor] Missing stylesheet: ${absPath}`);
                }
            }
        }

        // 3. Process Scripts
        const scripts = Array.from(doc.querySelectorAll('script'));
        const baseDir = baseItem.path.substring(0, baseItem.path.lastIndexOf('/')) || '/';
        console.log(`[PreviewProcessor] Found ${scripts.length} scripts to bundle.`);

        for (const script of scripts) {
            if (script.hasAttribute('data-merkava-internal')) continue;
            
            const type = script.getAttribute('type');
            if (type === 'application/json' || type === 'importmap') continue;

            // Elevate to native module status
            script.setAttribute('type', 'module');

            try {
                const src = script.getAttribute('src');
                if (src) {
                    const absPath = VirtualBundler.resolvePath(baseItem.path, src);
                    console.log(`[PreviewProcessor] Bundling script src: ${src} -> ${absPath}`);
                    const blobUrl = await VirtualBundler.build(absPath, baseItem, null);
                    script.setAttribute('src', blobUrl);
                } else {
                    console.log(`[PreviewProcessor] Bundling inline script.`);
                    const inlineCode = script.textContent;
                    const virtualPath = `${baseDir}/__inline_${Math.random().toString(36).substr(2, 5)}.js`;
                    const blobUrl = await VirtualBundler.build(virtualPath, baseItem, inlineCode);
                    script.textContent = "";
                    script.setAttribute('src', blobUrl);
                }
            } catch (scriptErr) {
                console.error(`[PreviewProcessor] A script failed to bundle, skipping:`, scriptErr);
            }
        }

        try {
            let finalHtml = doc.documentElement.outerHTML;
            
            // B"H - Inject Network Interceptor directly into the HTML string BEFORE writing.
            const interceptorCode = getNetworkInterceptorScript(baseItem.workspaceId, baseItem.path);
            const interceptorHtml = `<script data-merkava-internal="true">${interceptorCode}</script>`;
            
            if (finalHtml.includes('<head>')) {
                finalHtml = finalHtml.replace('<head>', `<head>${interceptorHtml}`);
            } else {
                finalHtml = interceptorHtml + finalHtml;
            }

            finalHtml = "<!DOCTYPE html>\n" + finalHtml;

            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            iframeDoc.open();
            iframeDoc.write(finalHtml);
            iframeDoc.close();
            
            console.log(`[PreviewProcessor] HTML Write Complete.`);
            
        } catch(e) { 
            console.error("[Preview Processor] HTML Manifestation failed during iframe write:", e); 
        }
    },

    async _processAssets(doc, item) {
        const elements = Array.from(doc.querySelectorAll('img[src], video[src], audio[src]'));
        console.log(`[PreviewProcessor] Processing ${elements.length} static assets.`);

        await Promise.all(elements.map(async (el) => {
            const attr = 'src';
            const rawPath = el.getAttribute(attr);
            if (!rawPath || rawPath.startsWith('http') || rawPath.startsWith('blob:') || rawPath.startsWith('data:')) return;

            const absPath = VirtualBundler.resolvePath(item.path, rawPath);
            try {
                const fsItem = { ...item, path: absPath, kind: 'file' };
                const content = await FileSystemProvider.read(fsItem);
                
                let blob;
                if (content instanceof Blob) {
                    blob = content;
                } else if (content && content.base64Content) {
                    const binStr = atob(content.base64Content);
                    const bytes = new Uint8Array(binStr.length);
                    for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
                    blob = new Blob([bytes], { type: content.mime || 'application/octet-stream' });
                } else {
                    const bytes = (typeof content === 'string') ? new TextEncoder().encode(content) : content;
                    blob = new Blob([bytes]);
                }
                
                el.setAttribute(attr, URL.createObjectURL(blob));
            } catch (e) {
                console.warn(`[PreviewProcessor] Asset not found: ${absPath}`);
            }
        }));
    }
};