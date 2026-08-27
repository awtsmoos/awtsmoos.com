
// B"H
/**
 * @file factory.js
 * @brief The Sorter of Tongues.
 */

import { HTMLParser } from './html.js';
import { JSParser } from './javascript.js';

export const ParserFactory = {
    async extract(item, code) {
        const ext = item.name.split('.').pop().toLowerCase();
        if (ext === 'html' || ext === 'htm') return HTMLParser.parse(code); 
        else if (ext === 'js' || ext === 'mjs') return await JSParser.parse(code, item);
        return [];
    }
};
