
// B"H
/**
 * @file transformer.js
 * @brief The Master of ES Module Transmutation.
 */

import { ImportScanner } from '../tools/import-scanner.js';
import { StringReplacer } from './string-replacer.js';

export const PreviewTransformer = {
    async transform(code, resolver, absPath = "unknown") {
        if (!code && code !== "") {
            console.warn("[Transformer] B\"H - Null code provided for " + absPath + ". Returning void.");
            return "";
        }

        console.log("[Transformer] B\"H - Initiating Transmutation of " + absPath + ". Input: " + code.length + " chars.");
        
        try {
            const { sources, getLine } = await ImportScanner.scanDetailed(code, absPath);

            console.log("[Transformer] B\"H - " + sources.length + " import connections detected in " + absPath + ".");

            let transformedCode = code;

            for (const source of sources) {
                const originalLabel = source.value;
                console.log("[Transformer] B\"H - Resolving connection: \"" + originalLabel + "\" at Line " + getLine(source.start));
                
                const manifestedUrl = await resolver(originalLabel);
                
                if (manifestedUrl && manifestedUrl !== originalLabel) {
                    console.log("[Transformer] B\"H - Replacing \"" + originalLabel + "\" -> \"" + manifestedUrl + "\"");
                    transformedCode = StringReplacer.robustReplace(transformedCode, source, manifestedUrl, getLine);
                } else {
                    console.log("[Transformer] B\"H - No replacement needed for \"" + originalLabel + "\".");
                }
            }

            console.log("[Transformer] B\"H - Transmutation Complete for " + absPath + ". Output: " + transformedCode.length + " chars.");
            
            if (transformedCode.length === 0 && code.length > 0) {
                console.error("[Transformer] B\"H - CRITICAL: Transmutation resulted in an empty string for non-empty input! " + absPath);
            }

            return transformedCode;

        } catch (e) {
            console.error("[Transformer] B\"H - Transmutation failed for " + absPath + ":", e);
            throw e;
        }
    }
};
