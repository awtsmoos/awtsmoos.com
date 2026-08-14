//B"H
//Boruch Hashem
//Blessed is He

import { punchCamera } from '../camera/camera.js';
import { COMBAT_TUNING } from '../data/combatTuning.js';
import {
	rememberRapidJailHit
} from '../ai/advanced/combat/hitEscapeIntent.js';
import { applyKnockback } from '../physics/knockback.js';
import {
	addBattlefieldScar
} from '../stage/scars/battlefieldScars.js';
import { recordComboHit } from './comboSystem.js';
import {
	buildHitEvent,
	pushComboAnnouncements,
	pushLaunchDebug,
	registerHitDiagnostics
} from './combatEvents.js';
import {
	applyHitstop,
	damageFor,
	knockFor
} from './attackMath.js';

/**
 * B"H
 *
 * Applies one validated body hit in the exact historic order: wake crushed state,
 * derive weapon and defense-aware damage, account total damage, remember rapid jail,
 * launch, combo, hitstop, camera, event, scar, announcements, and debug testimony.
 */

export function landCombatHit(state, attacker, target, attack) {
	const wake = wakeDiveStun(target);
	const weapon = attack.rapid ? null : attacker.heldWeapon;
	const damage = damageFor(attacker, target, attack, weapon)
		+ (wake ? 3 : 0);
	state.totalDamageDealt = (state.totalDamageDealt || 0) + damage;
	target.damage += damage;
	target.danger = target.damage
		>= COMBAT_TUNING.launch.killDangerPercent;
	rememberRapidJailHit(target, attacker, attack);
	const knock = knockFor(attacker, attack, weapon)
		* (wake?.wakeBonus || 1);
	const vector = applyKnockback(
		target,
		attacker,
		{ ...attack, damage, knock, wakeDive: !!wake },
		weapon
	);
	const force = Math.max(damage, knock, vector.force || 0);
	const combo = recordComboHit(
		state,
		attacker,
		target,
		damage,
		attack
	);
	applyHitstop(state, attack, force + (wake ? 8 : 0));
	punchCamera(
		state,
		wake ? 16 : attack.rapid ? 1.4 : Math.min(18, force * 0.45)
	);
	emitHit(
		state,
		attacker,
		target,
		attack,
		damage,
		weapon,
		force,
		combo,
		vector,
		wake
	);
}

function wakeDiveStun(target) {
	if (!target.diveStunned && !target.diveCrushed) {
		return null;
	}
	const wake = target.diveCrushed || { wakeBonus: 1.25 };
	target.diveStunned = 0;
	target.diveCrushed = null;
	target.stun = 0;
	return wake;
}

function emitHit(
	state, attacker, target, attack, damage, weapon, force, combo, vector, wake
) {
	const event = buildHitEvent(attacker, target, attack, {
		color: wake ? '#7fffdc' : weapon?.color || `hsl(${attacker.dna.hue} 95% 70%)`,
		letter: hitLetter(attack, combo, wake),
		damage,
		force,
		combo,
		vector
	});
	if (wake) {
		event.storyBeat = 'diveWake';
	}
	state.events.push(event);
	registerHitDiagnostics(state, attack, event);
	addBattlefieldScar(state, event);
	pushComboAnnouncements(state, attacker, target, combo);
	pushLaunchDebug(state, target, vector);
}

function hitLetter(attack, combo, wake) {
	if (wake) return 'התעוררות!';
	if (combo.count >= 20) return 'כ';
	if (combo.count >= 10) return 'י';
	if (combo.count >= 5) return 'ה';
	return attack.letter || 'כ';
}
