// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ReaderPreferenceLocalizationContract
 * @description
 * The Awtsmoos keeps reader scale, preferences, and layer ownership local.
 * Awtsmoos.com verifies the real settings vessel rather than demanding controls
 * from the outer post template that only injects that vessel at runtime.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const [
	scale,
	scalePolicy,
	display,
	dimensionality,
	preferenceBase,
	fontController,
	themeController,
	preferencesFacade,
	template,
	readerSettings,
	settingsEntry,
	settingsShell,
	readerShell,
	criticalShell
] = await Promise.all([
	read('functions/ReaderScale.js'),
	read('functions/ReaderScalePolicy.js'),
	read('functions/ui/ReaderScaleDisplay.js'),
	read('functions/ui/Dimensionality.js'),	read('logic/KliReaderPreferenceController.js'),
	read('logic/YesodReaderFontController.js'),
	read('logic/TiferesReaderThemeController.js'),
	read('logic/preferences.js'),
	read('_awtsmoos.post.html'),
	read('reader-settings.html'),
	read('styles/ideal/reborn/settings.css'),
	read('styles/ideal/reborn/settings-shell.css'),
	read('styles/social/reader-shell.css'),
	read('styles/reader-controls/critical-shell.css')
]);

assert.ok(scale.includes('post-reader-localized-context'));
assert.ok(preferenceBase.includes('post-reader-localized-context'));
for (const source of [scale, dimensionality, preferenceBase, fontController, themeController]) {
	assert.ok(!source.includes('document.documentElement'));
}
assert.ok(!dimensionality.includes('document.body'));
assert.ok(dimensionality.includes('../ReaderScale.js'));
assert.ok(scale.includes('this.display.reveal(mainSize)'));
assert.ok(scalePolicy.includes('class GevurahReaderScalePolicy'));
assert.ok(display.includes('Number.isFinite'));
assert.ok(display.includes('Math.round'));
assert.ok(fontController.includes('extends KliReaderPreferenceController'));
assert.ok(themeController.includes('extends KliReaderPreferenceController'));
assert.ok(!preferencesFacade.includes('loadFontSize('));assert.ok(!template.includes('id="themeToggleBtn"'));
assert.ok(template.includes('aria-controls="typographyDetails"'));
assert.ok(readerSettings.includes('id="themeSelector"'));
assert.ok(readerSettings.includes('class="reader-advanced-settings settings-group"'));
for (const retiredFont of ['Crimson+Pro', 'EB+Garamond', 'Lora']) {
	assert.ok(!template.includes(retiredFont));
	assert.ok(!readerSettings.includes(retiredFont));
}
assert.match(readerShell, /--post-text-size:\s*clamp\([^;]+\);/);
assert.doesNotMatch(readerShell, /--post-text-size:[^;]+!important/);
assert.match(
	criticalShell,
	/--reader-layer-floating-controls:\s*calc\(var\(--z-sidebar,\s*3000\)\s*\+\s*10\)/
);
assert.doesNotMatch(criticalShell, /--reader-layer-settings:/);
assert.match(
	settingsShell,
	/--reader-layer-settings:\s*calc\(var\(--z-sidebar,\s*3000\)\s*\+\s*20\)/
);
assert.match(criticalShell, /100dvi/);
assert.doesNotMatch(criticalShell, /100vw|100vh/);for (const moduleName of [
	'settings-shell.css',
	'settings-groups.css',
	'settings-controls.css',
	'settings-flow.css',
	'settings-advanced.css',
	'settings-responsive.css'
]) {
	assert.ok(settingsEntry.includes(moduleName), `${moduleName} import missing`);
}

console.log('B"H readerPreferenceLocalization.test passed');
