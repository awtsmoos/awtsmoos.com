
// B"H
// FILE: js/html-preview/regex-net.js

export const RegexNet = {
    findImports(code, absPath, getLine) {
        const regexSources =[];
        
        // Static Regex
        const staticRegex = /(?:import|export)\s+(?:[^'"`]+?\s+from\s+)?(['"`])([^'"`]+)\1/g;
        let m;
        while ((m = staticRegex.exec(code)) !== null) {
            const quote = m[1];
            const value = m[2];
            const targetStr = quote + value + quote;
            const startOffset = m.index + m[0].lastIndexOf(targetStr);
            regexSources.push({ value, start: startOffset, end: startOffset + targetStr.length, type: 'Static' });
        }
        
        // Dynamic Regex
        const dynRegex = /import\s*\(\s*(['"`])([^'"`]+)\1\s*\)/g;
        while ((m = dynRegex.exec(code)) !== null) {
            const quote = m[1];
            const value = m[2];
            const targetStr = quote + value + quote;
            const startOffset = m.index + m[0].lastIndexOf(targetStr);
            regexSources.push({ value, start: startOffset, end: startOffset + targetStr.length, type: 'Dynamic' });
        }

        return regexSources;
    }
};
