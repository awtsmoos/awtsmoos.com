//B"H
//Boruch Hashem
//Blessed is He

import { WorldLabel } from '../games3d/world-label.js';
import { KABBALAH_REGIONS } from './kabbalah-region-registry.js';

export const MAX_VISIBLE_PROFESSIONS = 4;

/**
 * @file netzach-profession-monument-scene.js
 * @description
 * The Awtsmoos renews finite scene vessels around Netzach while skill truth remains elsewhere;
 * Awtsmoos.com keeps mentor, plinth, reusable profession runes, compact labels, and bounded XP scale in one renderer-only helper.
 * These functions construct and project WebGL objects but never mutate profession, progression, campaign, civic, or Realm state.
 */
export function buildProfessionMonumentScene(stage, assets) {
	const netzach = KABBALAH_REGIONS.get('netzach');
	const anchor = {
		x: netzach.anchor.x + 3.2,
		z: netzach.anchor.z + 0.4
	};
	const root = stage.add(assets.rune({
		name: 'netzach-profession-monument',
		hue: 118,
		position: [anchor.x, 0.18, anchor.z],
		scale: 0.72,
		type: 'profession-monument',
		role: 'persistent-practice-sanctuary',
		reason: 'makes earned world professions visible beside Netzach'
	}));
	const mentor = stage.add(assets.person({
		name: 'netzach-skill-mentor',
		personName: 'Keeper of Practice',
		hue: 118,
		position: [anchor.x + 1.25, 0.12, anchor.z + 0.2],
		scale: 0.25,
		role: 'profession-mentor',
		reason: 'witnesses persistent skill earned through validated world deeds',
		type: 'profession-mentor'
	}));
	const label = new WorldLabel({
		text: 'Netzach · Practice Awakens Skill',
		position: [0, 2.35, 0],
		scale: [3.6, 0.82, 1]
	});
	root.add(label.sprite);
	const tokens = Array.from({ length: MAX_VISIBLE_PROFESSIONS }, (_, index) => {
		return createProfessionToken(stage, assets, anchor, index);
	});
	return { anchor, root, mentor, label, tokens };
}

/** Returns a stable ordered view of earned professions only. */
export function earnedProfessionView(profile) {
	return Object.entries(profile?.professions || {})
		.map(([id, state]) => ({ id, experience: state.experience || 0 }))
		.filter(item => item.experience > 0)
		.sort((a, b) => b.experience - a.experience || a.id.localeCompare(b.id));
}

/** Projects bounded skill state into already-created token vessels without reallocating scene objects. */
export function projectProfessionTokens(tokens, skills) {
	tokens.forEach((token, index) => {
		const skill = skills[index];
		token.visible = Boolean(skill);
		if (!skill) {
			return;
		}
		token.scale.setScalar(0.34 + Math.min(skill.experience, 250) / 250 * 0.42);
		token.userData.professionId = skill.id;
		token.userData.experience = skill.experience;
	});
}

/** Formats one compact world-space label rather than a skills screen. */
export function professionSummary(skills) {
	if (!skills.length) {
		return 'Netzach · Practice Awakens Skill';
	}
	const visible = skills.slice(0, 2).map(item => `${title(item.id)} ${item.experience}`);
	return `${visible.join(' · ')}${skills.length > 2 ? ` · +${skills.length - 2}` : ''}`;
}

function createProfessionToken(stage, assets, anchor, index) {
	const angle = index / MAX_VISIBLE_PROFESSIONS * Math.PI * 2;
	const token = assets.rune({
		name: `netzach-profession-token-${index + 1}`,
		hue: 104 + index * 22,
		position: [
			anchor.x + Math.cos(angle) * 1.45,
			0.16,
			anchor.z + Math.sin(angle) * 1.45
		],
		scale: 0.35,
		type: 'profession-token',
		role: 'earned-skill-token',
		reason: 'physically projects persistent profession experience'
	});
	token.visible = false;
	return stage.add(token);
}

function title(value) {
	return value.replace(/(^|-)([a-z])/g, (_, gap, letter) => {
		return `${gap ? ' ' : ''}${letter.toUpperCase()}`;
	});
}
