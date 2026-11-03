//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file instant-stage-pieces.test.mjs
 * @description Procedural set pieces are real geometry before any GPU is consulted;
 * Awtsmoos.com proves descriptors become grounded, scaled, tagged native groups with contact shadows, entirely in Node.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
	boxGeometry,
	createStudioStagePiece,
	cylinderGeometry,
	discGeometry,
	geometryFromFaces,
	planeGeometry,
	sphereGeometry
} from '../src/movie/native/StudioStagePieces.js';

test('primitive geometry builders produce positioned, normalled triangle soup', () => {
	for (const geometry of [boxGeometry(2, 3, 2), cylinderGeometry(1, 2, 12), sphereGeometry(1.5, 10, 8), planeGeometry(4, 2), discGeometry(1, 10)]) {
		const positions = geometry.attributes.position;
		const normals = geometry.attributes.normal;
		assert.ok(positions.count > 0);
		assert.equal(positions.count % 3, 0, 'whole triangles only');
		assert.equal(normals.count, positions.count);
	}
	const box = boxGeometry(2, 3, 2);
	const ys = [];
	const positionArray = box.attributes.position.array;
	for (let index = 1; index < positionArray.length; index += 3) ys.push(positionArray[index]);
	assert.equal(Math.min(...ys), 0, 'box stands on the ground');
	assert.equal(Math.max(...ys), 3, 'box reaches its height');
	const empty = geometryFromFaces([]);
	assert.equal(empty.attributes.position.count, 0, 'empty input still returns a geometry vessel');
});

test('stage pieces place, scale, rotate, tag, and shadow descriptors', () => {
	const descriptor = {
		layerId: 'arch-1', kind: 'model3d', form: 'model', model: 'procedural', primitive: 'arch',
		position: { x: -6, y: 0, z: 2.4 }, scale: { x: 1, y: 1, z: 1 }, rotation: 0.5, color: null, opacity: 1
	};
	const piece = createStudioStagePiece(descriptor, { groundY: 0 });
	assert.deepEqual(
		[piece.position.x, piece.position.y, piece.position.z],
		[-6, 0, 2.4]
	);
	assert.equal(piece.userData.studioLayerId, 'arch-1');
	assert.ok(piece.children.length >= 4, 'arch pillars, beam, and a contact shadow');
	const figure = createStudioStagePiece({
		layerId: 'elder', kind: 'character3d', form: 'character', model: 'procedural', primitive: 'figure',
		position: { x: 1, y: 0, z: 1 }, scale: { x: 1.15, y: 1.15, z: 1.15 }, rotation: 0
	}, { groundY: 2 });
	assert.equal(figure.position.y, 2, 'pieces stand on the scene ground height');
	assert.ok(figure.children.length >= 5, 'figure body, head, hat, and shadow');
	const backdrop = createStudioStagePiece({
		layerId: 'bg', kind: 'background', form: 'backdrop', textureSrc: 'https://example.com/x.jpg',
		position: { x: 0, y: 7, z: -18 }, scale: { x: 3.4, y: 3.4, z: 1 }, rotation: 0
	}, { groundY: 0 });
	assert.equal(backdrop.children.length, 1, 'backdrops cast no contact shadow');
});
