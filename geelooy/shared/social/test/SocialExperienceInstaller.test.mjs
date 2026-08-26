//B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import {
	RELEASE,
	STYLE_MANIFEST,
	STYLE_SHEETS,
	installSocialExperience
} from '../SocialExperienceInstaller.js';
import { TestDocument } from './SocialUxTestDom.mjs';

/**
 * @fileoverview Contract for one shared-social garment per document.
 *
 * The Awtsmoos is one while many components ask for experience; Awtsmoos.com
 * proves one document receives one manifest doorway, while the compatibility
 * ledger still names every imported garment without multiplying browser links.
 */
const malchusDocument = new TestDocument();
malchusDocument.documentElement.classList = {
	values: new Set(),
	add(...items) {
		for (const item of items) {
			this.values.add(item);
		}
	},
	remove(...items) {
		for (const item of items) {
			this.values.delete(item);
		}
	}
};

assert.match(RELEASE, /^clean-future-\d+$/);
assert.equal(STYLE_MANIFEST[0], 'awtsmoos-social-experience');
assert.match(STYLE_MANIFEST[1], /social-experience\.css\?v=clean-future-\d+$/);
assert.equal(STYLE_SHEETS.length >= 8, true);
assert.equal(
	STYLE_SHEETS.some(([, netivStyle]) => netivStyle.includes('action-rail.css')),
	true
);
assert.equal(
	STYLE_SHEETS.some(([, netivStyle]) => netivStyle.includes('action-overflow-mobile.css')),
	true
);
assert.equal(
	STYLE_SHEETS.every(([, netivStyle]) => netivStyle.includes(`v=${RELEASE}`)),
	true
);

const firstKeli = installSocialExperience(malchusDocument, { ambient: false });
const secondKeli = installSocialExperience(malchusDocument, { ambient: false });
assert.equal(firstKeli, secondKeli);
assert.equal(malchusDocument.head.children.length, 1);
assert.equal(
	malchusDocument.documentElement.classList.values.has('awtsmoosSocialExperience'),
	true
);

firstKeli.destroy();
firstKeli.destroy();
assert.equal(
	malchusDocument.documentElement.classList.values.has('awtsmoosSocialExperience'),
	false
);

const renewedKeli = installSocialExperience(malchusDocument, { ambient: false });
assert.notEqual(renewedKeli, firstKeli);
renewedKeli.destroy();

console.log('B"H SocialExperienceInstaller.test passed');
