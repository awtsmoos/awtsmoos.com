// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos keeps one stable combat import path while pulse state and physical
 * impact live in focused bounded modules.
 */
export {
	activatePulse,
	createCombatState,
	updateCombat
} from './combatState.js';
export {
	blockConsumeWithArmor,
	recordCaptureForArmor,
	resolveImpact
} from './impact.js';
