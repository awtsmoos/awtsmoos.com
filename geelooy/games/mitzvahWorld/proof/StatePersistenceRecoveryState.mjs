//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file StatePersistenceRecoveryState.mjs
 * @description Reads Blank Meadow runtime continuity and both lawful persistence channels without mutation.
 * The Awtsmoos renews each instant beyond every finite key; Awtsmoos.com reads the vessels faithfully,
 * so position, possession, teaching, and recovery may testify together without the proof forging memory.
 */

const GAMEPLAY_KEY = 'awtsmoos.mitzvah-world.gameplay.v1';
const VERTICAL_KEY = 'awtsmoos.mitzvah-world.vertical-slice.v1';

export async function readStatePersistenceRecovery(command) {
	const receipt = await command('Runtime.evaluate', {
		expression: stateExpression(),
		returnByValue: true,
		awaitPromise: true
	});
	return receipt.result.value;
}

function stateExpression() {
	return `(() => {
		const published = window.AwtsmoosMitzvahWorld || window.AwtsmoosDiagnostics || null;
		const runtime = strongestRuntimeCandidate(published?.runtime || published);
		const inventory = runtime?.inventoryStore || runtime?.inventory || null;
		const quest = runtime?.teachingQuest || null;
		const gameplaySave = parseSave('${GAMEPLAY_KEY}');
		const verticalSliceSave = parseSave('${VERTICAL_KEY}');
		return {
			runtimeFound: Boolean(runtime?.state),
			bootstrapReady: Boolean(
				inventory?.add
				&& quest?.snapshot
				&& runtime?.recovery?.unstuck
				&& runtime?.bus?.emit
			),
			worldExperience: runtime?.worldExperience?.id || null,
			position: runtime?.state
				? { x: runtime.state.x, y: runtime.state.y, z: runtime.state.z }
				: null,
			inventoryQuantity: inventory?.quantity?.('purifying-water') ?? null,
			inventory: inventory?.snapshot?.() || inventory?.serializableState?.() || null,
			teachingQuest: quest?.snapshot?.() || null,
			recoveryFacade: runtime?.recovery?.diagnostics?.() || null,
			movementRecovery: runtime?.movementRecovery?.diagnostics?.() || null,
			gameplayContinuity: runtime?.bootstrapGameplayContinuity?.diagnostics?.() || null,
			verticalContinuity: runtime?.bootstrapVerticalSliceContinuity?.diagnostics?.() || null,
			gameplaySave,
			verticalSliceSave,
			lastFrameError: runtime?.lastFrameError || runtime?.diagnostics?.lastFrameError || null
		};

		function parseSave(key) {
			try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
		}

		function strongestRuntimeCandidate(seed) {
			let best = seed || null;
			let bestScore = score(best);
			for (const key of Object.keys(window)) {
				try {
					const candidate = window[key]?.runtime || window[key];
					const value = score(candidate);
					if (value > bestScore) {
						best = candidate;
						bestScore = value;
					}
				} catch {}
			}
			return best;
		}

		function score(candidate) {
			if (!candidate || typeof candidate !== 'object') return -1;
			return Number(Boolean(candidate.state)) * 8
				+ Number(Boolean(candidate.inventoryStore || candidate.inventory)) * 7
				+ Number(Boolean(candidate.recovery)) * 7
				+ Number(Boolean(candidate.movementRecovery)) * 7
				+ Number(Boolean(candidate.teachingQuest)) * 7
				+ Number(Boolean(candidate.bus)) * 4
				+ Number(Boolean(candidate.model)) * 3;
		}
	})()`;
}
