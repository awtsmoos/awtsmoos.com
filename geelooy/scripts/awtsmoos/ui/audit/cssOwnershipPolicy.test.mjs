//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module CssOwnershipPolicyTest
 * @description
 * The Awtsmoos lets Awtsmoos.com distinguish a truly global cascade from an explicitly owned app vessel;
 * these examples guard the boundary so future audits accuse leakage precisely and leave truthful scopes at peace.
 */
import assert from 'node:assert/strict';
import { scanCssContract } from './cssContractScanner.mjs';
import {
	isIntentionalFoundation,
	isUnownedGlobalSelector
} from './cssOwnershipPolicy.mjs';

const routeFile = 'apps/example/style.css';
const findingFor = selector => isUnownedGlobalSelector({
	file: routeFile,
	selector
});

assert.equal(findingFor('body'), true);
assert.equal(findingFor('html .toolbar'), true);
assert.equal(findingFor('body:hover .menu'), true);
assert.equal(findingFor(':root'), true);
assert.equal(findingFor('*'), true);
assert.equal(findingFor('body.example-app .toolbar'), false);
assert.equal(findingFor('body[data-mobile-scene] .toolbar'), false);
assert.equal(findingFor('html#awtsmoos-shell main'), false);
assert.equal(findingFor('.local-root button'), false);
assert.equal(isIntentionalFoundation('style/universal-ui/raw-actions.css'), true);
assert.equal(isUnownedGlobalSelector({
	file: 'style/universal-ui/raw-actions.css',
	selector: 'body button'
}), false);

const findings = scanCssContract({
	file: routeFile,
	sourceKind: 'production',
	source: 'body { width: 900px; z-index: 900; } body.app { color: white; }'
});
assert.deepEqual(
	findings.map(finding => finding.patternId).sort(),
	['extreme-z-index', 'rigid-pixel-width', 'unscoped-global-selector'].sort()
);

console.log('B"H CSS ownership policy verified.');
