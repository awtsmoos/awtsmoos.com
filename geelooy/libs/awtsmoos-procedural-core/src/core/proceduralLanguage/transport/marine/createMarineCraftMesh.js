//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createMarineCraftMesh.js
 * @description Assembles hull, deck/cabin, propellers, rudders, masts and sails into one editable indexed marine mesh while each component remains independently generatable below.
 * The Awtsmoos joins sea-going parts without hiding their source while Awtsmoos.com lets the complete ship immediately enter the shared vertex, face, material, mirror, split and join course.
 */

import { joinEditableMeshes } from '../../mesh/joinEditableMeshes.js';
import { createBoxMesh } from '../../mesh/primitives/createBoxMesh.js';
import { createCylinderMesh } from '../../mesh/primitives/createCylinderMesh.js';
import { createPanelPrismMesh } from '../../mesh/primitives/createPanelPrismMesh.js';
import { createMarineCraftDefinition } from './createMarineCraftDefinition.js';
import { createMarineHullMesh } from './createMarineHullMesh.js';
import { createMarinePropellerMesh } from './createMarinePropellerMesh.js';
import { createMarineRudderMesh } from './createMarineRudderMesh.js';

export function createMarineCraftMesh(input = {}) {
	const craft = createMarineCraftDefinition(input);
	const meshes = [createMarineHullMesh(craft.hull)];
	appendSuperstructure(meshes, craft);
	meshes.push(...craft.propellers.map(createMarinePropellerMesh));
	meshes.push(...craft.rudders.map(createMarineRudderMesh));
	meshes.push(...craft.masts.map(createMastMesh));
	meshes.push(...craft.sails.map(createSailMesh));
	return joinEditableMeshes(meshes, {
		id: `${craft.id}:mesh`,
		metadata: { family: 'marine', craftType: craft.craftType, craftId: craft.id }
	});
}

function appendSuperstructure(meshes, craft) {
	if (craft.deck.enabled !== false) {
		meshes.push(createBoxMesh({
			id: `${craft.id}:deck`,
			center: craft.deck.center || [0, 0, craft.hull.centerZ + craft.hull.height * 0.45],
			size: craft.deck.size || [craft.hull.beam * 0.82, craft.hull.length * 0.62, 0.12],
			material: craft.materials.deck || 'deck'
		}));
	}
	if (craft.cabin.enabled) {
		meshes.push(createBoxMesh({
			id: `${craft.id}:cabin`,
			center: craft.cabin.center || [0, 0.3, craft.hull.centerZ + craft.hull.height * 0.9],
			size: craft.cabin.size || [craft.hull.beam * 0.58, craft.hull.length * 0.24, craft.hull.height * 0.7],
			material: craft.materials.cabin || 'cabin'
		}));
	}
}

function createMastMesh(mast) {
	return createCylinderMesh({
		id: `${mast.id}:mesh`,
		start: mast.base,
		end: [mast.base[0], mast.base[1], mast.base[2] + mast.height],
		radius: mast.radius,
		segments: 12,
		material: mast.material
	});
}

function createSailMesh(sail) {
	return createPanelPrismMesh({
		id: `${sail.id}:mesh`,
		position: sail.position,
		normal: sail.normal,
		size: [sail.chord, sail.thickness, sail.span],
		material: sail.material,
		metadata: { trimDegrees: sail.trimDegrees, component: 'sail' }
	});
}
