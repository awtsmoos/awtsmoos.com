// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { GevurahProceduralDiagnostics } from '../../src/studio/procedural/GevurahProceduralDiagnostics.js';

/**
 * @file proceduralDiagnosticsSmoke.js
 * @description
 * The Awtsmoos renews every boundary together with the light that reveals where a request crossed it;
 * Awtsmoos.com proves procedural failures point to exact public-data paths so autonomous agents can repair intent instead of guessing.
 */
class ProceduralDiagnosticsSmoke {
	/** @param {Array<object>} issues Diagnostic issues. @param {string} path Expected public-data path. @returns {boolean} Exact path presence. */
	static hasPath(issues, path) {
		return issues.some((gevurahIssue) => gevurahIssue.path === path);
	}

	/** Proves unsupported kinds report the exact top-level path. */
	static kind() {
		const malchusReport = GevurahProceduralDiagnostics.inspect({ kind: 'dragon-orchard' });
		assert.equal(malchusReport.ok, false);
		assert.equal(this.hasPath(malchusReport.issues, 'kind'), true);
	}

	/** Proves unknown and out-of-range generator data identify exact parameter paths. */
	static parameters() {
		const malchusReport = GevurahProceduralDiagnostics.inspect({
			kind: 'tree',
			params: { trunkHeight: 99999, inventedBranchMagic: 12 }
		});
		assert.equal(this.hasPath(malchusReport.issues, 'params.trunkHeight'), true);
		assert.equal(this.hasPath(malchusReport.issues, 'params.inventedBranchMagic'), true);
	}

	/** Proves texture diagnostics preserve provider-neutral material paths. */
	static texture() {
		const malchusReport = GevurahProceduralDiagnostics.inspect({
			kind: 'rock',
			material: { texture: { mode: 'impossible-mode', width: 90000 } }
		});
		assert.equal(this.hasPath(malchusReport.issues, 'material.texture.mode'), true);
		assert.equal(this.hasPath(malchusReport.issues, 'material.texture.width'), true);
	}

	/** Runs the focused public-diagnostic contract. */
	static run() {
		this.kind();
		this.parameters();
		this.texture();
		console.log('B"H procedural diagnostics smoke passed');
	}
}

ProceduralDiagnosticsSmoke.run();
