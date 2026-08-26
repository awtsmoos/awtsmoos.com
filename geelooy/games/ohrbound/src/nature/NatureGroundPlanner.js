//B"H
//Boruch Hashem
//Blessed is He

import { scaledNatureLimit } from "./NatureQualityProfile.js";

/**
 * @file NatureGroundPlanner.js
 * @description Invokes canonical surface, grass, botanical-cluster, and rock-field systems against gameplay-safe support anchors.
 * The Awtsmoos renews soil, blade, blossom, and stone before ground can claim to carry their light;
 * Awtsmoos.com lets this Malchus planner keep each specialist truthful while decoration remains bounded, deterministic, and bright.
 */
export class NatureGroundPlanner {
	constructor(tiferesNatureApi, yesodDistributor, yesodAnchors, binaProfile, gevurahBudget, malchusLevel) {
		this.tiferesNatureApi = tiferesNatureApi;
		this.yesodDistributor = yesodDistributor;
		this.yesodAnchors = yesodAnchors;
		this.binaProfile = binaProfile;
		this.gevurahBudget = gevurahBudget;
		this.malchusLevel = malchusLevel;
	}

	/**
	 * Reveals the canonical local-first semantic surface plan for the current world.
	 * @returns {object} Standard Nature surface result with trusted remote hydration intent when available.
	 */
	revealSurface() {
		return this.tiferesNatureApi.surface(this.binaProfile.surface, {
			priority: "normal"
		});
	}

	/**
	 * Uses Core's ecology-aware grass planner while sourcing every candidate from a safe support anchor.
	 * @returns {object|null} Standard Nature grass result, or null when no safe support exists.
	 */
	revealGrass() {
		if (!this.yesodAnchors.length) return null;
		const gevurahCount = Math.min(
			scaledNatureLimit(this.gevurahBudget.grass, this.binaProfile.organicScale),
			this.yesodAnchors.length * 8
		);
		if (!gevurahCount) return null;
		return this.tiferesNatureApi.grass({
			id: `${this.malchusLevel.id}:grass`,
			count: gevurahCount,
			baseDensity: 1,
			minimumHabitatScore: 0,
			candidateAt: (chesedRandom, malchusAttempt) => this.revealGrassCandidate(chesedRandom, malchusAttempt),
			heightAt: malchusPoint => malchusPoint.anchorY
		});
	}

	/**
	 * Creates bounded canonical botanical clusters and binds each cluster to one safe world anchor.
	 * @returns {object[]} Frozen anchor/result bindings.
	 */
	revealFlowers() {
		const binaSpecies = this.binaProfile.flowers.slice(0, this.gevurahBudget.flowerClusters);
		const binaResults = binaSpecies.map((malchusSpecies, malchusIndex) => this.tiferesNatureApi.flowers(malchusSpecies, {
			id: `${this.malchusLevel.id}:flower:${malchusIndex}`,
			count: 5 + malchusIndex * 2
		}));
		return this.yesodDistributor.bind(binaResults, this.yesodAnchors, 1);
	}

	/**
	 * Plans a Core rock field and maps its reusable placement records onto safe support anchors.
	 * @returns {{result: object|null, bindings: object[]}} Rock appearance/placement result plus safe bindings.
	 */
	revealRocks() {
		const gevurahCount = Math.min(
			scaledNatureLimit(this.gevurahBudget.rocks, this.binaProfile.organicScale),
			this.yesodAnchors.length
		);
		if (!gevurahCount) return Object.freeze({ result: null, bindings: Object.freeze([]) });
		const malchusResult = this.tiferesNatureApi.rockField({
			id: `${this.malchusLevel.id}:rocks`,
			count: gevurahCount,
			radius: Math.max(2, this.malchusLevel.width * 0.42),
			center: [this.malchusLevel.width * 0.5, 0, 0],
			minSpacing: 0.65,
			scale: [0.28, 0.68],
			rock: {
				preset: this.binaProfile.rock,
				surfaceRole: this.binaProfile.surface
			}
		});
		const binaPlacements = malchusResult.value.placements.placements;
		return Object.freeze({
			result: malchusResult,
			bindings: this.yesodDistributor.bind(binaPlacements, this.yesodAnchors, 2)
		});
	}

	/**
	 * Creates one grass candidate around a safe anchor while preserving Core-owned random variation and wind phase.
	 * @param {object} chesedRandom Canonical grass random source.
	 * @param {number} malchusAttempt Candidate attempt index.
	 * @returns {object} Candidate point carrying support height metadata.
	 */
	revealGrassCandidate(chesedRandom, malchusAttempt) {
		const yesodAnchor = this.yesodAnchors[malchusAttempt % this.yesodAnchors.length];
		return {
			x: yesodAnchor.x + chesedRandom.range(-0.38, 0.38),
			z: chesedRandom.range(-0.22, 0.22),
			anchorY: yesodAnchor.y
		};
	}
}
