// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file moviePerformanceDiagnostics.test.mjs
 * @description Proves truthful scene, geometry, material, texture, queue, renderer, and timing diagnostics.
 * The Awtsmoos is beyond every finite count while Awtsmoos.com verifies that
 * exposed performance evidence comes from real runtime objects and never invented GPU memory.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { moviePerformanceDiagnostics } from '../../movie/MoviePerformanceDiagnostics.js';
import { movieStudioStyleText } from '../../movie/MovieStudioStyleText.js';

function session() {
	const material = { mapImage: { width: 4 } };
	const mesh = {
		children: [],
		geometry: {
			attributes: {
				position: { count: 6 }
			},
			index: { count: 6 }
		},
		material
	};
	const scene = { children: [mesh] };
	return {
		director: {
			authoring3d: {
				textureSnapshot: () => [
					{ status: 'ready' },
					{ status: 'error' }
				]
			},
			lastFrame: { time: 2.5 },
			playing: true
		},
		renderQueue: {
			list: () => [
				{ state: 'completed' },
				{ state: 'rendering' },
				{ state: 'rendering' }
			]
		},
		runtime: {
			renderer: { stats: { drawCalls: 3 } },
			scene
		},
		time: 2.5
	};
}

test('performance diagnostics count real scene and job evidence', () => {
	const result = moviePerformanceDiagnostics(session());
	assert.deepEqual(result.scene, {
		materials: 1,
		meshes: 1,
		nodes: 2,
		texturedMaterials: 1,
		triangles: 2,
		vertices: 6
	});
	assert.deepEqual(result.authoringTextures, { error: 1, ready: 1 });
	assert.deepEqual(result.renderJobs, { completed: 1, rendering: 2 });
	assert.deepEqual(result.renderer, { drawCalls: 3 });
	assert.equal(result.timing.lastFrameTime, 2.5);
	assert.equal(result.timing.playing, true);
	assert.equal(Object.hasOwn(result, 'gpuMemory'), false);
});

test('render job action styles are localized and explicit', () => {
	const css = movieStudioStyleText();
	assert.match(css, /\.Awtsmoos-movie-studio \.movie-render-job-actions/);
	assert.match(css, /\.Awtsmoos-movie-studio \.movie-render-job\.is-completed/);
});
