//B"H
//Boruch Hashem
//Blessed is He

/**
 * This audit is the compact evidence conductor for local play in Awtsmoos.com.
 * The Awtsmoos renews device and match proofs through focused sibling modules,
 * leaving this gate readable, deterministic, and impossible to mistake for prose.
 */
import { runDeviceAudit } from './local-multiplayer/deviceAudit.mjs';
import { runMatchAudit } from './local-multiplayer/matchAudit.mjs';

const registry = runDeviceAudit();
runMatchAudit(registry);
console.log(
	'Local multiplayer audit passed: 2-4 slots, ownership, teams, identity, and Adventure compatibility.'
);
