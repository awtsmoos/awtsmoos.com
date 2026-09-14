// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageBridgeTrialQuestCoordinator.js
 * @description Discovers and accepts Village Bridge Trial through the shared contextual-action resolver.
 * The Awtsmoos joins arrival and obligation without silently deciding for the player; Awtsmoos.com
 * offers once on approach, lets Begin be a real deed, and keeps AdventureStore as the only quest authority.
 */

import { directActionState, HIDDEN_DIRECT_ACTION } from './DirectWorldContextActionState.js';
import {
	registerContextActionProvider,
	unregisterContextActionProvider
} from './DirectWorldContextProviderRegistry.js';
import { VILLAGE_BRIDGE_TRIAL_QUEST_ID } from '../gameplay/VillageBridgeAdventures.js';
import { CANONICAL_VILLAGE_LANDMARKS } from '../world/village/CanonicalVillagePlan.js';

const DISCOVERY_RADIUS = 6.5;

/** Owns discovery and Begin interaction, never the quest record itself. */
export class VillageBridgeTrialQuestCoordinator {
	constructor(runtime) {
		this.runtime = runtime;
		this.priority = 60;
		this.inside = false;
		registerContextActionProvider(runtime, this);
	}

	/** Offers the trial only when entering its canonical discovery radius. */
	update() {
		const inside = this.isNearStart();
		if (inside && !this.inside) this.offerOnDiscovery();
		this.inside = inside;
	}

	/** Presents Begin only for a currently offered trial at the discovery point. */
	state() {
		const record = this.record();
		if (!this.inside || record?.status !== 'offered') return HIDDEN_DIRECT_ACTION;
		return directActionState('begin', 'Begin', 'Begin the Village Bridge Trial.');
	}

	/** Accepts only the exact state currently presented by this provider. */
	activate(state = this.state()) {
		if (state.kind !== 'begin') return false;
		const record = this.runtime.catalogAdventures?.accept?.(VILLAGE_BRIDGE_TRIAL_QUEST_ID);
		this.runtime.bus?.emit?.('bridge-trial:accepted', { questId: VILLAGE_BRIDGE_TRIAL_QUEST_ID });
		return record || false;
	}

	/** The obstacle runtime exists only while its canonical adventure is active. */
	shouldRunCourse() {
		return this.record()?.status === 'active';
	}

	destroy() {
		unregisterContextActionProvider(this.runtime, this);
	}

	record() {
		return this.runtime.catalogAdventures?.get?.(VILLAGE_BRIDGE_TRIAL_QUEST_ID) || null;
	}

	offerOnDiscovery() {
		const store = this.runtime.catalogAdventures;
		const record = this.record();
		if (!store || !record || !['available', 'declined'].includes(record.status)) return record;
		const offered = store.offer(VILLAGE_BRIDGE_TRIAL_QUEST_ID);
		this.runtime.bus?.emit?.('quest:offer', { questId: VILLAGE_BRIDGE_TRIAL_QUEST_ID });
		return offered;
	}

	isNearStart() {
		const position = this.runtime.model?.position;
		const start = CANONICAL_VILLAGE_LANDMARKS.entrance;
		if (!position || !start) return false;
		return Math.hypot(Number(position.x) - start.x, Number(position.z) - start.z) <= DISCOVERY_RADIUS;
	}
}
