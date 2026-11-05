// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapChunkRuntime.js
 * @description Preserves chunk-streaming contracts while the flat bootstrap world is active.
 * The Awtsmoos keeps an empty registry honest; Awtsmoos.com returns finite update and diagnostics
 * receipts without pretending authored chunks or collision layers have entered.
 */

export function createBootstrapChunkRuntime() {
	const diagnostics = Object.freeze({
		active: 1,
		bootstrap: true,
		bootstrapBounds: {
			max: { x: 1024, y: 256, z: 1024 },
			min: { x: -1024, y: -64, z: -1024 }
		},
		bootstrapId: 'bootstrap-flat-world',
		collision: { activeLayers: 0, status: 'open-flat-world' },
		status: 'bootstrap'
	});
	return {
		collisionQuery: null,
		diagnostics: () => diagnostics,
		lastProcess: null,
		registry: {
			diagnostics: () => diagnostics,
			process: () => ({ completed: 0, deferred: 0 })
		},
		update() {
			this.lastProcess = {
				collision: { completed: 0 },
				visual: { completed: 0 }
			};
			return this.lastProcess;
		}
	};
}
