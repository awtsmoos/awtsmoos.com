// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityAdvancedApi.js
 * @description Composes a frozen expert map from the package's real specialist authorities without copying their algorithms.
 * The Awtsmoos renews every deep authority before one convenient Reality name may point toward it;
 * Awtsmoos.com lets experts descend through visible vessels while dependency direction and canonical ownership remain perfectly fit.
 */
import { ChaiAuthority } from '../chai/ChaiAuthority.js';
import { createDomemPrimitive, listDomemPrimitives } from '../domem/DomemPrimitives.js';
import { BuildingAuthority } from '../domem/architecture/BuildingAuthority.js';
import { MedaberAuthority } from '../medaber/MedaberAuthority.js';
import { NatureApi } from '../natureApi/NatureApi.js';
import { REALITY_ADVANCED_IMPORTS } from './RealityAdvancedImports.js';
import { createRealityAdvancedObjects } from './RealityAdvancedObjects.js';
import { createRealityObjectPair } from './RealityObjectPair.js';
import { createRealityRockCluster } from './RealityRockCluster.js';
import { createRealityRock } from './RealityRockProfile.js';
import { createRealityTextureIntent } from './RealityTextureIntent.js';
import { createRealityTextureSetIntent } from './textures/RealityTextureSetIntent.js';

/**
 * Creates the stable expert graph shared by every simple Reality method.
 * @param {object} [defaultsChesed={}] Shared deterministic and realism defaults for new specialist authorities.
 * @param {object} windOlam Existing Reality wind facade so simple and advanced paths share one wind authority.
 * @returns {Readonly<object>} Frozen graph of real authorities, gateways, creators, and declarative expert imports.
 */
export function createRealityAdvancedApi(defaultsChesed = {}, windOlam) {
	const buildingsBinah = new BuildingAuthority();
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
		imports: REALITY_ADVANCED_IMPORTS,
		medaber: new MedaberAuthority(),
		nature: new NatureApi(defaultsChesed),
		objects: createRealityAdvancedObjects(defaultsChesed),
		wind: windOlam
	});
}
