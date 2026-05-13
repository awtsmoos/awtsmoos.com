
/**
 * B"H
 * @file AbsoluteImportPurifier.js
 * @description
 * 🧹 THE GREAT BROOM OF THE HEAVENS 🧹
 * 
 * "And He separated the light from the darkness."
 * Sometimes, digital artifacts cling to the holy vessels. A mere '?v=123'
 * added to an import statement causes the earthly server to fail to recognize 
 * the file as a JavaScript module, rendering it into the void as 'application/json'.
 * This shatters the Web Worker completely!
 * 
 * Run this script using `node AbsoluteImportPurifier.js` in your terminal.
 * It will traverse every single file and rip the query strings out of the imports,
 * ensuring the Seder Hishtalshelus (Chain of Emanation) flows smoothly.
 */
const fs = require('fs');
const path = require('path');

function purifyDir(dir) {
    const files = fs.readdirSync(dir);
    for(let f of files) {
        const p = path.join(dir, f);
        if (fs.statSync(p).isDirectory()) {
            if (!p.includes('node_modules') && !p.includes('.git')) {
                purifyDir(p);
            }
        } else if (p.endsWith('.js')) {
            let content = fs.readFileSync(p, 'utf8');
            if (content.includes('?v=')) {
                // Eradicate ?v=... from any import or require statements
                const replaced = content.replace(/(\.js)\?v=[a-zA-Z0-9_]+(['"])/g, '$1$2');
                if (replaced !== content) {
                    fs.writeFileSync(p, replaced);
                    console.log(`B"H - 🌟 Purified Vessel: ${path.relative(__dirname, p)}`);
                }
            }
        }
    }
}

console.log('B"H - Initiating the Great Purge of Import Queries...');
purifyDir(__dirname);
console.log('B"H - Purge Complete. The vessels are clean.');
