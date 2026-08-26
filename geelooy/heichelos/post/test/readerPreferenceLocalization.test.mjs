// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file readerPreferenceLocalization.test.mjs
 * @description
 * The Awtsmoos keeps scale, theme, layers, and motion inside the reader's measured shore;
 * Awtsmoos.com guards every repaired seam so old global leaks and offscreen rails return no more.
 */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");
const [
	scale,
	display,
	dimensionality,
	preferenceBase,
	fontController,
	themeController,
	preferencesFacade,
	template,
	settingsEntry,
	readerShell,
	criticalShell
] = await Promise.all([
	read("functions/ReaderScale.js"),
	read("functions/ui/ReaderScaleDisplay.js"),
	read("functions/ui/Dimensionality.js"),
	read("logic/KliReaderPreferenceController.js"),
	read("logic/YesodReaderFontController.js"),
	read("logic/TiferesReaderThemeController.js"),
	read("logic/preferences.js"),
	read("_awtsmoos.post.html"),
	read("styles/ideal/reborn/settings.css"),
	read("styles/social/reader-shell.css"),
	read("styles/reader-controls/critical-shell.css")
]);

assert.ok(scale.includes("post-reader-localized-context"), "reader scale root contract missing");
assert.ok(preferenceBase.includes("post-reader-localized-context"), "preference root contract missing");
for (const source of [scale, dimensionality, preferenceBase, fontController, themeController]) {
	assert.ok(!source.includes("document.documentElement"), "global document-root mutation returned");
}
assert.ok(!dimensionality.includes("document.body"), "legacy body-scale mutation returned");
assert.ok(dimensionality.includes("../ReaderScale.js"), "legacy dimensionality facade escaped localized engine");
assert.ok(scale.includes("tiferesReaderScaleDisplay.reveal(mainSize)"), "human scale presenter is disconnected");
assert.ok(display.includes('return Number.isFinite(parsedSize) ? `${Math.round(parsedSize * 100) / 100}px` : "Aa"'), "human scale formatting contract missing");
assert.ok(fontController.includes("extends KliReaderPreferenceController"), "font controller lost localized inheritance");
assert.ok(themeController.includes("extends KliReaderPreferenceController"), "theme controller lost localized inheritance");
assert.ok(!preferencesFacade.includes("loadFontSize("), "preference facade duplicated scale bootstrap");
assert.ok(!template.includes('id="themeToggleBtn"'), "duplicate theme button returned");
assert.ok(template.includes('id="themeSelector"'), "theme selector missing");
assert.ok(template.includes('class="reader-advanced-settings settings-group"'), "advanced disclosure missing");
assert.ok(template.includes('aria-controls="typographyDetails"'), "settings trigger relation missing");
for (const retiredFont of ["Crimson+Pro", "EB+Garamond", "Lora"]) {
	assert.ok(!template.includes(retiredFont), `${retiredFont} still blocks initial render`);
}
assert.match(readerShell, /--post-text-size:\s*clamp\([^;]+\);/, "reader-size default missing");
assert.doesNotMatch(readerShell, /--post-text-size:[^;]+!important/, "reader-size default became an important prison");
assert.ok(criticalShell.includes("--reader-layer-floating-controls: 820"), "floating layer contract missing");
assert.ok(criticalShell.includes("--reader-layer-settings: 840"), "settings layer contract missing");
assert.ok(criticalShell.includes("transform: none !important"), "safe-edge rail transform contract missing");
for (const moduleName of ["settings-shell.css", "settings-groups.css", "settings-controls.css", "settings-flow.css", "settings-advanced.css", "settings-responsive.css"]) {
	assert.ok(settingsEntry.includes(moduleName), `${moduleName} import missing`);
}

console.log('B"H readerPreferenceLocalization.test passed');
