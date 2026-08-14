//B"H
//Boruch Hashem
//Blessed is He

import { defineWorldSystem } from './world-system-record.js';

/**
 * @file growth-knowledge-systems.js
 * @description
 * The Awtsmoos renews profession, ecology, law, diplomacy, knowledge, and narrative as living world systems rather than text pages;
 * Awtsmoos.com lets Chesed grow, Gevurah bound, Tiferes reconcile, Netzach endure, and Hod communicate through existing domain services.
 * Each lazy loader imports the real mature modules while their own stores and state machines remain authoritative.
 */
export const GROWTH_KNOWLEDGE_SYSTEMS = Object.freeze([
	defineWorldSystem({
		id: 'professions-progression',
		title: 'Professions and Progression',
		sefiros: ['netzach', 'malchus'],
		anchorKind: 'world-action',
		activation: 'validated-skill-action',
		saveAuthority: 'ProfessionService / ProgressionService',
		load: async () => Promise.all([
			import('../../professions/profession-service.js'),
			import('../../progression/progression-service.js')
		])
	}),
	defineWorldSystem({
		id: 'ecology-sanctuary',
		title: 'Ecology, Animals, Climate, and Disaster',
		sefiros: ['chesed', 'gevurah'],
		anchorKind: 'habitat',
		activation: 'region-proximity',
		saveAuthority: 'Living world ecology domain',
		load: async () => Promise.all([
			import('../../ecology/animal-welfare-service.js'),
			import('../../ecology/climate-profile.js'),
			import('../../ecology/disaster-service.js'),
			import('../../ecology/ecology-cycle-service.js')
		])
	}),
	defineWorldSystem({
		id: 'law-governance-diplomacy',
		title: 'Law, Governance, and Diplomacy',
		sefiros: ['gevurah', 'tiferes', 'hod'],
		anchorKind: 'court-and-council',
		activation: 'civic-case-or-hearing',
		saveAuthority: 'Law / governance / treaty domain state',
		load: async () => Promise.all([
			import('../../law/case-service.js'),
			import('../../governance/council-service.js'),
			import('../../governance/faction-service.js'),
			import('../../diplomacy/treaty-service.js')
		])
	}),
	defineWorldSystem({
		id: 'knowledge-narrative',
		title: 'Knowledge, Chronicle, Rumor, and Timeline',
		sefiros: ['hod', 'binah', 'chochmah'],
		anchorKind: 'teacher-library-inscription',
		activation: 'knowledge-anchor',
		saveAuthority: 'Knowledge and narrative domain state',
		load: async () => Promise.all([
			import('../../knowledge/knowledge-service.js'),
			import('../../narrative/campaign-bridge.js'),
			import('../../narrative/chronicle-projector.js'),
			import('../../narrative/rumor-service.js'),
			import('../../narrative/timeline-query-service.js')
		])
	})
]);
