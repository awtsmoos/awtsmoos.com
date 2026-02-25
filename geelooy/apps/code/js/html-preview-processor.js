
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

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    await processAssets(doc, baseItem);

    const moduleCache = new Map(); // absPath -> blobUrl

    const resolvePath = (base, rel) => {
        if (!rel || rel.startsWith('http') || rel.startsWith('data:') || rel.startsWith('blob:')) return null;
        if (rel.startsWith('/')) return rel;
        const basePath = base.substring(0, base.lastIndexOf('/'));
        const stack = basePath ? basePath.split('/').filter(Boolean) :[];
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
                console.error(`[Preview] B"H - Failed to read module: ${absPath}`, e);
                const emptyBlobUrl = URL.createObjectURL(new Blob([`console.error('Module not found: ${absPath}');\nexport default {};`], { type: 'application/javascript' }));
                moduleCache.set(absPath, emptyBlobUrl);
                return emptyBlobUrl;
            }
        }

        console.log(`\n%c[PreviewProcessor] B"H - MANIFESTING MODULE: ${absPath}`, "color: #00f6ff; font-weight: bold; font-size: 14px;");
        const getLine = (index) => (code.substring(0, index).match(/\n/g) ||[]).length + 1;

        if (absPath.endsWith('.css')) {
            code = `const style = document.createElement('style');\nstyle.textContent = ${JSON.stringify(code)};\ndocument.head.appendChild(style);\nexport default style;`;
        } else if (absPath.endsWith('.json')) {
            code = `export default ${code};`;
        }

        let sources =[];
        
        // 1. AST RITUAL
        try {
            const Parser = await window.MerkavahParserPromise;
            const p = new Parser(code);
            if (p.registerExpressionParsers) p.registerExpressionParsers();
            if (p.registerStatementParsers) p.registerStatementParsers();
            if (p.registerDeclarationParsers) p.registerDeclarationParsers();
            const ast = p.parse();

            const walk = (node) => {
                if (!node || typeof node !== 'object') return;
                
                const isImportDecl = node.type === 'ImportDeclaration';
                const isExportSource = (node.type === 'ExportNamedDeclaration' || node.type === 'ExportAllDeclaration') && node.source;
                
                if (isImportDecl || isExportSource) {
                    if (node.source && (node.source.type === 'Literal' || node.source.type === 'StringLiteral')) {
                        console.log(`[PreviewProcessor] AST Found Static Import: "${node.source.value}" at line ${getLine(node.source.start || 0)}`);
                        sources.push(node.source);
                    }
                } else if (node.type === 'ImportExpression' || 
                         (node.type === 'CallExpression' && node.callee && (node.callee.type === 'Import' || (node.callee.type === 'Identifier' && node.callee.name === 'import')))) {
                    
                    const arg = node.source || (node.arguments && node.arguments[0]);
                    if (arg && (arg.type === 'Literal' || arg.type === 'StringLiteral')) {
                        console.log(`[PreviewProcessor] AST Found Dynamic Import: "${arg.value}" at line ${getLine(arg.start || 0)}`);
                        sources.push(arg);
                    } else if (arg && arg.type === 'TemplateLiteral' && arg.quasis && arg.quasis.length === 1) {
                        console.log(`[PreviewProcessor] AST Found Dynamic Template Import: "${arg.quasis[0].value.raw}" at line ${getLine(arg.start || 0)}`);
                        sources.push({
                            value: arg.quasis[0].value.raw,
                            start: arg.start,
                            end: arg.end
                        });
                    }
                }

                for (const key in node) {
                    const child = node[key];
                    if (Array.isArray(child)) {
                        for (let k = 0; k < child.length; k++) walk(child[k]);
                    } else {
                        walk(child);
                    }
                }
            };
            walk(ast);
        } catch(e) {
            console.warn(`[PreviewProcessor] AST Parse failed for ${absPath}. Will rely fully on Regex Net. Error:`, e);
        }

        // 2. REGEX NET (The Safety Net)
        const regexSources =[];
        
        const staticRegex = /(?:import|export)\s+(?:[^'"`]+?\s+from\s+)?(['"`])([^'"`]+)\1/g;
        let m;
        while ((m = staticRegex.exec(code)) !== null) {
            const quote = m[1];
            const value = m[2];
            const targetStr = quote + value + quote;
            const startOffset = m.index + m[0].lastIndexOf(targetStr);
            regexSources.push({ value, start: startOffset, end: startOffset + targetStr.length, type: 'Static' });
        }
        
        const dynRegex = /import\s*\(\s*(['"`])([^'"`]+)\1\s*\)/g;
        while ((m = dynRegex.exec(code)) !== null) {
            const quote = m[1];
            const value = m[2];
            const targetStr = quote + value + quote;
            const startOffset = m.index + m[0].lastIndexOf(targetStr);
            regexSources.push({ value, start: startOffset, end: startOffset + targetStr.length, type: 'Dynamic' });
        }

        // Merge Regex findings if AST missed them
        for (const rs of regexSources) {
            const alreadyFound = sources.some(s => {
                const sStart = s.start ?? s.range?.[0] ?? -1;
                return Math.abs(sStart - rs.start) < 5; 
            });
            if (!alreadyFound) {
                console.log(`%c[PreviewProcessor] B"H - AST MISSED IMPORT! Regex Caught ${rs.type} Import: "${rs.value}" at line ${getLine(rs.start)}`, "color: #ffae57; font-weight: bold;");
                sources.push(rs);
            }
        }

        console.log(`[PreviewProcessor] Total imports found in ${absPath}: ${sources.length}`);

        // Sort descending to replace strings from back-to-front without messing up offsets
        sources.sort((a, b) => {
            const startA = a.start ?? a.range?.[0] ?? 0;
            const startB = b.start ?? b.range?.[0] ?? 0;
            return startB - startA;
        });

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
                replacementUrl = `https://esm.sh/${relPath}`;
            }

            const start = source.start ?? source.range?.[0];
            const end = source.end ?? source.range?.[1];
            
            if (start !== undefined && end !== undefined) {
                console.log(`[PreviewProcessor] REPLACING: "${relPath}" -> Blob URL... (Line ${getLine(start)})`);
                const before = transformedCode.substring(0, start);
                const after = transformedCode.substring(end);
                transformedCode = before + `"${replacementUrl}"` + after;
            } else {
                console.warn(`[PreviewProcessor] FATAL: Missing start/end for node:`, source);
            }
        }

        const blob = new Blob([transformedCode], { type: 'application/javascript' });
        const blobUrl = URL.createObjectURL(blob);
        moduleCache.set(absPath, blobUrl);
        console.log(`[PreviewProcessor] Sealed ${absPath} into Blob: ${blobUrl}\n`);
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

        script.setAttribute('type', 'module');

        const src = script.getAttribute('src');
        if (src) {
            console.log(`\n%c[PreviewProcessor] B"H - Found HTML <script src="${src}">`, "color: #ff00ff; font-weight:bold;");
            const absPath = resolvePath(baseItem.path, src);
            if (absPath) {
                const blobUrl = await buildModule(absPath);
                console.log(`[PreviewProcessor] B"H - HTML <script> Replaced: ${src} -> ${blobUrl}`);
                script.setAttribute('src', blobUrl);
            }
        } else {
            const inlineCode = script.innerHTML;
            const inlinePath = baseItem.path + '/__inline_' + Math.random().toString(36).substr(2, 5) + '.js';
            console.log(`\n%c[PreviewProcessor] B"H - Manifesting Inline HTML Script at virtual sibling: ${inlinePath}`, "color: #ff00ff; font-weight:bold;");
            const blobUrl = await buildModule(inlinePath, inlineCode);
            script.innerHTML = '';
            script.setAttribute('src', blobUrl);
        }
    }

    // 5. Construct Final HTML
    const finalHtml = doc.documentElement.outerHTML;
    
    try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if(!iframeDoc) throw new Error("Cannot access iframe document.");
        
        iframeDoc.open();
        iframeDoc.write(finalHtml);
        iframeDoc.close();
        
        if (!iframeDoc.head) {
            const head = iframeDoc.createElement('head');
            iframeDoc.documentElement.insertBefore(head, iframeDoc.documentElement.firstChild);
        }

        // 6. Inject Network Interceptor
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
        const stack = basePath ? basePath.split('/').filter(p => p) :[];
        const parts = relPath.split('/');
        for (const p of parts) {
            if (p === '..') stack.pop();
            else if (p !== '.') stack.push(p);
        }
        return '/' + stack.join('/');
    };

    const elements =[
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
