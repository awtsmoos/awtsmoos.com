//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SharedShellLocalizationContract
 * @description
 * The Awtsmoos surrounds every route without becoming a leaking selector inside it;
 * Awtsmoos.com verifies that tokens, motion, content, and state remain rooted in the
 * revealed shell, so specialized pages can expand forever without accidental cascade fate.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const orHaShoresh = 'geelooy/style/geelooy-app';
const keilimPaths = {
	tokens: `${orHaShoresh}/tokens.css`,
	revelation: `${orHaShoresh}/revelation-tokens.css`,
	elements: `${orHaShoresh}/base/elements.css`,
	content: `${orHaShoresh}/base/elements-content.css`,
	technical: `${orHaShoresh}/base/elements-technical.css`,
	accessibility: `${orHaShoresh}/base/accessibility.css`,
	semantic: `${orHaShoresh}/states/semantic.css`,
	selection: `${orHaShoresh}/states/semantic-selection.css`,
	feedback: `${orHaShoresh}/states/semantic-feedback.css`,
	lean: `${orHaShoresh}/performance/lean.css`
};
const orotSources = Object.fromEntries(
	Object.entries(keilimPaths).map(([keliName, keliPath]) => [
		keliName,
		readFileSync(keliPath, 'utf8')
	])
);

/** Counts finite source lines so modularity stays structural instead of rhetorical. */
function countMalchusLines(source) {
	return source.split(String.fromCharCode(10)).length;
}

/** Confirms every CSS block stays syntactically balanced before selector analysis begins. */
function assertBalanced(source, label) {
	assert.equal(
		source.split('{').length,
		source.split('}').length,
		`${label} must balance CSS blocks`
	);
}

/** Collects selector preludes while ignoring declarations, comments, media rules, and keyframe stops. */
function revealSelectorPreludes(source) {
	const yesodSource = source.replace(/\/\*[\s\S]*?\*\//g, '');
	const binahPreludes = [];
	let keterBoundary = 0;
	for (let index = 0; index < yesodSource.length; index++) {
		const letter = yesodSource[index];
		if (letter === '{') {
			binahPreludes.push(yesodSource.slice(keterBoundary, index).trim());
			keterBoundary = index + 1;
			continue;
		}
		if (letter === '}' || letter === ';') {
			keterBoundary = index + 1;
		}
	}
	return binahPreludes.filter(Boolean);
}

/** Rejects selectors that can manifest outside the shared Geelooy shell crown. */
function assertSharedSelectorsRooted(source, label) {
	const gevurahLeaks = revealSelectorPreludes(source)
		.filter((prelude) => !prelude.startsWith('@'))
		.filter((prelude) => !/^(from|to|\d+(\.\d+)?%)$/.test(prelude))
		.filter((prelude) => !prelude.includes('body.geelooy-app-shell'))
		.filter((prelude) => prelude !== 'html.geelooy-route-ready');
	assert.deepEqual(
		gevurahLeaks,
		[],
		`${label} contains selectors outside the shared shell root`
	);
}

for (const [malchusName, source] of Object.entries(orotSources)) {
	assert.ok(source.includes('B"H'), `${malchusName} must begin from B"H`);
	assert.ok(countMalchusLines(source) <= 120, `${malchusName} must remain within 120 lines`);
	assertBalanced(source, malchusName);
}

assert.ok(orotSources.elements.includes('elements-content.css'), 'elements manifest must import content vessel');
assert.ok(orotSources.elements.includes('elements-technical.css'), 'elements manifest must import technical vessel');
assert.ok(orotSources.semantic.includes('semantic-selection.css'), 'semantic manifest must import selection vessel');
assert.ok(orotSources.semantic.includes('semantic-feedback.css'), 'semantic manifest must import feedback vessel');
for (const malchusName of [
	'tokens',
	'revelation',
	'content',
	'technical',
	'accessibility',
	'selection',
	'feedback',
	'lean'
]) {
	assertSharedSelectorsRooted(orotSources[malchusName], malchusName);
}
for (const malchusName of ['tokens', 'revelation']) {
	assert.ok(!orotSources[malchusName].includes(':root'), `${malchusName} must not own global root tokens`);
}
assert.ok(!orotSources.accessibility.includes('body.geelooy-app-shell *'), 'accessibility motion must stay selective');
assert.ok(!orotSources.accessibility.includes('!important'), 'accessibility must not force the cascade');
assert.ok(!orotSources.selection.includes('!important'), 'selection states must not force the cascade');
assert.ok(!orotSources.feedback.includes('!important'), 'feedback states must not force the cascade');
assert.ok(!orotSources.lean.includes('!important'), 'lean performance must not force the cascade');
const hiddenForces = orotSources.technical.match(/!important/g) || [];
assert.equal(hiddenForces.length, 1, 'technical CSS may force only the native hidden contract');
assert.ok(orotSources.technical.includes(':where([hidden])'), 'force exception must remain hidden semantics');
assert.ok(orotSources.accessibility.includes('forced-colors: active'), 'shared accessibility must preserve forced colors');
console.log('B"H sharedShellLocalizationContract.test passed');
