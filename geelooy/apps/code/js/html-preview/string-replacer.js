
// B"H
// FILE: js/html-preview/string-replacer.js

/**
 * @class StringReplacer
 * @description The surgical blade. It does not trust mere coordinates; 
 * it visually verifies the boundaries of a string (the quotes) before 
 * excising and replacing it with the manifested Blob URL.
 */
export const StringReplacer = {
    /**
     * @function robustReplace
     * @description Visually scans the code around the reported boundaries to ensure we capture and replace the quotes flawlessly.
     */
    robustReplace(code, sourceObj, replacementUrl, getLine) {
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
        let quotes =['"', "'", '`'];

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

        console.log(`[StringReplacer] Exact Replacement: Line ${getLine(exactStart)} | Target: ${code.substring(exactStart, exactEnd)} -> "${replacementUrl}"`);
        
        return code.substring(0, exactStart) + `"${replacementUrl}"` + code.substring(exactEnd);
    }
};
