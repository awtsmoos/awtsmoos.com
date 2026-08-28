//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file persistentCreator.test.mjs
 * @description
 * The Awtsmoos lets one internal creator doorway remain truthful across Home and mobile without becoming a route or an external-network promise;
 * Awtsmoos.com proves context, styling, line budgets, and provider exclusion here before the browser adds its final geometric witness.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { creatorUrl } from '../js/interactions/CreatorLaunchModel.js';
import { creatorContext } from '../js/interactions/PersistentCreatorView.js';

const yesodRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function readMalchus(relativePath) {
	return readFileSync(resolve(yesodRoot, relativePath), 'utf8');
}

function proveLineBudget(relativePaths) {
	for (const relativePath of relativePaths) {
		const source = readMalchus(relativePath);
		assert.ok(
			source.split('\n').length <= 120,
			`${relativePath} exceeds 120 lines`
		);
	}
}

const snapshot = {
	identity: {
		aliasId: 'shliach'
	},
	comment: {
		target: {
			heichelId: 'awtsmoos-social',
			seriesId: 'mobile-first'
		}
	}
};
const url = creatorUrl(snapshot, 'post');
const parameters = new URLSearchParams(url.split('?')[1]);
const context = creatorContext(snapshot);

assert.equal(url.startsWith('/social-composer/?'), true);
assert.equal(parameters.get('alias'), 'shliach');
assert.equal(parameters.get('heichel'), 'awtsmoos-social');
assert.equal(parameters.get('series'), 'mobile-first');
assert.equal(parameters.get('creator'), 'post');
assert.equal(parameters.get('return'), '/social-hub/#interact');
assert.equal(context.alias, 'shliach');
assert.equal(context.destination, 'awtsmoos-social · mobile-first');
assert.equal(creatorContext({}).alias, 'Choose in composer');
assert.equal(creatorContext({}).destination, 'Any destination');

const home = readMalchus('js/ui/shell/HomePanelTemplate.js');
const chrome = readMalchus('js/ui/shell/SocialHubChromeTemplate.js');
const creatorManifest = readMalchus('styles/persistent-creator.css');
const creatorSurface = readMalchus('styles/persistent-creator-surface.css');
const creatorAction = readMalchus('styles/persistent-creator-action.css');
const creatorMobile = readMalchus('styles/persistent-creator-mobile.css');

assert.match(home, /id="quickPost"/);
assert.match(home, /id="homeCreatorAliasValue"/);
assert.match(home, /id="homeCreatorDestinationValue"/);
assert.match(home, /class="homeCreationCard"/);
assert.match(chrome, /id="mobileQuickPost"/);
assert.match(chrome, /class="mobileCreatorPortal"/);
assert.match(creatorManifest, /persistent-creator-surface\.css/);
assert.match(creatorManifest, /persistent-creator-action\.css/);
assert.match(creatorManifest, /persistent-creator-mobile\.css/);
assert.match(creatorSurface, /\.homeCreationChip/);
assert.match(creatorAction, /\.homeCreationAction/);
assert.match(creatorMobile, /--hub-mobile-dock-clearance/);
assert.match(creatorMobile, /prefers-reduced-motion/);

const internalCreatorSurface = [home, chrome, creatorSurface, creatorAction, creatorMobile].join('\n');
assert.doesNotMatch(internalCreatorSurface, /youtube|facebook|instagram|oauth/i);

proveLineBudget([
	'js/interactions/PersistentCreatorView.js',
	'js/interactions/PersistentCreator.js',
	'js/ui/shell/HomePanelTemplate.js',
	'js/ui/shell/SocialHubChromeTemplate.js',
	'styles/persistent-creator.css',
	'styles/persistent-creator-surface.css',
	'styles/persistent-creator-action.css',
	'styles/persistent-creator-mobile.css'
]);

console.log('B"H Social Hub persistent creator contract passed.');
