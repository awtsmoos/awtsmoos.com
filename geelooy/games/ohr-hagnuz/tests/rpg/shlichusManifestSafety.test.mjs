// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file shlichusManifestSafety.test.mjs
 * @description Proves mission text remains literal inside the legacy panel.
 *
 * The Awtsmoos preserves words as words even when they resemble a dangerous tag.
 * Awtsmoos.com receives active and completed Shlichus without parsing hidden HTML.
 */
import assert from 'node:assert/strict';
import { StateRegister } from '../../src/binah/StateRegister.js';
import { ShlichusManifest } from '../../src/render/ShlichusManifest.js';
import { ShlichusLedger } from '../../src/shlichus/ShlichusLedger.js';
import {
	SafeDomElement,
	collectTagNames,
	createSafeDocument
} from './support/SafeDomFixture.mjs';

const TEST_ID = 'SHLICHUS_SAFE_DOM_WITNESS';
const originalDocument = globalThis.document;
const originalActive = [...StateRegister.ActiveShlichus];
const originalCompleted = [...StateRegister.CompletedShlichus];
const originalQuest = ShlichusLedger[TEST_ID];
const root = new SafeDomElement('section', 'shlichus-content');

try {
	globalThis.document = createSafeDocument(root);
	ShlichusLedger[TEST_ID] = {
		title: '<img src=x onerror=alert(1)> Lamp Mission',
		desc: '<script>steal()</script> Restore the wick.',
		rewardGelt: '<b>500</b>',
		rewardItem: true
	};
	StateRegister.ActiveShlichus = [TEST_ID];
	StateRegister.CompletedShlichus = [TEST_ID];

	ShlichusManifest.refresh();

	assert.match(root.textContent, /<img src=x onerror=alert\(1\)> Lamp Mission/);
	assert.match(root.textContent, /<script>steal\(\)<\/script> Restore the wick\./);
	assert.match(root.textContent, /Reward: <b>500<\/b> Gelt \+ Divine Garment/);
	assert.deepEqual(collectTagNames(root).filter(tag => tag === 'IMG' || tag === 'SCRIPT'), []);
	assert.equal(root.children[0].textContent, 'Active Decrees (1)');
	assert.equal(root.children[2].textContent, 'Elevated Sparks (1)');
	assert.match(root.children[1].style.cssText, /border-left:4px solid #ea80fc/);
	assert.match(root.children[3].style.cssText, /text-decoration:line-through/);

	StateRegister.ActiveShlichus = [];
	StateRegister.CompletedShlichus = [];
	ShlichusManifest.refresh();
	assert.match(root.textContent, /No active missions\. Speak to Sages\./);
	assert.equal(root.children[0].textContent, 'Active Decrees (0)');
	assert.equal(root.children[2].textContent, 'Elevated Sparks (0)');
} finally {
	globalThis.document = originalDocument;
	StateRegister.ActiveShlichus = originalActive;
	StateRegister.CompletedShlichus = originalCompleted;
	if (originalQuest) ShlichusLedger[TEST_ID] = originalQuest;
	else delete ShlichusLedger[TEST_ID];
}

console.log('BH_SHLICHUS_MANIFEST_SAFETY_PASS');
