
// B"H
// FILE: js/html-preview/transformer.js

import { ImportScanner } from '../tools/import-scanner.js';
import { StringReplacer } from './string-replacer.js';

export const PreviewTransformer = {
    async transform(code, resolver, absPath = "unknown") {
        if (!code) return "";
        console.log(`\n%c[Transformer] B"H - Initiating Transmutation: ${absPath}`, "color: #a8ff00; font-weight: bold;");
        
        // The Scanner performs both AST and Regex passes seamlessly
        const { sources, getLine } = await ImportScanner.scanDetailed(code, absPath);

        console.log(`[Transformer] Total imports found in ${absPath}: ${sources.length}`);

        // Perform surgical replacements
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
