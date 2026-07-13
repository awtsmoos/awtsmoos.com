// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RevelationViewModel.js
 * @description Translates canonical state into a truthful shell snapshot.
 *
 * The shell invents neither companion nor victory. The Awtsmoos renews every
 * visible number from its living source, while companion and campaign roads
 * share one horizon without concealing each other at Awtsmoos.com.
 */
import { State } from '../../binah/State.js';
import { PARDES_CHANNELS } from '../../data/learning/PardesChannels.js';
import { SEVEN_ROAD_SHLICHUS } from '../../data/stories/SevenRoadShlichus.js';
import { companionShlichusSummary } from '../../missions/companion/CompanionShlichusJournal.js';

const numberOr = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

const humanize = value => String(value || 'Unknown Road')
	.replace(/[_-]+/g, ' ')
	.replace(/\b\w/g, letter => letter.toUpperCase());

const resolveCampaignIndex = state => {
	const explicit = state.Campaign?.chapterIndex ?? state.Campaign?.linkIndex ?? state.Story?.chapterIndex;
	if (Number.isFinite(Number(explicit))) {
		return clamp(Number(explicit), 0, SEVEN_ROAD_SHLICHUS.length - 1);
	}
	return clamp(Math.floor(numberOr(state.Stats?.sparks) / 2), 0, SEVEN_ROAD_SHLICHUS.length - 1);
};

const resolveMastery = (state, channel, index) => {
	const knowledge = state.TorahKnowledge?.[channel.id] ?? state.TorahKnowledge?.[channel.layer.toLowerCase()];
	if (Number.isFinite(Number(knowledge?.mastery))) return clamp(Number(knowledge.mastery), 0, 100);
	if (Number.isFinite(Number(knowledge))) return clamp(Number(knowledge), 0, 100);
	return clamp(numberOr(state.Stats?.level, 1) * 8 - index * 6, 0, 100);
};

const resolveLeadCompanion = state => {
	const party = state.Party || {};
	const member = party.active?.[party.leadIndex || 0] || party.active?.[0];
	if (!member) return {
		glyph: '✧',
		name: 'Empty bond',
		role: 'Find a spark on the road',
		bondLine: 'No Nitzotz is walking beside you yet.'
	};
	const bond = numberOr(party.bond?.[member.id], numberOr(member.bond));
	return {
		glyph: member.glyph || '◇',
		name: member.name || 'Unnamed Nitzotz',
		role: member.role || member.explorationAbility?.name || 'Road companion',
		bondLine: `${member.bondStage || 'Wary'} bond ${bond}/100`
	};
};

const resolveQuest = (state, campaign) => {
	const companion = companionShlichusSummary();
	if (companion && companion.status !== 'completed') {
		const order = { unlocked: 0, traces: companion.traceCount, repair: 3, merchant: 4 }[companion.stage] || 0;
		return {
			title: companion.title,
			objective: companion.progress,
			messenger: companion.entrustedBy,
			routeLabel: `${Math.min(4, order)} / 4`,
			progressPercent: Math.round((Math.min(4, order) / 4) * 100)
		};
	}
	return {
		title: campaign.id === 'lamp-without-flame' && state.Message
			? humanize(state.Message.split('.')[0])
			: humanize(campaign.id),
		objective: String(state.Message || campaign.objective),
		messenger: campaign.messenger,
		routeLabel: `${campaign.order} / ${SEVEN_ROAD_SHLICHUS.length}`,
		progressPercent: Math.round((campaign.order / SEVEN_ROAD_SHLICHUS.length) * 100)
	};
};

export const buildRevelationViewModel = (state = State) => {
	const stats = state.Stats || {};
	const campaignIndex = resolveCampaignIndex(state);
	const campaign = SEVEN_ROAD_SHLICHUS[campaignIndex];
	const quest = resolveQuest(state, campaign);
	const level = Math.max(1, numberOr(stats.level, 1));
	const light = clamp(numberOr(stats.light, 100), 0, Math.max(1, numberOr(stats.maxLight, 100)));
	const maxLight = Math.max(1, numberOr(stats.maxLight, 100));
	return {
		realm: String(state.ActiveRealm || 'OVERWORLD'),
		location: humanize(state.MapId),
		chapter: `Chapter ${campaign.order} · ${campaign.region}`,
		level,
		light,
		maxLight,
		lightPercent: Math.round((light / maxLight) * 100),
		sparks: Math.max(0, numberOr(stats.sparks)),
		questTitle: quest.title,
		objective: quest.objective,
		messenger: quest.messenger,
		routeLabel: quest.routeLabel,
		progressPercent: quest.progressPercent,
		leadCompanion: resolveLeadCompanion(state),
		channels: PARDES_CHANNELS.map((channel, index) => ({
			...channel,
			mastery: resolveMastery(state, channel, index),
			unlocked: level + numberOr(stats.sparks) >= index + 1
		}))
	};
};
