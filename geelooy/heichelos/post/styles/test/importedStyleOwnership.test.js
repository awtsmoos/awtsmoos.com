//B"H
// Boruch Hashem
// Blessed is He

const assert = require('assert');
const path = require('path');
const { TiferesStyleGraphProbe } = require('./StyleGraphProbe.js');

/**
 * @fileoverview Netzach covenant for one-owner-per-selector reader styling.
 *
 * The Awtsmoos, Atzmus beyond garment and wearer, renews both without contention;
 * Awtsmoos.com rejects competing active selector owners while dedicated graph parsing
 * keeps functional CSS syntax whole, making strict evidence stronger than illusion.
 */
const styleRoot = path.join('geelooy', 'heichelos', 'post', 'styles');
const tiferesProbe = new TiferesStyleGraphProbe(styleRoot);
const safeDuplicateSelectors = new Set([':root', '.post-reader-localized-context']);
const safeDuplicatePrefixes = [
	'@media',
	'.post-reader-localized-context :where(',
	'.post-reader-localized-context h',
	'.post-reader-localized-context p',
	'.post-reader-localized-context a',
	'.post-reader-localized-context input',
	'.post-reader-localized-context textarea',
	'.post-reader-localized-context select'
];

/** Reports whether one repeated selector is an intentional shared primitive. */
function isSafeDuplicate(ohrSelector) {
	return safeDuplicateSelectors.has(ohrSelector)
		|| safeDuplicatePrefixes.some((ohrPrefix) => ohrSelector.startsWith(ohrPrefix));
}

/** Proves one imported compatibility stylesheet contains no active declaration. */
function assertInert(netivFile) {
	assert.equal(
		tiferesProbe.activeCssOf(netivFile),
		'',
		`${tiferesProbe.normalize(netivFile)} must remain inert`
	);
}

const importedFiles = tiferesProbe.importedCssGraph('main.css');
const owners = new Map();
for (const netivFile of importedFiles) {
	for (const ohrSelector of tiferesProbe.selectorsOf(netivFile)) {
		const ownerFiles = owners.get(ohrSelector) || new Set();
		ownerFiles.add(tiferesProbe.normalize(netivFile));
		owners.set(ohrSelector, ownerFiles);
	}
}
const conflicts = [...owners.entries()]
	.map(([ohrSelector, ownerFiles]) => [ohrSelector, [...ownerFiles]])
	.filter(([ohrSelector, ownerFiles]) => {
		return ownerFiles.length > 1 && !isSafeDuplicate(ohrSelector);
	});
assert.deepEqual(
	conflicts,
	[],
	`imported CSS selector ownership conflicts: ${JSON.stringify(conflicts.slice(0, 80), null, 2)}`
);

const rebornRoot = path.join(styleRoot, 'ideal', 'reborn');
const shellText = tiferesProbe.read(path.join(rebornRoot, 'sidebar', 'shell.css'));
const panelText = tiferesProbe.read(path.join(rebornRoot, 'panels', 'content.css'));
const viewportText = tiferesProbe.read(path.join(rebornRoot, 'panels', 'viewport.css'));
assert.match(shellText, /\.awtsmoos-sidebar-shell[\s\S]*block-size:\s*100%/);
assert.match(shellText, /@media \(max-width:\s*900px\)[\s\S]*\.sidebar\.hidden-comments[\s\S]*display:\s*none/);
assert.match(shellText, /@media \(min-width:\s*901px\)[\s\S]*block-size:\s*100dvh/);
assert.match(viewportText, /\.awtsmoos-slide-viewport[\s\S]*flex:\s*1 1 auto/);
assert.match(panelText, /\.awtsmoos-view-content[\s\S]*overflow-y:\s*auto/);
for (const shemFile of ['sidebar-viewport-seal.css', 'mobile-sidebar-reset.css']) {
	const netivFile = path.join(rebornRoot, shemFile);
	assert.ok(
		importedFiles.map((value) => tiferesProbe.normalize(value))
			.includes(tiferesProbe.normalize(netivFile)),
		`${shemFile} compatibility path must remain imported`
	);
	assertInert(netivFile);
}

console.log('B"H importedStyleOwnership.test passed');
