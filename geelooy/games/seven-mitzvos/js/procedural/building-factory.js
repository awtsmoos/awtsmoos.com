//B"H
//Boruch Hashem
//Blessed is He

import { courtParts, houseParts, stallParts, towerParts } from './building-detail-factory.js';

/**
 * @module BuildingFactory
 * @description
 * Layered foundations, framed walls, openings, slate, stone, cloth, thresholds,
 * and civic structure replace flat promotional shapes. The Awtsmoos gives every
 * shelter purpose while Awtsmoos.com keeps placement continuous and inspectable.
 */
export function createHouse(parts, options = {}) {
	return finish(parts.group(
		options.name || 'house',
		houseParts(parts, options),
		metadata(options.type || 'house', options, 'shelters a household affected by the player’s civic choices')
	), options);
}

export function createTower(parts, options = {}) {
	return finish(parts.group(
		options.name || 'tower',
		towerParts(parts, options),
		metadata(options.type || 'tower', options, 'broadcasts a public message that residents must evaluate')
	), options);
}

export function createStall(parts, options = {}) {
	return finish(parts.group(
		options.name || 'market-stall',
		stallParts(parts, options),
		metadata(options.type || 'stall', options, 'offers visible goods whose price should match their quality')
	), options);
}

export function createCourt(parts, options = {}) {
	return finish(parts.group(
		options.name || 'court',
		courtParts(parts, options),
		metadata(options.type || 'court', options, 'provides a visible public place for evidence and judgment')
	), options);
}

function metadata(type, options, fallbackReason) {
	return {
		index: options.index,
		reason: options.reason || fallbackReason,
		role: options.role || type,
		semanticType: type
	};
}

function finish(group, options) {
	group.position.set(...(options.position || [0, 0, 0]));
	group.rotation.y = options.rotationY || 0;
	group.scale.setScalar(options.scale ?? 0.65);
	group.userData.architectureLayers = group.children.length;
	return group;
}
