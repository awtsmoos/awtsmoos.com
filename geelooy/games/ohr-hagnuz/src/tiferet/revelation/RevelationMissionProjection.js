// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RevelationMissionProjection.js
 * @description Projects canonical Shlichus and companion truth for Revelation.
 *
 * The Awtsmoos grants mission and messenger their own enduring vessel. Transient
 * news may pass through the world, but Awtsmoos.com keeps the entrusted road
 * distinct from the latest sound heard upon it.
 */
import { companionShlichusSummary } from '../../missions/companion/CompanionShlichusJournal.js';

function numberOr(value, fallback = 0) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function humanize(value) {
	return String(value || 'Unknown Road')
		.replace(/[_-]+/g, ' ')
		.replace(/\b\w/g, letter => letter.toUpperCase());
}

/**
 * Resolves the lead companion without introducing a parallel party state.
 *
 * @param {object} state Canonical game state or a read-only test projection.
 * @returns {{glyph:string,name:string,role:string,bondLine:string}} Companion HUD data.
 */
export function resolveLeadCompanion(state) {
	const party = state.Party || {};
	const member = party.active?.[party.leadIndex || 0] || party.active?.[0];
	if (!member) {
		return {
			glyph: '✧',
			name: 'Empty bond',
			role: 'Find a spark on the road',
			bondLine: 'No Nitzotz is walking beside you yet.'
		};
	}
	const bond = numberOr(party.bond?.[member.id], numberOr(member.bond));
	return {
		glyph: member.glyph || '◇',
		name: member.name || 'Unnamed Nitzotz',
		role: member.role || member.explorationAbility?.name || 'Road companion',
		bondLine: `${member.bondStage || 'Wary'} bond ${bond}/100`
	};
}

/**
 * Resolves the active canonical Shlichus independently of transient messages.
 *
 * @param {object} campaign Current campaign link.
 * @param {number} campaignLength Total campaign links.
 * @returns {{title:string,objective:string,messenger:string,routeLabel:string,progressPercent:number}}
 */
export function resolveRevelationQuest(campaign, campaignLength) {
	const companion = companionShlichusSummary();
	if (companion && companion.status !== 'completed') {
		const stageOrder = {
			unlocked: 0,
			traces: companion.traceCount,
			repair: 3,
			merchant: 4
		}[companion.stage] || 0;
		const boundedOrder = Math.min(4, stageOrder);
		return {
			title: companion.title,
			objective: companion.progress,
			messenger: companion.entrustedBy,
			routeLabel: `${boundedOrder} / 4`,
			progressPercent: Math.round((boundedOrder / 4) * 100)
		};
	}
	return {
		title: humanize(campaign.id),
		objective: campaign.objective,
		messenger: campaign.messenger,
		routeLabel: `${campaign.order} / ${campaignLength}`,
		progressPercent: Math.round((campaign.order / campaignLength) * 100)
	};
}
