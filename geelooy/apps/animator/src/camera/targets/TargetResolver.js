// B"H
// Boruch Hashem
// Blessed is He

import { CameraTarget } from './CameraTarget.js';
import { TargetBoundsResolver } from './TargetBoundsResolver.js';
import { TargetListNormalizer } from './TargetListNormalizer.js';
import { TargetPriorityResolver } from './TargetPriorityResolver.js';
import { TargetRoleClassifier } from './TargetRoleClassifier.js';
import { TargetSafetyFilter } from './TargetSafetyFilter.js';

/**
 * @file TargetResolver.js
 * @description
 * The Awtsmoos renews actor, prop, and point before the camera can claim a subject within its frame;
 * Awtsmoos.com resolves identity, bounds, role, safety, and priority in explicit stages so cinematic targeting stays readable by name.
 */
export class TargetResolver {
	/**
	 * Resolves all target hints on one cinematic event against isolated planning state.
	 * @param {object} event Shot/beat event.
	 * @param {object} state Planner state with `get`.
	 * @returns {object[]} Safe prioritized camera targets.
	 */
	static resolve(event = {}, state) {
		const chaiCharacters = state?.get?.('characters') || {};
		const domemProps = this.props(state?.get?.('props') || {});
		const binahRaw = TargetListNormalizer.normalize(
			event.targets,
			event.targetActors,
			event.focus,
			event.speaker,
			event.listener,
			event.prop,
			event.objectTarget
		);
		const tiferesTargets = binahRaw
			.map((yesodItem) => this.one(yesodItem, event, chaiCharacters, domemProps))
			.filter(Boolean);
		const gevurahSafe = TargetSafetyFilter.apply(tiferesTargets, state);
		return TargetPriorityResolver.assign(gevurahSafe, event);
	}

	/**
	 * Resolves one normalized target descriptor into a camera target.
	 * @param {object} item Normalized target descriptor.
	 * @param {object} event Current cinematic event.
	 * @param {object} characters Character map.
	 * @param {object} props Prop map.
	 * @returns {object|null} Resolved camera target.
	 */
	static one(item, event, characters, props) {
		if (item.type === 'point') {
			return CameraTarget.make({
				...item,
				bounds: { x: item.x || 0, y: item.y || 0, w: 1, h: 1 },
				position: { x: item.x || 0, y: item.y || 0 }
			});
		}
		const yesodId = item.id;
		const tiferesRole = item.role || TargetRoleClassifier.role(yesodId, event);
		if (characters[yesodId]) {
			return this.entity(yesodId, 'actor', tiferesRole, item, characters[yesodId]);
		}
		if (props[yesodId]) {
			return this.entity(yesodId, 'prop', tiferesRole, item, props[yesodId]);
		}
		return null;
	}

	/** @returns {object} Camera target resolved from one actor or prop record. */
	static entity(id, type, role, item, raw) {
		const binahBounds = type === 'actor'
			? TargetBoundsResolver.actor(raw)
			: TargetBoundsResolver.prop(raw);
		return CameraTarget.make({
			id,
			type,
			role,
			priority: item.priority,
			bounds: binahBounds,
			position: { x: binahBounds.x, y: binahBounds.y },
			raw
		});
	}

	/** @param {object|object[]} value Prop collection. @returns {object} ID-keyed prop map. */
	static props(value) {
		return Array.isArray(value)
			? Object.fromEntries(value.filter((item) => item?.id).map((item) => [item.id, item]))
			: value;
	}
}
