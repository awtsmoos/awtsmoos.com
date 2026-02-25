
// B"H
// FILE: js/html-preview/transformer.js

import { ASTWalker } from './ast-walker.js';
import { RegexNet } from './regex-net.js';
import { StringReplacer } from './string-replacer.js';

export const PreviewTransformer = {
    async transform(code, resolver, absPath = "unknown") {
        if (!code) return "";
        console.log(`\n%c[Transformer] B"H - Initiating Transmutation: ${absPath}`, "color: #a8ff00; font-weight: bold;");
        
        const getLine = (index) => (code.substring(0, index).match(/\n/g) ||[]).length + 1;
        
        // 1. Gather via AST
        let sources = await ASTWalker.findImports(code, absPath, getLine);

        // 2. Gather via Regex Net
        const regexSources = RegexNet.findImports(code, absPath, getLine);

        // 3. Merge Regex findings if AST missed them
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

        // 4. Perform surgical replacements
        let transformedCode = code;
        for (const source of sources) {
            const originalLabel = source.value;
            const manifestedUrl = await resolver(originalLabel);
            
            if (manifestedUrl && manifestedUrl !== originalLabel) {
                transformedCode = StringReplacer.robustReplace(transformedCode, source, manifestedUrl, getLine);
            }
        }

        return transformedCode;
    }
};
