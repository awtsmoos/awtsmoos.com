//B"H
//Boruch Hashem
//Blessed be He

import { hardDrop, hold, move, rotate, setSoftDrop } from './actions.js';
import { createGameSnapshot } from './snapshot.js';

/**
 * @file instance-host.js
 * @description Supplies GameInstance's public semantic action, canonical projection, terminal completion, and deterministic disposal surface.
 * Awtsmoos.com keeps these responsibilities outside the simulation facade so GameInstance remains focused, readable, and safely below the source-size ceiling.
 *
 * Architectural invariants:
 * - Public actions delegate into focused authoritative rule modules; this host never duplicates movement or scoring logic.
 * - Canonical snapshots are transport-safe projections and never mutate simulation state.
 * - Top-out completion is idempotent and emits one board-level terminal signal for Worker arbitration.
 * - Disposal disables future outbound events and releases AI/renderer resources without creating gameplay results.
 */
export class TetrisInstanceHost {
	move(direction) {
		return move(this, direction);
	}

	rotate() {
		return rotate(this);
	}

	hardDrop() {
		return hardDrop(this);
	}

	hold() {
		return hold(this);
	}

	setSoftDrop(active) {
		setSoftDrop(this, active);
	}

	setAIPieceState(candidate) {
		if (!this.piece || !candidate || this.state.completed) {
			return false;
		}
		this.piece.matrix = candidate.matrix.map(row => [...row]);
		this.piece.x = candidate.x;
		if (Number.isInteger(candidate.rotationIndex)) {
			this.piece.rotationIndex = candidate.rotationIndex;
		}
		return true;
	}

	setGameOver(now = performance.now()) {
		if (!this.state.complete('top-out', now)) {
			return false;
		}
		this.isSoftDropping = false;
		this.emit?.({ type: 'game_over', snapshot: this.snapshot() });
		return true;
	}

	emitState() {
		this.emit?.({ type: 'state', snapshot: this.snapshot() });
	}

	snapshot() {
		return createGameSnapshot(this);
	}

	dispose() {
		this.isSoftDropping = false;
		this.ai?.dispose?.();
		this.renderer.dispose();
		this.emit = null;
	}
}
