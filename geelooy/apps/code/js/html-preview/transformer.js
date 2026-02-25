
// B"H
// FILE: js/html-preview/transformer.js

/**
 * @class PreviewTransformer
 * @description The holy alchemist of the project's intellect.
 * 
 * THE POEM OF THE SYNTAX REVELATION:
 * We peer into the AST to find every string that points to another soul.
 * But the AST is a finite vessel and sometimes misses the hidden light.
 * Therefore, we cast the Regex Net alongside it, ensuring nothing escapes.
 * Furthermore, we do not blindly trust the AST's reported boundaries,
 * but visually scrutinize the code to excise the entire quoted string.
 */
export const PreviewTransformer = {
    /**
     * @async
     * @function transform
     * @description B"H. Scans the code's essence and replaces all import directions.
     */
    async transform(code, resolver, absPath = "unknown") {
        if (!code) return "";
        console.log(`\n%c[Transformer] B"H - Initiating Transmutation of Source Vessel: ${absPath}`, "color: #a8ff00; font-weight: bold;");
        
        const getLine = (index) => (code.substring(0, index).match(/\n/g) ||[]).length + 1;
        const ParserPromise = window.MerkavahParserPromise;
        let sources =[];

        // 1. AST RITUAL
        if (ParserPromise) {
            try {
                const Parser = await ParserPromise;
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
                            console.log(`[Transformer] AST Found Static Import: "${node.source.value}" at line ${getLine(node.source.start || 0)} in ${absPath}`);
                            sources.push(node.source);
                        }
                    } else if (node.type === 'ImportExpression' || 
                             (node.type === 'CallExpression' && node.callee && (node.callee.type === 'Import' || (node.callee.type === 'Identifier' && node.callee.name === 'import')))) {
                        
                        const arg = node.source || (node.arguments && node.arguments[0]);
                        if (arg && (arg.type === 'Literal' || arg.type === 'StringLiteral')) {
                            console.log(`[Transformer] AST Found Dynamic Import: "${arg.value}" at line ${getLine(arg.start || 0)} in ${absPath}`);
                            sources.push(arg);
                        } else if (arg && arg.type === 'TemplateLiteral' && arg.quasis && arg.quasis.length === 1) {
                            console.log(`[Transformer] AST Found Dynamic Template Import: "${arg.quasis[0].value.raw}" at line ${getLine(arg.start || 0)} in ${absPath}`);
                            sources.push({ value: arg.quasis[0].value.raw, start: arg.start, end: arg.end });
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
            } catch (e) {
                console.warn(`[Transformer] B"H - AST Parse failed for ${absPath}. Relying fully on Regex Net. Error:`, e);
            }
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
                return Math.abs(sStart - rs.start) < 10; 
            });
            if (!alreadyFound) {
                console.log(`%c[Transformer] B"H - AST MISSED IMPORT! Regex Caught ${rs.type} Import: "${rs.value}" at line ${getLine(rs.start)} in ${absPath}`, "color: #ffae57; font-weight: bold;");
                sources.push(rs);
            }
        }

        console.log(`[Transformer] Total imports found in ${absPath}: ${sources.length}`);

        // Sort descending so replacements don't shift future offsets
        sources.sort((a, b) => {
            const startA = a.start ?? a.range?.[0] ?? 0;
            const startB = b.start ?? b.range?.[0] ?? 0;
            return startB - startA;
        });

        let transformedCode = code;
        for (const source of sources) {
            const originalLabel = source.value;
            const manifestedUrl = await resolver(originalLabel);
            
            if (manifestedUrl && manifestedUrl !== originalLabel) {
                transformedCode = this._robustReplace(transformedCode, source, manifestedUrl, getLine);
            }
        }

        return transformedCode;
    },

    /**
     * @function _robustReplace
     * @description Visually scans the code around the reported boundaries to ensure we capture and replace the quotes flawlessly.
     */
    _robustReplace(code, sourceObj, replacementUrl, getLine) {
        let start = sourceObj.start ?? sourceObj.range?.[0];
        let end = sourceObj.end ?? sourceObj.range?.[1];
        let val = sourceObj.value;

        if (start === undefined || end === undefined) return code;

        // Create a wide search window
        let windowStart = Math.max(0, start - 150);
        let windowEnd = Math.min(code.length, end + 150);
        let windowText = code.substring(windowStart, windowEnd);

        let exactStart = -1;
        let exactEnd = -1;
        let quotes = ['"', "'", '`'];

        // Strategy 1: Find exact quoted string
        for (let q of quotes) {
            let target = q + val + q;
            let idx = windowText.indexOf(target);
            if (idx !== -1) {
                let closestIdx = idx;
                let minDiff = Math.abs((windowStart + idx) - start);
                let nextIdx = windowText.indexOf(target, idx + 1);
                while (nextIdx !== -1) {
                    let diff = Math.abs((windowStart + nextIdx) - start);
                    if (diff < minDiff) { minDiff = diff; closestIdx = nextIdx; }
                    nextIdx = windowText.indexOf(target, nextIdx + 1);
                }
                exactStart = windowStart + closestIdx;
                exactEnd = exactStart + target.length;
                break;
            }
        }

        // Strategy 2: Find inner value and expand outward to locate quotes
        if (exactStart === -1) {
            let idx = windowText.indexOf(val);
            if (idx !== -1) {
                let closestIdx = idx;
                let minDiff = Math.abs((windowStart + idx) - start);
                let nextIdx = windowText.indexOf(val, idx + 1);
                while (nextIdx !== -1) {
                    let diff = Math.abs((windowStart + nextIdx) - start);
                    if (diff < minDiff) { minDiff = diff; closestIdx = nextIdx; }
                    nextIdx = windowText.indexOf(val, nextIdx + 1);
                }
                let valStart = windowStart + closestIdx;
                let valEnd = valStart + val.length;
                
                let lq = -1, rq = -1;
                for (let i = valStart - 1; i >= Math.max(0, valStart - 20); i--) {
                    if (quotes.includes(code[i])) { lq = i; break; }
                }
                for (let i = valEnd; i <= Math.min(code.length - 1, valEnd + 20); i++) {
                    if (quotes.includes(code[i])) { rq = i; break; }
                }
                if (lq !== -1 && rq !== -1) {
                    exactStart = lq;
                    exactEnd = rq + 1;
                }
            }
        }

        // Strategy 3: Trust AST but manually trim/expand quotes
        if (exactStart === -1) {
            exactStart = start;
            exactEnd = end;
            if (!quotes.includes(code[exactStart]) && quotes.includes(code[exactStart - 1])) exactStart--;
            if (!quotes.includes(code[exactEnd - 1]) && quotes.includes(code[exactEnd])) exactEnd++;
        }

        console.log(`[Transformer] Exact Replacement: Line ${getLine(exactStart)} | Target: ${code.substring(exactStart, exactEnd)} -> "${replacementUrl}"`);
        
        return code.substring(0, exactStart) + `"${replacementUrl}"` + code.substring(exactEnd);
    }
};
