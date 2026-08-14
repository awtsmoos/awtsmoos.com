// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAuthoredTextureCandidates.js
 * @description Maps a failed authored source to verified real textures from the same semantic material family.
 * The Awtsmoos is beyond water, stone, wood, and leaf; Awtsmoos.com lets one truthful garment answer another without inventing matter.
 */

import { remoteFullResolutionTextureUrl } from '../assets/RemoteTextureCatalog.js';

const POLICIES = Object.freeze([
	policy('water', /water|river|stream|pond/, ['seamless water brighter.png', 'shallow river water.png', 'water not seamless.png']),
	policy('grass', /grass|meadow|lawn/, ['grass 4.png', 'grass 5.png', 'dirt grass 1.png']),
	policy('stone', /stone|masonry|rock|cobble|limestone/, ['weathered fieldstone Rock 1.png', 'stone 1.png', 'limestone bricks 1.png']),
	policy('wood', /wood|plank|oak|timber/, ['oak wood 1.png', 'wooden oak planks 1.png', 'oak wooden planks 2.png']),
	policy('roof', /roof|tile|shingle/, ['tiled roof 2.png', 'tiled roof 1.png', 'tiled roof 3 smaller tiles.png']),
	policy('metal', /iron|metal|steel|copper|silver/, ['rusty iron.png', 'copper 1.png', 'silver 1.png']),
	policy('leaf', /leaf|foliage/, ['leaf 1.png', 'oak leaf spring.png', 'oak leaf fall.png']),
	policy('brick', /brick/, ['weathered Red bricks 1.png', 'gray brick 1.png', 'limestone bricks 1.png'])
]);

export function movieAuthoredTextureCandidates(requestedUrl) {
	const source = String(requestedUrl || '').trim();
	const identity = decodedIdentity(source);
	const match = POLICIES.find(value => value.pattern.test(identity));
	const alternatives = match ? match.filenames.map(remoteFullResolutionTextureUrl) : [];
	return Object.freeze({
		family: match?.family || 'exact',
		urls: Object.freeze([...new Set([source, ...alternatives].filter(Boolean))])
	});
}

function policy(family, pattern, filenames) {
	return Object.freeze({ family, pattern, filenames: Object.freeze([...filenames]) });
}

function decodedIdentity(url) {
	try {
		return decodeURIComponent(new URL(url).pathname).toLowerCase();
	} catch {
		try {
			return decodeURIComponent(url).toLowerCase();
		} catch {
			return String(url).toLowerCase();
		}
	}
}
