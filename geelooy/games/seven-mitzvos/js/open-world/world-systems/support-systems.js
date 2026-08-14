//B"H
//Boruch Hashem
//Blessed is He

import { defineWorldSystem } from './world-system-record.js';

/**
 * @file support-systems.js
 * @description
 * The Awtsmoos renews cooperation, accessibility, and replay as supporting vessels around one inhabited game;
 * Awtsmoos.com keeps multiplayer resilience, semantic input, and remembered sessions available without letting support chrome replace world play.
 * These systems activate only when their contracts are needed and retain their own mature policies.
 */
export const SUPPORT_WORLD_SYSTEMS = Object.freeze([
	defineWorldSystem({
		id: 'multiplayer-coordination',
		title: 'Multiplayer Coordination and Resilience',
		sefiros: ['yesod', 'netzach', 'gevurah'],
		anchorKind: 'network-session',
		activation: 'multiplayer-session',
		saveAuthority: 'Multiplayer protocol and host/session services',
		load: async () => Promise.all([
			import('../../multiplayer/decision-service.js'),
			import('../../multiplayer/desync-service.js'),
			import('../../multiplayer/host-migration-service.js'),
			import('../../multiplayer/interest-projector.js'),
			import('../../multiplayer/lobby-service.js'),
			import('../../multiplayer/offline-action-service.js'),
			import('../../multiplayer/planning-board-service.js'),
			import('../../multiplayer/protocol-compatibility-service.js'),
			import('../../multiplayer/rate-limit-service.js'),
			import('../../multiplayer/reconnect-service.js'),
			import('../../multiplayer/role-policy.js')
		])
	}),
	defineWorldSystem({
		id: 'accessibility-input',
		title: 'Accessibility and Semantic Input',
		sefiros: ['hod', 'malchus'],
		anchorKind: 'input-and-projection',
		activation: 'always-available-support',
		saveAuthority: 'AccessibilityProfileService / input bindings',
		load: async () => Promise.all([
			import('../../accessibility/accessibility-profile-service.js'),
			import('../../accessibility/accessible-state-projector.js'),
			import('../../accessibility/input-binding-service.js')
		])
	}),
	defineWorldSystem({
		id: 'replay-memory',
		title: 'Replay Metadata',
		sefiros: ['netzach', 'hod'],
		anchorKind: 'session-memory',
		activation: 'replay-or-audit',
		saveAuthority: 'ReplayMetadataService',
		load: () => import('../../replay/replay-metadata-service.js')
	})
]);
