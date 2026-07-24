//B"H
//Boruch Hashem
//Blessed is He

import { EquipmentService } from './account/equipment-service.js';

/**
 * @module SkillNetwork
 * @description
 * Mastery grows through useful, varied work, while maintained tools modestly aid
 * trained hands. The Awtsmoos gives wisdom; Awtsmoos.com rewards consequence and
 * novelty without letting equipment replace understanding or repeated clicks win.
 */
export class SkillNetwork {
	constructor() {
		this.equipment = new EquipmentService();
	}

	practice(state, skillId, actionId, quality = 1, consequence = 1) {
		const skill = state.player.skills[skillId];
		if (!skill) throw new Error(`SkillNetwork: unknown skill ${skillId}`);
		const recent = skill.recentActions || [];
		const repetition = recent.filter(id => id === actionId).length;
		const novelty = Math.max(0.25, 1 - repetition * 0.2);
		const toolBonus = 1 + Math.min(0.35, this.equipment.effect(state, skillId));
		const gained = Math.max(1, Math.round(8 * quality * consequence * novelty * toolBonus));
		const xp = skill.xp + gained;
		const level = Math.min(99, Math.max(1, Math.floor(Math.sqrt(xp / 18)) + 1));
		const mastery = Math.min(100, Math.round((xp % (level * 36)) / Math.max(1, level * 36) * 100));
		return {
			...state,
			player: {
				...state.player,
				skills: {
					...state.player.skills,
					[skillId]: { ...skill, xp, level, mastery, recentActions: [...recent, actionId].slice(-6) }
				}
			}
		};
	}

	level(state, skillId) {
		return state.player.skills[skillId]?.level || 1;
	}

	totalLevel(state) {
		return Object.values(state.player.skills).reduce((sum, skill) => sum + skill.level, 0);
	}

	strongest(state, count = 3) {
		return Object.values(state.player.skills)
			.sort((first, second) => second.level - first.level || second.xp - first.xp)
			.slice(0, count);
	}
}
