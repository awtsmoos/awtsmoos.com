//B"H
// Boruch Hashem
// Blessed is He
/** Locks the phone-screenshot defects into executable source contracts. */
import fs from 'node:fs';
import assert from 'node:assert/strict';

const read = path => fs.readFileSync(path, 'utf8');
const home = read('geelooy/index.html');
const shliach = read('geelooy/scripts/home-simple/ShliachSpotlightContent.js');
const shliachLoader = read('geelooy/scripts/home-simple/ShliachSpotlight.js');
const homeMobile = read('geelooy/style/home-simple/main-brand-mobile.css');
const apps = read('geelooy/apps/index.html');
const appsIntegrity = read('geelooy/apps/styles/integrity.css');
const games = read('geelooy/games/index.html');
const gamesIntegrity = read('geelooy/games/styles/integrity.css');

assert.match(home, /components\.css\?v=mobile-visual-001/);
assert.match(home, /index\.js\?v=mobile-visual-001/);
assert.match(shliach, /addEventListener\("error"/);
assert.match(shliach, /mediaState = "missing"/);
assert.match(shliach, /image\.hidden = true/);
assert.match(shliach, /shliach-spotlight-media-fallback/);
assert.match(shliachLoader, /ShliachSpotlightContent\.js\?v=mobile-visual-001/);
assert.match(shliachLoader, /shliach-spotlight\.css\?v=mobile-visual-001/);
assert.match(homeMobile, /padding-bottom:\s*calc\(9rem \+ env\(safe-area-inset-bottom\)\)/);

const appsFuture = apps.indexOf('/style/future-system/index.css');
const appsIntegrityLink = apps.indexOf('./styles/integrity.css?v=apps-mobile-010');
assert.ok(appsFuture >= 0 && appsIntegrityLink > appsFuture, 'Apps integrity CSS must load after Future System');
assert.match(apps, /style\.css\?v=apps-mobile-010/);
assert.match(appsIntegrity, /background:\s*#050914/);
assert.match(appsIntegrity, /font-family:\s*Inter, ui-sans-serif, system-ui/);
assert.match(appsIntegrity, /body\[data-geelooy-route="apps"\] a \{ color: inherit; \}/);
assert.match(appsIntegrity, /\[data-future-icon\].*block-size:/s);
assert.match(appsIntegrity, /backdrop-filter:\s*none !important/);

const gamesFuture = games.indexOf('/style/future-system/index.css');
const gamesIntegrityLink = games.indexOf('./styles/integrity.css?v=games-mobile-010');
assert.ok(gamesFuture >= 0 && gamesIntegrityLink > gamesFuture, 'Games integrity CSS must load after Future System');
assert.match(games, /style\.css\?v=games-mobile-010/);
assert.match(gamesIntegrity, /\[data-future-reveal\][\s\S]*filter:\s*none !important/);
assert.match(gamesIntegrity, /\.skipLink[\s\S]*inset-inline-start:\s*-200vw/);
assert.match(gamesIntegrity, /padding-block-start:\s*calc\(var\(--g-header-h/);
assert.match(gamesIntegrity, /padding-block-end:\s*calc\(var\(--g-dock-h/);
assert.match(gamesIntegrity, /backdrop-filter:\s*none !important/);

for (const path of [
	'geelooy/scripts/home-simple/ShliachSpotlightContent.js',
	'geelooy/scripts/home-simple/ShliachSpotlight.js',
	'geelooy/style/home-simple/shliach-spotlight.css',
	'geelooy/style/home-simple/main-brand-mobile.css',
	'geelooy/apps/index.html',
	'geelooy/apps/style.css',
	'geelooy/apps/styles/integrity.css',
	'geelooy/games/index.html',
	'geelooy/games/style.css',
	'geelooy/games/styles/integrity.css'
]) {
	assert.ok(read(path).split(/\r?\n/).length <= 120, `${path} exceeds the source budget`);
}
console.log('B"H mobileScreenshotRepairContract.test passed.');
