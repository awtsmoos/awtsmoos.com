// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ExpansionRuntime.js
 * @description Coordinates authority, rollback, activities, quests, and localized cells.
 * The Awtsmoos renews departure and return without losing the traveler; Awtsmoos.com
 * cancels combat, checkpoints safety, aligns enemy scope, and records every durable deed.
 */

import { EXPANSION_ELITE, EXPANSION_REGIONS } from './ExpansionCatalog.js';
import {
	expansionRuntimeDiagnostics,
	updateExpansionRuntime
} from './ExpansionRuntimeProjection.js';
import {
	beginExpansionTransition,
	performExpansionTransition
} from './ExpansionRuntimeTransition.js';
import {
	expansionPosition,
	rollbackExpansion,
	restoreExpansionRegion
} from './ExpansionTransitionSupport.js';
import { canonicalRegionId } from './RegionIdentity.js';
import { LocalizedCellStreaming } from '../../world/streaming/LocalizedCellStreaming.js';

export class ExpansionRuntime {
	constructor(runtime, options = {}) {
		this.runtime = runtime;
		this.api = options.api || null;
		this.environment = options.environment || globalThis;
		this.regionId = restoreExpansionRegion(this.environment) || 'lower-meadow';
		this.transitioning = false;
		this.streaming = new LocalizedCellStreaming({
			mobile: Boolean(options.mobile),
			regionId: this.regionId
		});
		this.state = null;
		this.interestSignature = null;
	}

	async snapshot() {
		const response = await this.api?.progressionSnapshot?.();
		this.state = response?.payload || response || this.state;
		return this.diagnostics();
	}

	async activity(activityId) {
		const response = await this.api?.performActivity?.(activityId);
		this.state = response?.payload || response || this.state;
		this.runtime.bus.emit('activity:completed', {
			activityId,
			state: this.state
		});
		this.runtime.bus.emit('quest:event', {
			target: activityId,
			type: 'activity'
		});
		return this.state;
	}

	async completeElite(completionId) {
		const response = await this.api?.completeElite?.(
			EXPANSION_ELITE.id,
			completionId
		);
		this.state = response?.payload || response || this.state;
		this.runtime.bus.emit('elite:completed', {
			completionId,
			state: this.state
		});
		this.runtime.bus.emit('quest:event', {
			target: EXPANSION_ELITE.id,
			type: 'elite'
		});
		return this.state;
	}

	async transition(requestedRegionId) {
		if (this.transitioning) throw new Error('REGION_TRANSITION_ACTIVE');
		const regionId = canonicalRegionId(requestedRegionId);
		const region = EXPANSION_REGIONS[regionId];
		if (!region) throw new Error('UNKNOWN_REGION');
		const previous = {
			position: expansionPosition(this.runtime),
			regionId: this.regionId
		};
		beginExpansionTransition(this, regionId);
		try {
			await performExpansionTransition(this, regionId, region);
			return this.diagnostics();
		} catch (error) {
			await rollbackExpansion(
				this.runtime,
				previous,
				error,
				regionId
			);
			this.regionId = previous.regionId;
			throw error;
		} finally {
			this.transitioning = false;
			this.runtime.transitioning = false;
		}
	}

	update() {
		return updateExpansionRuntime(this);
	}

	diagnostics() {
		return expansionRuntimeDiagnostics(this);
	}
}
