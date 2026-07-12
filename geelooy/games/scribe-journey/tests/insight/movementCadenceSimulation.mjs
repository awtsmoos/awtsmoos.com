// B"H

import { InputState } from '../../js/input/inputState.js';
import { createCadenceState, evaluateIntent, recordAttempt, recordStepComplete, resolveHeldDirection } from '../../js/workers/world/movement/cadence.js';
import { attemptMove, updatePosition } from '../../js/workers/world/movement.js';

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

function makeState() {
	const clearRow = () => ['⬜', '⬜', '⬜', '⬜', '⬜'];
	return {
		currentMapId: 'test_map',
		maps: { test_map: { width: 5, baseLayer: [clearRow(), clearRow(), clearRow(), clearRow(), clearRow()], interactables: {} } },
		player: { x: 2, y: 2, pixelX: 80, pixelY: 80, startX: 2, startY: 2, targetX: 2, targetY: 2, direction: 'up', isMoving: false },
		bots: [], keys: {}, time: { totalMinutes: 720 }, gateEffects: { speedMult: 1.5 }
	};
}

const emissions = [];
const input = new InputState(snapshot => emissions.push(snapshot));
input.setSource('keyboard:ArrowUp', 'ArrowUp', 'up');
input.setSource('pointer:joystick', 'ArrowRight', 'right');
assert(emissions.at(-1).__intent === 'right', 'Newest device direction must own intent.');
input.clearSource('pointer:joystick');
assert(emissions.at(-1).__intent === 'up', 'Clearing joystick must reveal held keyboard intent.');
input.clearAll();
assert(Object.keys(emissions.at(-1)).length === 0, 'Global release must emit an empty snapshot.');

const cadence = createCadenceState();
const player = { direction: 'up' };
assert(resolveHeldDirection({ ArrowRight: true, __intent: 'right' }) === 'right', 'Explicit intent must win.');
assert(!evaluateIntent(cadence, player, 'right', 100), 'A new direction must turn before stepping.');
assert(player.direction === 'right', 'Turn-before-step must update facing.');
assert(!evaluateIntent(cadence, player, 'right', 140), 'Turn delay must remain active.');
assert(evaluateIntent(cadence, player, 'right', 160), 'Direction must step after turn delay.');
recordAttempt(cadence, { moved: true }, 160);
recordStepComplete(cadence, 310);
assert(evaluateIntent(cadence, player, 'right', 310), 'Held direction may continue after arrival.');

const state = makeState();
const trigger = { startBattle() { throw new Error('Unexpected encounter.'); } };
const move = attemptMove(state, 'right');
assert(move.moved && state.player.targetX === 3, 'A clear tile must begin one rightward step.');
assert(!updatePosition(state, 1000, trigger).completed, 'A huge frame delta must be clamped, not teleport.');
updatePosition(state, 50, trigger);
const completion = updatePosition(state, 50, trigger);
assert(completion.completed, 'Three bounded frames must complete the 145ms step.');
assert(state.player.x === 3 && state.player.pixelX === 120, 'Completed step must land exactly on tile coordinates.');

state.maps.test_map.baseLayer[2][4] = '🌳';
const blocked = attemptMove(state, 'right');
assert(!blocked.moved && blocked.reason === 'solid-tile', 'Solid terrain must report a blocked step.');
assert(state.player.x === 3 && !state.player.isMoving, 'Blocked movement must not displace the player.');

console.log(JSON.stringify({ ok: true, emissions: emissions.length, movementChecks: 12 }));
