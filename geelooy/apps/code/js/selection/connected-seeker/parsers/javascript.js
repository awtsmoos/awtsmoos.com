
// B"H
/**
 * @file javascript.js
 * @brief The Reader of the Inner Mind.
 */

import { ImportScanner } from '../../../tools/import-scanner.js';

export const JSParser = {
    async parse(code, item) {
        try {
            const links = await ImportScanner.scan(code, item.path);
            return links.filter(l => l.startsWith('.') || l.startsWith('/'));
        } catch (e) { return []; }
    }
};
