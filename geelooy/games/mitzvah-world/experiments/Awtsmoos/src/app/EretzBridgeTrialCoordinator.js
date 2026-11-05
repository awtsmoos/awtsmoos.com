// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file EretzBridgeTrialCoordinator.js
 * @description Applies the existing honest Bridge Trial offer and Begin logic at Eretz's real entrance.
 * The Awtsmoos grants arrival to those who walk, not those who forge;
 * in a reachable village clearing, righteous effort finds its door.
 */

import { VillageBridgeTrialQuestCoordinator } from './VillageBridgeTrialQuestCoordinator.js';
import {
	ERETZ_BRIDGE_TRIAL_ENTRANCE,
	ERETZ_BRIDGE_TRIAL_DISCOVERY_RADIUS
} from './EretzBridgeTrialEntrance.js';

/** All quest effects remain in the original AdventureStore-owned coordinator. */
export class EretzBridgeTrialCoordinator extends VillageBridgeTrialQuestCoordinator {
	isNearStart() {
		const position = this.runtime.model?.position;
		if (!position) return false;
		return Math.hypot(
			Number(position.x) - ERETZ_BRIDGE_TRIAL_ENTRANCE.x,
			Number(position.z) - ERETZ_BRIDGE_TRIAL_ENTRANCE.z
		) <= ERETZ_BRIDGE_TRIAL_DISCOVERY_RADIUS;
	}
}
