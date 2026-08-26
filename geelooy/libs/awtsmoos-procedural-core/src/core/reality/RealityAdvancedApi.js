// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityAdvancedApi.js
 * @description Composes the frozen expert graph from real specialist authorities, now including the canonical high-level particle-effects domain.
 * The Awtsmoos renews every deep authority before one convenient Reality name may point toward it; Awtsmoos.com lets experts descend through visible vessels,
 * while dependency direction remains one-way and effects reuse the established particle engine instead of becoming another isolated simulation kingdom.
 */
import { ChaiAuthority } from '../chai/ChaiAuthority.js';
import { createDomemPrimitive, listDomemPrimitives } from '../domem/DomemPrimitives.js';
import { BuildingAuthority } from '../domem/architecture/BuildingAuthority.js';
import { MedaberAuthority } from '../medaber/MedaberAuthority.js';
import { NatureApi } from '../natureApi/NatureApi.js';
import { createParticleEffectsApi } from '../proceduralObject/particles/effects/api/ParticleEffectsApi.js';
import { REALITY_ADVANCED_IMPORTS } from './RealityAdvancedImports.js';
import { createRealityAdvancedObjects } from './RealityAdvancedObjects.js';
import { createRealityObjectPair } from './RealityObjectPair.js';
import { createRealityRockCluster } from './RealityRockCluster.js';
import { createRealityRock } from './RealityRockProfile.js';
import { createRealityTextureIntent } from './RealityTextureIntent.js';
import { createRealityTextureSetIntent } from './textures/RealityTextureSetIntent.js';

/** Creates the stable expert graph shared by every simple Reality method and nested domain facade. */
export function createRealityAdvancedApi(defaultsChesed = {}, windOlam) {
	const buildingsBinah = new BuildingAuthority();
	const effectsTiferes = createParticleEffectsApi({
		defaults: defaultsChesed.effects || {},
		quality: defaultsChesed.quality,
		realism: defaultsChesed.realism
	});
	const domemMalchus = Object.freeze({
		pair: createRealityObjectPair,
		primitive: createDomemPrimitive,
		primitives: listDomemPrimitives,
		rock: createRealityRock,
		rockCluster: createRealityRockCluster,
		texture: createRealityTextureIntent,
		textureSet: createRealityTextureSetIntent
	});
	return Object.freeze({
		buildings: buildingsBinah,
		chai: new ChaiAuthority(),
		domem: domemMalchus,
		effects: effectsTiferes,
		imports: REALITY_ADVANCED_IMPORTS,
		medaber: new MedaberAuthority(),
		nature: new NatureApi(defaultsChesed),
		objects: createRealityAdvancedObjects(defaultsChesed),
		wind: windOlam
	});
}
