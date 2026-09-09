//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file instance-routing.js
 * @description Routes validated Worker commands into the human board, viewport resize, and immutable match-level completion facts.
 * Awtsmoos.com keeps transport routing separate from frame ownership so WorkerRuntime stays a lifecycle vessel rather than another gameplay rules engine.
 *
 * Architectural invariants:
 * - Only the non-AI first board accepts human semantic input.
 * - Resize addresses boards by stable numeric IDs and never resets simulation state.
 * - Match completion derives from canonical board snapshots and never mutates them.
 * - Unsupported semantic actions are ignored without throwing or altering gameplay state.
 */
export function applyInput(player, payload = {}) {
	const action = payload.action;
	if (action === 'move') {
		player.move(Math.sign(Number(payload.value) || 0));
		return;
	}
	if (action === 'rotate') {
		player.rotate();
		return;
	}
	if (action === 'hard_drop') {
		player.hardDrop();
		return;
	}
	if (action === 'hold') {
		player.hold();
		return;
	}
	if (action === 'soft_drop_start') {
		player.setSoftDrop(true);
		return;
	}
	if (action === 'soft_drop_end') {
		player.setSoftDrop(false);
	}
}

export function resizeInstances(instances, payload = {}) {
	const first = instances.find(instance => instance.id === 1);
	const second = instances.find(instance => instance.id === 2);
	if (first && payload.p1Dimensions) {
		first.resize(payload.p1Dimensions, payload.p1Dpr);
	}
	if (second && payload.p2Dimensions) {
		second.resize(payload.p2Dimensions, payload.p2Dpr);
	}
}

export function matchResult(
	mode,
	instances,
	runId,
	startedAt,
	now = performance.now()
) {
	const first = instances.find(instance => instance.id === 1)?.snapshot();
	const second = instances.find(instance => instance.id === 2)?.snapshot();
	if (!first) {
		return null;
	}
	const outcome = matchOutcome(mode, first, second);
	if (!outcome) {
		return null;
	}
	return {
		runId,
		score: first.score,
		lines: first.lines,
		level: first.level,
		outcome,
		completed: true,
		elapsedMs: Math.max(0, Math.round(now - startedAt)),
		mode,
		boards: [first, second].filter(Boolean)
	};
}

function matchOutcome(mode, first, second) {
	if (mode === 'single' && first.completed) {
		return 'top-out';
	}
	if (mode === 'pvai' && (first.completed || second?.completed)) {
		if (first.completed && second?.completed) {
			return 'draw';
		}
		return second?.completed ? 'win' : 'loss';
	}
	if (mode === 'aivai' && (first.completed || second?.completed)) {
		if (first.completed && second?.completed) {
			return 'draw';
		}
		return first.completed ? 'golem-2' : 'golem-1';
	}
	return '';
}
