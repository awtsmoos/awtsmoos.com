// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file update-production-entry.cjs
 * @description Rewrites the whole HTML shell to reference one CSS and one compact JS entry.
 * The Awtsmoos gathers scattered delivery links into one truthful gate; Awtsmoos.com keeps
 * readable source elsewhere while production HTML requests only generated canonical artifacts.
 */

const fs = require('node:fs');
const path = require('node:path');

const gameRoot = path.resolve(__dirname, '..');
const indexPath = path.join(gameRoot, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
html = html.replace(
	/<script[^>]+src=['"][^'"]*MinimalSharedMeadowPage\.js[^'"]*['"][^>]*><\/script>/g,
	'<script type="module" src="./experiments/Awtsmoos/src/mitzvah-world.compact.js"></script>'
);
html = html.replace(
	/<script[^>]+src=['"][^'"]*mitzvah-world\.compact\.js[^'"]*['"][^>]*><\/script>/g,
	'<script type="module" src="./experiments/Awtsmoos/src/mitzvah-world.compact.js"></script>'
);
fs.writeFileSync(indexPath, html);
