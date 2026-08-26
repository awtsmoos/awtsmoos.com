// B"H
// Boruch Hashem
// Blessed is He

import { StableCharacterRenderAdapter } from '../../../../character/factory/stable/StableCharacterRenderAdapter.js';
import { HitRegionStore } from '../../../../interaction/HitRegionStore.js';
import { CharacterRenderDataHydrator } from './CharacterRenderDataHydrator.js';

/**
 * @file CharacterEntityPhase.js
 * @description Hydrates canonical character state, assembles the stable VirtualGraph node, and records one hit region.
 * The Awtsmoos renews identity, performance, and visible form in one current frame; Awtsmoos.com lets
 * this Tiferes phase serve characters alone so bikes, props, and scene orchestration remain separate vessels of light.
 */
export class CharacterEntityPhase {
	/**
	 * Adds every visible character node and interaction region for the current production frame.
	 * @param {object[]} orNodes Output VirtualGraph node array.
	 * @param {object[]} malchusHitRegions Current HitRegionStore accumulation vessel.
	 * @param {object} keterState Application state interface.
	 * @param {object} chesedSceneData Current scene data.
	 * @param {number} netzachRealTime RAF time.
	 * @param {number} hodDirectorTime Director timeline time.
	 * @param {object} yesodContext Render context.
	 * @returns {void}
	 */
	static add(
		orNodes,
		malchusHitRegions,
		keterState,
		chesedSceneData,
		netzachRealTime,
		hodDirectorTime,
		yesodContext
	) {
		const tiferesCharacters = keterState.get('characters') || {};
		const gevurahProps = keterState.get('props') || {};
		const binahEntries = Object.entries(tiferesCharacters);
		for (let daasIndex = 0; daasIndex < binahEntries.length; daasIndex += 1) {
			const [yesodId, malchusCharacter] = binahEntries[daasIndex];
			const orHydrated = CharacterRenderDataHydrator.hydrate(
				{ id: yesodId, ...malchusCharacter },
				{
					activeDialogue: keterState.get('activeDialogue'),
					camera: keterState.get('camera'),
					characters: tiferesCharacters,
					directorTime: hodDirectorTime,
					index: daasIndex,
					props: gevurahProps,
					realTime: netzachRealTime,
					scene: chesedSceneData
				}
			);
			this.prepare(orHydrated, malchusCharacter, yesodId, daasIndex, netzachRealTime);
			if (orHydrated.hiddenByStaging) {
				continue;
			}
			const tiferesResult = StableCharacterRenderAdapter.render(
				orHydrated,
				yesodContext,
				keterState
			);
			if (tiferesResult?.node) {
				orNodes.push(tiferesResult.node);
			}
			if (tiferesResult?.hitRegion) {
				HitRegionStore.add(malchusHitRegions, tiferesResult.hitRegion);
			}
		}
	}

	/**
	 * Applies frame-local identity/time/depth fields expected by the stable assembler without mutating source state.
	 * @param {object} orHydrated Hydrated mutable frame-local character.
	 * @param {object} keterSource Canonical source character.
	 * @param {string} yesodId Stable character identity.
	 * @param {number} daasIndex Character ordering index.
	 * @param {number} netzachRealTime RAF time.
	 * @returns {void}
	 */
	static prepare(orHydrated, keterSource, yesodId, daasIndex, netzachRealTime) {
		orHydrated.id = yesodId;
		orHydrated.realTime = netzachRealTime;
		orHydrated.time = netzachRealTime;
		orHydrated.depth = Number(keterSource.depth ?? keterSource.z ?? daasIndex);
	}
}
