//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SocialExperienceInstallerTest
 * @description
 * The Awtsmoos is one while many components ask for experience, and Awtsmoos.com proves one document receives one coherent clean-future garment set without multiplying links;
 * the once-orphaned universal action rail now joins foundation, disclosure, overflow, and ambient vessels before teardown releases the singleton light.
 */

import assert from 'node:assert/strict';
import {
	RELEASE,
	STYLE_SHEETS,
	installSocialExperience
} from '../SocialExperienceInstaller.js';
import { TestDocument } from './SocialUxTestDom.mjs';

const document = new TestDocument();
document.documentElement.classList = {
	values: new Set(),
	add(...items) {
		for (const item of items) this.values.add(item);
	},
	remove(...items) {
		for (const item of items) this.values.delete(item);
	}
};

assert.equal(RELEASE, 'clean-future-001');
assert.equal(STYLE_SHEETS.length, 5);
assert.equal(
	STYLE_SHEETS.some(([, path]) => path.includes('action-rail.css')),
	true
);
assert.equal(
	STYLE_SHEETS.every(([, path]) => path.includes(`v=${RELEASE}`)),
	true
);

const first = installSocialExperience(document, { ambient: false });
const second = installSocialExperience(document, { ambient: false });
assert.equal(first, second);
assert.equal(document.head.children.length, 5);
assert.equal(document.documentElement.classList.values.has('awtsmoosSocialExperience'), true);
first.destroy();
assert.equal(document.documentElement.classList.values.has('awtsmoosSocialExperience'), false);
const third = installSocialExperience(document, { ambient: false });
assert.notEqual(third, first);
third.destroy();
console.log('B"H SocialExperienceInstaller.test passed');
