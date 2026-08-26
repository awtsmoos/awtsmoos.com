//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/**
 * @module ResponsivePanelsContractTest
 * @description
 * The Awtsmoos lets wide Advanced composition remain expansive while Awtsmoos.com gives focused widths one deliberate panel and one accessible preview sheet;
 * this contract tests behavior-bearing tokens rather than quote punctuation, so formatting may evolve without weakening the actual responsive covenant.
 */
const source = readFileSync(
	'geelooy/social-composer/js/civilization/responsivePanels.js',
	'utf8'
);

function matches(pattern, message) {
	assert.match(source, pattern, message);
}

matches(
	/FOCUSED_PANEL_QUERY\s*=\s*["']\(max-width: 1080px\)["']/,
	'focused breakpoint must remain 1080px'
);
matches(
	/PREVIEW_SHEET_QUERY\s*=\s*["']\(max-width: 820px\)["']/,
	'preview breakpoint must remain 820px'
);
matches(
	/panels\.forEach\(panel => panel\.open = true\)/,
	'wide Advanced mode must open all major panels'
);
matches(
	/opened\.length === 1/,
	'a single already-open panel should remain intentional'
);
matches(
	/panel\.dataset\.mobilePanel === ["']content["']/,
	'content must remain the focused fallback panel'
);
matches(
	/addEventListener\(["']toggle["'], collapseSiblingMajorPanels\)/,
	'major panels must collapse siblings after toggling'
);
matches(
	/panel\.open = panel === activePanel/,
	'focused mode must leave only the active panel open'
);
matches(
	/sheet\.inert = hidden/,
	'hidden preview must become inert'
);
matches(
	/setAttribute\(["']aria-hidden["'], hidden \? ["']true["'] : ["']false["']\)/,
	'preview aria-hidden must follow visibility'
);
matches(
	/classList\.add\(["']is-open["']\)/,
	'mobile preview must expose its open state'
);
matches(
	/previewInvoker\?\.focus\(\)/,
	'closing preview must restore invoker focus'
);
matches(
	/event\.key === ["']Escape["']/,
	'Escape must close the preview sheet'
);
matches(
	/scrollIntoView\(\{ behavior: ["']smooth["'], block: ["']start["'] \}\)/,
	'wide preview should scroll into view smoothly'
);

assert.ok(
	source.split('\n').length <= 120,
	'responsivePanels.js exceeds 120 lines'
);

console.log('B"H responsivePanelsContract.test passed');
