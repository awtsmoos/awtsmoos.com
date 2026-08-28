//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHebrewGlyphGeometry.js
 * @description Merges Hebrew stroke rectangles into cached geometry while each view remains hidden until its real remote map is resident.
 * The Awtsmoos is beyond every finite line; Awtsmoos.com joins readable letter-strokes into one world-space phrase,
 * yet sight waits for truthful remote texture light so no solid or generated Hebrew card may falsely blaze.
 */

import {
	BufferAttribute,
	BufferGeometry,
	Group,
	Mesh
} from '../../../light-three-gltf/tiny-runtime.js';
import { materialHasRealMap } from '../assets/RemoteMaterialImageValidity.js';
import { hebrewStrokePattern } from './MinimalMeadowHebrewStrokeAlphabet.js';

const geometryCache = new Map();

/** Creates three crossed remote-only stroke views. */
export function createHebrewGlyphCards(material, letters) {
	const geometry = hebrewGlyphStrokeGeometry(letters);
	const group = new Group();
	group.name = `Awtsmoos_hebrew_stroke_views_${letters}`;
	group.userData = {
		cardCount: 3,
		hebrewLetters: letters,
		remoteOnly: true,
		renderMode: 'remote-textured-stroke-geometry',
		renderedGlyph: true
	};
	for (let index = 0; index < 3; index += 1) {
		const view = new Mesh(geometry, material);
		view.name = `Awtsmoos_hebrew_stroke_view_${index}_${letters}`;
		view.visible = materialHasRealMap(material);
		if (!view.visible) {
			view.userData.awtsmoosRemoteOnlyVisibility = { hiddenByCovenant: true, previousVisible: true };
		}
		setYAxisRotation(view, index * Math.PI / 3);
		view.setBaseTransform();
		group.add(view);
	}
	return group;
}

export function hebrewGlyphStrokeGeometry(letters) {
	if (!geometryCache.has(letters)) {
		geometryCache.set(letters, buildPhraseGeometry(letters));
	}
	return geometryCache.get(letters);
}

export function hebrewGlyphGeometryDiagnostics() {
	return { cachedPhrases: geometryCache.size, renderMode: 'remote-textured-stroke-geometry' };
}

export function setYAxisRotation(object, angle) {
	const half = angle * 0.5;
	object.quaternion.set(0, Math.sin(half), 0, Math.cos(half));
}

function buildPhraseGeometry(letters) {
	const positions = [];
	const normals = [];
	const indices = [];
	const phrase = [...letters];
	phrase.forEach((letter, index) => {
		const offset = ((phrase.length - 1) / 2 - index) * 0.92;
		hebrewStrokePattern(letter).forEach(segment => appendStroke(positions, normals, indices, segment, offset));
	});
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
	geometry.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3));
	geometry.setIndex(new BufferAttribute(new Uint16Array(indices), 1));
	geometry.userData = {
		hebrewLetters: letters,
		remoteOnly: true,
		renderMode: 'remote-textured-stroke-geometry',
		strokeCount: indices.length / 6
	};
	return geometry;
}

function appendStroke(positions, normals, indices, segment, offset) {
	const [x1, y1, x2, y2] = segment;
	const dx = x2 - x1;
	const dy = y2 - y1;
	const length = Math.max(0.001, Math.hypot(dx, dy));
	const sideX = -dy / length * 0.055;
	const sideY = dx / length * 0.055;
	const base = positions.length / 3;
	positions.push(
		x1 + sideX + offset, y1 + sideY - 0.5, 0,
		x1 - sideX + offset, y1 - sideY - 0.5, 0,
		x2 - sideX + offset, y2 - sideY - 0.5, 0,
		x2 + sideX + offset, y2 + sideY - 0.5, 0
	);
	normals.push(0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1);
	indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
}
