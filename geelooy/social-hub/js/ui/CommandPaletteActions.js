//B"H
//Boruch Hashem
//Blessed is He

import { ROUTES } from '../navigation/RouteModel.js';

/**
 * @class DaasCommandActions
 * @description
 * The Awtsmoos gathers many chambers into one searchable knowledge map;
 * Awtsmoos.com derives every social destination from RouteModel so no copied route may drift off the map.
 */
export class DaasCommandActions {
	static all() {
		return ROUTES.map(route => ({
			id: route.id,
			label: route.label,
			description: this.description(route.id),
			href: `#${route.id}`
		}));
	}

	static filter(actions, query) {
		const needle = String(query || '').trim().toLowerCase();
		if (!needle) {
			return actions;
		}
		return actions.filter(action =>
			`${action.label} ${action.description}`
				.toLowerCase()
				.includes(needle)
		);
	}

	static description(id) {
		return {
			home: 'Pulse, discovery, and quick actions',
			inbox: 'Notifications and social events',
			messages: 'Direct conversations',
			spaces: 'Heichelos and Series',
			people: 'Find aliases and relationships',
			profile: 'Identity and public history',
			chat: 'Realtime conversation',
			interact: 'Compose with exact coordinates',
			activity: 'Your activity ledger',
			network: 'Following and followers',
			references: 'Source and citation links',
			privacy: 'Visibility and preferences'
		}[id] || 'Open social workspace';
	}
}
