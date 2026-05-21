// B"H
// tests/insight/cssLayerReport.mjs

import fs from 'node:fs';
import path from 'node:path';

/**
 * Chapter 2: The screen has heavens and firmaments. When a random z-index climbs
 * above the throne, dialogue vanishes beneath static and touch controls drown.
 * This report names the rogue layers.
 *
 * @returns {object} CSS layering and mobile-safety diagnostics.
 */
function buildCssLayerReport() {
    const cssDir = path.resolve('css');
    const files = fs.readdirSync(cssDir).filter(file => file.endsWith('.css'));
    const hardZ = [];
    const unsafeBottom = [];

    for (const file of files) {
        const text = fs.readFileSync(path.join(cssDir, file), 'utf8');
        for (const match of text.matchAll(/z-index:\s*(\d+)/g)) {
            hardZ.push({ file, value: Number(match[1]) });
        }
        if (/bottom:\s*\d+%/.test(text)) unsafeBottom.push(file);
    }

    return { files: files.length, hardZ, unsafeBottom };
}

console.log(JSON.stringify(buildCssLayerReport(), null, 2));
