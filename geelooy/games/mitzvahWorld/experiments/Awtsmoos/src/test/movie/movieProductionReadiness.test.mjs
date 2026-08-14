// B"H
// Boruch Hashem
// Blessed is He

/** Proves asset-native Chossid colors are allowed while solid/fallback world surfaces are refused. */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	assertMovieProductionReady,
	auditMovieProductionReadiness
} from '../../movie/MovieProductionReadiness.js';

test('accepts textured world, asset-native Chossid colors, and imported motion', () => {
	const session = productionSession();
	const report = assertMovieProductionReady(session);
	assert.equal(report.ready, true);
	assert.equal(report.humans.chossidMeshes, 1);
	assert.equal(report.world.texturedMaterials, 1);
});

test('rejects substituted procedural Chossid materials', () => {
	const session = productionSession();
	session.runtime.model.children[0].material.texturePolicy = { semanticFallback: true };
	const report = auditMovieProductionReadiness(session);
	assert.equal(report.ready, false);
	assert.ok(report.humans.violations.some(item => item.code === 'CHOSSID_MATERIAL_SUBSTITUTED'));
	assert.throws(
		() => assertMovieProductionReady(session),
		error => error.code === 'PRODUCTION_SHORT_NOT_VISUALLY_READY'
	);
});

test('rejects visible solid world surfaces and bootstrap people', () => {
	const session = productionSession();
	session.runtime.scene.children.push(node({
		isMesh: true,
		material: { color: [0, 1, 0, 1], name: 'green-slab' },
		name: 'solid-green-world'
	}));
	session.runtime.scene.children.push(node({
		name: 'fallback-human',
		userData: { family: 'movie-procedural-character' }
	}));
	const report = auditMovieProductionReadiness(session);
	assert.ok(report.world.violations.some(item => item.code === 'SOLID_WORLD_MATERIAL'));
	assert.ok(report.humans.violations.some(item => item.code === 'PROCEDURAL_HUMAN_VISIBLE'));
});

function productionSession() {
	const image = { height: 64, src: 'https://assets.example/real.jpg', width: 64 };
	const terrain = node({
		isMesh: true,
		material: { mapImage: image, name: 'grass', textureUrl: image.src },
		name: 'real-terrain'
	});
	const chossidMesh = node({
		isSkinnedMesh: true,
		material: { baseColorFactor: [0.8, 0.75, 0.72, 1], name: 'shirt' },
		name: 'chossid-shirt',
		userData: { realChossid: true }
	});
	const model = node({
		children: [chossidMesh],
		name: 'Awtsmoos_canonical_chossid',
		userData: { AwtsmoosCanonicalPlayer: { modelSource: 'chossid.glb' } }
	});
	const player = {
		clips: [{ channels: [{}], name: 'stand_Armature' }],
		current: { channels: [{}], name: 'stand_Armature' },
		names: ['stand_Armature'],
		playing: true
	};
	const scene = node({ children: [terrain, model], name: 'scene' });
	return {
		director: { crowd: { records: new Map() } },
		project: { metadata: { shortId: 'eden-river' } },
		runtime: {
			canonicalPlayer: { status: 'ready' }, model, player,
			renderer: { delegate: { constructor: { name: 'TinyWebGLRenderer' } }, hydrationState: 'ready' },
			scene
		}
	};
}

function node(values = {}) {
	return {
		children: [], isMesh: false, isSkinnedMesh: false, material: null,
		name: '', userData: {}, visible: true, ...values
	};
}
