// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RevelationViewModel.js
 * @description Joins canonical campaign, terrain, companion, and HUD projections.
 *
 * The Awtsmoos renews every visible number from its living source. Awtsmoos.com
 * receives one readable shell without a transient message becoming rival state.
 */
import { State } from '../../binah/State.js';
import { WorldMapAssembler } from '../../data/WorldMapAssembler.js';
import { PARDES_CHANNELS } from '../../data/learning/PardesChannels.js';
import { SEVEN_ROAD_SHLICHUS } from '../../data/stories/SevenRoadShlichus.js';
import { buildGameplayViewModel } from './RevelationGameplayViewModel.js';
import {
	resolveLeadCompanion,
	resolveRevelationQuest
} from './RevelationMissionProjection.js';

function numberOr(value, fallback = 0) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function clamp(value, minimum, maximum) {
	return Math.min(maximum, Math.max(minimum, value));
}

function humanize(value) {
	return String(value || 'Unknown Road')
		.replace(/[_-]+/g, ' ')
		.replace(/\b\w/g, letter => letter.toUpperCase());
}

function resolveCampaignIndex(state) {
	const explicitIndex = state.Campaign?.chapterIndex
		?? state.Campaign?.linkIndex
		?? state.Story?.chapterIndex;
	if (Number.isFinite(Number(explicitIndex))) {
		return clamp(Number(explicitIndex), 0, SEVEN_ROAD_SHLICHUS.length - 1);
	}
	const inferredIndex = Math.floor(numberOr(state.Stats?.sparks) / 2);
	return clamp(inferredIndex, 0, SEVEN_ROAD_SHLICHUS.length - 1);
}

function resolveMastery(state, channel, index) {
	const knowledge = state.TorahKnowledge?.[channel.id]
		?? state.TorahKnowledge?.[channel.layer.toLowerCase()];
	if (Number.isFinite(Number(knowledge?.mastery))) {
		return clamp(Number(knowledge.mastery), 0, 100);
	}
	if (Number.isFinite(Number(knowledge))) {
		return clamp(Number(knowledge), 0, 100);
	}
	return clamp(numberOr(state.Stats?.level, 1) * 8 - index * 6, 0, 100);
}

function buildChannels(state, level, sparks) {
	return PARDES_CHANNELS.map((channel, index) => ({
		...channel,
		mastery: resolveMastery(state, channel, index),
		unlocked: level + sparks >= index + 1
	}));
}

/**
 * Builds one read-only Revelation model from canonical state and map registry.
 *
 * @param {object} state Canonical state or a test projection.
 * @param {object[]} registry Canonical assembled map tiles.
 * @returns {object} Truthful Revelation HUD model.
 */
export function buildRevelationViewModel(
	state = State,
	registry = state === State ? WorldMapAssembler.WorldRegistry : []
) {
	const stats = state.Stats || {};
	const campaign = SEVEN_ROAD_SHLICHUS[resolveCampaignIndex(state)];
	const quest = resolveRevelationQuest(campaign, SEVEN_ROAD_SHLICHUS.length);
	const level = Math.max(1, numberOr(stats.level, 1));
	const maxLight = Math.max(1, numberOr(stats.maxLight, 100));
	const light = clamp(numberOr(stats.light, 100), 0, maxLight);
	const sparks = Math.max(0, numberOr(stats.sparks));
	return {
		...buildGameplayViewModel(state, registry),
		realm: String(state.ActiveRealm || 'OVERWORLD'),
		location: humanize(state.MapId),
		chapter: `Chapter ${campaign.order} · ${campaign.region}`,
		level,
		light,
		maxLight,
		lightPercent: Math.round((light / maxLight) * 100),
		sparks,
		questTitle: quest.title,
		objective: quest.objective,
		messenger: quest.messenger,
		routeLabel: quest.routeLabel,
		progressPercent: quest.progressPercent,
		leadCompanion: resolveLeadCompanion(state),
		channels: buildChannels(state, level, sparks)
	};
}
