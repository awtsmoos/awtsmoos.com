
// B"H
/**
 * @file import-scanner.js
 * @brief The Eye of Dependency. Unites AST and Regex scanning logic.
 * 
 * THE POEM OF THE GATHERER:
 * To see the threads that bind the scattered code,
 * We must observe the paths where imports flowed.
 * First the AST, with structure pure and tight,
 * Traces the logic with meticulous sight.
 * But if the code is shattered, or the parser fails to see,
 * The Regex Net sweeps underneath to set the missed links free.
 * Thus the scanner brings forth every hidden name,
 * Ensuring that the bundle and the seeker share the same.
 */

import { ASTWalker } from './ast-walker.js';
import { RegexNet } from './regex-net.js';

export const ImportScanner = {
    /**
     * @async
     * @function scanDetailed
     * @description Returns deep objects containing character start/end ranges.
     * Crucial for the HTML Preview Bundler which must perform string replacements.
     */
    async scanDetailed(code, absPath) {
        const getLine = (index) => (code.substring(0, index).match(/\n/g) || []).length + 1;
        
        let sources = await ASTWalker.findImports(code, absPath, getLine);
        const regexSources = RegexNet.findImports(code, absPath, getLine);
        
        // Merge Regex findings if AST missed them
        for (const rs of regexSources) {
            const alreadyFound = sources.some(s => {
                const sStart = s.start ?? s.range?.[0] ?? -1;
                return Math.abs(sStart - rs.start) < 10; 
            });
            if (!alreadyFound) {
                console.log(`[ImportScanner] B"H - Regex Caught missed import: "${rs.value}" at line ${getLine(rs.start)} in ${absPath}`);
                sources.push(rs);
            }
        }

        // Sort descending so downstream replacements don't shift future offsets
        sources.sort((a, b) => {
            const startA = a.start ?? a.range?.[0] ?? 0;
            const startB = b.start ?? b.range?.[0] ?? 0;
            return startB - startA;
        });

        return { sources, getLine };
    },

    /**
     * @async
     * @function scan
     * @description Returns a clean array of string paths.
     * Crucial for the Connected Seeker which only cares about the destinations.
     */
    async scan(code, absPath) {
        const { sources } = await this.scanDetailed(code, absPath);
        return sources.map(s => s.value);
    }
};
