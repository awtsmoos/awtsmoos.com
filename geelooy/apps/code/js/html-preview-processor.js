
// B"H
// FILE: js/html-preview-processor.js

import { State } from './state.js';
import { FileSystemProvider } from './fs-provider.js';
import { getNetworkInterceptorScript } from './html-preview-templates.js';

export const orchestratePreview = async (baseItem, iframe, contentOverride = null) => {
    if (!iframe.parentNode) {
        console.warn("[Preview] Iframe detached. Aborting orchestration.");
        return;
    }

    let htmlContent = contentOverride;
    
    if (htmlContent === null) {
        try {
            htmlContent = await FileSystemProvider.read(baseItem);
            if (htmlContent instanceof Blob) htmlContent = await htmlContent.text();
            else if (htmlContent.base64Content) htmlContent = atob(htmlContent.base64Content);
        } catch (e) {
            console.error("[Preview] Failed to read source:", e);
            return;
        }
    }

    if (!htmlContent) return;

    // 1. Parse User HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // 2. Pre-load Assets (Images, CSS)
    await processAssets(doc, baseItem);

    // 3. The Divine Module Bundler (AST-based Blob URL Generator)
    const moduleCache = new Map(); // absPath -> blobUrl

    const resolvePath = (base, rel) => {
        if (!rel || rel.startsWith('http') || rel.startsWith('data:') || rel.startsWith('blob:')) return null;
        if (rel.startsWith('/')) return rel;
        const basePath = base.substring(0, base.lastIndexOf('/'));
        const stack = basePath ? basePath.split('/').filter(Boolean) : [];
        const parts = rel.split('/');
        for (const p of parts) {
            if (p === '..') stack.pop();
            else if (p !== '.') stack.push(p);
        }
        return '/' + stack.join('/');
    };

    const buildModule = async (absPath, sourceCodeOverride = null) => {
        if (moduleCache.has(absPath)) return moduleCache.get(absPath);

        let code = sourceCodeOverride;
        if (code === null) {
            try {
                const item = { ...baseItem, path: absPath, kind: 'file' };
                const raw = await FileSystemProvider.read(item);
                code = (raw instanceof Blob) ? await raw.text() : (raw.base64Content ? atob(raw.base64Content) : raw);
            } catch(e) {
                console.error(`[Preview] Failed to read module: ${absPath}`, e);
                // Return a valid empty module so V8 doesn't crash the whole dependency tree
                const emptyBlobUrl = URL.createObjectURL(new Blob([`console.error('Module not found: ${absPath}');\nexport default {};`], { type: 'application/javascript' }));
                moduleCache.set(absPath, emptyBlobUrl);
                return emptyBlobUrl;
            }
        }

        // Handle CSS and JSON imports natively
        if (absPath.endsWith('.css')) {
            code = `const style = document.createElement('style');\nstyle.textContent = ${JSON.stringify(code)};\ndocument.head.appendChild(style);\nexport default style;`;
        } else if (absPath.endsWith('.json')) {
            code = `export default ${code};`;
        }

        let sources = [];
        try {
            // Attempt AST Parse
            const Parser = await window.MerkavahParserPromise;
            const p = new Parser(code);
            p.registerExpressionParsers();
            p.registerStatementParsers();
            p.registerDeclarationParsers();
            const ast = p.parse();

            const walk = (node) => {
                if (!node || typeof node !== 'object') return;
                
                if (node.type === 'ImportDeclaration' || 
                    (node.type === 'ExportNamedDeclaration' && node.source) || 
                    node.type === 'ExportAllDeclaration') {
                    if (node.source && node.source.type === 'Literal') {
                        sources.push(node.source);
                    }
                }
                if (node.type === 'ImportExpression' && node.source && node.source.type === 'Literal') {
                    sources.push(node.source);
                }

                for (const key in node) {
                    if (Array.isArray(node[key])) node[key].forEach(walk);
                    else walk(node[key]);
                }
            };
            walk(ast);
        } catch(e) {
            console.warn(`[Preview] AST Parse failed for ${absPath}. Using RegEx fallback.`, e);
            // RegEx fallback to find imports in unparseable files (like JSX/TSX)
            // Safely extracts string literals from import/export declarations and dynamic imports
            const regex = /(?:import|export)\s+(?:[^'"]+?\s+from\s+)?(['"])([^'"]+)\1|import\s*\(\s*(['"])([^'"]+)\3\s*\)/g;
            let match;
            while ((match = regex.exec(code)) !== null) {
                const quote = match[1] || match[3];
                const specifier = match[2] || match[4];
                if (specifier) {
                    const specStr = quote + specifier + quote;
                    const specStart = match.index + match[0].lastIndexOf(specStr);
                    sources.push({
                        value: specifier,
                        start: specStart,
                        end: specStart + specStr.length
                    });
                }
            }
        }

        // Sort descending to replace strings from back-to-front without messing up offsets
        sources.sort((a, b) => b.start - a.start);

        let transformedCode = code;
        for (const source of sources) {
            const relPath = source.value;
            let replacementUrl = relPath;

            if (relPath.startsWith('.') || relPath.startsWith('/')) {
                const depAbsPath = resolvePath(absPath, relPath);
                if (depAbsPath) {
                    replacementUrl = await buildModule(depAbsPath);
                }
            } else if (!relPath.startsWith('http') && !relPath.startsWith('blob:') && !relPath.startsWith('data:')) {
                // Bare specifier! Redirect to esm.sh to prevent native V8 crash
                replacementUrl = `https://esm.sh/${relPath}`;
            }

            const before = transformedCode.substring(0, source.start);
            const after = transformedCode.substring(source.end);
            transformedCode = before + `"${replacementUrl}"` + after;
        }

        // Seal the fully transformed code into a Blob and cache it
        const blob = new Blob([transformedCode], { type: 'application/javascript' });
        const blobUrl = URL.createObjectURL(blob);
        moduleCache.set(absPath, blobUrl);
        return blobUrl;
    };

    // 4. Extract and Transform Scripts
    const allScripts = Array.from(doc.querySelectorAll('script'));

    for (const script of allScripts) {
        if (script.hasAttribute('data-merkava-internal')) continue;

        const type = script.getAttribute('type') || 'text/javascript';
        if (type !== 'text/javascript' && type !== 'module' && type !== '' && type !== 'application/javascript') {
            continue;
        }

        // Force all scripts to be native ES modules so V8 handles imports correctly
        script.setAttribute('type', 'module');

        const src = script.getAttribute('src');
        if (src) {
            const absPath = resolvePath(baseItem.path, src);
            if (absPath) {
                const blobUrl = await buildModule(absPath);
                script.setAttribute('src', blobUrl);
            }
        } else {
            const inlineCode = script.innerHTML;
            // Generate a virtual path for the inline script to resolve relative imports correctly
            const inlinePath = baseItem.path + '/__inline_' + Math.random().toString(36).substr(2, 5) + '.js';
            const blobUrl = await buildModule(inlinePath, inlineCode);
            script.innerHTML = ''; // Clear inline code to rely purely on the blob source
            script.setAttribute('src', blobUrl);
        }
    }

    // 5. Construct Final HTML
    const finalHtml = doc.documentElement.outerHTML;
    
    try {
        // B"H - Safe Iframe Write
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if(!iframeDoc) throw new Error("Cannot access iframe document.");
        
        iframeDoc.open();
        iframeDoc.write(finalHtml);
        iframeDoc.close();
        
        if (!iframeDoc.head) {
            const head = iframeDoc.createElement('head');
            iframeDoc.documentElement.insertBefore(head, iframeDoc.documentElement.firstChild);
        }

        // 6. Inject Network Interceptor (For native fetch/XHR calls to resolve)
        const scriptNetwork = iframeDoc.createElement('script');
        scriptNetwork.textContent = getNetworkInterceptorScript(baseItem.workspaceId, baseItem.path);
        scriptNetwork.setAttribute('data-merkava-internal', 'true');
        iframeDoc.head.insertBefore(scriptNetwork, iframeDoc.head.firstChild);

    } catch(e) {
        console.error("[Preview] Failed to write to iframe:", e);
    }
};

async function processAssets(doc, item) {
    const resolveRelativePath = (relPath) => {
        if (!relPath || relPath.startsWith('http') || relPath.startsWith('data:') || relPath.startsWith('blob:')) return null;
        if (relPath.startsWith('/')) return relPath;
        const basePath = item.path.substring(0, item.path.lastIndexOf('/'));
        const stack = basePath ? basePath.split('/').filter(p => p) : [];
        const parts = relPath.split('/');
        for (const p of parts) {
            if (p === '..') stack.pop();
            else if (p !== '.') stack.push(p);
        }
        return '/' + stack.join('/');
    };

    const elements = [
        ...Array.from(doc.querySelectorAll('img[src], video[src], audio[src]')),
        ...Array.from(doc.querySelectorAll('link[rel="stylesheet"][href]'))
    ];

    await Promise.all(elements.map(async (el) => {
        const attr = el.tagName === 'LINK' ? 'href' : 'src';
        const rawPath = el.getAttribute(attr);
        const absPath = resolveRelativePath(rawPath);
        if (absPath) {
            try {
                let typeHint = 'text/plain';
                if (el.tagName === 'IMG') typeHint = 'image/png';
                else if (el.tagName === 'LINK') typeHint = 'text/css';

                const fsItem = { ...item, path: absPath, kind: 'file' };
                const content = await FileSystemProvider.read(fsItem);
                
                let blob;
                if (content instanceof Blob) blob = content;
                else if (content && content.base64Content) {
                    const bin = atob(content.base64Content);
                    const len = bin.length;
                    const bytes = new Uint8Array(len);
                    for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
                    blob = new Blob([bytes], { type: content.mime || typeHint });
                } else if (typeof content === 'string') {
                    blob = new Blob([content], { type: typeHint });
                }

                if (blob) {
                    el.setAttribute(attr, URL.createObjectURL(blob));
                }
            } catch (e) { /* ignore missing assets */ }
        }
    }));
}
