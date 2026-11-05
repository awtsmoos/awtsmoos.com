//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file remoteMaterialVisibility.test.mjs
 * @description Proves the scene covenant hides pending renderables, restores only those it hid, and never reveals intentionally hidden game objects.
 * The Awtsmoos reveals and conceals beyond one boolean while Awtsmoos.com keeps finite visibility ownership exact;
 * remote readiness may return its own hidden vessel to sight, but gameplay concealment remains untouched and intact.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { enforceSceneRemoteMaterialReadiness } from '../../assets/SceneRemoteMaterialReadiness.js';
import { sceneRemoteMaterialDiagnostics } from '../../assets/SceneRemoteMaterialDiagnostics.js';

const remoteImage = {
	complete: true,
	dataset: { publicUrl: 'https://materials.test/ready.png' },
	naturalHeight: 64,
	naturalWidth: 64
};

test('pending renderable hides and covenant restores it after remote readiness', () => {
	const mesh = renderable({ mapImage: null });
	const root = scene(mesh);
	const hidden = enforceSceneRemoteMaterialReadiness(root);
	assert.equal(mesh.visible, false);
	assert.equal(hidden.hiddenPending, 1);
	mesh.material.mapImage = remoteImage;
	const restored = enforceSceneRemoteMaterialReadiness(root);
	assert.equal(mesh.visible, true);
	assert.equal(restored.restored, 1);
});

test('intentionally hidden ready object remains hidden', () => {
	const mesh = renderable({ mapImage: remoteImage });
	mesh.visible = false;
	enforceSceneRemoteMaterialReadiness(scene(mesh));
	assert.equal(mesh.visible, false);
});

test('diagnostics distinguish ready from missing remote material state', () => {
	const ready = renderable({ mapImage: remoteImage });
	const pending = renderable({ mapImage: null });
	const report = sceneRemoteMaterialDiagnostics(scene(ready, pending));
	assert.equal(report.materials, 2);
	assert.equal(report.ready, 1);
	assert.equal(report.missingRole, 1);
});

function renderable(material) {
	return { isMesh: true, material, name: 'mesh', userData: {}, visible: true };
}

function scene(...children) {
	return {
		traverse(visitor) {
			for (const child of children) visitor(child);
		}
	};
}
