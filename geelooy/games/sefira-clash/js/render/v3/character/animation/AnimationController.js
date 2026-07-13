//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the animation controller vessel in this instant, revealing
 * its focused js render v3 character animation service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — the controller delegates every pose to smaller sparks of form. */
import { baseRig, guardRig } from '../CharacterRig.js';
import { poseInfo } from './Pose.js';
import { idle } from './Idle.js';
import { run } from './Run.js';
import { jump } from './Jump.js';
import { fall } from './Fall.js';
import { punch } from './Punch.js';
import { kick } from './Kick.js';
import { charge } from './Charge.js';
import { hitstun } from './Hitstun.js';
import { launch } from './Launch.js';
import { ledge } from './Ledge.js';
import { knockout } from './Knockout.js';
import { landingLayer } from './layers/LandingLayer.js';
import { shieldLayer } from './layers/ShieldLayer.js';
import { comboLayer } from './layers/ComboLayer.js';

/**
 * Reveals the resolve pose behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} f The f value entering this behavior.
 */
export function resolvePose(f) {
	const info = poseInfo(f);
	let p = baseRig(f);
	p.anim = info;
	if (info.name.startsWith('ledge')) p = ledge(p, f, info);
	else if (['walk', 'run', 'sprint', 'brake', 'turnaround'].includes(info.name))
		p = run(p, f, info);
	else if (['jumpStart', 'rising', 'doubleJump', 'dive'].includes(info.name))
		p = jump(p, f, info);
	else if (['peak', 'falling', 'fastFall'].includes(info.name)) p = fall(p, f, info);
	else if (
		info.name.includes('Punch') ||
		info.name === 'rapidPunch' ||
		info.name === 'punchJab' ||
		info.name === 'punchCombo' ||
		info.name === 'punchMissRecovery'
	)
		p = punch(p, f, info);
	else if (info.name.includes('Kick') || info.name === 'kick' || info.name === 'roundhouse')
		p = kick(p, f, info);
	else if (info.name.startsWith('hit') || info.name === 'stunned' || info.name === 'dizzy')
		p = hitstun(p, f, info);
	else if (['launch', 'wallBounce', 'groundBounce'].includes(info.name)) p = launch(p, f, info);
	else if (info.name === 'death') p = knockout(p, f, info);
	else p = idle(p, f, info);
	if (f.chargeGlow && !(f.attack || f.rapidAttack)) p = charge(p, f, info);
	p = landingLayer(p, info);
	p = shieldLayer(p, f, info);
	p = comboLayer(p, f, info);
	return guardRig(p);
}
