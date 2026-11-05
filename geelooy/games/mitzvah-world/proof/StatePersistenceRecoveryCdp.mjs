//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file StatePersistenceRecoveryCdp.mjs
 * @description Mutates Blank Meadow only through real recovery, movement, inventory, and quest event APIs.
 * The Awtsmoos gives every finite deed its lawful path; Awtsmoos.com presses, adds, and emits without deceit,
 * then waits until both production persistence vessels contain the exact state born from those living feet.
 */

import { readStatePersistenceRecovery } from './StatePersistenceRecoveryState.mjs';

export async function preparePersistentRuntimeState(command) {
	const before = await waitForPersistentRuntime(command);
	const recovery = await evaluate(command, runtimeExpression(`runtime => ({
		result: runtime.recovery.unstuck(),
		facade: runtime.recovery.diagnostics?.() || null,
		movement: runtime.movementRecovery?.diagnostics?.() || null
	})`));

	await key(command, 'keyDown', 'w', 'KeyW');
	await delay(650);
	await key(command, 'keyUp', 'w', 'KeyW');
	await delay(160);

	const mutation = await evaluate(command, runtimeExpression(`runtime => {
		const inventory = runtime.inventoryStore || runtime.inventory;
		const beforeQuantity = inventory.quantity('purifying-water');
		const beforeQuest = runtime.teachingQuest.snapshot();
		inventory.add('purifying-water', 1);
		runtime.bus.emit('enemy:alert', {
			archetype: 'warden',
			source: 'state-persistence-proof'
		});
		return {
			beforeQuantity,
			afterQuantity: inventory.quantity('purifying-water'),
			beforeQuest,
			afterQuest: runtime.teachingQuest.snapshot()
		};
	}`));

	const saved = await waitForLawfulSaves(command, mutation);
	return { before, recovery, mutation, saved };
}

export async function waitForPersistentRuntime(command, attempts = 500) {
	for (let attempt = 0; attempt < attempts; attempt += 1) {
		const state = await readStatePersistenceRecovery(command);
		if (state.runtimeFound
			&& state.bootstrapReady
			&& state.worldExperience === 'blank-meadow') return state;
		await delay(40);
	}
	throw new Error('Blank Meadow persistence vessels did not publish.');
}

async function waitForLawfulSaves(command, mutation) {
	for (let attempt = 0; attempt < 240; attempt += 1) {
		const state = await readStatePersistenceRecovery(command);
		const savedQuantity = state.gameplaySave?.inventory?.items?.['purifying-water'];
		const savedQuestIndex = state.verticalSliceSave?.quest?.index;
		if (savedQuantity === mutation.afterQuantity
			&& savedQuestIndex === mutation.afterQuest?.index) return state;
		await delay(25);
	}
	throw new Error('Production saves did not contain the mutated inventory and quest state.');
}

function runtimeExpression(operation) {
	return `(() => {
		const seed = (window.AwtsmoosMitzvahWorld || window.AwtsmoosDiagnostics || null);
		let runtime = seed?.runtime || seed;
		let best = score(runtime);
		for (const key of Object.keys(window)) {
			try {
				const candidate = window[key]?.runtime || window[key];
				const value = score(candidate);
				if (value > best) { runtime = candidate; best = value; }
			} catch {}
		}
		return (${operation})(runtime);
		function score(candidate) {
			if (!candidate || typeof candidate !== 'object') return -1;
			return Number(Boolean(candidate.state)) * 8
				+ Number(Boolean(candidate.inventoryStore || candidate.inventory)) * 7
				+ Number(Boolean(candidate.recovery)) * 7
				+ Number(Boolean(candidate.teachingQuest)) * 7
				+ Number(Boolean(candidate.bus)) * 4;
		}
	})()`;
}

async function key(command, type, keyValue, code) {
	await command('Input.dispatchKeyEvent', { type, key: keyValue, code });
}

async function evaluate(command, expression) {
	const receipt = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
	return receipt.result.value;
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
