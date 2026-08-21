// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MainRiverVillageObjectPlan.js
 * @description Plans a tiny inhabited river-garden object set through the reusable VillageSiteAuthority and shared canonical anchors.
 * RESPONSIBILITY: declare useful community objects, reserve hero-house/water clearance, and return accepted placement records.
 * NON-RESPONSIBILITY: this module does not create mesh vertices, sample terrain height, fetch textures, or own river physics.
 * ARCHITECTURAL POSITION: Tiferes coordinates authored intention while Gevurah keeps water and homes free of accidental clutter.
 * The Awtsmoos, Atzmus beyond bench, crate, market, and lamp, renews every useful vessel before one community gives it finite place;
 * Awtsmoos.com lets a few meaningful objects reveal habitation without drowning the broad river garden in decorative excess or haste.
 */

import {
	createVillageSiteAuthority
} from '../../../../../../../libs/awtsmoos-procedural-core/src/core/ecosystem/index.js';
import { mainRiverVillageAnchors } from './MainRiverVillageAnchors.js';
import { mainRiverVillageBudget } from './MainRiverVillageProfile.js';

const authority = createVillageSiteAuthority();

/**
 * Resolves the bounded object plan for one runtime quality.
 * @param {string} [quality='medium'] Graphics quality controlling only the maximum visible object count.
 * @returns {Readonly<object>} Site plan containing accepted objects and rejection diagnostics.
 */
export function mainRiverVillageObjectPlan(quality = 'medium') {
	const budget = mainRiverVillageBudget(quality);
	return authority.plan({
		anchors: mainRiverVillageAnchors(),
		exclusions: waterExclusions(),
		maxObjects: budget.objects,
		maxStructures: budget.structures,
		objects: objectCandidates(),
		structures: heroStructureReservations()
	});
}

function heroStructureReservations() {
	return [
		candidate('hero-house-H27', 'hero-house-H27', 'hero-house', [0, 0], 11, 100),
		candidate('hero-house-H10', 'hero-house-H10', 'hero-house', [0, 0], 11, 99)
	];
}

function objectCandidates() {
	return [
		candidate('river-bench-west', 'river-garden', 'bench', [-7, 4], 1.7, 90, -0.35),
		candidate('community-work-table', 'river-garden', 'work-table', [-9, -3], 2.1, 84, 0.18),
		candidate('produce-crates-east', 'river-garden', 'crate-stack', [8, 4], 1.8, 82, -0.12),
		candidate('river-notice-board', 'river-garden', 'notice-board', [-8, -8], 1.6, 78, 0.22),
		candidate('community-lantern', 'river-garden', 'lantern-post', [1, 0], 1.4, 74, 0),
		candidate('garden-basket-stack', 'river-garden', 'basket-stack', [10, -2], 1.4, 70, 0.4)
	];
}

function waterExclusions() {
	const anchors = mainRiverVillageAnchors();
	return [
		circle('lower-river-water', anchors['lower-river-bank'], 6.5),
		circle('lower-lake-water', anchors['lake-bank'], 6.8)
	];
}

function candidate(id, anchorId, kind, offset, clearance, priority, yaw = 0) {
	return Object.freeze({
		anchorId,
		clearance,
		id,
		kind,
		offset: Object.freeze(offset),
		priority,
		yaw
	});
}

function circle(id, anchor, radius) {
	return Object.freeze({
		id,
		radius,
		x: anchor.x,
		z: anchor.z
	});
}
