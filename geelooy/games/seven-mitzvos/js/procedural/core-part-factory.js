//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews portable form before the temporary render boundary clothes it in a visible vessel;
 * Awtsmoos.com keeps this factory narrow while geometry, color, transforms, and accents move toward native records one responsibility at a level.
 */

import * as THREE from "../../../scripts/build/three.module.js";
import {
	createAwtsmoosThreeBufferGeometry
} from "../../../../libs/awtsmoos-procedural-core/src/adapters/three/bufferGeometry.js";
import { PhysicalMaterialLibrary } from "../materials/physical-material-library.js";
import { advancedProfile } from "./advanced-profile-factory.js";
import { corePartHexColor } from "./core-part-color.js";
import { CorePartGeometryCache } from "./core-part-geometry-cache.js";
import {
	setCorePartGlow,
	setCorePartTint
} from "./core-part-material-effects.js";
import { corePartMaterialOptions } from "./core-part-material-policy.js";
import { applyCorePartTransform } from "./core-part-transform.js";

/** Transitional core-part render boundary while callers migrate to native scene records. */
export class CorePartFactory {
	constructor() {
		this.geometryCache = new CorePartGeometryCache();
		this.materials = new PhysicalMaterialLibrary();
	}

	/** Build one current render-boundary mesh from portable core geometry and physical material policy. */
	part(options = {}) {
		const profile = advancedProfile(options);
		const fallbackTint = corePartHexColor(
			options.hue ?? 42,
			options.lightness ?? 0.55
		);
		const materialPolicy = corePartMaterialOptions(options, fallbackTint);
		const material = this.materials.material(
			materialPolicy.role,
			materialPolicy.options
		);
		const renderData = this.geometryCache.renderData(profile);
		const geometry = createAwtsmoosThreeBufferGeometry(THREE, renderData);
		const mesh = new THREE.Mesh(geometry, material);
		mesh.name = options.name || profile.primitive;
		applyCorePartTransform(mesh, options);
		mesh.castShadow = options.castShadow !== false;
		mesh.receiveShadow = options.receiveShadow !== false;
		Object.assign(mesh.userData, semanticPartData(options, profile, material, materialPolicy));
		return mesh;
	}

	group(name, parts, data = {}) {
		const group = new THREE.Group();
		group.name = name;
		group.add(...parts);
		return this.mark(group, data);
	}

	mark(root, data = {}) {
		Object.assign(root.userData, data, { semanticRoot: root });
		root.traverse(child => {
			Object.assign(child.userData, data, { semanticRoot: root });
		});
		return root;
	}

	setGlow(root, color, intensity = 0.8) {
		return setCorePartGlow(root, color, intensity);
	}

	setHue(root, hue, lightness = 0.55) {
		return setCorePartTint(root, corePartHexColor(hue, lightness));
	}

	/** Preserve the existing current-renderer color compatibility method at the known boundary. */
	color(hue, lightness = 0.55) {
		return new THREE.Color(corePartHexColor(hue, lightness));
	}
}

function semanticPartData(options, profile, material, materialPolicy) {
	return {
		advancedCoreProfile: options.profile || profile.primitive,
		awtsmoosCorePart: true,
		awtsmoosProcedural: true,
		primitive: profile.primitive,
		modifierCount: profile.modifiers.length,
		materialRole: material.userData.materialRole || materialPolicy.role,
		materialState: material.userData.materialState,
		physicalSurfaceSize: materialPolicy.options.surfaceSize
	};
}
