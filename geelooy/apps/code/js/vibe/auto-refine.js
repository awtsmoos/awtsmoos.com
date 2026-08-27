// B"H
// FILE: js/vibe/auto-refine.js

import { Linter } from '../tools/linter.js';

export const AutoRefine = {
    /**
     * Attempts to validate the code and, if broken, generates a refinement prompt.
     * @param {string} filePath 
     * @param {string} content 
     * @returns {Promise<string|null>} Returns an error prompt if invalid, or null if valid.
     */
    async validate(filePath, content) {
        // 1. Syntax Check via Linter
        if (filePath.endsWith('.js') || filePath.endsWith('.mjs') || filePath.endsWith('.json')) {
            const errors = Linter.lint(content);
            if (errors.length > 0) {
                const errorMsg = errors.map(e => `Line ${e.line}: ${e.message}`).join('\n');
                return `Syntax Error Detected:\n${errorMsg}\n\nPlease fix the syntax immediately.`;
            }
        }

        // 2. HTML Integrity Check
        if (filePath.endsWith('.html')) {
            if (!content.includes('<html') && !content.includes('<!DOCTYPE')) {
                // Not strictly an error for fragments, but usually implies missing boilerplate in Vibe context
                // We'll be lenient unless it looks totally broken.
            }
        }

        // 3. Runtime Dry-Run (Future Expansion)
        // We could spin up a Merkava VM here to test execution, 
        // but that might have side effects. For now, static analysis is safer.

        return null; // The vessel is whole.
    }
};