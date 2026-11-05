//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file MinimalMeadowHebrewGlyphGeometry.js
 * @description Caches Hebrew stroke geometry while Procedural Core owns native geometry, groups, and meshes.
 * MitzvahWorld retains phrase semantics, crossed-view presentation, rotation, and strict remote-only visibility;
 * renderer-neutral stroke construction lives in a dedicated submodule so this public API stays compact and reusable.
 */

import {
	createNativeIndexedGeometry,
	createNativeMeshFromGeometry,
	createNativeWorldGroup
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';
import { materialHasRealMap } from '../assets/RemoteMaterialImageValidity.js';
import { createHebrewGlyphStrokeStreams } from './hebrewGlyph/HebrewGlyphStrokeStreams.js';

const geometryCache = new Map();

/**
 * Creates three crossed remote-only phrase views from one cached geometry vessel.
 * @param {object} material Core-owned remote gold material.
 * @param {string} letters Hebrew phrase to reveal when its genuine map is ready.
 * @returns {object} Core-owned group containing three deterministic crossed views.
 */
export function createHebrewGlyphCards(material, letters) {
	const geometry = hebrewGlyphStrokeGeometry(letters);
	const group = createNativeWorldGroup({
		name: `Awtsmoos_hebrew_stroke_views_${letters}`,
		userData: {
			cardCount: 3,
			hebrewLetters: letters,
			remoteOnly: true,
			renderMode: 'remote-textured-stroke-geometry',
			renderedGlyph: true
		}
	});
	for (let index = 0; index < 3; index += 1) {
		group.add(createGlyphView(geometry, material, letters, index));
	}
	return group;
}

/**
 * Returns cached Core-native stroke geometry for one exact Hebrew phrase.
 * @param {string} letters Stable phrase key.
 * @returns {object} Core-owned indexed geometry with phrase diagnostics.
 */
export function hebrewGlyphStrokeGeometry(letters) {
	if (!geometryCache.has(letters)) {
		const streams = createHebrewGlyphStrokeStreams(letters);
		geometryCache.set(letters, createNativeIndexedGeometry(streams, {
			geometryUserData: {
				hebrewLetters: letters,
				remoteOnly: true,
				renderMode: 'remote-textured-stroke-geometry',
				strokeCount: streams.strokeCount
			}
		}));
	}
	return geometryCache.get(letters);
}

/** Returns bounded cache evidence without exposing mutable geometry internals. */
export function hebrewGlyphGeometryDiagnostics() {
	return {
		cachedPhrases: geometryCache.size,
		renderMode: 'remote-textured-stroke-geometry'
	};
}
/**
 * Applies one deterministic Y-axis quaternion rotation without Euler allocation.
 * @param {object} object Native scene object exposing a quaternion.
 * @param {number} angle Rotation in radians.
 * @returns {void}
 */
export function setYAxisRotation(object, angle) {
	const half = angle * 0.5;
	object.quaternion.set(0, Math.sin(half), 0, Math.cos(half));
}

/** Creates one crossed view and stamps strict remote-only visibility evidence. */
function createGlyphView(geometry, material, letters, index) {
	const visible = materialHasRealMap(material);
	const mesh = createNativeMeshFromGeometry(geometry, material, {
		name: `Awtsmoos_hebrew_stroke_view_${index}_${letters}`,
		userData: visible ? {} : {
			awtsmoosRemoteOnlyVisibility: {
				hiddenByCovenant: true,
				previousVisible: true
			}
		}
	});
	mesh.visible = visible;
	setYAxisRotation(mesh, index * Math.PI / 3);
	mesh.setBaseTransform();
	return mesh;
}
