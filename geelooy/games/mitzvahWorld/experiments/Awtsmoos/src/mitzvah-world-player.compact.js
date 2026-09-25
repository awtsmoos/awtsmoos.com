//B"H

const __awtsmoosLiveImport = (resolve, name) => {
	const callable = function(...args) {
		const value = resolve()[name];
		if (new.target) return Reflect.construct(value, args, new.target);
		return Reflect.apply(value, this, args);
	};
	return new Proxy(callable, {
		apply(_target, thisArg, args) { return Reflect.apply(resolve()[name], thisArg, args); },
		construct(_target, args, newTarget) { return Reflect.construct(resolve()[name], args, newTarget); },
		get(_target, property) { const value = resolve()[name]; return value?.[property]; },
		set(_target, property, value) { const current = resolve()[name]; current[property] = value; return true; },
		has(_target, property) { const current = resolve()[name]; return property in current; },
		ownKeys() { return Reflect.ownKeys(resolve()[name]); }
	});
};
const __awtsmoosLiveNamespace = (resolve) => new Proxy(Object.create(null), {
	get(_target, property) { return resolve()[property]; },
	set(_target, property, value) { resolve()[property] = value; return true; },
	has(_target, property) { return property in resolve(); },
	ownKeys() { return Reflect.ownKeys(resolve()); },
	getOwnPropertyDescriptor(_target, property) {
		const descriptor = Object.getOwnPropertyDescriptor(resolve(), property);
		return descriptor ? { ...descriptor, configurable: true } : undefined;
	}
});

const __awtsmoosModule_1 = Object.create(null);

const __awtsmoosModule_5 = Object.create(null);

const __awtsmoosModule_6 = Object.create(null);

const __awtsmoosModule_4 = Object.create(null);

const __awtsmoosModule_14 = Object.create(null);

const __awtsmoosModule_15 = Object.create(null);

const __awtsmoosModule_16 = Object.create(null);

const __awtsmoosModule_17 = Object.create(null);

const __awtsmoosModule_13 = Object.create(null);

const __awtsmoosModule_18 = Object.create(null);

const __awtsmoosModule_19 = Object.create(null);

const __awtsmoosModule_12 = Object.create(null);

const __awtsmoosModule_20 = Object.create(null);

const __awtsmoosModule_21 = Object.create(null);

const __awtsmoosModule_22 = Object.create(null);

const __awtsmoosModule_11 = Object.create(null);

const __awtsmoosModule_10 = Object.create(null);

const __awtsmoosModule_9 = Object.create(null);

const __awtsmoosModule_24 = Object.create(null);

const __awtsmoosModule_26 = Object.create(null);

const __awtsmoosModule_25 = Object.create(null);

const __awtsmoosModule_23 = Object.create(null);

const __awtsmoosModule_8 = Object.create(null);

const __awtsmoosModule_28 = Object.create(null);

const __awtsmoosModule_29 = Object.create(null);

const __awtsmoosModule_30 = Object.create(null);

const __awtsmoosModule_32 = Object.create(null);

const __awtsmoosModule_31 = Object.create(null);

const __awtsmoosModule_27 = Object.create(null);

const __awtsmoosModule_7 = Object.create(null);

const __awtsmoosModule_35 = Object.create(null);

const __awtsmoosModule_36 = Object.create(null);

const __awtsmoosModule_38 = Object.create(null);

const __awtsmoosModule_37 = Object.create(null);

const __awtsmoosModule_39 = Object.create(null);

const __awtsmoosModule_40 = Object.create(null);

const __awtsmoosModule_34 = Object.create(null);

const __awtsmoosModule_43 = Object.create(null);

const __awtsmoosModule_42 = Object.create(null);

const __awtsmoosModule_44 = Object.create(null);

const __awtsmoosModule_46 = Object.create(null);

const __awtsmoosModule_45 = Object.create(null);

const __awtsmoosModule_41 = Object.create(null);

const __awtsmoosModule_47 = Object.create(null);

const __awtsmoosModule_33 = Object.create(null);

const __awtsmoosModule_3 = Object.create(null);

const __awtsmoosModule_52 = Object.create(null);

const __awtsmoosModule_51 = Object.create(null);

const __awtsmoosModule_55 = Object.create(null);

const __awtsmoosModule_54 = Object.create(null);

const __awtsmoosModule_53 = Object.create(null);

const __awtsmoosModule_56 = Object.create(null);

const __awtsmoosModule_57 = Object.create(null);

const __awtsmoosModule_50 = Object.create(null);

const __awtsmoosModule_49 = Object.create(null);

const __awtsmoosModule_58 = Object.create(null);

const __awtsmoosModule_48 = Object.create(null);

const __awtsmoosModule_2 = Object.create(null);

const __awtsmoosModule_60 = Object.create(null);

const __awtsmoosModule_62 = Object.create(null);

const __awtsmoosModule_61 = Object.create(null);

const __awtsmoosModule_59 = Object.create(null);

const __awtsmoosModule_0 = Object.create(null);

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzEssentialAssetRecord.js ----
{
	const __exports = __awtsmoosModule_1;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file EretzEssentialAssetRecord.js
	 * @description Creates legacy asset keys with null-safe startup values while declaring a strict authored-human policy.
	 * The Awtsmoos lets texture vessels begin empty without inventing a person; Awtsmoos.com preserves the legacy record shape,
	 * yet every human diagnostic now says GLB truth only, while authored visual hydration fills the remaining landscape.
	 */

	const IMAGE_KEYS = Object.freeze([
		'whiteBrickImage',
		'redBrickImage',
		'redBrick1Image',
		'redBrick2Image',
		'yellowBrickImage',
		'goldImage',
		'stoneImage',
		'woodImage',
		'dirt1Image',
		'dirt2Image',
		'dirtGrass1Image',
		'dirtGrass2Image',
		'terrainMixImage'
	]);

	function createEssentialAssetRecord() {
		const assets = Object.fromEntries(IMAGE_KEYS.map(key => [key, null]));
		assets.brickImage = null;
		assets.lavaImage = null;
		assets.terrainDirtImages = [null, null, null, null, null];
		assets.actorAssets = Object.freeze({
			fallbackActors: 0,
			playerBlockingRequests: 1,
			strategy: 'canonical-glb-before-play'
		});
		assets.importedModelMaterials = Object.freeze({
			npcs: [],
			player: Object.freeze({ fallback: false, source: 'canonical-player-glb' })
		});
		assets.houseMaterialDegradation = Object.freeze([]);
		assets.publicMaterialCache = Object.freeze({ entries: 0, ready: 0 });
		assets.publicMaterialPolicy = Object.freeze({
			blockingTextureRequests: 1,
			fallbackFirst: false,
			strategy: 'authored-terrain-before-gameplay-presentation'
		});
		assets.publicUrls = Object.freeze({});
		return assets;
	}


	__exports.createEssentialAssetRecord = createEssentialAssetRecord;
	function essentialAssetImageKeys() {
		return IMAGE_KEYS.slice();
	}

	__exports.essentialAssetImageKeys = essentialAssetImageKeys;

}

// ---- libs/awtsmoos-procedural-core/src/core/assets/ModelTemplateCache.js ----
{
	const __exports = __awtsmoosModule_5;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file ModelTemplateCache.js
	 * @description Owns reusable asynchronous model-template identity, promise sharing, retry eviction, and cache evidence.
	 * The Awtsmoos, Atzmus beyond every duplicated garment, renews one hidden source while many visible instances receive its light;
	 * Awtsmoos.com lets one canonical resource promise serve many worlds without confusing renderer parsing, URL policy, or game delight.
	 */

	/** Renderer-neutral cache for parsed model templates. */
	class ModelTemplateCache {
		/**
		 * @param {object} options Cache dependencies.
		 * @param {Function} options.loadTemplate Loads one canonical resource into a reusable parsed template.
		 * @param {Function} [options.resolveResource] Validates and canonicalizes caller resource identities.
		 */
		constructor(options = {}) {
			if (typeof options.loadTemplate !== 'function') {
				throw new TypeError('B"H | ModelTemplateCache requires loadTemplate.');
			}
			this.loadTemplate = options.loadTemplate;
			this.resolveResource = options.resolveResource || defaultResourceResolver;
			this.promises = new Map();
			this.cacheHits = 0;
			this.cacheMisses = 0;
			this.failures = 0;
			this.templateLoads = 0;
		}

		/** Loads or reuses one parsed template promise. */
		async load(resource, options = {}) {
			const resourceUrl = this.resolveResource(resource);
			const cached = this.promises.has(resourceUrl);
			if (cached) {
				this.cacheHits += 1;
				options.onProgress?.({ cached: true, phase: 'ready', progress: 1 });
			} else {
				this.cacheMisses += 1;
				this.templateLoads += 1;
				const promise = Promise.resolve(
					this.loadTemplate(resourceUrl, options)
				).catch(error => {
					this.failures += 1;
					this.promises.delete(resourceUrl);
					throw wrapModelTemplateError(resourceUrl, error);
				});
				this.promises.set(resourceUrl, promise);
			}
			return Object.freeze({
				cached,
				resourceUrl,
				template: await this.promises.get(resourceUrl)
			});
		}

		/** Clears all shared promises and diagnostics. */
		clear() {
			this.promises.clear();
			this.cacheHits = 0;
			this.cacheMisses = 0;
			this.failures = 0;
			this.templateLoads = 0;
		}

		/** Returns immutable cache evidence. */
		stats() {
			return Object.freeze({
				cacheHits: this.cacheHits,
				cacheMisses: this.cacheMisses,
				failures: this.failures,
				templateLoads: this.templateLoads,
				templatesCached: this.promises.size
			});
		}
	}


	__exports.ModelTemplateCache = ModelTemplateCache;
	function wrapModelTemplateError(resourceUrl, error) {
		const wrapped = new Error(
			`Unable to load model template ${resourceUrl}: ${error?.message || error}`
		);
		wrapped.cause = error;
		return wrapped;
	}

	function defaultResourceResolver(resource) {
		const value = String(resource || '').trim();
		if (!value) throw new Error('B"H | Model resource identity is required.');
		return value;
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/assets/ModelAssetService.js ----
{
	const __exports = __awtsmoosModule_6;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file ModelAssetService.js
	 * @description Separates shared parsed templates from isolated mutable model instances and explicit graceful fallbacks.
	 * The Awtsmoos, Atzmus beyond template and actor, renews one source and every distinct manifestation without division;
	 * Awtsmoos.com lets render adapters instantiate their own vessels while reusable lifecycle, evidence, and failure law stay one decision.
	 */

	/** Renderer-neutral service coordinating shared templates and isolated model instances. */
	class ModelAssetService {
		/**
		 * @param {object} options Service dependencies.
		 * @param {*} options.templateCache Cache exposing load(), clear(), and stats().
		 * @param {Function} options.instantiateTemplate Creates one isolated instance from a shared template.
		 * @param {Function} [options.decorateInstance] Applies adapter-specific receipt metadata.
		 * @param {Function} [options.decorateFallback] Applies adapter-specific fallback metadata.
		 */
		constructor(options = {}) {
			if (!options.templateCache?.load || typeof options.instantiateTemplate !== 'function') {
				throw new TypeError('B"H | ModelAssetService requires cache and instantiator.');
			}
			this.templateCache = options.templateCache;
			this.instantiateTemplate = options.instantiateTemplate;
			this.decorateInstance = options.decorateInstance || identityValue;
			this.decorateFallback = options.decorateFallback || identityValue;
			this.instancesCreated = 0;
			this.fallbacksCreated = 0;
		}

		/** Returns the shared parsed template for expert or adapter reuse. */
		async loadShared(resource, options = {}) {
			const result = await this.templateCache.load(resource, options);
			return result.template;
		}

		/** Creates one isolated mutable model instance from a shared parsed template. */
		async loadIsolated(resource, label = 'instance', options = {}) {
			try {
				const loaded = await this.templateCache.load(resource, options);
				const context = Object.freeze({
					label,
					options,
					resourceUrl: loaded.resourceUrl,
					template: loaded.template
				});
				const instance = await this.instantiateTemplate(loaded.template, context);
				this.instancesCreated += 1;
				return this.decorateInstance(instance, context) ?? instance;
			} catch (error) {
				options.onFailure?.({ error, label, resourceUrl: resource });
				if (typeof options.fallbackFactory !== 'function') throw error;
				const fallback = await options.fallbackFactory({ error, label, url: resource });
				this.fallbacksCreated += 1;
				const context = Object.freeze({ error, label, resourceUrl: resource });
				return this.decorateFallback(fallback, context) ?? fallback;
			}
		}

		/** Clears shared templates and instance counters. */
		clear() {
			this.templateCache.clear?.();
			this.instancesCreated = 0;
			this.fallbacksCreated = 0;
		}

		/** Returns immutable service and cache diagnostics. */
		stats() {
			return Object.freeze({
				fallbacksCreated: this.fallbacksCreated,
				instancesCreated: this.instancesCreated,
				...(this.templateCache.stats?.() || {})
			});
		}
	}


	__exports.ModelAssetService = ModelAssetService;
	/** Convenience factory for dependency-injected model services. */
	function createModelAssetService(options = {}) {
		return new ModelAssetService(options);
	}


	__exports.createModelAssetService = createModelAssetService;
	function identityValue(value) {
		return value;
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/assets/index.js ----
{
	const __exports = __awtsmoosModule_4;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file index.js
	 * @description Public reusable model-asset lifecycle for renderer adapters, vegetation libraries, worlds, and games.
	 * The Awtsmoos, Atzmus beyond file and scene, renews every model source before a renderer gives it visible form;
	 * Awtsmoos.com exposes shared-template and isolated-instance law without binding the procedural core to one parser or platform.
	 */

	__exports.ModelTemplateCache = __awtsmoosModule_5.ModelTemplateCache;
	__exports.ModelAssetService = __awtsmoosModule_6.ModelAssetService;
	__exports.createModelAssetService = __awtsmoosModule_6.createModelAssetService;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-matrix-core.js ----
{
	const __exports = __awtsmoosModule_14;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-matrix-core.js
	 * @description Direct column-major matrix operations for the Mitzvah World.
	 * The Awtsmoos renews every coordinate without waste; Awtsmoos.com forms each matrix
	 * directly so no intermediate vessel stands between intention and visible revelation.
	 */

	const EPSILON = 1e-8;
	__exports.EPSILON = EPSILON;


	function identity() {
		return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
	}


	__exports.identity = identity;
	function copyMat4(source) {
		return new Float32Array(source || identity());
	}


	__exports.copyMat4 = copyMat4;
	function mat4FromArray(source, offset = 0) {
		const result = new Float32Array(16);
		for (let index = 0; index < 16; index += 1) {
			result[index] = Number(source?.[offset + index] ?? (index % 5 === 0 ? 1 : 0));
		}
		return result;
	}


	__exports.mat4FromArray = mat4FromArray;
	function multiply(left, right) {
		const result = new Float32Array(16);
		for (let column = 0; column < 4; column += 1) {
			const offset = column * 4;
			const right0 = right[offset];
			const right1 = right[offset + 1];
			const right2 = right[offset + 2];
			const right3 = right[offset + 3];
			result[offset] = left[0] * right0 + left[4] * right1 + left[8] * right2 + left[12] * right3;
			result[offset + 1] = left[1] * right0 + left[5] * right1 + left[9] * right2 + left[13] * right3;
			result[offset + 2] = left[2] * right0 + left[6] * right1 + left[10] * right2 + left[14] * right3;
			result[offset + 3] = left[3] * right0 + left[7] * right1 + left[11] * right2 + left[15] * right3;
		}
		return result;
	}


	__exports.multiply = multiply;
	function inverse(matrix) {
		const result = new Float32Array(16);
		const [a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, a30, a31, a32, a33] = matrix;
		const b00 = a00 * a11 - a01 * a10;
		const b01 = a00 * a12 - a02 * a10;
		const b02 = a00 * a13 - a03 * a10;
		const b03 = a01 * a12 - a02 * a11;
		const b04 = a01 * a13 - a03 * a11;
		const b05 = a02 * a13 - a03 * a12;
		const b06 = a20 * a31 - a21 * a30;
		const b07 = a20 * a32 - a22 * a30;
		const b08 = a20 * a33 - a23 * a30;
		const b09 = a21 * a32 - a22 * a31;
		const b10 = a21 * a33 - a23 * a31;
		const b11 = a22 * a33 - a23 * a32;
		let determinant = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
		if (Math.abs(determinant) < EPSILON) return identity();
		determinant = 1 / determinant;
		result.set([
			(a11 * b11 - a12 * b10 + a13 * b09) * determinant,
			(-a01 * b11 + a02 * b10 - a03 * b09) * determinant,
			(a31 * b05 - a32 * b04 + a33 * b03) * determinant,
			(-a21 * b05 + a22 * b04 - a23 * b03) * determinant,
			(-a10 * b11 + a12 * b08 - a13 * b07) * determinant,
			(a00 * b11 - a02 * b08 + a03 * b07) * determinant,
			(-a30 * b05 + a32 * b02 - a33 * b01) * determinant,
			(a20 * b05 - a22 * b02 + a23 * b01) * determinant,
			(a10 * b10 - a11 * b08 + a13 * b06) * determinant,
			(-a00 * b10 + a01 * b08 - a03 * b06) * determinant,
			(a30 * b04 - a31 * b02 + a33 * b00) * determinant,
			(-a20 * b04 + a21 * b02 - a23 * b00) * determinant,
			(-a10 * b09 + a11 * b07 - a12 * b06) * determinant,
			(a00 * b09 - a01 * b07 + a02 * b06) * determinant,
			(-a30 * b03 + a31 * b01 - a32 * b00) * determinant,
			(a20 * b03 - a21 * b01 + a22 * b00) * determinant
		]);
		return result;
	}


	__exports.inverse = inverse;
	function translate(x = 0, y = 0, z = 0) {
		const result = identity();
		result[12] = x;
		result[13] = y;
		result[14] = z;
		return result;
	}


	__exports.translate = translate;
	function scale(x = 1, y = 1, z = 1) {
		const result = identity();
		result[0] = x;
		result[5] = y;
		result[10] = z;
		return result;
	}

	__exports.scale = scale;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-transform-math.js ----
{
	const __exports = __awtsmoosModule_15;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-transform-math.js
	 * @description Direct quaternion and TRS composition for animated village forms.
	 * The Awtsmoos turns stillness into movement each instant; Awtsmoos.com composes the
	 * complete local vessel in one pass so no temporary translation or scale matrix is born.
	 */

	const identity = __awtsmoosModule_14.identity;

	function quatNormalize(quaternion) {
		const x = quaternion?.[0] || 0;
		const y = quaternion?.[1] || 0;
		const z = quaternion?.[2] || 0;
		const w = quaternion?.[3] ?? 1;
		const inverseLength = 1 / (Math.hypot(x, y, z, w) || 1);
		return [x * inverseLength, y * inverseLength, z * inverseLength, w * inverseLength];
	}


	__exports.quatNormalize = quatNormalize;
	function quatMatrix(quaternion = [0, 0, 0, 1]) {
		const [x, y, z, w] = quatNormalize(quaternion);
		return composeNormalizedQuaternion(x, y, z, w, 0, 0, 0, 1, 1, 1);
	}


	__exports.quatMatrix = quatMatrix;
	function composeTRS(position, quaternion, scaling) {
		const source = quaternion.toArray ? quaternion.toArray() : quaternion;
		const [x, y, z, w] = quatNormalize(source);
		return composeNormalizedQuaternion(
			x,
			y,
			z,
			w,
			position.x,
			position.y,
			position.z,
			scaling.x,
			scaling.y,
			scaling.z
		);
	}


	__exports.composeTRS = composeTRS;
	function composeNormalizedQuaternion(x, y, z, w, px, py, pz, sx, sy, sz) {
		const x2 = x + x;
		const y2 = y + y;
		const z2 = z + z;
		const xx = x * x2;
		const xy = x * y2;
		const xz = x * z2;
		const yy = y * y2;
		const yz = y * z2;
		const zz = z * z2;
		const wx = w * x2;
		const wy = w * y2;
		const wz = w * z2;
		const result = identity();
		result[0] = (1 - yy - zz) * sx;
		result[1] = (xy + wz) * sx;
		result[2] = (xz - wy) * sx;
		result[4] = (xy - wz) * sy;
		result[5] = (1 - xx - zz) * sy;
		result[6] = (yz + wx) * sy;
		result[8] = (xz + wy) * sz;
		result[9] = (yz - wx) * sz;
		result[10] = (1 - xx - yy) * sz;
		result[12] = px;
		result[13] = py;
		result[14] = pz;
		return result;
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-camera-math.js ----
{
	const __exports = __awtsmoosModule_16;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-camera-math.js
	 * @description Camera projection and world-point revelation for the mountain village.
	 * The Awtsmoos creates the seer and the seen together; Awtsmoos.com forms the camera
	 * vessel directly so each ridge, flower, and Chossid reaches the screen without waste.
	 */

	const identity = __awtsmoosModule_14.identity;

	function perspective(fovDegrees, aspect, near, far) {
		const factor = 1 / Math.tan(fovDegrees * Math.PI / 360);
		const depth = 1 / (near - far);
		const result = new Float32Array(16);
		result[0] = factor / aspect;
		result[5] = factor;
		result[10] = (far + near) * depth;
		result[11] = -1;
		result[14] = 2 * far * near * depth;
		return result;
	}


	__exports.perspective = perspective;
	function lookAt(eye, target, up = [0, 1, 0]) {
		const forward = normalize3([
			eye[0] - target[0],
			eye[1] - target[1],
			eye[2] - target[2]
		]);
		const right = normalize3(cross3(up, forward));
		const upward = cross3(forward, right);
		const result = identity();
		result[0] = right[0];
		result[1] = upward[0];
		result[2] = forward[0];
		result[4] = right[1];
		result[5] = upward[1];
		result[6] = forward[1];
		result[8] = right[2];
		result[9] = upward[2];
		result[10] = forward[2];
		result[12] = -dot3(right, eye);
		result[13] = -dot3(upward, eye);
		result[14] = -dot3(forward, eye);
		return result;
	}


	__exports.lookAt = lookAt;
	function transformPoint(matrix, x, y, z) {
		return [
			matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12],
			matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13],
			matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]
		];
	}


	__exports.transformPoint = transformPoint;
	function cross3(left, right) {
		return [
			left[1] * right[2] - left[2] * right[1],
			left[2] * right[0] - left[0] * right[2],
			left[0] * right[1] - left[1] * right[0]
		];
	}

	function dot3(left, right) {
		return left[0] * right[0] + left[1] * right[1] + left[2] * right[2];
	}

	function normalize3(vector) {
		const inverseLength = 1 / (Math.hypot(vector[0], vector[1], vector[2]) || 1);
		return vector.map(value => value * inverseLength);
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-interpolation-math.js ----
{
	const __exports = __awtsmoosModule_17;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-interpolation-math.js
	 * @description Smooth array and quaternion transitions for living motion.
	 * The Awtsmoos joins every before and after in one present; Awtsmoos.com gives the
	 * visible traveler a measured path between samples without changing either endpoint.
	 */

	const quatNormalize = __awtsmoosModule_15.quatNormalize;

	function quatSlerp(left, right, amount) {
		const [ax, ay, az, aw] = left;
		let [bx, by, bz, bw] = right;
		let cosine = ax * bx + ay * by + az * bz + aw * bw;
		if (cosine < 0) {
			bx = -bx;
			by = -by;
			bz = -bz;
			bw = -bw;
			cosine = -cosine;
		}
		if (cosine > 0.9995) {
			return quatNormalize([
				ax + (bx - ax) * amount,
				ay + (by - ay) * amount,
				az + (bz - az) * amount,
				aw + (bw - aw) * amount
			]);
		}
		const angle = Math.acos(Math.min(1, Math.max(-1, cosine)));
		const sine = Math.sin(angle);
		const leftWeight = Math.sin((1 - amount) * angle) / sine;
		const rightWeight = Math.sin(amount * angle) / sine;
		return [
			ax * leftWeight + bx * rightWeight,
			ay * leftWeight + by * rightWeight,
			az * leftWeight + bz * rightWeight,
			aw * leftWeight + bw * rightWeight
		];
	}


	__exports.quatSlerp = quatSlerp;
	function lerpArray(left, right, amount) {
		return left.map((value, index) => value + (right[index] - value) * amount);
	}

	__exports.lerpArray = lerpArray;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-math.js ----
{
	const __exports = __awtsmoosModule_13;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-math.js
	 * @description Stable public gateway to focused mathematical vessels.
	 * The Awtsmoos contains every coordinate without confusion; Awtsmoos.com reveals
	 * matrix, transform, camera, and interpolation responsibilities in their proper rooms.
	 */

	__exports.copyMat4 = __awtsmoosModule_14.copyMat4;
	__exports.EPSILON = __awtsmoosModule_14.EPSILON;
	__exports.identity = __awtsmoosModule_14.identity;
	__exports.inverse = __awtsmoosModule_14.inverse;
	__exports.mat4FromArray = __awtsmoosModule_14.mat4FromArray;
	__exports.multiply = __awtsmoosModule_14.multiply;
	__exports.scale = __awtsmoosModule_14.scale;
	__exports.translate = __awtsmoosModule_14.translate;
	__exports.composeTRS = __awtsmoosModule_15.composeTRS;
	__exports.quatMatrix = __awtsmoosModule_15.quatMatrix;
	__exports.quatNormalize = __awtsmoosModule_15.quatNormalize;
	__exports.lookAt = __awtsmoosModule_16.lookAt;
	__exports.perspective = __awtsmoosModule_16.perspective;
	__exports.transformPoint = __awtsmoosModule_16.transformPoint;
	__exports.lerpArray = __awtsmoosModule_17.lerpArray;
	__exports.quatSlerp = __awtsmoosModule_17.quatSlerp;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-transform-cache.js ----
{
	const __exports = __awtsmoosModule_18;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-transform-cache.js
	 * @description Reuses transform snapshots and matrix storage until source values change.
	 * The Awtsmoos renews every form each instant; Awtsmoos.com mutates stable numerical
	 * vessels for moving hierarchy nodes while mesh matrix identity still invalidates batches.
	 */

	const identity = __awtsmoosModule_13.identity;

	const MATRIX_SNAPSHOT = 1;
	const TRS_SNAPSHOT = 2;

	const ROOT_WORLD_MATRIX = identity();


	__exports.ROOT_WORLD_MATRIX = ROOT_WORLD_MATRIX;
	function cachedLocalMatrix(object) {
		if (!localTransformChanged(object)) return object._localMatrixCache;
		captureLocalTransform(object);
		object._localMatrixCache ||= new Float32Array(16);
		if (object.matrix) copyMatrixInto(object._localMatrixCache, object.matrix);
		else composeTrsInto(object._localMatrixCache, object);
		object._localRevision = (object._localRevision || 0) + 1;
		return object._localMatrixCache;
	}


	__exports.cachedLocalMatrix = cachedLocalMatrix;
	function updateCachedWorldMatrix(
		object,
		parentWorld = ROOT_WORLD_MATRIX,
		parentRevision = null
	) {
		const localMatrix = cachedLocalMatrix(object);
		const localRevision = object._localRevision || 0;
		const inheritedRevision = parentRevision
			?? object.parent?._worldRevision
			?? 0;
		const unchanged = object._worldParentMatrix === parentWorld
			&& object._worldParentRevision === inheritedRevision
			&& object._worldLocalRevision === localRevision;
		if (unchanged) return false;
		if (object.isMesh || !validMatrix(object.matrixWorld)) {
			object.matrixWorld = multiplyInto(
				new Float32Array(16),
				parentWorld,
				localMatrix
			);
		} else {
			multiplyInto(object.matrixWorld, parentWorld, localMatrix);
		}
		object._worldParentMatrix = parentWorld;
		object._worldParentRevision = inheritedRevision;
		object._worldLocalRevision = localRevision;
		object._worldRevision = (object._worldRevision || 0) + 1;
		return true;
	}


	__exports.updateCachedWorldMatrix = updateCachedWorldMatrix;
	function invalidateTransformCache(object) {
		object._localTransformSnapshot = null;
		object._worldParentMatrix = null;
		object._worldParentRevision = -1;
		object._worldLocalRevision = -1;
	}


	__exports.invalidateTransformCache = invalidateTransformCache;
	function localTransformChanged(object) {
		const snapshot = object._localTransformSnapshot;
		if (object.matrix) {
			if (!snapshot || snapshot.length !== 17 || snapshot[0] !== MATRIX_SNAPSHOT) {
				return true;
			}
			for (let index = 0; index < 16; index += 1) {
				if (snapshot[index + 1] !== object.matrix[index]) return true;
			}
			return false;
		}
		if (!snapshot || snapshot.length !== 11 || snapshot[0] !== TRS_SNAPSHOT) {
			return true;
		}
		return snapshot[1] !== object.position.x
			|| snapshot[2] !== object.position.y
			|| snapshot[3] !== object.position.z
			|| snapshot[4] !== object.quaternion.x
			|| snapshot[5] !== object.quaternion.y
			|| snapshot[6] !== object.quaternion.z
			|| snapshot[7] !== object.quaternion.w
			|| snapshot[8] !== object.scale.x
			|| snapshot[9] !== object.scale.y
			|| snapshot[10] !== object.scale.z;
	}

	function captureLocalTransform(object) {
		if (object.matrix) {
			const snapshot = reusableSnapshot(object, 17);
			snapshot[0] = MATRIX_SNAPSHOT;
			for (let index = 0; index < 16; index += 1) {
				snapshot[index + 1] = object.matrix[index];
			}
			return;
		}
		const snapshot = reusableSnapshot(object, 11);
		snapshot[0] = TRS_SNAPSHOT;
		snapshot[1] = object.position.x;
		snapshot[2] = object.position.y;
		snapshot[3] = object.position.z;
		snapshot[4] = object.quaternion.x;
		snapshot[5] = object.quaternion.y;
		snapshot[6] = object.quaternion.z;
		snapshot[7] = object.quaternion.w;
		snapshot[8] = object.scale.x;
		snapshot[9] = object.scale.y;
		snapshot[10] = object.scale.z;
	}

	function reusableSnapshot(object, length) {
		if (!object._localTransformSnapshot || object._localTransformSnapshot.length !== length) {
			object._localTransformSnapshot = new Array(length);
		}
		return object._localTransformSnapshot;
	}

	function copyMatrixInto(target, source) {
		for (let index = 0; index < 16; index += 1) target[index] = source[index];
	}

	function composeTrsInto(target, object) {
		const quaternion = object.quaternion;
		const x = quaternion.x || 0;
		const y = quaternion.y || 0;
		const z = quaternion.z || 0;
		const w = quaternion.w ?? 1;
		const inverseLength = 1 / (Math.hypot(x, y, z, w) || 1);
		const normalizedX = x * inverseLength;
		const normalizedY = y * inverseLength;
		const normalizedZ = z * inverseLength;
		const normalizedW = w * inverseLength;
		const x2 = normalizedX + normalizedX;
		const y2 = normalizedY + normalizedY;
		const z2 = normalizedZ + normalizedZ;
		const xx = normalizedX * x2;
		const xy = normalizedX * y2;
		const xz = normalizedX * z2;
		const yy = normalizedY * y2;
		const yz = normalizedY * z2;
		const zz = normalizedZ * z2;
		const wx = normalizedW * x2;
		const wy = normalizedW * y2;
		const wz = normalizedW * z2;
		target[0] = (1 - yy - zz) * object.scale.x;
		target[1] = (xy + wz) * object.scale.x;
		target[2] = (xz - wy) * object.scale.x;
		target[3] = 0;
		target[4] = (xy - wz) * object.scale.y;
		target[5] = (1 - xx - zz) * object.scale.y;
		target[6] = (yz + wx) * object.scale.y;
		target[7] = 0;
		target[8] = (xz + wy) * object.scale.z;
		target[9] = (yz - wx) * object.scale.z;
		target[10] = (1 - xx - yy) * object.scale.z;
		target[11] = 0;
		target[12] = object.position.x;
		target[13] = object.position.y;
		target[14] = object.position.z;
		target[15] = 1;
	}

	function multiplyInto(target, left, right) {
		for (let column = 0; column < 4; column += 1) {
			const offset = column * 4;
			const right0 = right[offset];
			const right1 = right[offset + 1];
			const right2 = right[offset + 2];
			const right3 = right[offset + 3];
			target[offset] = left[0] * right0 + left[4] * right1 + left[8] * right2 + left[12] * right3;
			target[offset + 1] = left[1] * right0 + left[5] * right1 + left[9] * right2 + left[13] * right3;
			target[offset + 2] = left[2] * right0 + left[6] * right1 + left[10] * right2 + left[14] * right3;
			target[offset + 3] = left[3] * right0 + left[7] * right1 + left[11] * right2 + left[15] * right3;
		}
		return target;
	}

	function validMatrix(matrix) {
		return matrix?.length === 16;
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-vector.js ----
{
	const __exports = __awtsmoosModule_19;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-vector.js
	 * @description Mutable vector and quaternion vessels used throughout the tiny runtime.
	 * The Awtsmoos renews every direction and rotation; Awtsmoos.com gives those values
	 * readable forms whose identity remains stable while their present coordinates change.
	 */

	class Vector3 {
		constructor(x = 0, y = 0, z = 0) {
			this.set(x, y, z);
		}

		set(x = 0, y = 0, z = 0) {
			this.x = x;
			this.y = y;
			this.z = z;
			return this;
		}

		fromArray(values = [0, 0, 0]) {
			return this.set(values[0] || 0, values[1] || 0, values[2] || 0);
		}

		copy(vector) {
			return this.set(vector.x || 0, vector.y || 0, vector.z || 0);
		}

		clone() {
			return new Vector3(this.x, this.y, this.z);
		}

		toArray() {
			return [this.x, this.y, this.z];
		}
	}


	__exports.Vector3 = Vector3;
	class Quaternion {
		constructor(x = 0, y = 0, z = 0, w = 1) {
			this.set(x, y, z, w);
		}

		set(x = 0, y = 0, z = 0, w = 1) {
			this.x = x;
			this.y = y;
			this.z = z;
			this.w = w;
			return this;
		}

		fromArray(values = [0, 0, 0, 1]) {
			return this.set(values[0] || 0, values[1] || 0, values[2] || 0, values[3] ?? 1);
		}

		copy(quaternion) {
			return this.set(
				quaternion.x || 0,
				quaternion.y || 0,
				quaternion.z || 0,
				quaternion.w ?? 1
			);
		}

		clone() {
			return new Quaternion(this.x, this.y, this.z, this.w);
		}

		toArray() {
			return [this.x, this.y, this.z, this.w];
		}
	}

	__exports.Quaternion = Quaternion;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-object3d.js ----
{
	const __exports = __awtsmoosModule_12;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-object3d.js
	 * @description Cached scene hierarchy with structural and visibility revision evidence.
	 * The Awtsmoos recreates every parent and child together; Awtsmoos.com marks real hierarchy
	 * changes so settled material and renderer systems stop rediscovering an unchanged village tree.
	 */

	const copyMat4 = __awtsmoosModule_13.copyMat4;
	const identity = __awtsmoosModule_13.identity;
	const cachedLocalMatrix = __awtsmoosModule_18.cachedLocalMatrix;
	const invalidateTransformCache = __awtsmoosModule_18.invalidateTransformCache;
	const ROOT_WORLD_MATRIX = __awtsmoosModule_18.ROOT_WORLD_MATRIX;
	const updateCachedWorldMatrix = __awtsmoosModule_18.updateCachedWorldMatrix;
	const Quaternion = __awtsmoosModule_19.Quaternion;
	const Vector3 = __awtsmoosModule_19.Vector3;

	class Object3D {
		constructor() {
			this.children = [];
			this.parent = null;
			this.position = new Vector3();
			this.quaternion = new Quaternion();
			this.scale = new Vector3(1, 1, 1);
			this.matrix = null;
			this.matrixWorld = identity();
			this.name = '';
			this._visible = true;
			this._sceneGraphRevision = 0;
			this.userData = {};
			this.isBone = false;
		}

		get visible() {
			return this._visible;
		}

		set visible(value) {
			const next = value !== false;
			if (this._visible === next) return;
			this._visible = next;
			markSceneGraphChanged(this);
		}

		add(object) {
			if (!object) return this;
			if (object.parent) object.parent.remove(object);
			object.parent = this;
			invalidateTransformCache(object);
			this.children.push(object);
			markSceneGraphChanged(this);
			return this;
		}

		remove(object) {
			const index = this.children.indexOf(object);
			if (index < 0) return this;
			this.children.splice(index, 1);
			markSceneGraphChanged(this);
			object.parent = null;
			invalidateTransformCache(object);
			return this;
		}

		traverse(visitor) {
			visitor(this);
			for (const child of this.children) child.traverse(visitor);
		}

		setBaseTransform() {
			this._base = {
				position: this.position.clone(),
				quaternion: this.quaternion.clone(),
				scale: this.scale.clone(),
				matrix: this.matrix ? copyMat4(this.matrix) : null
			};
			return this;
		}

		resetToBase() {
			if (!this._base) return;
			this.position.copy(this._base.position);
			this.quaternion.copy(this._base.quaternion);
			this.scale.copy(this._base.scale);
			this.matrix = this._base.matrix ? copyMat4(this._base.matrix) : null;
			invalidateTransformCache(this);
		}

		localMatrix() {
			return cachedLocalMatrix(this);
		}

		updateWorldMatrix(parentWorld = ROOT_WORLD_MATRIX) {
			updateCachedWorldMatrix(this, parentWorld);
			for (const child of this.children) child.updateWorldMatrix(this.matrixWorld);
			return this.matrixWorld;
		}
	}


	__exports.Object3D = Object3D;
	class Group extends Object3D {
		constructor() {
			super();
			this.isGroup = true;
		}
	}


	__exports.Group = Group;
	class Scene extends Group {
		constructor() {
			super();
			this.isScene = true;
		}
	}


	__exports.Scene = Scene;
	class Bone extends Object3D {
		constructor() {
			super();
			this.isBone = true;
		}
	}


	__exports.Bone = Bone;
	function markSceneGraphChanged(object) {
		let root = object;
		while (root.parent) root = root.parent;
		root._sceneGraphRevision = Number(root._sceneGraphRevision || 0) + 1;
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-mesh-object.js ----
{
	const __exports = __awtsmoosModule_20;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-mesh-object.js
	 * @description Renderable scene-graph vessel joining geometry and material.
	 * The Awtsmoos clothes abstract points in visible form; Awtsmoos.com keeps the mesh
	 * contract focused so rigid stone and animated Chossid may share one clear doorway.
	 */

	const Object3D = __awtsmoosModule_12.Object3D;

	class Mesh extends Object3D {
		constructor(geometry = null, material = null) {
			super();
			this.geometry = geometry;
			this.material = material;
			this.isMesh = true;
			this.isSkinnedMesh = false;
			this.skinIndex = null;
			this.skeleton = null;
			this.primitiveMode = 4;
			this.nodeIndex = null;
		}
	}

	__exports.Mesh = Mesh;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-geometry.js ----
{
	const __exports = __awtsmoosModule_21;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-geometry.js
	 * @description Buffer and material vessels shared by imported and procedural forms.
	 * The Awtsmoos gives finite arrays the power to reveal mountains and faces; Awtsmoos.com
	 * keeps geometry, attributes, and garments small, explicit, and reusable.
	 */

	class BufferGeometry {
		constructor() {
			this.attributes = {};
			this.index = null;
			this.mode = 4;
			this.userData = {};
		}

		setAttribute(key, value) {
			this.attributes[key] = value;
			return this;
		}

		setIndex(value) {
			this.index = value;
			return this;
		}
	}


	__exports.BufferGeometry = BufferGeometry;
	class BufferAttribute {
		constructor(array, itemSize, normalized = false, componentType = null) {
			this.array = array;
			this.itemSize = itemSize;
			this.normalized = normalized;
			this.componentType = componentType;
			this.count = Math.floor((array?.length || 0) / itemSize);
		}
	}


	__exports.BufferAttribute = BufferAttribute;
	class MeshStandardMaterial {
		constructor(parameters = {}) {
			const color = parameters.color || [0.74, 0.68, 0.58, 1];
			const opacity = parameters.opacity ?? color[3] ?? 1;
			const alphaMode = parameters.alphaMode || 'OPAQUE';
			const autoTransparent = alphaMode === 'BLEND' || opacity < 1;
			this.name = parameters.name || 'material';
			this.color = color;
			this.opacity = opacity;
			this.alphaMode = alphaMode;
			this.alphaCutoff = parameters.alphaCutoff ?? 0.5;
			this.transparent = parameters.transparent ?? autoTransparent;
			this.doubleSided = parameters.doubleSided === true;
		}
	}

	__exports.MeshStandardMaterial = MeshStandardMaterial;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-camera.js ----
{
	const __exports = __awtsmoosModule_22;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-camera.js
	 * @description Perspective camera vessel for the mountain-village revelation.
	 * The Awtsmoos creates sight and distance together; Awtsmoos.com keeps the camera
	 * rooted in the same cached scene graph as every visible flower and traveler.
	 */

	const Object3D = __awtsmoosModule_12.Object3D;

	class PerspectiveCamera extends Object3D {
		constructor(fov = 45, aspect = 1, near = 0.1, far = 1000) {
			super();
			this.fov = fov;
			this.aspect = aspect;
			this.near = near;
			this.far = far;
		}
	}

	__exports.PerspectiveCamera = PerspectiveCamera;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-runtime.js ----
{
	const __exports = __awtsmoosModule_11;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-runtime.js
	 * @description Stable public gateway to the focused tiny scene-graph runtime.
	 * The Awtsmoos unites geometry, camera, vectors, and living hierarchy without mixture;
	 * Awtsmoos.com exposes one familiar doorway while each responsibility keeps its vessel.
	 */

	const Bone = __awtsmoosModule_12.Bone;
	const Group = __awtsmoosModule_12.Group;
	const Object3D = __awtsmoosModule_12.Object3D;
	const Scene = __awtsmoosModule_12.Scene;
	const Mesh = __awtsmoosModule_20.Mesh;
	const BufferAttribute = __awtsmoosModule_21.BufferAttribute;
	const BufferGeometry = __awtsmoosModule_21.BufferGeometry;
	const MeshStandardMaterial = __awtsmoosModule_21.MeshStandardMaterial;
	const PerspectiveCamera = __awtsmoosModule_22.PerspectiveCamera;
	const Quaternion = __awtsmoosModule_19.Quaternion;
	const Vector3 = __awtsmoosModule_19.Vector3;

	__exports.Bone = Bone;
	__exports.BufferAttribute = BufferAttribute;
	__exports.BufferGeometry = BufferGeometry;
	__exports.Group = Group;
	__exports.Mesh = Mesh;
	__exports.MeshStandardMaterial = MeshStandardMaterial;
	__exports.Object3D = Object3D;
	__exports.PerspectiveCamera = PerspectiveCamera;
	__exports.Quaternion = Quaternion;
	__exports.Scene = Scene;
	__exports.Vector3 = Vector3;

	function resetTreeToBase(root) {
		root.traverse(object => object.resetToBase?.());
	}


	__exports.resetTreeToBase = resetTreeToBase;
	const __awtsmoosDefault_1w2urep = {
		Bone,
		BufferAttribute,
		BufferGeometry,
		Group,
		Mesh,
		MeshStandardMaterial,
		Object3D,
		PerspectiveCamera,
		Quaternion,
		Scene,
		Vector3
	};
	__exports.default = __awtsmoosDefault_1w2urep;
}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-gltf-accessors.js ----
{
	const __exports = __awtsmoosModule_10;
	// B"H
	const BufferAttribute = __awtsmoosModule_11.BufferAttribute;

	/** Accessors: the hidden letters of GLTF made exact before the body moves. */
	const COMPONENTS={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array};

	__exports.COMPONENTS = COMPONENTS;
	const TYPE_SIZES={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16};

	__exports.TYPE_SIZES = TYPE_SIZES;
	function componentName(t){return ({5120:'BYTE',5121:'UNSIGNED_BYTE',5122:'SHORT',5123:'UNSIGNED_SHORT',5125:'UNSIGNED_INT',5126:'FLOAT'})[t]||String(t);}

	__exports.componentName = componentName;
	function normalizedScale(Ctor){if(Ctor===Int8Array)return 1/127;if(Ctor===Uint8Array)return 1/255;if(Ctor===Int16Array)return 1/32767;if(Ctor===Uint16Array)return 1/65535;return 1;}


	__exports.normalizedScale = normalizedScale;
	function scalar(view,off,Ctor){if(Ctor===Float32Array)return view.getFloat32(off,true);if(Ctor===Uint32Array)return view.getUint32(off,true);if(Ctor===Uint16Array)return view.getUint16(off,true);if(Ctor===Uint8Array)return view.getUint8(off);if(Ctor===Int16Array)return view.getInt16(off,true);return view.getInt8(off);}
	function writeTuple(target,index,values,itemSize){for(let k=0;k<itemSize;k++)target[index*itemSize+k]=values[k]??0;}

	function readAccessor(doc,buffers,index){
	  const a=doc.accessors[index],Ctor=COMPONENTS[a?.componentType],itemSize=TYPE_SIZES[a?.type]||1;if(!a||!Ctor)throw new Error(`Unsupported accessor ${index}`);
	  const normalized=a.normalized===true;let array;
	  if(a.bufferView===undefined){array=new Ctor(a.count*itemSize);}else{
	    const bv=doc.bufferViews[a.bufferView],buffer=buffers[bv.buffer],base=(bv.byteOffset||0)+(a.byteOffset||0),stride=bv.byteStride||Ctor.BYTES_PER_ELEMENT*itemSize;
	    if(stride===Ctor.BYTES_PER_ELEMENT*itemSize){array=new Ctor(buffer,base,a.count*itemSize);}else{array=new Ctor(a.count*itemSize);const view=new DataView(buffer);for(let i=0;i<a.count;i++)for(let k=0;k<itemSize;k++)array[i*itemSize+k]=scalar(view,base+i*stride+k*Ctor.BYTES_PER_ELEMENT,Ctor);}
	  }
	  if(a.sparse){array=new Ctor(array);applySparse(doc,buffers,a,array,itemSize,Ctor);}
	  const attr=new BufferAttribute(array,itemSize,normalized,a.componentType);attr.accessorIndex=index;attr.min=a.min;attr.max=a.max;return attr;
	}


	__exports.readAccessor = readAccessor;
	function applySparse(doc,buffers,a,array,itemSize,Ctor){
	  const s=a.sparse,iv=doc.bufferViews[s.indices.bufferView],vv=doc.bufferViews[s.values.bufferView],ICtor=COMPONENTS[s.indices.componentType];
	  const ib=buffers[iv.buffer],vb=buffers[vv.buffer],iBase=(iv.byteOffset||0)+(s.indices.byteOffset||0),vBase=(vv.byteOffset||0)+(s.values.byteOffset||0);
	  const iView=new DataView(ib),vView=new DataView(vb);for(let n=0;n<s.count;n++){const idx=scalar(iView,iBase+n*ICtor.BYTES_PER_ELEMENT,ICtor),vals=[];for(let k=0;k<itemSize;k++)vals[k]=scalar(vView,vBase+(n*itemSize+k)*Ctor.BYTES_PER_ELEMENT,Ctor);writeTuple(array,idx,vals,itemSize);}
	}

	function accessorFloatArray(attr){
	  const src=attr.array;if(src instanceof Float32Array&&!attr.normalized)return src;const out=new Float32Array(src.length),scale=attr.normalized?normalizedScale(src.constructor):1;
	  for(let i=0;i<src.length;i++){let v=src[i]*scale;if(attr.normalized&&(src instanceof Int8Array||src instanceof Int16Array))v=Math.max(-1,v);out[i]=v;}return out;
	}


	__exports.accessorFloatArray = accessorFloatArray;
	function normalizeWeightsAttribute(attr){
	  const src=accessorFloatArray(attr),out=new Float32Array(src.length),size=attr.itemSize;for(let i=0;i<attr.count;i++){let sum=0;for(let k=0;k<size;k++)sum+=Math.abs(src[i*size+k]||0);if(sum>0){for(let k=0;k<size;k++)out[i*size+k]=(src[i*size+k]||0)/sum;}else out[i*size]=1;}return new BufferAttribute(out,size,false,5126);
	}


	__exports.normalizeWeightsAttribute = normalizeWeightsAttribute;
	function accessorSummary(doc,index){const a=doc.accessors[index];return `${index} ${a.type} ${componentName(a.componentType)} norm=${!!a.normalized} count=${a.count}`;}

	__exports.accessorSummary = accessorSummary;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-animation-parser.js ----
{
	const __exports = __awtsmoosModule_9;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-animation-parser.js
	 * @description Decodes GLTF animation channels into stable scalar sampling vessels.
	 * The Awtsmoos speaks every motion through measured times and values; Awtsmoos.com
	 * preserves each source channel exactly while separating parsing from living playback.
	 */

	const accessorFloatArray = __awtsmoosModule_10.accessorFloatArray;

	const TARGET_SIZE = {
		rotation: 4,
		scale: 3,
		translation: 3,
		weights: 1
	};

	function summarizeAnimations(document) {
		return (document.animations || []).map((animation, index) => ({
			channels: (animation.channels || []).length,
			index,
			name: animation.name || `animation_${index}`,
			paths: [...new Set(
				(animation.channels || [])
					.map(channel => channel.target?.path)
					.filter(Boolean)
			)],
			samplers: (animation.samplers || []).length
		}));
	}


	__exports.summarizeAnimations = summarizeAnimations;
	function parseTinyAnimations(document, accessors, nodeMap) {
		return (document.animations || []).map((animation, index) => (
			parseAnimation(animation, index, accessors, nodeMap)
		));
	}


	__exports.parseTinyAnimations = parseTinyAnimations;
	function parseAnimation(animation, index, accessors, nodeMap) {
		const channels = [];
		let duration = 0;
		for (const sourceChannel of animation.channels || []) {
			const channel = parseChannel(
				sourceChannel,
				animation.samplers || [],
				accessors,
				nodeMap
			);
			if (!channel) {
				continue;
			}
			channels.push(channel);
			duration = Math.max(duration, channel.input[channel.input.length - 1] || 0);
		}
		return {
			channels,
			duration,
			index,
			name: animation.name || `animation_${index}`
		};
	}

	function parseChannel(sourceChannel, samplers, accessors, nodeMap) {
		const sampler = samplers[sourceChannel.sampler];
		const target = sourceChannel.target || {};
		const node = nodeMap.get(target.node);
		const size = TARGET_SIZE[target.path];
		if (!sampler || !node || !size) {
			return null;
		}
		return {
			input: accessorFloatArray(accessors[sampler.input]),
			interpolation: sampler.interpolation || 'LINEAR',
			node,
			nodeIndex: target.node,
			output: accessorFloatArray(accessors[sampler.output]),
			path: target.path,
			size
		};
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-animation-bindings.js ----
{
	const __exports = __awtsmoosModule_24;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-animation-bindings.js
	 * @description Remembers only properties truly governed by imported animation channels.
	 * The Awtsmoos renews the whole tree, yet Awtsmoos.com restores only the animated vessels,
	 * preserving exact bind values without traversing unrelated cottages, garments, or helpers.
	 */

	function createAnimationBindings(clips) {
		const bindingByNode = new Map();
		const bindings = [];
		for (const clip of clips) {
			for (const channel of clip.channels || []) {
				let paths = bindingByNode.get(channel.node);
				if (!paths) {
					paths = new Map();
					bindingByNode.set(channel.node, paths);
				}
				if (paths.has(channel.path)) {
					continue;
				}
				const binding = {
					base: readBaseValue(channel.node, channel.path),
					node: channel.node,
					path: channel.path
				};
				paths.set(channel.path, binding);
				bindings.push(binding);
			}
		}
		return bindings;
	}


	__exports.createAnimationBindings = createAnimationBindings;
	function captureClipPose(clip) {
		const pose = new Map();
		for (const channel of clip?.channels || []) {
			pose.set(channel, readNodeValue(channel.node, channel.path));
		}
		return pose;
	}


	__exports.captureClipPose = captureClipPose;
	function resetAnimationBindings(bindings) {
		for (const binding of bindings) {
			writeNodeValue(binding.node, binding.path, binding.base);
		}
	}


	__exports.resetAnimationBindings = resetAnimationBindings;
	function writeNodeValue(node, path, values) {
		if (path === 'translation') {
			node.position.set(values[0], values[1], values[2]);
			return;
		}
		if (path === 'rotation') {
			node.quaternion.set(values[0], values[1], values[2], values[3]);
			return;
		}
		if (path === 'scale') {
			node.scale.set(values[0], values[1], values[2]);
		}
	}


	__exports.writeNodeValue = writeNodeValue;
	function readBaseValue(node, path) {
		const base = node._base;
		if (path === 'translation') {
			const value = base?.position || node.position;
			return [value.x, value.y, value.z];
		}
		if (path === 'rotation') {
			const value = base?.quaternion || node.quaternion;
			return [value.x, value.y, value.z, value.w];
		}
		if (path === 'scale') {
			const value = base?.scale || node.scale;
			return [value.x, value.y, value.z];
		}
		return [0];
	}

	function readNodeValue(node, path) {
		if (path === 'translation') {
			return [node.position.x, node.position.y, node.position.z];
		}
		if (path === 'rotation') {
			return [node.quaternion.x, node.quaternion.y, node.quaternion.z, node.quaternion.w];
		}
		if (path === 'scale') {
			return [node.scale.x, node.scale.y, node.scale.z];
		}
		return [0];
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-animation-quaternion.js ----
{
	const __exports = __awtsmoosModule_26;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-animation-quaternion.js
	 * @description Writes one normalized quaternion interpolation into a reusable vessel.
	 * The Awtsmoos turns without division; Awtsmoos.com reveals that rotation through a
	 * stable destination whose identity survives every sampled instant.
	 */

	function slerpQuaternionInto(
		output,
		ax,
		ay,
		az,
		aw,
		bx,
		by,
		bz,
		bw,
		amount
	) {
		let cosine = ax * bx + ay * by + az * bz + aw * bw;
		if (cosine < 0) {
			bx = -bx;
			by = -by;
			bz = -bz;
			bw = -bw;
			cosine = -cosine;
		}
		if (cosine > 0.9995) {
			return normalizeInto(
				output,
				ax + (bx - ax) * amount,
				ay + (by - ay) * amount,
				az + (bz - az) * amount,
				aw + (bw - aw) * amount
			);
		}
		const angle = Math.acos(Math.min(1, Math.max(-1, cosine)));
		const sine = Math.sin(angle);
		const leftWeight = Math.sin((1 - amount) * angle) / sine;
		const rightWeight = Math.sin(amount * angle) / sine;
		return normalizeInto(
			output,
			ax * leftWeight + bx * rightWeight,
			ay * leftWeight + by * rightWeight,
			az * leftWeight + bz * rightWeight,
			aw * leftWeight + bw * rightWeight
		);
	}


	__exports.slerpQuaternionInto = slerpQuaternionInto;
	function normalizeInto(output, x, y, z, w) {
		const scale = 1 / Math.max(1e-12, Math.hypot(x, y, z, w));
		output[0] = x * scale;
		output[1] = y * scale;
		output[2] = z * scale;
		output[3] = w * scale;
		return output;
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-animation-sampler.js ----
{
	const __exports = __awtsmoosModule_25;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-animation-sampler.js
	 * @description Samples scalar animation channels without transient per-frame arrays.
	 * The Awtsmoos joins keyframes without waste; Awtsmoos.com lets each bone receive the
	 * same measured pose while temporary numbers pass through stable, reusable vessels.
	 */

	const slerpQuaternionInto = __awtsmoosModule_26.slerpQuaternionInto;

	function applyChannelSample(channel, time, fadeFrom, fadeAmount = 1) {
		const span = resolveSpan(channel, time);
		if (channel.path === 'rotation') {
			applyRotation(channel, span, fadeFrom, fadeAmount);
			return;
		}
		if (channel.path === 'translation' || channel.path === 'scale') {
			applyVector(channel, span, fadeFrom, fadeAmount);
		}
	}


	__exports.applyChannelSample = applyChannelSample;
	function applyVector(channel, span, fadeFrom, fadeAmount) {
		const values = channel._sampleScratch || (channel._sampleScratch = new Float64Array(3));
		for (let index = 0; index < 3; index += 1) {
			const sampled = sampleComponent(channel, span, index);
			values[index] = fadeFrom
				? fadeFrom[index] + (sampled - fadeFrom[index]) * fadeAmount
				: sampled;
		}
		const target = channel.path === 'translation'
			? channel.node.position
			: channel.node.scale;
		target.set(values[0], values[1], values[2]);
	}

	function applyRotation(channel, span, fadeFrom, fadeAmount) {
		const output = channel._sampleScratch || (channel._sampleScratch = new Float64Array(4));
		const left = span.left * channel.size;
		const right = span.right * channel.size;
		const source = channel.output;
		if (span.step) {
			for (let index = 0; index < 4; index += 1) {
				output[index] = source[left + index] ?? (index === 3 ? 1 : 0);
			}
		} else {
			slerpQuaternionInto(output,
				source[left] || 0, source[left + 1] || 0,
				source[left + 2] || 0, source[left + 3] ?? 1,
				source[right] || 0, source[right + 1] || 0,
				source[right + 2] || 0, source[right + 3] ?? 1,
				span.amount);
		}
		if (fadeFrom) {
			slerpQuaternionInto(output, ...fadeFrom, ...output, fadeAmount);
		}
		channel.node.quaternion.set(output[0], output[1], output[2], output[3]);
	}

	function sampleComponent(channel, span, componentIndex) {
		const left = span.left * channel.size + componentIndex;
		const valueA = channel.output[left] ?? 0;
		if (span.step) return valueA;
		const right = span.right * channel.size + componentIndex;
		const valueB = channel.output[right] ?? valueA;
		return valueA + (valueB - valueA) * span.amount;
	}

	function resolveSpan(channel, time) {
		const times = channel.input;
		const span = channel._sampleSpan || (channel._sampleSpan = {});
		const last = times.length - 1;
		if (last <= 0 || time <= times[0]) return assignSpan(span, 0, 0, 0, true);
		if (time >= times[last]) return assignSpan(span, last, last, 0, true);
		let low = 0;
		let high = last;
		while (high - low > 1) {
			const middle = (low + high) >> 1;
			if (times[middle] <= time) low = middle;
			else high = middle;
		}
		const amount = (time - times[low]) / Math.max(1e-8, times[high] - times[low]);
		return assignSpan(span, low, high, amount, channel.interpolation === 'STEP');
	}

	function assignSpan(span, left, right, amount, step) {
		span.left = left;
		span.right = right;
		span.amount = amount;
		span.step = step || left === right;
		return span;
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-animation-player.js ----
{
	const __exports = __awtsmoosModule_23;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-animation-player.js
	 * @description Advances imported clips through exact first-play, looping, and crossfade laws.
	 * The Awtsmoos renews a living pose from the first instant; Awtsmoos.com never blends the first
	 * idle from bind pose with zero weight, yet preserves gentle transitions after motion is alive.
	 */

	const captureClipPose = __awtsmoosModule_24.captureClipPose;
	const createAnimationBindings = __awtsmoosModule_24.createAnimationBindings;
	const resetAnimationBindings = __awtsmoosModule_24.resetAnimationBindings;
	const applyChannelSample = __awtsmoosModule_25.applyChannelSample;

	class TinyAnimationPlayer {
		constructor(root, clips = []) {
			this.root = root;
			this.clips = clips;
			this.bindings = createAnimationBindings(clips);
			this.currentIndex = clips.length ? 0 : -1;
			this.time = 0;
			this.playing = true;
			this.bindPose = false;
			this.lastApplied = null;
			this.fadeDuration = 0.18;
			this.fadeTime = 0;
			this.fadePose = null;
		}

		get current() {
			return this.clips[this.currentIndex] || null;
		}

		get names() {
			return this.clips.map(clip => clip.name);
		}

		play(indexOrName) {
			const index = resolveClipIndex(this.clips, indexOrName);
			if (index < 0) return this.current;
			const target = this.clips[index];
			const alreadyApplied = this.lastApplied === target?.name;
			if (index === this.currentIndex && !this.bindPose && alreadyApplied) {
				this.playing = true;
				return this.current;
			}
			const hasAppliedPose = this.lastApplied !== null && this.lastApplied !== 'bind';
			this.fadePose = hasAppliedPose ? captureClipPose(target) : null;
			this.fadeTime = hasAppliedPose ? 0 : this.fadeDuration;
			this.currentIndex = index;
			this.time = 0;
			this.bindPose = false;
			this.playing = true;
			this.apply(0);
			return this.current;
		}

		next() {
			return this.play((this.currentIndex + 1) % Math.max(1, this.clips.length));
		}

		setBindPose(enabled) {
			this.bindPose = Boolean(enabled);
			this.time = 0;
			this.fadePose = null;
			resetAnimationBindings(this.bindings);
			this.lastApplied = this.bindPose ? 'bind' : null;
		}

		update(deltaTime) {
			if (this.bindPose || !this.current) return;
			const delta = Math.max(0, Number(deltaTime) || 0);
			if (this.playing) this.time += delta;
			if (this.fadePose) this.fadeTime += delta;
			const duration = this.current.duration || 1;
			this.apply(duration ? this.time % duration : 0);
		}

		apply(time) {
			const clip = this.current;
			if (!clip) return;
			resetAnimationBindings(this.bindings);
			const fadeAmount = this.fadePose
				? smooth(Math.min(1, this.fadeTime / Math.max(0.001, this.fadeDuration)))
				: 1;
			for (const channel of clip.channels) {
				applyChannelSample(channel, time, this.fadePose?.get(channel), fadeAmount);
			}
			if (this.fadePose && this.fadeTime >= this.fadeDuration) this.fadePose = null;
			this.lastApplied = clip.name;
		}

		diagnostics() {
			const clip = this.current;
			return {
				bindPose: this.bindPose,
				channels: clip?.channels.length || 0,
				clipCount: this.clips.length,
				currentAnimation: clip?.name || null,
				currentIndex: this.currentIndex,
				duration: Number((clip?.duration || 0).toFixed(3)),
				fade: this.fadePose
					? Number((1 - this.fadeTime / this.fadeDuration).toFixed(3))
					: 0,
				playing: this.playing,
				time: Number(this.time.toFixed(3))
			};
		}
	}


	__exports.TinyAnimationPlayer = TinyAnimationPlayer;
	function resolveClipIndex(clips, indexOrName) {
		return typeof indexOrName === 'number'
			? indexOrName
			: clips.findIndex(clip => clip.name === indexOrName);
	}

	function smooth(amount) {
		return amount * amount * (3 - 2 * amount);
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-animation.js ----
{
	const __exports = __awtsmoosModule_8;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-animation.js
	 * @description Stable public doorway to parsed clips and allocation-free playback.
	 * The Awtsmoos unites source time with visible motion; Awtsmoos.com keeps parsing,
	 * sampling, bindings, and playback in small vessels behind one familiar import.
	 */

	__exports.parseTinyAnimations = __awtsmoosModule_9.parseTinyAnimations;
	__exports.summarizeAnimations = __awtsmoosModule_9.summarizeAnimations;
	__exports.TinyAnimationPlayer = __awtsmoosModule_23.TinyAnimationPlayer;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-skin-cache.js ----
{
	const __exports = __awtsmoosModule_28;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-skin-cache.js
	 * @description Guards a computed joint palette by renderer frame and exact mesh
	 * transform. Reuse is permitted only when the vessel is truly unchanged before Awtsmoos.
	 */
	class SkinPaletteCache {
		constructor() {
			this.frameToken = null;
			this.meshWorld = new Float32Array(16);
			this.valid = false;
			this.revision = 0;
		}

		/** Returns true only when a fresh palette computation is required. */
		needsUpdate(frameToken, meshWorld) {
			if (!validFrameToken(frameToken) || !this.valid) {
				return true;
			}
			if (this.frameToken !== frameToken) {
				return true;
			}
			return !matrixEquals(this.meshWorld, meshWorld);
		}

		/** Records the exact transform and increments the palette revision. */
		markUpdated(frameToken, meshWorld) {
			this.frameToken = frameToken;
			copyMatrix(this.meshWorld, meshWorld);
			this.valid = validFrameToken(frameToken);
			this.revision += 1;
			return this.revision;
		}

		invalidate() {
			this.valid = false;
			this.frameToken = null;
		}
	}


	__exports.SkinPaletteCache = SkinPaletteCache;
	function matrixEquals(left, right) {
		if (!left || !right || left.length !== 16 || right.length !== 16) {
			return false;
		}
		for (let index = 0; index < 16; index += 1) {
			if (left[index] !== right[index]) {
				return false;
			}
		}
		return true;
	}


	__exports.matrixEquals = matrixEquals;
	function copyMatrix(target, source) {
		if (!source || source.length !== 16) {
			target.fill(Number.NaN);
			return;
		}
		for (let index = 0; index < 16; index += 1) {
			target[index] = source[index];
		}
	}

	function validFrameToken(frameToken) {
		return Number.isInteger(frameToken) && frameToken >= 0;
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-skin-lines.js ----
{
	const __exports = __awtsmoosModule_29;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-skin-lines.js
	 * @description Extracts diagnostic bone segments without entering palette or
	 * renderer ownership. Each line is a small revealed relationship before the
	 * Awtsmoos, drawn by Awtsmoos.com only from current parent-child transforms.
	 */

	/** Returns parent-to-child line positions for all skeletons bound below a root. */
	function skeletonLinePositions(root) {
		const positions = [];
		root.traverse((node) => {
			const skeletons = node.userData?.skeletons;
			if (!(skeletons instanceof Map)) {
				return;
			}
			for (const skeleton of skeletons.values()) {
				appendSkeletonLines(skeleton, positions);
			}
		});
		return new Float32Array(positions);
	}


	__exports.skeletonLinePositions = skeletonLinePositions;
	function appendSkeletonLines(skeleton, positions) {
		const jointSet = new Set(skeleton.joints.filter(Boolean));
		for (const joint of jointSet) {
			const parent = joint.parent;
			if (!parent || !jointSet.has(parent)) {
				continue;
			}
			positions.push(
				parent.matrixWorld[12],
				parent.matrixWorld[13],
				parent.matrixWorld[14],
				joint.matrixWorld[12],
				joint.matrixWorld[13],
				joint.matrixWorld[14]
			);
		}
	}
}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-skin-matrix.js ----
{
	const __exports = __awtsmoosModule_30;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-skin-matrix.js
	 * @description Decodes inverse-bind matrices from imported accessors with explicit
	 * identity fallback. The Awtsmoos renews every matrix entry, while Awtsmoos.com
	 * keeps absence visible instead of disguising missing data as remembered geometry.
	 */
	const identity = __awtsmoosModule_13.identity;

	/** Returns one 4x4 matrix from a BufferAttribute-like accessor. */
	function readSkinMatrix(accessor, index) {
		const source = accessor?.array || accessor;
		if (!source) {
			return identity();
		}
		const matrix = new Float32Array(16);
		for (let component = 0; component < 16; component += 1) {
			matrix[component] = source[index * 16 + component] ?? (
				component % 5 === 0 ? 1 : 0
			);
		}
		return matrix;
	}
	__exports.readSkinMatrix = readSkinMatrix;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-skin-binding.js ----
{
	const __exports = __awtsmoosModule_32;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-skin-binding.js
	 * @description Connects imported skin definitions to their visible mesh vessels.
	 * The Awtsmoos joins bone and garment in one living form; Awtsmoos.com records that
	 * relationship once so animation may unfold without rediscovering its own structure.
	 */

	function bindSceneSkeletons(root, doc, accessors, createSkeleton) {
		const nodeMap = root.userData?.nodeMap || new Map();
		const skeletons = new Map();
		let maxJoints = 0;
		let missingJoints = 0;
		for (let skinIndex = 0; skinIndex < (doc.skins || []).length; skinIndex += 1) {
			const skinDefinition = doc.skins[skinIndex] || {};
			const inverseBindAccessor = skinDefinition.inverseBindMatrices === undefined
				? null
				: accessors[skinDefinition.inverseBindMatrices];
			const skeleton = createSkeleton({
				inverseBindAccessor,
				nodeMap,
				skinDef: skinDefinition,
				skinIndex
			});
			skeletons.set(skinIndex, skeleton);
			maxJoints = Math.max(maxJoints, skeleton.jointCount);
			missingJoints += skeleton.joints.filter(joint => !joint).length;
		}
		const meshStats = bindMeshes(root, skeletons);
		root.userData.skeletons = skeletons;
		return {
			maxJoints,
			missingJoints,
			skeletonCount: skeletons.size,
			...meshStats
		};
	}


	__exports.bindSceneSkeletons = bindSceneSkeletons;
	function bindMeshes(root, skeletons) {
		let rigidMeshes = 0;
		let skinnedMeshes = 0;
		root.traverse(node => {
			if (!node.isMesh) return;
			const hasSkinAttributes = Boolean(
				node.geometry?.attributes?.joints
				&& node.geometry?.attributes?.weights
			);
			node.skeleton = skeletons.get(node.skinIndex) || null;
			node.isSkinnedMesh = Boolean(node.skeleton && hasSkinAttributes);
			if (node.isSkinnedMesh) skinnedMeshes += 1;
			else rigidMeshes += 1;
		});
		return {
			rigidMeshes,
			skinnedMeshes
		};
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-skin-scene.js ----
{
	const __exports = __awtsmoosModule_31;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-skin-scene.js
	 * @description Updates visible world matrices in a reusable frame-local node map.
	 * The Awtsmoos renews every hidden bone and visible garment; Awtsmoos.com recomputes
	 * only changed transforms and keeps the map and metric vessels stable across frames.
	 */

	const bindSceneSkeletons = __awtsmoosModule_32.bindSceneSkeletons;
	const ROOT_WORLD_MATRIX = __awtsmoosModule_18.ROOT_WORLD_MATRIX;
	const updateCachedWorldMatrix = __awtsmoosModule_18.updateCachedWorldMatrix;

	__exports.bindSceneSkeletons = bindSceneSkeletons;

	function collectWorldMatrices(root, reusableWorldByNode = null) {
		const worldByNode = reusableWorldByNode instanceof Map
			? reusableWorldByNode
			: new Map();
		worldByNode.clear();
		const stats = reusableStats(worldByNode.stats);
		updateVisibleBranch(
			root,
			ROOT_WORLD_MATRIX,
			0,
			worldByNode,
			stats,
			true
		);
		worldByNode.stats = stats;
		return worldByNode;
	}


	__exports.collectWorldMatrices = collectWorldMatrices;
	function updateTinySkeletons(root) {
		root._tinySkeletonWorldByNode = collectWorldMatrices(
			root,
			root._tinySkeletonWorldByNode
		);
		const worldByNode = root._tinySkeletonWorldByNode;
		let jointsUploaded = 0;
		let skinnedMeshes = 0;
		root.traverse(node => {
			if (!node.isSkinnedMesh || !node.skeleton || !worldByNode.has(node)) return;
			skinnedMeshes += 1;
			jointsUploaded += node.skeleton.update(node.matrixWorld || ROOT_WORLD_MATRIX);
		});
		return {
			jointsUploaded,
			skinnedMeshes
		};
	}


	__exports.updateTinySkeletons = updateTinySkeletons;
	function setMeshKindVisibility(
		root,
		{ skinned = true, rigid = true } = {}
	) {
		root.traverse(node => {
			if (!node.isMesh) return;
			node.visible = node.isSkinnedMesh ? skinned : rigid;
		});
	}


	__exports.setMeshKindVisibility = setMeshKindVisibility;
	function updateVisibleBranch(
		node,
		parentWorld,
		parentRevision,
		worldByNode,
		stats,
		parentVisible
	) {
		const visible = parentVisible && node.visible !== false;
		if (!visible) {
			stats.skippedSubtrees += 1;
			return;
		}
		const changed = updateCachedWorldMatrix(
			node,
			parentWorld,
			parentRevision
		);
		if (changed) stats.updatedNodes += 1;
		else stats.reusedNodes += 1;
		node.userData ||= {};
		node.userData.worldMatrix = node.matrixWorld;
		worldByNode.set(node, node.matrixWorld);
		for (const child of node.children || []) {
			updateVisibleBranch(
				child,
				node.matrixWorld,
				node._worldRevision || 0,
				worldByNode,
				stats,
				visible
			);
		}
	}

	function reusableStats(stats) {
		const result = stats || {
			reusedNodes: 0,
			skippedSubtrees: 0,
			updatedNodes: 0
		};
		result.reusedNodes = 0;
		result.skippedSubtrees = 0;
		result.updatedNodes = 0;
		return result;
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-skin-system.js ----
{
	const __exports = __awtsmoosModule_27;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-skin-system.js
	 * @description Owns imported skin palettes and measured frame-local reuse. Every
	 * matrix is a finite keli renewed by the Awtsmoos, and Awtsmoos.com reuses it only
	 * when frame identity and mesh transform agree exactly.
	 */
	const identity = __awtsmoosModule_13.identity;
	const inverse = __awtsmoosModule_13.inverse;
	const multiply = __awtsmoosModule_13.multiply;
	const SkinPaletteCache = __awtsmoosModule_28.SkinPaletteCache;
	const skeletonLinePositions = __awtsmoosModule_29.skeletonLinePositions;
	const readSkinMatrix = __awtsmoosModule_30.readSkinMatrix;
	const bindSceneSkeletons = __awtsmoosModule_31.bindSceneSkeletons;
	const collectWorldMatrices = __awtsmoosModule_31.collectWorldMatrices;
	const setMeshKindVisibility = __awtsmoosModule_31.setMeshKindVisibility;
	const updateTinySkeletons = __awtsmoosModule_31.updateTinySkeletons;

	const MAX_TINY_JOINTS = 96;


	__exports.MAX_TINY_JOINTS = MAX_TINY_JOINTS;
	__exports.collectWorldMatrices = collectWorldMatrices;
	__exports.setMeshKindVisibility = setMeshKindVisibility;
	__exports.skeletonLinePositions = skeletonLinePositions;
	__exports.updateTinySkeletons = updateTinySkeletons;

	/** Stores one GLTF skin and computes its mesh-relative joint palette. */
	class TinySkeleton {
		constructor({
			skinIndex = 0,
			skinDef = {},
			nodeMap = new Map(),
			inverseBindAccessor = null
		} = {}) {
			this.skinIndex = skinIndex;
			this.name = skinDef.name || `Skin_${skinIndex}`;
			this.joints = (skinDef.joints || []).map((index) => nodeMap.get(index));
			this.inverseBindMatrices = this.joints.map((_, index) => (
				readSkinMatrix(inverseBindAccessor, index)
			));
			this.jointCount = this.joints.length;
			this.jointMatrices = new Float32Array(Math.max(1, this.jointCount) * 16);
			this.paletteCache = new SkinPaletteCache();
			this.paletteRevision = 0;
			this.lastPaletteRecomputed = false;
			this.resetPalette();
		}

		resetPalette() {
			for (let index = 0; index < Math.max(1, this.jointCount); index += 1) {
				this.jointMatrices.set(identity(), index * 16);
			}
		}

		update(meshWorld = identity()) {
			this.computePalette(meshWorld);
			this.paletteRevision += 1;
			this.paletteCache.invalidate();
			this.lastPaletteRecomputed = true;
			return Math.min(this.jointCount, MAX_TINY_JOINTS);
		}

		updateCached(meshWorld = identity(), frameToken) {
			if (!this.paletteCache.needsUpdate(frameToken, meshWorld)) {
				this.lastPaletteRecomputed = false;
				return Math.min(this.jointCount, MAX_TINY_JOINTS);
			}
			this.computePalette(meshWorld);
			this.paletteCache.markUpdated(frameToken, meshWorld);
			this.paletteRevision += 1;
			this.lastPaletteRecomputed = true;
			return Math.min(this.jointCount, MAX_TINY_JOINTS);
		}

		invalidatePaletteCache() {
			this.paletteCache.invalidate();
		}

		computePalette(meshWorld) {
			const inverseMesh = inverse(meshWorld);
			const count = Math.min(this.jointCount, MAX_TINY_JOINTS);
			for (let index = 0; index < count; index += 1) {
				const joint = this.joints[index];
				const jointWorld = joint?.userData?.worldMatrix
					|| joint?.matrixWorld
					|| identity();
				const skinMatrix = multiply(
					inverseMesh,
					multiply(jointWorld, this.inverseBindMatrices[index])
				);
				this.jointMatrices.set(skinMatrix, index * 16);
			}
		}
	}


	__exports.TinySkeleton = TinySkeleton;
	/** Builds and binds every GLTF skin using the canonical TinySkeleton class. */
	function bindTinySkeletons(root, doc, accessors) {
		return bindSceneSkeletons(
			root,
			doc,
			accessors,
			(configuration) => new TinySkeleton(configuration)
		);
	}
	__exports.bindTinySkeletons = bindTinySkeletons;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-gltf-instance.js ----
{
	const __exports = __awtsmoosModule_7;
	// B"H
	// Boruch Hashem
	// Blessed is He
	/**
	 * @file tiny-gltf-instance.js
	 * @description Clones transforms and skeletons while sharing immutable GLTF resources.
	 * The Awtsmoos renews every actor as a distinct motion vessel; Awtsmoos.com shares
	 * geometry, accessors, textures, and palette materials without sharing mutable bones.
	 */

	const parseTinyAnimations = __awtsmoosModule_8.parseTinyAnimations;
	const copyMat4 = __awtsmoosModule_13.copyMat4;
	const Bone = __awtsmoosModule_11.Bone;
	const Group = __awtsmoosModule_11.Group;
	const Mesh = __awtsmoosModule_11.Mesh;
	const bindTinySkeletons = __awtsmoosModule_27.bindTinySkeletons;

	function instantiateTinyGltf(template, options = {}) {
		if (!template?.scene) throw new Error('A parsed GLTF template is required.');
		const nodeMap = new Map();
		const resources = {
			geometries: new Set(),
			materials: new Set()
		};
		const scene = cloneNode(
			template.scene,
			nodeMap,
			resources,
			options.materialResolver
		);
		const sourceData = template.scene.userData || {};
		const document = template.json || sourceData.gltf || {};
		const accessors = sourceData.accessors || [];
		const sourceNodes = sourceData.allNodes || [];
		const allNodes = sourceNodes.map((_, index) => nodeMap.get(index) || null);
		Object.assign(scene.userData, {
			accessors,
			allNodes,
			gltf: document,
			instanceLabel: options.label || 'instance',
			materials: sourceData.materials || [],
			nodeMap,
			sharedSourceUrl: sourceData.sourceUrl || null,
			skins: document.skins || []
		});
		const skinStats = bindTinySkeletons(scene, document, accessors);
		const animations = parseTinyAnimations(document, accessors, nodeMap);
		scene.userData.animations = animations;
		scene.name = `${options.label || 'instance'}_shared_gltf_scene`;
		return {
			animations,
			experimental: true,
			json: document,
			scene,
			stats: {
				...(template.stats || {}),
				...skinStats,
				instanceLabel: options.label || 'instance',
				sharedGeometries: resources.geometries.size,
				sharedMaterials: resources.materials.size,
				sharedTemplate: true
			}
		};
	}


	__exports.instantiateTinyGltf = instantiateTinyGltf;
	function cloneNode(source, nodeMap, resources, materialResolver) {
		const target = createNode(source, resources, materialResolver);
		copyNodeState(source, target);
		const nodeIndex = source.userData?.nodeIndex;
		if (Number.isInteger(nodeIndex)) nodeMap.set(nodeIndex, target);
		for (const child of source.children || []) {
			target.add(cloneNode(child, nodeMap, resources, materialResolver));
		}
		target.setBaseTransform();
		return target;
	}

	function createNode(source, resources, materialResolver) {
		if (source.isBone) return new Bone();
		if (!source.isMesh) return new Group();
		resources.geometries.add(source.geometry);
		collectMaterials(resources.materials, source.material);
		const material = resolveMaterial(
			source.material,
			source,
			materialResolver
		);
		const mesh = new Mesh(source.geometry, material);
		mesh.skinIndex = source.skinIndex;
		mesh.primitiveMode = source.primitiveMode;
		mesh.nodeIndex = source.nodeIndex;
		return mesh;
	}

	function copyNodeState(source, target) {
		target.name = source.name;
		target.visible = source.visible !== false;
		target.position.copy(source.position);
		target.quaternion.copy(source.quaternion);
		target.scale.copy(source.scale);
		target.matrix = source.matrix ? copyMat4(source.matrix) : null;
		target.userData = { ...(source.userData || {}) };
	}

	function resolveMaterial(material, node, resolver) {
		if (Array.isArray(material)) {
			return material.map(item => resolver?.(item, node) || item);
		}
		return resolver?.(material, node) || material;
	}

	function collectMaterials(target, material) {
		for (const item of Array.isArray(material) ? material : [material]) {
			if (item) target.add(item);
		}
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-gltf-container.js ----
{
	const __exports = __awtsmoosModule_35;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-gltf-container.js
	 * @description Parses GLB container structure and resolves declared buffers without owning scene construction.
	 * The Awtsmoos gives each binary chamber its exact boundary; Awtsmoos.com reads those boundaries once,
	 * so a trusted ArrayBuffer may enter the parser directly without being wrapped, fetched, and copied through another finite disguise.
	 */

	const GLB_MAGIC = 0x46546c67;
	const JSON_CHUNK = 0x4e4f534a;
	const BIN_CHUNK = 0x004e4942;

	/** Parses one complete GLB ArrayBuffer into document, BIN chunk, and auditable chunk metadata. */
	function parseTinyGlbContainer(buffer) {
		const view = new DataView(buffer);
		if (view.getUint32(0, true) !== GLB_MAGIC) {
			throw new Error('Not a GLB container');
		}
		let document = null;
		let binaryChunk = null;
		const chunks = [];
		for (let offset = 12; offset + 8 <= buffer.byteLength;) {
			const length = view.getUint32(offset, true);
			const type = view.getUint32(offset + 4, true);
			const start = offset + 8;
			const bytes = buffer.slice(start, start + length);
			chunks.push({ type, byteOffset: start, byteLength: length });
			if (type === JSON_CHUNK) {
				document = JSON.parse(new TextDecoder().decode(bytes));
			}
			if (type === BIN_CHUNK) binaryChunk = bytes;
			offset = start + length;
		}
		if (!document) throw new Error('GLB missing JSON chunk');
		return { binaryChunk, chunks, document };
	}


	__exports.parseTinyGlbContainer = parseTinyGlbContainer;
	/** Resolves embedded, data-URI, or external GLTF buffers relative to the canonical source URL. */
	async function loadTinyGltfBuffers(document, baseUrl, binaryChunk) {
		return Promise.all((document.buffers || []).map(buffer => {
			if (!buffer.uri) return binaryChunk;
			if (buffer.uri.startsWith('data:')) return dataUriBuffer(buffer.uri);
			return fetchBuffer(new URL(buffer.uri, baseUrl).href);
		}));
	}


	__exports.loadTinyGltfBuffers = loadTinyGltfBuffers;
	async function fetchBuffer(url) {
		const response = await fetch(url, { mode: 'cors' });
		if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
		return response.arrayBuffer();
	}

	function dataUriBuffer(uri) {
		const raw = atob(uri.split(',')[1] || '');
		const bytes = new Uint8Array(raw.length);
		for (let index = 0; index < raw.length; index += 1) {
			bytes[index] = raw.charCodeAt(index);
		}
		return bytes.buffer;
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-gltf-finalize.js ----
{
	const __exports = __awtsmoosModule_36;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-gltf-finalize.js
	 * @description Finalizes a built tiny GLTF scene with scene roots, animations, skeleton binding, and authored diagnostics.
	 * The Awtsmoos joins geometry to motion only after each prior vessel is ready;
	 * Awtsmoos.com keeps that final union separate so loader timing can name exactly where the canonical Chossid becomes alive.
	 */

	const parseTinyAnimations = __awtsmoosModule_8.parseTinyAnimations;
	const Group = __awtsmoosModule_11.Group;
	const bindTinySkeletons = __awtsmoosModule_27.bindTinySkeletons;

	/** Finalizes one parsed template without fetching or decoding new external resources. */
	function finalizeTinyGltf(document, accessors, built, stats, sourceUrl, materials) {
		const root = new Group();
		root.name = 'AwtsmoosTinyGltfRoot';
		const fallbackNodes = built.nodes.map((_, index) => index);
		const sceneDefinition = document.scenes?.[document.scene || 0]
			|| document.scenes?.[0]
			|| { nodes: fallbackNodes };
		for (const nodeIndex of sceneDefinition.nodes || []) {
			root.add(built.nodes[nodeIndex]);
		}
		Object.assign(root.userData, {
			gltf: document,
			nodeMap: built.nodeMap,
			allNodes: built.nodes,
			skins: document.skins || [],
			accessors,
			sourceUrl,
			materials: materials.materials,
			materialDetails: materials.diagnostics
		});
		const animations = parseTinyAnimations(document, accessors, built.nodeMap);
		Object.assign(stats, bindTinySkeletons(root, document, accessors));
		stats.clips = animations.map(clip => ({
			index: clip.index,
			name: clip.name,
			duration: clip.duration,
			channels: clip.channels.length
		}));
		stats.joints = (document.skins || []).reduce((total, skin) => {
			return total + (skin.joints?.length || 0);
		}, 0);
		stats.skeletonName = document.skins?.[0]?.name || null;
		stats.hasInverseBind = !!document.skins?.[0]?.inverseBindMatrices;
		root.userData.animations = animations;
		return {
			scene: root,
			json: document,
			stats,
			animations,
			experimental: true
		};
	}

	__exports.finalizeTinyGltf = finalizeTinyGltf;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-gltf-structure-diagnostics.js ----
{
	const __exports = __awtsmoosModule_38;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-gltf-structure-diagnostics.js
	 * @description Summarizes authored skin and accessor structure without participating in scene construction.
	 * The Awtsmoos gives every finite diagnostic its own vessel; Awtsmoos.com reads joints and weighted accessors
	 * without forcing the builder that reveals the Chossid to also carry the entire burden of explanation.
	 */

	const accessorSummary = __awtsmoosModule_10.accessorSummary;

	/** Returns focused skin/accessor evidence used by loader statistics and release diagnostics. */
	function tinyGltfStructureDiagnostics(document) {
		return {
			accessorDetails: accessorDetails(document),
			skinDetails: skinDetails(document)
		};
	}


	__exports.tinyGltfStructureDiagnostics = tinyGltfStructureDiagnostics;
	function skinDetails(document) {
		return (document.skins || []).map((skin, index) => ({
			index,
			name: skin.name || null,
			joints: (skin.joints || []).length,
			skeleton: skin.skeleton ?? null,
			hasInverseBind: skin.inverseBindMatrices !== undefined,
			inverseBindAccessor: skin.inverseBindMatrices
		}));
	}

	function accessorDetails(document) {
		const entries = [];
		for (const mesh of document.meshes || []) {
			for (const primitive of mesh.primitives || []) {
				for (const [semantic, index] of Object.entries(primitive.attributes || {})) {
					if (semantic === 'JOINTS_0' || semantic === 'WEIGHTS_0') {
						entries.push(`${semantic}: ${accessorSummary(document, index)}`);
					}
				}
			}
		}
		return [...new Set(entries)].slice(0, 24);
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-gltf-loader-stats.js ----
{
	const __exports = __awtsmoosModule_37;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-gltf-loader-stats.js
	 * @description Owns loader statistics and essential accessor warming outside the orchestration doorway.
	 * The Awtsmoos lets measurement surround the vessel without making measurement the vessel itself;
	 * Awtsmoos.com keeps parser orchestration small while diagnostics preserve the exact shape of the authored GLB.
	 */

	const summarizeAnimations = __awtsmoosModule_8.summarizeAnimations;
	const tinyGltfStructureDiagnostics = __awtsmoosModule_38.tinyGltfStructureDiagnostics;

	/** Creates one mutable build-time stats vessel later frozen by the loader result. */
	function createTinyGltfStats(document, chunks, bytes, materialPack) {
		return {
			nodes: 0,
			meshes: 0,
			primitives: 0,
			materials: (document.materials || []).length,
			images: (document.images || []).length,
			textures: (document.textures || []).length,
			animations: (document.animations || []).length,
			skins: (document.skins || []).length,
			skinnedNodes: 0,
			skinnedPrimitives: 0,
			bytes,
			chunks,
			animationDetails: summarizeAnimations(document),
			materialDetails: materialPack.diagnostics,
			...tinyGltfStructureDiagnostics(document)
		};
	}


	__exports.createTinyGltfStats = createTinyGltfStats;
	/** Warms matrix/scalar and animation accessors required by canonical skeleton/animation validation. */
	function warmTinyGltfEssentialAccessors(document, getAccessor) {
		for (let index = 0; index < (document.accessors || []).length; index += 1) {
			const type = document.accessors[index].type;
			if (type === 'MAT4' || type === 'SCALAR') getAccessor(index);
		}
		for (const animation of document.animations || []) {
			for (const sampler of animation.samplers || []) {
				if (sampler.input !== undefined) getAccessor(sampler.input);
				if (sampler.output !== undefined) getAccessor(sampler.output);
			}
		}
	}

	__exports.warmTinyGltfEssentialAccessors = warmTinyGltfEssentialAccessors;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-gltf-materials.js ----
{
	const __exports = __awtsmoosModule_39;
	// B"H
	const MeshStandardMaterial = __awtsmoosModule_11.MeshStandardMaterial;

	/** GLTF material vessels: no more brown default; linear colors receive display breath. */
	const DEFAULT_COLOR = [1, 1, 1, 1];

	async function createTinyMaterials(doc, buffers, baseUrl) {
	  const images = await loadImages(doc, buffers, baseUrl);
	  const materials = (doc.materials || []).map((def, index) => materialFromDef(doc, def, index, images));
	  return { materials, images, diagnostics: materialDiagnostics(doc, materials, images) };
	}


	__exports.createTinyMaterials = createTinyMaterials;
	function materialFromDef(doc, def = {}, index = 0, images = []) {
	  const pbr = def.pbrMetallicRoughness || {}, factor = pbr.baseColorFactor || DEFAULT_COLOR;
	  const tex = textureImage(doc, pbr.baseColorTexture, images);
	  const color = tex ? factor : displayColor(factor);
	  const mat = new MeshStandardMaterial({ name: def.name || `material_${index}`, color, opacity: factor[3] ?? 1, alphaMode: def.alphaMode || 'OPAQUE', alphaCutoff: def.alphaCutoff ?? 0.5, transparent: (def.alphaMode || 'OPAQUE') === 'BLEND' || (factor[3] ?? 1) < 1, doubleSided: def.doubleSided === true });
	  Object.assign(mat, { metallicFactor: pbr.metallicFactor ?? 1, roughnessFactor: pbr.roughnessFactor ?? 1, baseColorFactor: factor, sourceColorSpace: tex ? 'texture+sRGB-factor' : 'gltf-factor-linear-to-display', mapImage: tex?.image || null, textureUrl: tex?.url || null, mapRepeat: tex?.repeat || [1, 1], anisotropy: true });
	  return mat;
	}

	function defaultTinyMaterial() {
	  const mat = new MeshStandardMaterial({ name: 'material_default', color: DEFAULT_COLOR, opacity: 1, alphaMode: 'OPAQUE' });
	  Object.assign(mat, { sourceColorSpace: 'neutral-default', mapRepeat: [1, 1], anisotropy: true });
	  return mat;
	}


	__exports.defaultTinyMaterial = defaultTinyMaterial;
	function textureImage(doc, info, images) {
	  if (!info) return null; const tex = doc.textures?.[info.index]; if (!tex) return null;
	  const image = images[tex.source]; if (!image) return null; const sampler = doc.samplers?.[tex.sampler] || {};
	  return { image, url: image.dataset?.url || image.src || `image_${tex.source}`, repeat: sampler.wrapS === 33071 || sampler.wrapT === 33071 ? [1, 1] : [1, 1] };
	}

	async function loadImages(doc, buffers, baseUrl) {
	  return await Promise.all((doc.images || []).map((image, index) => loadOneImage(doc, buffers, baseUrl, image, index)));
	}

	async function loadOneImage(doc, buffers, baseUrl, image, index) {
	  if (image.uri) return await loadUriImage(new URL(image.uri, baseUrl).href, index);
	  if (image.bufferView !== undefined) {
	    const bv = doc.bufferViews[image.bufferView], buffer = buffers[bv.buffer];
	    const bytes = buffer.slice(bv.byteOffset || 0, (bv.byteOffset || 0) + bv.byteLength);
	    const blob = new Blob([bytes], { type: image.mimeType || 'image/png' });
	    const url = URL.createObjectURL(blob);
	    try { return await loadUriImage(url, index, `glb-bufferView:${image.bufferView}`); }
	    finally { setTimeout(() => URL.revokeObjectURL(url), 2000); }
	  }
	  return null;
	}

	function loadUriImage(src, index, label = src) {
	  return new Promise(resolve => { const img = new Image(); let done = false; const finish = value => { if (!done) { done = true; resolve(value); } }; img.crossOrigin = src.startsWith('blob:') ? null : 'anonymous'; img.onload = () => { img.dataset.url = label; img.dataset.index = String(index); finish(img); }; img.onerror = () => finish(null); img.src = src; });
	}

	function displayColor(color) { return [toSrgb(color[0] ?? 1), toSrgb(color[1] ?? 1), toSrgb(color[2] ?? 1), color[3] ?? 1]; }
	function toSrgb(v) { v = Math.max(0, Math.min(1, v)); return v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055; }

	function materialDiagnostics(doc, materials, images) {
	  return { count: materials.length, images: images.filter(Boolean).length, textures: (doc.textures || []).length, defaultColor: DEFAULT_COLOR, colorsConverted: true, entries: materials.map((m, i) => ({ i, name: m.name, color: m.color, raw: m.baseColorFactor, hasMap: !!m.mapImage, textureSize: m.mapImage ? `${m.mapImage.naturalWidth}x${m.mapImage.naturalHeight}` : null, sourceColorSpace: m.sourceColorSpace })).slice(0, 64) };
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-gltf-scene-builder.js ----
{
	const __exports = __awtsmoosModule_40;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-gltf-scene-builder.js
	 * @description Builds tiny GLTF nodes, meshes, and transforms from parsed document data without owning diagnostics.
	 * The Awtsmoos gives every authored node its measured place while Awtsmoos.com keeps scene construction separate
	 * from explanation, so the canonical Chossid stays small in responsibility while its structure remains fully inspectable elsewhere.
	 */

	const normalizeWeightsAttribute = __awtsmoosModule_10.normalizeWeightsAttribute;
	const defaultTinyMaterial = __awtsmoosModule_39.defaultTinyMaterial;
	const mat4FromArray = __awtsmoosModule_13.mat4FromArray;
	const Bone = __awtsmoosModule_11.Bone;
	const BufferGeometry = __awtsmoosModule_11.BufferGeometry;
	const Group = __awtsmoosModule_11.Group;
	const Mesh = __awtsmoosModule_11.Mesh;

	const ATTRIBUTES = Object.freeze({
		POSITION: 'position',
		NORMAL: 'normal',
		TEXCOORD_0: 'uv',
		COLOR_0: 'color',
		JOINTS_0: 'joints',
		WEIGHTS_0: 'weights'
	});

	/** Builds the node graph while sharing parsed accessors and immutable geometry/material vessels. */
	function buildTinyGltfScene(document, materials, getAccessor, stats) {
		const bones = collectBoneIndices(document);
		const nodeMap = new Map();
		const nodes = (document.nodes || []).map((definition = {}, index) => {
			const node = bones.has(index) ? new Bone() : new Group();
			applyNodeTransform(node, definition, index);
			nodeMap.set(index, node);
			stats.nodes += 1;
			if (definition.skin !== undefined) stats.skinnedNodes += 1;
			return node;
		});
		attachMeshes(document, nodes, materials, getAccessor, stats);
		attachChildren(document, nodes);
		return { nodeMap, nodes };
	}


	__exports.buildTinyGltfScene = buildTinyGltfScene;
	function attachMeshes(document, nodes, materials, getAccessor, stats) {
		for (let index = 0; index < nodes.length; index += 1) {
			const definition = document.nodes[index] || {};
			const meshDefinition = document.meshes?.[definition.mesh];
			if (!meshDefinition) continue;
			(meshDefinition.primitives || []).forEach((primitive, primitiveIndex) => {
				const mesh = primitiveMesh(materials, getAccessor, primitive, meshDefinition, definition, primitiveIndex);
				mesh.nodeIndex = index;
				mesh.setBaseTransform();
				nodes[index].add(mesh);
				stats.meshes += 1;
				stats.primitives += 1;
				if (mesh.skinIndex !== null && mesh.geometry.attributes.joints && mesh.geometry.attributes.weights) {
					stats.skinnedPrimitives += 1;
				}
			});
		}
	}

	function primitiveMesh(materials, getAccessor, primitive, meshDefinition, nodeDefinition, primitiveIndex) {
		const geometry = new BufferGeometry();
		geometry.mode = primitive.mode ?? 4;
		geometry.userData = { primitive, primitiveIndex };
		for (const [semantic, accessorIndex] of Object.entries(primitive.attributes || {})) {
			const key = ATTRIBUTES[semantic];
			if (!key) continue;
			const source = getAccessor(accessorIndex);
			geometry.setAttribute(key, key === 'weights' ? normalizeWeightsAttribute(source) : source);
		}
		if (primitive.indices !== undefined) geometry.setIndex(getAccessor(primitive.indices));
		const material = primitive.material !== undefined ? materials[primitive.material] : defaultTinyMaterial();
		const mesh = new Mesh(geometry, material);
		mesh.name = meshDefinition.name || nodeDefinition.name || `mesh_${nodeDefinition.mesh}_${primitiveIndex}`;
		mesh.skinIndex = nodeDefinition.skin ?? null;
		mesh.primitiveMode = geometry.mode;
		mesh.userData = { meshDef: meshDefinition, primitive, primitiveIndex };
		return mesh;
	}

	function applyNodeTransform(node, definition, index) {
		node.userData.nodeIndex = index;
		node.userData.gltfNode = definition;
		if (definition.name) {
			node.name = definition.name;
			node.userData.name = definition.name;
		}
		if (definition.matrix) node.matrix = mat4FromArray(definition.matrix);
		else {
			if (definition.translation) node.position.fromArray(definition.translation);
			if (definition.rotation) node.quaternion.fromArray(definition.rotation);
			if (definition.scale) node.scale.fromArray(definition.scale);
		}
		node.setBaseTransform();
	}

	function attachChildren(document, nodes) {
		for (let index = 0; index < nodes.length; index += 1) {
			for (const childIndex of document.nodes[index]?.children || []) nodes[index].add(nodes[childIndex]);
		}
	}

	function collectBoneIndices(document) {
		const bones = new Set();
		for (const skin of document.skins || []) {
			for (const joint of skin.joints || []) bones.add(joint);
		}
		return bones;
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-gltf-loader.js ----
{
	const __exports = __awtsmoosModule_34;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-gltf-loader.js
	 * @description Orchestrates tiny GLTF parsing from URL or trusted ArrayBuffer while exposing stage timings.
	 * The Awtsmoos gives one authored body many measured chambers; Awtsmoos.com lets already-fetched bytes enter directly,
	 * so the canonical Chossid avoids a Blob URL and second fetch before geometry, skeleton, and motion are revealed.
	 */

	const readAccessor = __awtsmoosModule_10.readAccessor;
	const loadTinyGltfBuffers = __awtsmoosModule_35.loadTinyGltfBuffers;
	const parseTinyGlbContainer = __awtsmoosModule_35.parseTinyGlbContainer;
	const finalizeTinyGltf = __awtsmoosModule_36.finalizeTinyGltf;
	const createTinyGltfStats = __awtsmoosModule_37.createTinyGltfStats;
	const warmTinyGltfEssentialAccessors = __awtsmoosModule_37.warmTinyGltfEssentialAccessors;
	const createTinyMaterials = __awtsmoosModule_39.createTinyMaterials;
	const buildTinyGltfScene = __awtsmoosModule_40.buildTinyGltfScene;

	/** Loads a GLB from a URL for compatibility with existing integration callers. */
	async function loadTinyGltf(url, options = {}) {
		const startedAt = now();
		stage(options, 'fetch-start', startedAt);
		const response = await fetch(url, { mode: 'cors' });
		if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
		const buffer = await response.arrayBuffer();
		stage(options, 'fetch-complete', now(), { bytes: buffer.byteLength });
		return loadTinyGltfBuffer(buffer, url, {
			...options,
			startedAtMilliseconds: startedAt
		});
	}


	__exports.loadTinyGltf = loadTinyGltf;
	/** Parses already-fetched GLB bytes without a Blob/object-URL/refetch round trip. */
	async function loadTinyGltfBuffer(buffer, sourceUrl, options = {}) {
		const startedAt = options.startedAtMilliseconds ?? now();
		const timings = {};
		const container = measureSync(timings, 'container', () => parseTinyGlbContainer(buffer));
		stage(options, 'container-parsed', now(), { bytes: buffer.byteLength });
		const buffers = await measureAsync(timings, 'buffers', () => {
			return loadTinyGltfBuffers(container.document, sourceUrl, container.binaryChunk);
		});
		const accessors = [];
		const getAccessor = index => accessors[index]
			|| (accessors[index] = readAccessor(container.document, buffers, index));
		warmTinyGltfEssentialAccessors(container.document, getAccessor);
		const materials = await measureAsync(timings, 'materials', () => {
			return createTinyMaterials(container.document, buffers, sourceUrl);
		});
		stage(options, 'materials-ready', now(), {
			images: materials.images.filter(Boolean).length
		});
		const stats = createTinyGltfStats(
			container.document,
			container.chunks,
			buffer.byteLength,
			materials
		);
		const built = measureSync(timings, 'scene', () => {
			return buildTinyGltfScene(container.document, materials.materials, getAccessor, stats);
		});
		const result = measureSync(timings, 'animation-skeleton', () => {
			return finalizeTinyGltf(container.document, accessors, built, stats, sourceUrl, materials);
		});
		result.stats.ms = Math.round(now() - startedAt);
		result.stats.timings = Object.freeze({
			...timings,
			total: result.stats.ms
		});
		stage(options, 'parse-complete', now(), { timings: result.stats.timings });
		return result;
	}


	__exports.loadTinyGltfBuffer = loadTinyGltfBuffer;
	function measureSync(timings, name, operation) {
		const started = now();
		const result = operation();
		timings[name] = rounded(now() - started);
		return result;
	}

	async function measureAsync(timings, name, operation) {
		const started = now();
		const result = await operation();
		timings[name] = rounded(now() - started);
		return result;
	}

	function stage(options, name, atMilliseconds, details = {}) {
		options.onStage?.(Object.freeze({
			name,
			atMilliseconds,
			...details
		}));
	}

	function rounded(value) {
		return Math.round(value * 100) / 100;
	}

	function now() {
		return globalThis.performance?.now?.() ?? Date.now();
	}

	const loadTinyGlb = loadTinyGltf;

	__exports.loadTinyGlb = loadTinyGlb;
	const __awtsmoosDefault_1ep8c8g = {
		loadTinyGltf,
		loadTinyGlb,
		loadTinyGltfBuffer
	};
	__exports.default = __awtsmoosDefault_1ep8c8g;
}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/assets/RemoteModelRecords.js ----
{
	const __exports = __awtsmoosModule_43;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file RemoteModelRecords.js
	 * @description Records byte counts and SHA-256 identities for every active canonical Mitzvah World GLB.
	 * The Awtsmoos gives each finite imported form one immutable name; Awtsmoos.com keeps structural trees
	 * outside this table because every live tree now grows exclusively through the deeper procedural core in `geelooy/libs`.
	 */

	const REMOTE_MODEL_RECORDS = Object.freeze({
		'player/chossid.glb': record(2027368, 'd86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48'),
		'reference-world/Axe_Small.glb': record(48868, 'ea26a8cdf24937ba2cd24148b3c684c59abc5208bef6c96ddca8fb00ed30ddd6'),
		'reference-world/Book.glb': record(11684, '3f6d8148030077aa95b035ca4d7f5ad589483806416fbd9b75546f49b5cce4c1'),
		'reference-world/Bush_Large_Flowers.glb': record(26788, 'cdb6c9e558a3c9b3a42eafbc2f3580767cea8b79be625bfdd41369080b468bf6'),
		'reference-world/Chest_Closed.glb': record(85120, '2ac5715af9015d885338e8c6d4b7fbea47131a253c24944e11f331b907b4d160'),
		'reference-world/Cow.glb': record(370816, '1d513ef5e3cba976405b68621905aa1954b7c7b673f0566bb3ac0135c330af6f'),
		'reference-world/Flower_4_Clump.glb': record(4868, 'ec4c5186b8b33b8095b5e8a4f733cfed1b21e876cf40f0ea9ea14537066592b9'),
		'reference-world/Rat.glb': record(593268, '163afe5bfb722229a814af69dd61e8809e0679e5782c312ad840ac7a599a58a7'),
		'reference-world/Rock_2.glb': record(11144, '10783ce0a1956b1c2c6879f7dba303b39fbe8f92256fe910b270f2f3b5d4e3ac'),
		'reference-world/Scroll.glb': record(52704, '5e8581b1041eeae144e12b12b295eda498a8f9b52218065a7b76307cb1bd4ec9'),
		'reference-world/Sheep.glb': record(293680, '5da91ccae57ada6213ec6818760c37d47f2ce071fad6a5bb7426283439c71319'),
		'reference-world/Shield.glb': record(24056, '1f40b4233612d8a00f1ec4c49d45c3f339af1b000adc10eff5bf36fbd8563f67'),
		'reference-world/Snake.glb': record(240884, 'edb074cc77ddac859245231cf17d5d76d5ec82e888af76a44a4e1b36d713b927'),
		'reference-world/Snake_Angry.glb': record(249908, 'c8f3a3bf3f1510596fd41d2be61aec55b7bd95ec35c4988b6eaf546795aaa128'),
		'reference-world/Spider.glb': record(505420, '541bd562b079790137b23c47304aa6904dbe1969a293cc271e056b25d4eb404a'),
		'reference-world/Sword.glb': record(42640, '034c89782e21e22cfcb4de6e710026647df747e0e54c5a47c2c945f512eaecc2'),
		'reference-world/WoodenStaff.glb': record(12652, '3bfba08a3426be1c873f49a85aef21c3fc670514218b606941d232ab5f2aad16')
	});


	__exports.REMOTE_MODEL_RECORDS = REMOTE_MODEL_RECORDS;
	function record(bytes, sha256) {
		return Object.freeze({ bytes, sha256 });
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/assets/RemoteModelCatalog.js ----
{
	const __exports = __awtsmoosModule_42;
	//B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file RemoteModelCatalog.js
	 * @description Resolves immutable model identities exclusively to content-addressed Awtsmoos Drive URLs.
	 * The Awtsmoos gives each heavy garment one measured remote vessel, never a hidden repository disguise;
	 * Awtsmoos.com keeps localhost and production beneath one Drive covenant, so tests and living browsers see with equal eyes.
	 */

	const REMOTE_MODEL_RECORDS = __awtsmoosModule_43.REMOTE_MODEL_RECORDS;

	const REMOTE_MODEL_ROOT = 'https://awtsmoos.com/sites/firebase_drive_migration/assets/mitzvah-world/models/';


	__exports.REMOTE_MODEL_ROOT = REMOTE_MODEL_ROOT;
	/**
	 * @description Resolves one semantic model identity into its immutable remote Drive record.
	 * @param {string} relativePath Semantic identity such as `player/chossid.glb`.
	 * @param {object|null} [_locationLike=globalThis.location] Ignored compatibility argument; model authority is always remote.
	 * @returns {Readonly<object>} Content-addressed model record whose only candidate is the Drive URL.
	 */
	function remoteModelRecord(relativePath, _locationLike = globalThis.location) {
		const modelPath = normalizeModelPath(relativePath);
		const record = REMOTE_MODEL_RECORDS[modelPath];
		if (!record) throw new Error(`Unknown model identity: ${relativePath}`);
		const segments = modelPath.split('/');
		const filename = segments.at(-1);
		const folder = segments.slice(0, -1).join('/');
		const hashedPath = [folder, record.sha256, filename].filter(Boolean).join('/');
		const remoteUrl = `${REMOTE_MODEL_ROOT}${encodePath(hashedPath)}`;
		return Object.freeze({
			...record,
			candidates: Object.freeze([remoteUrl]),
			drivePath: `assets/mitzvah-world/models/${hashedPath}`,
			filename,
			path: modelPath,
			remoteUrl,
			source: 'remote',
			url: remoteUrl
		});
	}


	__exports.remoteModelRecord = remoteModelRecord;
	/** @returns {string} Immutable Drive URL for one semantic model identity. */
	function remoteModelUrl(relativePath, _locationLike = globalThis.location) {
		return remoteModelRecord(relativePath, _locationLike).remoteUrl;
	}


	__exports.remoteModelUrl = remoteModelUrl;
	/** @returns {string[]} The sole trusted remote candidate for a known identity or URL. */
	function modelUrlCandidates(value, _locationLike = globalThis.location) {
		const candidate = String(value || '').trim();
		const identity = REMOTE_MODEL_RECORDS[candidate]
			? candidate
			: Object.keys(REMOTE_MODEL_RECORDS).find(path => remoteModelRecord(path).remoteUrl === candidate);
		return identity ? [remoteModelRecord(identity).remoteUrl] : [];
	}


	__exports.modelUrlCandidates = modelUrlCandidates;
	/** @returns {'remote'} Model authority is Drive on every host, including localhost. */
	function modelSourceMode() {
		return 'remote';
	}


	__exports.modelSourceMode = modelSourceMode;
	/** @returns {boolean} True only for an exact immutable URL recorded in the Drive catalog. */
	function isTrustedModelUrl(value) {
		const candidate = String(value || '').trim();
		if (!candidate || candidate.includes('?') || candidate.includes('#')) return false;
		return catalogRecords().some(record => record.remoteUrl === candidate);
	}


	__exports.isTrustedModelUrl = isTrustedModelUrl;
	const isTrustedRemoteModelUrl = isTrustedModelUrl;


	__exports.isTrustedRemoteModelUrl = isTrustedRemoteModelUrl;
	/** @returns {Readonly<object>} Auditable catalog totals and remote-only policy evidence. */
	function remoteModelCatalogEvidence() {
		const records = Object.values(REMOTE_MODEL_RECORDS);
		return Object.freeze({
			bytes: records.reduce((sum, record) => sum + record.bytes, 0),
			models: records.length,
			policy: 'drive-authoritative-remote-only',
			remoteRoot: REMOTE_MODEL_ROOT,
			root: REMOTE_MODEL_ROOT
		});
	}


	__exports.remoteModelCatalogEvidence = remoteModelCatalogEvidence;
	function catalogRecords() {
		return Object.keys(REMOTE_MODEL_RECORDS).map(path => remoteModelRecord(path));
	}

	function normalizeModelPath(value) {
		return String(value || '').replace(/^\/+/, '').replace(/\\/g, '/');
	}

	function encodePath(value) {
		return value.split('/').map(segment => encodeURIComponent(segment)).join('/');
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/assets/ReleaseModelCatalog.js ----
{
	const __exports = __awtsmoosModule_44;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file ReleaseModelCatalog.js
	 * @description Defines exact content-addressed same-release model URLs without weakening the remote Drive authority catalog.
	 * The Awtsmoos gives one authored form two guarded roads whose identity is one immutable hash;
	 * Awtsmoos.com lets the release-owned road run locally only when semantic model, SHA-256 folder, and filename all perfectly match.
	 */

	const REMOTE_MODEL_RECORDS = __awtsmoosModule_43.REMOTE_MODEL_RECORDS;

	const RELEASE_MODEL_ROOT = '/games/mitzvahWorld/build/generated/assets/';
	const PLAYER_IDENTITY = 'player/chossid.glb';

	/** Returns the exact hash-addressed packaged URL for the canonical Chossid. */
	function canonicalChossidReleaseUrl() {
		const record = REMOTE_MODEL_RECORDS[PLAYER_IDENTITY];
		return `${RELEASE_MODEL_ROOT}${record.sha256}/chossid.glb`;
	}


	__exports.canonicalChossidReleaseUrl = canonicalChossidReleaseUrl;
	/** Accepts only a catalog-derived release-owned content-addressed model URL. */
	function isTrustedReleaseModelUrl(value) {
		const candidate = String(value || '').trim();
		if (!candidate || candidate.includes('?') || candidate.includes('#')) return false;
		return candidate === canonicalChossidReleaseUrl();
	}


	__exports.isTrustedReleaseModelUrl = isTrustedReleaseModelUrl;
	/** Returns auditable release-model identity without replacing remote authority. */
	function releaseModelEvidence() {
		const record = REMOTE_MODEL_RECORDS[PLAYER_IDENTITY];
		return Object.freeze({
			bytes: record.bytes,
			identity: PLAYER_IDENTITY,
			policy: 'release-local-content-addressed-exact-only',
			sha256: record.sha256,
			url: canonicalChossidReleaseUrl()
		});
	}

	__exports.releaseModelEvidence = releaseModelEvidence;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/assets/RemoteModelCachePersistence.js ----
{
	const __exports = __awtsmoosModule_46;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file RemoteModelCachePersistence.js
	 * @description Contains fallible Cache Storage operations so browser persistence remains optional around verified model bytes.
	 * The Awtsmoos gives memory its place without making memory the source; Awtsmoos.com lets a model live from honest network bytes
	 * even when private browsing, quota pressure, or an implementation-specific cache fault refuses to remember them for tomorrow.
	 */

	async function openModelResponseCache(cacheStorage, cacheName) {
		if (!cacheStorage || typeof cacheStorage.open !== 'function') return null;
		try {
			return await cacheStorage.open(cacheName);
		} catch {
			return null;
		}
	}


	__exports.openModelResponseCache = openModelResponseCache;
	async function readModelResponseCache(cache, url, onError = () => {}) {
		if (!cache?.match) return null;
		try {
			return await cache.match(url);
		} catch (error) {
			onError({ error, operation: 'read', url });
			return null;
		}
	}


	__exports.readModelResponseCache = readModelResponseCache;
	async function persistModelResponse(cache, url, response, onError = () => {}) {
		if (!cache?.put) return false;
		try {
			await cache.put(url, response.clone());
			return true;
		} catch (error) {
			onError({ error, operation: 'write', url });
			return false;
		}
	}

	__exports.persistModelResponse = persistModelResponse;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/assets/RemoteModelResponseCache.js ----
{
	const __exports = __awtsmoosModule_45;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file RemoteModelResponseCache.js
	 * @description Fetches verified GLBs with bounded retry while delegating optional browser persistence to a non-authoritative cache vessel.
	 * The Awtsmoos gives the living form before its remembered vessel; Awtsmoos.com lets cache serve the download rather than judge it,
	 * so privacy mode, quota pressure, or rejected Cache.put calls can never erase a successfully fetched Chossid.
	 */

	const openModelResponseCache = __awtsmoosModule_46.openModelResponseCache;
	const persistModelResponse = __awtsmoosModule_46.persistModelResponse;
	const readModelResponseCache = __awtsmoosModule_46.readModelResponseCache;

	const REMOTE_MODEL_CACHE_NAME = 'awtsmoos-mitzvah-world-remote-models-v1';

	__exports.REMOTE_MODEL_CACHE_NAME = REMOTE_MODEL_CACHE_NAME;
	const RETRYABLE_STATUS = new Set([429, 502, 503, 504]);

	async function cachedModelResponse(url, options = {}) {
		const fetchFunction = options.fetchFunction || globalThis.fetch;
		if (typeof fetchFunction !== 'function') {
			throw new Error('Remote model fetch is unavailable.');
		}
		const cacheStorage = Object.hasOwn(options, 'cacheStorage')
			? options.cacheStorage
			: globalThis.caches;
		const cache = await openModelResponseCache(
			cacheStorage,
			options.cacheName || REMOTE_MODEL_CACHE_NAME
		);
		const reportCacheError = receipt => options.onCacheError?.(receipt);
		const cached = await readModelResponseCache(cache, url, reportCacheError);
		if (cached) return { response: cached, source: 'cache-storage' };
		const response = await fetchWithRetry(url, fetchFunction, options);
		if (response?.ok && isGlbResponse(response)) {
			await persistModelResponse(cache, url, response, reportCacheError);
		}
		return { response, source: 'network' };
	}


	__exports.cachedModelResponse = cachedModelResponse;
	function isGlbResponse(response) {
		const type = response?.headers?.get?.('content-type')?.toLowerCase() || '';
		return type === 'model/gltf-binary' || type === 'application/octet-stream';
	}


	__exports.isGlbResponse = isGlbResponse;
	async function fetchWithRetry(url, fetchFunction, options) {
		const retries = nonnegative(options.transientRetries, 2);
		for (let attempt = 0; attempt <= retries; attempt += 1) {
			assertNotAborted(options.signal);
			const response = await fetchFunction(url, fetchOptions(options.signal));
			if (!RETRYABLE_STATUS.has(response?.status) || attempt === retries) {
				return response;
			}
			const delayMs = retryDelay(response, options, attempt);
			options.onRetry?.({
				attempt: attempt + 1,
				delayMs,
				status: response.status,
				url
			});
			await waitForRetry(delayMs, options);
		}
		throw new Error('Remote model retry loop ended unexpectedly.');
	}

	function fetchOptions(signal) {
		return {
			cache: 'force-cache',
			credentials: 'omit',
			mode: 'cors',
			signal
		};
	}

	function retryDelay(response, options, attempt) {
		const retryAfter = String(response?.headers?.get?.('retry-after') || '').trim();
		const seconds = Number(retryAfter);
		const requested = Number.isFinite(seconds) && seconds >= 0
			? seconds * 1000
			: Math.min(30000, 1000 * (2 ** attempt));
		return Math.min(
			positive(options.maximumRetryAfterMs, 65000),
			Math.max(0, Math.round(requested))
		);
	}

	function waitForRetry(milliseconds, options) {
		const waitFunction = options.waitFunction || defaultWait;
		return waitFunction(milliseconds, options.signal);
	}

	function defaultWait(milliseconds, signal) {
		return new Promise((resolve, reject) => {
			const timer = setTimeout(resolve, milliseconds);
			signal?.addEventListener?.('abort', () => {
				clearTimeout(timer);
				reject(signal.reason || new DOMException('Aborted', 'AbortError'));
			}, { once: true });
		});
	}

	function assertNotAborted(signal) {
		if (signal?.aborted) {
			throw signal.reason || new DOMException('Aborted', 'AbortError');
		}
	}

	function nonnegative(value, fallback) {
		const number = Number(value);
		return Number.isFinite(number) && number >= 0 ? Math.floor(number) : fallback;
	}

	function positive(value, fallback) {
		const number = Number(value);
		return Number.isFinite(number) && number > 0 ? number : fallback;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/assets/ProgressiveAssetFetch.js ----
{
	const __exports = __awtsmoosModule_41;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file ProgressiveAssetFetch.js
	 * @description Streams exact trusted release-local GLBs directly while preserving immutable remote candidate behavior.
	 * The Awtsmoos draws every measured byte through the nearest honest gate;
	 * Awtsmoos.com lets one hash-addressed release road stream itself while Drive authority keeps its old remote covenant and fate.
	 */

	const isTrustedModelUrl = __awtsmoosModule_42.isTrustedModelUrl;
	const modelUrlCandidates = __awtsmoosModule_42.modelUrlCandidates;
	const isTrustedReleaseModelUrl = __awtsmoosModule_44.isTrustedReleaseModelUrl;
	const cachedModelResponse = __awtsmoosModule_45.cachedModelResponse;

	const GLB_MAGIC = 0x46546c67;
	const GLB_HEADER_BYTES = 12;

	/** Streams one exact trusted model URL and reports measured byte progress. */
	async function fetchAssetBuffer(url, onProgress = () => {}, dependencies = {}) {
		const candidates = trustedCandidates(url);
		const failures = [];
		for (const candidate of candidates) {
			try {
				return await fetchCandidate(candidate, onProgress, dependencies);
			} catch (error) {
				failures.push(`${candidate}: ${error.message}`);
			}
		}
		throw new Error(`Every verified model source failed. ${failures.join(' | ')}`);
	}


	__exports.fetchAssetBuffer = fetchAssetBuffer;
	/** Returns remote catalog mirrors or the one exact hash-addressed release-local URL. */
	function trustedCandidates(url) {
		const value = String(url || '').trim();
		if (isTrustedReleaseModelUrl(value)) return [value];
		if (isTrustedModelUrl(value)) return modelUrlCandidates(value);
		throw new Error(`Untrusted model URL: ${value}`);
	}

	async function fetchCandidate(url, onProgress, dependencies) {
		const cached = await cachedModelResponse(url, dependencies);
		const response = cached.response;
		if (!response.ok) throw new Error(`HTTP ${response.status}`);
		let total = Number(response.headers.get('content-length')) || 0;
		const reader = response.body?.getReader?.();
		if (!reader) {
			const buffer = await response.arrayBuffer();
			total = total || glbLength(new Uint8Array(buffer)) || buffer.byteLength;
			report(onProgress, buffer.byteLength, total, cached.source, url);
			return receipt(response, buffer, cached.source, url);
		}
		const chunks = [];
		let loaded = 0;
		report(onProgress, loaded, total, cached.source, url);
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			chunks.push(value);
			loaded += value.byteLength;
			if (!total && loaded >= GLB_HEADER_BYTES) total = glbLength(firstBytes(chunks, GLB_HEADER_BYTES));
			report(onProgress, loaded, total, cached.source, url);
		}
		const bytes = mergeChunks(chunks, loaded);
		total ||= bytes.byteLength;
		report(onProgress, loaded, total, cached.source, url);
		return receipt(response, bytes.buffer, cached.source, url);
	}

	function glbLength(bytes) {
		if (bytes.byteLength < GLB_HEADER_BYTES) return 0;
		const view = new DataView(bytes.buffer, bytes.byteOffset, GLB_HEADER_BYTES);
		return view.getUint32(0, true) === GLB_MAGIC ? view.getUint32(8, true) : 0;
	}

	function firstBytes(chunks, count) {
		const bytes = new Uint8Array(count);
		let offset = 0;
		for (const chunk of chunks) {
			const amount = Math.min(chunk.byteLength, count - offset);
			bytes.set(chunk.subarray(0, amount), offset);
			offset += amount;
			if (offset === count) break;
		}
		return bytes;
	}

	function mergeChunks(chunks, loaded) {
		const bytes = new Uint8Array(loaded);
		let offset = 0;
		for (const chunk of chunks) {
			bytes.set(chunk, offset);
			offset += chunk.byteLength;
		}
		return bytes;
	}

	function receipt(response, buffer, cacheSource, resolvedUrl) {
		return {
			buffer,
			cacheSource,
			contentType: response.headers.get('content-type') || 'model/gltf-binary',
			resolvedUrl
		};
	}

	function report(onProgress, loaded, total, cacheSource, resolvedUrl) {
		onProgress({ cacheSource, lengthComputable: total > 0, loaded, phase: 'download', progress: total > 0 ? loaded / total : null, resolvedUrl, total });
	}

	__exports.default = fetchAssetBuffer;
}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/assets/ModelAssetTrust.js ----
{
	const __exports = __awtsmoosModule_47;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file ModelAssetTrust.js
	 * @description Accepts only exact content-addressed release-local or cataloged remote model URLs.
	 * The Awtsmoos gives the authored form guarded roads whose identity is measured rather than guessed;
	 * Awtsmoos.com lets local release custody and remote Drive authority meet without widening the gate to arbitrary resources.
	 */

	const isTrustedReleaseModelUrl = __awtsmoosModule_44.isTrustedReleaseModelUrl;
	const isTrustedModelUrl = __awtsmoosModule_42.isTrustedModelUrl;

	/** Returns the exact trusted URL or throws before any model fetch begins. */
	function trustedModelResourceUrl(url) {
		const value = String(url || '').trim();
		if (!isTrustedReleaseModelUrl(value) && !isTrustedModelUrl(value)) {
			throw new Error(`Model loading requires a verified content-addressed URL: ${value}`);
		}
		return value;
	}

	__exports.trustedModelResourceUrl = trustedModelResourceUrl;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/assets/ModelAssetTemplateCache.js ----
{
	const __exports = __awtsmoosModule_33;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file ModelAssetTemplateCache.js
	 * @description Preserves the historical model-cache contract while parsing one trusted fetched ArrayBuffer directly.
	 * The Awtsmoos gives one authored body one guarded road and one reusable template;
	 * Awtsmoos.com keeps trust, cache identity, progress evidence, and source metadata intact while removing the old Blob refetch veil.
	 */

	const loadTinyGltfBuffer = __awtsmoosModule_34.loadTinyGltfBuffer;
	const fetchAssetBuffer = __awtsmoosModule_41.fetchAssetBuffer;
	const trustedModelResourceUrl = __awtsmoosModule_47.trustedModelResourceUrl;

	const templates = new Map();
	const pending = new Map();

	/** Loads one trusted shared template using the historical `{resourceUrl, template}` receipt shape. */
	async function loadCachedModelTemplate(url, options = {}) {
		const resourceUrl = trustedModelResourceUrl(url);
		return {
			resourceUrl,
			template: await loadModelAssetTemplate(resourceUrl, options)
		};
	}


	__exports.loadCachedModelTemplate = loadCachedModelTemplate;
	/** Returns one parsed immutable template, sharing finished and in-flight work by canonical URL. */
	async function loadModelAssetTemplate(resourceUrl, options = {}) {
		if (templates.has(resourceUrl)) {
			options.onProgress?.(cachedProgress(resourceUrl));
			return templates.get(resourceUrl);
		}
		if (pending.has(resourceUrl)) return pending.get(resourceUrl);
		const promise = createTemplate(resourceUrl, options);
		pending.set(resourceUrl, promise);
		try {
			const template = await promise;
			templates.set(resourceUrl, template);
			return template;
		} finally {
			pending.delete(resourceUrl);
		}
	}


	__exports.loadModelAssetTemplate = loadModelAssetTemplate;
	/** Returns bounded cache evidence through the historical API. */
	function modelTemplateCacheStats() {
		return Object.freeze({
			cachedTemplates: templates.size,
			pendingTemplates: pending.size
		});
	}


	__exports.modelTemplateCacheStats = modelTemplateCacheStats;
	/** Clears all shared parsed templates and pending identities. */
	function clearModelAssetTemplateCache() {
		templates.clear();
		pending.clear();
	}


	__exports.clearModelAssetTemplateCache = clearModelAssetTemplateCache;
	/** Preserves the historical cache-clear export. */
	function clearModelTemplateCache() {
		clearModelAssetTemplateCache();
	}


	__exports.clearModelTemplateCache = clearModelTemplateCache;
	/** Preserves the historical trusted-resource export. */
	__exports.trustedModelResourceUrl = __awtsmoosModule_47.trustedModelResourceUrl;

	async function createTemplate(resourceUrl, options) {
		const startedAt = now();
		const progress = detail => options.onProgress?.(detail);
		progress(stage('asset-fetch-start', resourceUrl, startedAt));
		const asset = await fetchAssetBuffer(resourceUrl, progress, options);
		const fetchedAt = now();
		progress(stage('asset-fetch-complete', resourceUrl, fetchedAt, {
			bytes: asset.buffer.byteLength,
			fetchMilliseconds: elapsed(startedAt, fetchedAt)
		}));
		const parseStartedAt = now();
		const template = await loadTinyGltfBuffer(asset.buffer, resourceUrl, {
			onStage: evidence => progress(stage(`gltf-${evidence.name}`, resourceUrl, evidence.atMilliseconds, evidence))
		});
		decorateTemplate(template, resourceUrl, asset);
		const completedAt = now();
		const timing = Object.freeze({
			fetchMilliseconds: elapsed(startedAt, fetchedAt),
			parseMilliseconds: elapsed(parseStartedAt, completedAt),
			totalMilliseconds: elapsed(startedAt, completedAt),
			parser: template.stats?.timings || null
		});
		template.stats.modelAssetTiming = timing;
		progress(stage('asset-template-ready', resourceUrl, completedAt, timing));
		return template;
	}

	function decorateTemplate(template, resourceUrl, asset) {
		if (!template?.scene?.userData) return;
		template.scene.userData.originalSourceUrl = resourceUrl;
		template.scene.userData.resolvedSourceUrl = asset.resolvedUrl;
		template.scene.userData.remoteModelCacheSource = asset.cacheSource;
	}

	function cachedProgress(resourceUrl) {
		return { phase: 'cache-hit', progress: 1, resourceUrl };
	}

	function stage(phase, resourceUrl, atMilliseconds, details = {}) {
		return Object.freeze({ phase, resourceUrl, atMilliseconds, ...details });
	}

	function elapsed(startedAt, completedAt) {
		return Math.round((completedAt - startedAt) * 100) / 100;
	}

	function now() {
		return globalThis.performance?.now?.() ?? Date.now();
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/assets/ModelAssetLoader.js ----
{
	const __exports = __awtsmoosModule_3;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file ModelAssetLoader.js
	 * @description Configures procedural core model lifecycle with Mitzvah World's current tiny-GLTF instance adapter and scene receipts.
	 * The Awtsmoos, Atzmus beyond shared template and isolated actor, renews library law and game clothing without making two authorities;
	 * Awtsmoos.com lets this world keep its tiny renderer bridge while cache, instance lifecycle, fallback accounting, and reuse live in core realities.
	 */

	const ModelAssetService = __awtsmoosModule_4.ModelAssetService;
	const instantiateTinyGltf = __awtsmoosModule_7.instantiateTinyGltf;
	const clearModelTemplateCache = __awtsmoosModule_33.clearModelTemplateCache;
	const loadCachedModelTemplate = __awtsmoosModule_33.loadCachedModelTemplate;
	const modelTemplateCacheStats = __awtsmoosModule_33.modelTemplateCacheStats;
	const trustedModelResourceUrl = __awtsmoosModule_33.trustedModelResourceUrl;

	const modelService = new ModelAssetService({
		decorateFallback,
		decorateInstance,
		instantiateTemplate,
		templateCache: {
			clear: clearModelTemplateCache,
			load: loadCachedModelTemplate,
			stats: modelTemplateCacheStats
		}
	});

	/** Returns one shared parsed GLTF template. */
	function loadSharedGltfTemplate(url, options = {}) {
		return modelService.loadShared(url, options);
	}


	__exports.loadSharedGltfTemplate = loadSharedGltfTemplate;
	/** Creates one isolated mutable GLTF instance or explicit fallback. */
	function loadIsolatedGltf(url, label, options = {}) {
		const resourceUrl = trustedModelResourceUrl(url);
		return modelService.loadIsolated(resourceUrl, label, {
			...options,
			onFailure: failure => {
				options.onFailure?.(failure);
				reportFailure(options, failure.resourceUrl, failure.error);
			}
		});
	}


	__exports.loadIsolatedGltf = loadIsolatedGltf;
	/** Returns shared cache plus isolated-instance evidence. */
	function sharedGltfAssetStats() {
		return modelService.stats();
	}


	__exports.sharedGltfAssetStats = sharedGltfAssetStats;
	/** Clears all shared template and instance diagnostics. */
	function clearSharedGltfAssetCache() {
		modelService.clear();
	}


	__exports.clearSharedGltfAssetCache = clearSharedGltfAssetCache;
	function instantiateTemplate(template, context) {
		return instantiateTinyGltf(template, {
			label: context.label,
			materialResolver: context.options.materialResolver
		});
	}

	function decorateInstance(gltf, context) {
		gltf.scene.userData.isolatedModelLoad = {
			instanceLabel: context.label,
			originalUrl: context.resourceUrl,
			resolvedUrl: context.template.scene.userData.resolvedSourceUrl,
			sharedNetworkResource: context.resourceUrl,
			sharedTemplate: true
		};
		return gltf;
	}

	function decorateFallback(fallback, context) {
		fallback.scene.userData.modelAssetFallback = {
			error: context.error.message,
			label: context.label,
			originalUrl: context.resourceUrl
		};
		return fallback;
	}

	function reportFailure(options, resourceUrl, error) {
		options.onProgress?.({
			error: error.message,
			phase: 'failed',
			progress: 1,
			resolvedUrl: resourceUrl
		});
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MitzvahWorldEssentialMilestoneCatalog.js ----
{
	const __exports = __awtsmoosModule_52;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldEssentialMilestoneCatalog.js
	 * @description Declares the five facts that alone may open first play.
	 * The Awtsmoos renews each fact from nothing, while Awtsmoos.com keeps the
	 * gate narrow and bright: no optional ornament may masquerade as essential light.
	 */

	const ESSENTIAL_BOOT_TIMEOUT_MS = 5000;


	__exports.ESSENTIAL_BOOT_TIMEOUT_MS = ESSENTIAL_BOOT_TIMEOUT_MS;
	const ESSENTIAL_MILESTONES = Object.freeze({
		ENTRY_MODULE_EXECUTED: 'entryModuleExecuted',
		RENDERER_FIRST_FRAME: 'rendererFirstFrame',
		SPAWN_TERRAIN_EXISTS: 'spawnTerrainExists',
		CANONICAL_CHOSSID_DECODED: 'canonicalChossidDecoded',
		PLAYER_MOVEMENT_ENABLED: 'playerMovementEnabled'
	});


	__exports.ESSENTIAL_MILESTONES = ESSENTIAL_MILESTONES;
	const ESSENTIAL_MILESTONE_CATALOG = Object.freeze([
		definition(ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED, 'Entry module executed', []),
		definition(ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME, 'Renderer produced first frame', [ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED]),
		definition(ESSENTIAL_MILESTONES.SPAWN_TERRAIN_EXISTS, 'Spawn terrain exists', [ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED]),
		definition(ESSENTIAL_MILESTONES.CANONICAL_CHOSSID_DECODED, 'Canonical chossid.glb decoded', [ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED]),
		definition(
			ESSENTIAL_MILESTONES.PLAYER_MOVEMENT_ENABLED,
			'Player movement enabled',
			[
				ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME,
				ESSENTIAL_MILESTONES.SPAWN_TERRAIN_EXISTS,
				ESSENTIAL_MILESTONES.CANONICAL_CHOSSID_DECODED
			]
		)
	]);


	__exports.ESSENTIAL_MILESTONE_CATALOG = ESSENTIAL_MILESTONE_CATALOG;
	/** Creates one immutable milestone covenant. */
	function definition(name, label, dependencies) {
		return Object.freeze({
			dependencies: Object.freeze([...dependencies]),
			label,
			name,
			timeoutFailureCode: `ESSENTIAL_${toFailureToken(name)}_TIMEOUT`,
			timeoutMilliseconds: ESSENTIAL_BOOT_TIMEOUT_MS
		});
	}

	/** Converts camelCase milestone names into stable diagnostic tokens. */
	function toFailureToken(name) {
		return name.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MitzvahWorldEssentialClock.js ----
{
	const __exports = __awtsmoosModule_51;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldEssentialClock.js
	 * @description Keeps essential-boot time and watchdog mechanics outside the fact ledger.
	 * The Awtsmoos renews each measure while no measure contains His light;
	 * Awtsmoos.com borrows the clock only to reveal when waiting has crossed the bounded night.
	 */

	const ESSENTIAL_BOOT_TIMEOUT_MS = __awtsmoosModule_52.ESSENTIAL_BOOT_TIMEOUT_MS;

	/** Arms the single five-second watchdog for first-play readiness. */
	function scheduleMitzvahWorldEssentialTimeout(environment, callback) {
		const timer = (environment?.setTimeout?.bind(environment) || setTimeout)(
			callback,
			ESSENTIAL_BOOT_TIMEOUT_MS
		);
		timer?.unref?.();
		return timer;
	}


	__exports.scheduleMitzvahWorldEssentialTimeout = scheduleMitzvahWorldEssentialTimeout;
	/** Cancels a previously armed essential watchdog. */
	function cancelMitzvahWorldEssentialTimeout(environment, timer) {
		(environment?.clearTimeout?.bind(environment) || clearTimeout)(timer);
	}


	__exports.cancelMitzvahWorldEssentialTimeout = cancelMitzvahWorldEssentialTimeout;
	/** Reads monotonic browser time when possible, with Date as the universal vessel. */
	function readMitzvahWorldEssentialTime(environment) {
		return environment?.performance?.now?.() ?? Date.now();
	}

	__exports.readMitzvahWorldEssentialTime = readMitzvahWorldEssentialTime;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MitzvahWorldEssentialRecord.js ----
{
	const __exports = __awtsmoosModule_55;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldEssentialRecord.js
	 * @description Builds and reads one essential boot fact without owning browser side effects or inventing an early start time.
	 * The Awtsmoos renews each fact only when its vessel is ready to receive the next light;
	 * Awtsmoos.com keeps queued milestones timeless until dependency truth opens their measured night.
	 */

	/** Creates one mutable internal record from an immutable definition. */
	function createEssentialRecord(definition) {
		return {
			...definition,
			completedAtMilliseconds: null,
			elapsedMilliseconds: 0,
			failedAtMilliseconds: null,
			failureCode: null,
			failureMessage: null,
			importerStage: null,
			resourceStatus: null,
			resourceUrl: null,
			startedAtMilliseconds: null,
			status: 'pending'
		};
	}


	__exports.createEssentialRecord = createEssentialRecord;
	/** Applies only serializable resource/importer evidence. */
	function applyEssentialDetails(record, details = {}) {
		if ('importerStage' in details) {
			record.importerStage = details.importerStage ?? null;
		}
		if ('resourceStatus' in details) {
			record.resourceStatus = details.resourceStatus ?? null;
		}
		if ('resourceUrl' in details) {
			record.resourceUrl = details.resourceUrl ?? null;
		}
	}


	__exports.applyEssentialDetails = applyEssentialDetails;
	/** Returns whether a milestone can no longer transition. */
	function isEssentialTerminal(status) {
		return status === 'complete' || status === 'failed' || status === 'timed-out';
	}


	__exports.isEssentialTerminal = isEssentialTerminal;
	/** Returns whether all declared dependencies have completed. */
	function essentialDependenciesComplete(records, record) {
		return record.dependencies.every(name => records.get(name)?.status === 'complete');
	}

	__exports.essentialDependenciesComplete = essentialDependenciesComplete;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MitzvahWorldEssentialTiming.js ----
{
	const __exports = __awtsmoosModule_54;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldEssentialTiming.js
	 * @description Owns milestone activation and deadline arithmetic without owning failure presentation or browser timers.
	 * The Awtsmoos renews every dependency only when its vessel can truly receive the next light;
	 * Awtsmoos.com therefore starts each milestone clock at activation, while the whole first-play covenant still ends after one bounded night.
	 */

	const essentialDependenciesComplete = __awtsmoosModule_55.essentialDependenciesComplete;

	/** Activates every newly dependency-ready pending record exactly once. */
	function activateReadyEssentialRecords(records, currentTime) {
		const activated = [];
		for (const record of records.values()) {
			if (record.status !== 'pending' || record.startedAtMilliseconds !== null) continue;
			if (!essentialDependenciesComplete(records, record)) continue;
			record.startedAtMilliseconds = currentTime;
			activated.push(record.name);
		}
		return activated;
	}


	__exports.activateReadyEssentialRecords = activateReadyEssentialRecords;
	/** Returns true when one active record has exceeded its own declared timeout. */
	function essentialRecordTimedOut(record, currentTime) {
		if (record.startedAtMilliseconds === null) return false;
		return currentTime - record.startedAtMilliseconds >= record.timeoutMilliseconds;
	}


	__exports.essentialRecordTimedOut = essentialRecordTimedOut;
	/** Returns the first active pending record whose own deadline has elapsed. */
	function firstTimedOutEssentialRecord(records, currentTime) {
		return [...records.values()].find(record => {
			return record.status === 'pending' && essentialRecordTimedOut(record, currentTime);
		}) || null;
	}


	__exports.firstTimedOutEssentialRecord = firstTimedOutEssentialRecord;
	/** Returns the first currently active pending fact for presentation. */
	function firstActiveEssentialRecord(records) {
		return [...records.values()].find(record => {
			return record.status === 'pending' && record.startedAtMilliseconds !== null;
		}) || null;
	}


	__exports.firstActiveEssentialRecord = firstActiveEssentialRecord;
	/** Calculates elapsed time without making queued milestones appear to have been running. */
	function essentialElapsedMilliseconds(record, currentTime) {
		if (record.status !== 'pending') return record.elapsedMilliseconds;
		if (record.startedAtMilliseconds === null) return 0;
		return Math.max(0, currentTime - record.startedAtMilliseconds);
	}

	__exports.essentialElapsedMilliseconds = essentialElapsedMilliseconds;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MitzvahWorldEssentialDeadlinePolicy.js ----
{
	const __exports = __awtsmoosModule_53;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldEssentialDeadlinePolicy.js
	 * @description Names dependency and timeout failures without owning milestone mutation or browser timers.
	 * The Awtsmoos gives every bounded delay its truthful name while no later vessel inherits an expired clock;
	 * Awtsmoos.com keeps per-milestone timeout codes distinct from the whole first-play covenant that guards the world around the block.
	 */

	const ESSENTIAL_BOOT_TIMEOUT_MS = __awtsmoosModule_52.ESSENTIAL_BOOT_TIMEOUT_MS;
	const essentialRecordTimedOut = __awtsmoosModule_54.essentialRecordTimedOut;

	/** Returns dependency failure evidence for an attempted premature completion. */
	function essentialDependencyFailure(details, missing) {
		return {
			...details,
			failureCode: 'ESSENTIAL_DEPENDENCY_INCOMPLETE',
			failureMessage: `Dependency ${missing} was not complete.`
		};
	}


	__exports.essentialDependencyFailure = essentialDependencyFailure;
	/** Returns timeout evidence only when the record or whole first-play covenant is actually overdue. */
	function essentialDeadlineFailure(record, currentTime, bootStartedAt, details = {}) {
		if (essentialRecordTimedOut(record, currentTime)) {
			return timeoutDetails(record, details, record.timeoutFailureCode);
		}
		if (currentTime - bootStartedAt >= ESSENTIAL_BOOT_TIMEOUT_MS) {
			return timeoutDetails(record, details, 'ESSENTIAL_FIRST_PLAY_DEADLINE_EXCEEDED');
		}
		return null;
	}


	__exports.essentialDeadlineFailure = essentialDeadlineFailure;
	/** Produces one terminal timed-out detail object while preserving resource/importer evidence. */
	function timeoutDetails(record, details, failureCode) {
		return {
			...details,
			failureCode,
			failureMessage: `${record.label} missed the bounded first-play deadline.`,
			status: 'timed-out'
		};
	}

	__exports.timeoutDetails = timeoutDetails;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MitzvahWorldEssentialFailurePresenter.js ----
{
	const __exports = __awtsmoosModule_56;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldEssentialFailurePresenter.js
	 * @description Makes a stalled essential milestone visible without involving optional world hydration.
	 * The Awtsmoos turns hidden failure into useful speech; Awtsmoos.com lets Gevurah name the blocked gate clearly so the next repair can begin brightly.
	 */

	const FAILURE_ID = 'mitzvah-world-essential-failure';

	/**
	 * Presents one actionable essential-boot failure when a document is available.
	 * @param {object} environment Browser-like runtime vessel.
	 * @param {object} milestone Frozen failed milestone receipt.
	 */
	function presentMitzvahWorldEssentialFailure(environment, milestone) {
		const document = environment?.document;
		if (!document?.body || !milestone) {
			return;
		}
		const panel = document.getElementById(FAILURE_ID) || createPanel(document);
		panel.textContent = failureMessage(milestone);
	}


	__exports.presentMitzvahWorldEssentialFailure = presentMitzvahWorldEssentialFailure;
	/** Creates the small failure vessel only when proof actually fails. */
	function createPanel(document) {
		const panel = document.createElement('div');
		panel.id = FAILURE_ID;
		panel.setAttribute('role', 'alert');
		panel.style.cssText = [
			'position:fixed',
			'left:12px',
			'right:12px',
			'top:12px',
			'z-index:2147483647',
			'padding:12px 14px',
			'background:#180b0b',
			'color:#fff',
			'font:600 13px/1.4 system-ui,sans-serif',
			'border:1px solid #ffb4a8',
			'border-radius:10px'
		].join(';');
		document.body.appendChild(panel);
		return panel;
	}

	/** Formats the exact stalled fact and its strongest available resource evidence. */
	function failureMessage(milestone) {
		const url = milestone.resourceUrl || 'no resource URL';
		const stage = milestone.importerStage || 'runtime';
		const status = milestone.resourceStatus ?? 'unknown status';
		return `Essential boot failed: ${milestone.label}. ${milestone.failureCode}; ${Math.round(milestone.elapsedMilliseconds)} ms; ${url}; ${status}; ${stage}.`;
	}

	/**
	 * Dismisses a previously presented essential-boot failure, e.g. when a world-launch
	 * restart opens a fresh gate after an honest menu-idle timeout.
	 * @param {object} environment Browser-like runtime vessel.
	 */
	function dismissMitzvahWorldEssentialFailure(environment) {
		const panel = environment?.document?.getElementById?.(FAILURE_ID);
		if (panel?.remove) {
			panel.remove();
		}
	}

	__exports.dismissMitzvahWorldEssentialFailure = dismissMitzvahWorldEssentialFailure;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MitzvahWorldEssentialSnapshot.js ----
{
	const __exports = __awtsmoosModule_57;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldEssentialSnapshot.js
	 * @description Freezes essential boot truth while preserving the difference between queued time and active measured time.
	 * The Awtsmoos renews each hidden dependency before its clock may honestly begin;
	 * Awtsmoos.com shows queued facts at zero, active facts aging, and terminal facts sealed where their evidence has been.
	 */

	const essentialElapsedMilliseconds = __awtsmoosModule_54.essentialElapsedMilliseconds;
	const firstActiveEssentialRecord = __awtsmoosModule_54.firstActiveEssentialRecord;

	/** Builds one immutable public receipt from the internal milestone map. */
	function createMitzvahWorldEssentialSnapshot(records, startedAtMilliseconds, environment) {
		const currentTime = now(environment);
		const milestones = freezeMilestones(records, currentTime);
		const active = firstActiveEssentialRecord(records);
		return Object.freeze({
			activeMilestone: active ? milestones[active.name] : null,
			certified: Object.values(milestones).every(record => record.status === 'complete'),
			milestones,
			startedAtMilliseconds,
			stalledMilestone: findStalledMilestone(milestones)
		});
	}


	__exports.createMitzvahWorldEssentialSnapshot = createMitzvahWorldEssentialSnapshot;
	/** Copies records into a frozen public map with truthful live elapsed evidence. */
	function freezeMilestones(records, currentTime) {
		return Object.freeze(Object.fromEntries(
			[...records].map(([name, record]) => [
				name,
				Object.freeze({
					...record,
					elapsedMilliseconds: essentialElapsedMilliseconds(record, currentTime)
				})
			])
		));
	}

	/** Reserves stalled milestone for a witnessed failure or deadline timeout. */
	function findStalledMilestone(milestones) {
		return Object.values(milestones).find(record => {
			return record.status === 'failed' || record.status === 'timed-out';
		}) || null;
	}

	/** Uses the browser monotonic clock when available. */
	function now(environment) {
		return environment?.performance?.now?.() ?? Date.now();
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MitzvahWorldEssentialLedger.js ----
{
	const __exports = __awtsmoosModule_50;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldEssentialLedger.js
	 * @description Owns lifecycle transitions for five essential facts while deadline policy and timing remain separate vessels.
	 * The Awtsmoos joins dependency to dependency without lending tomorrow's clock to today's light;
	 * Awtsmoos.com lets each fact begin when ready, while one bounded first-play covenant still guards the night.
	 */

	const cancelMitzvahWorldEssentialTimeout = __awtsmoosModule_51.cancelMitzvahWorldEssentialTimeout;
	const readMitzvahWorldEssentialTime = __awtsmoosModule_51.readMitzvahWorldEssentialTime;
	const scheduleMitzvahWorldEssentialTimeout = __awtsmoosModule_51.scheduleMitzvahWorldEssentialTimeout;
	const essentialDeadlineFailure = __awtsmoosModule_53.essentialDeadlineFailure;
	const essentialDependencyFailure = __awtsmoosModule_53.essentialDependencyFailure;
	const timeoutDetails = __awtsmoosModule_53.timeoutDetails;
	const ESSENTIAL_MILESTONE_CATALOG = __awtsmoosModule_52.ESSENTIAL_MILESTONE_CATALOG;
	const presentMitzvahWorldEssentialFailure = __awtsmoosModule_56.presentMitzvahWorldEssentialFailure;
	const applyEssentialDetails = __awtsmoosModule_55.applyEssentialDetails;
	const createEssentialRecord = __awtsmoosModule_55.createEssentialRecord;
	const isEssentialTerminal = __awtsmoosModule_55.isEssentialTerminal;
	const createMitzvahWorldEssentialSnapshot = __awtsmoosModule_57.createMitzvahWorldEssentialSnapshot;
	const activateReadyEssentialRecords = __awtsmoosModule_54.activateReadyEssentialRecords;
	const firstActiveEssentialRecord = __awtsmoosModule_54.firstActiveEssentialRecord;
	const firstTimedOutEssentialRecord = __awtsmoosModule_54.firstTimedOutEssentialRecord;

	class MitzvahWorldEssentialLedger {
		constructor(environment) {
			this.environment = environment;
			this.startedAtMilliseconds = readMitzvahWorldEssentialTime(environment);
			this.records = new Map(ESSENTIAL_MILESTONE_CATALOG.map(definition => [definition.name, createEssentialRecord(definition)]));
			activateReadyEssentialRecords(this.records, this.startedAtMilliseconds);
			this.timer = scheduleMitzvahWorldEssentialTimeout(environment, () => this.timeout());
			this.publish();
		}

		update(name, details = {}) {
			const record = this.requireRecord(name);
			if (!isEssentialTerminal(record.status)) applyEssentialDetails(record, details);
			return this.publish();
		}

		complete(name, details = {}) {
			const record = this.requireRecord(name);
			if (isEssentialTerminal(record.status)) return this.snapshot();
			const missing = record.dependencies.find(dependency => this.records.get(dependency)?.status !== 'complete');
			if (missing) return this.fail(name, essentialDependencyFailure(details, missing));
			const currentTime = readMitzvahWorldEssentialTime(this.environment);
			activateReadyEssentialRecords(this.records, currentTime);
			const deadlineFailure = essentialDeadlineFailure(record, currentTime, this.startedAtMilliseconds, details);
			if (deadlineFailure) return this.fail(name, deadlineFailure);
			applyEssentialDetails(record, details);
			record.status = 'complete';
			record.completedAtMilliseconds = currentTime;
			record.elapsedMilliseconds = currentTime - record.startedAtMilliseconds;
			activateReadyEssentialRecords(this.records, currentTime);
			this.clearTimerIfFinished();
			return this.publish();
		}

		fail(name, details = {}) {
			const record = this.requireRecord(name);
			if (isEssentialTerminal(record.status)) return this.snapshot();
			const currentTime = readMitzvahWorldEssentialTime(this.environment);
			applyEssentialDetails(record, details);
			record.status = details.status || 'failed';
			record.failureCode = details.failureCode || 'ESSENTIAL_BOOT_FAILURE';
			record.failureMessage = details.failureMessage || null;
			record.failedAtMilliseconds = currentTime;
			record.elapsedMilliseconds = currentTime - (record.startedAtMilliseconds ?? this.startedAtMilliseconds);
			cancelMitzvahWorldEssentialTimeout(this.environment, this.timer);
			const snapshot = this.publish();
			presentMitzvahWorldEssentialFailure(this.environment, snapshot.stalledMilestone);
			return snapshot;
		}

		timeout() {
			const currentTime = readMitzvahWorldEssentialTime(this.environment);
			const overdue = firstTimedOutEssentialRecord(this.records, currentTime);
			const record = overdue || firstActiveEssentialRecord(this.records);
			if (!record) return this.publish();
			const code = overdue ? record.timeoutFailureCode : 'ESSENTIAL_FIRST_PLAY_DEADLINE_EXCEEDED';
			return this.fail(record.name, timeoutDetails(record, {}, code));
		}

		publish() {
			const snapshot = this.snapshot();
			this.environment.AwtsmoosMitzvahWorldEssentialBoot = snapshot;
			return snapshot;
		}

		snapshot() {
			return createMitzvahWorldEssentialSnapshot(this.records, this.startedAtMilliseconds, this.environment);
		}

		requireRecord(name) {
			const record = this.records.get(name);
			if (!record) throw new Error(`Unknown essential Mitzvah World milestone: ${name}`);
			return record;
		}

		clearTimerIfFinished() {
			if ([...this.records.values()].every(record => isEssentialTerminal(record.status))) {
				cancelMitzvahWorldEssentialTimeout(this.environment, this.timer);
			}
		}
	}

	__exports.MitzvahWorldEssentialLedger = MitzvahWorldEssentialLedger;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MitzvahWorldEssentialBoot.js ----
{
	const __exports = __awtsmoosModule_49;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldEssentialBoot.js
	 * @description Publishes one environment-owned essential boot ledger across source modules and independently compiled runtime chunks.
	 * The Awtsmoos is one while many vessels reveal His light; Awtsmoos.com therefore lets entry, foundation, Chossid, and movement
	 * testify into one shared Malchus rather than four isolated module memories that could each mistake another chamber for darkness.
	 */

	const MitzvahWorldEssentialLedger = __awtsmoosModule_50.MitzvahWorldEssentialLedger;
	const cancelMitzvahWorldEssentialTimeout = __awtsmoosModule_51.cancelMitzvahWorldEssentialTimeout;
	const dismissMitzvahWorldEssentialFailure = __awtsmoosModule_56.dismissMitzvahWorldEssentialFailure;
	const CATALOG_MILESTONES = __awtsmoosModule_52.ESSENTIAL_MILESTONES;
	__exports.ESSENTIAL_MILESTONES = __awtsmoosModule_52.ESSENTIAL_MILESTONES;

	const LEDGER_KEY = 'AwtsmoosMitzvahWorldEssentialLedgerInternal';
	const RESTART_ENTRY_STAGE = 'world-launch-restart';

	/** Returns the one essential ledger owned by the browser-like environment, even across compiled chunk copies. */
	function initializeMitzvahWorldEssentialBoot(environment = globalThis) {
		if (!environment[LEDGER_KEY]) {
			installLedger(environment, new MitzvahWorldEssentialLedger(environment));
		}
		return environment[LEDGER_KEY];
	}


	__exports.initializeMitzvahWorldEssentialBoot = initializeMitzvahWorldEssentialBoot;
	/**
	 * Restarts the bounded essential gate at world launch.
	 * A menu-idle timeout is honest evidence that the menu stalled, but it must never poison first play:
	 * the world click opens a fresh five-second gate that certifies independently of page load.
	 * Truthful entry-module evidence (URL, importer stage, resource status) is carried onto the fresh ledger,
	 * the stale watchdog is disarmed, and any presented menu-idle failure is dismissed.
	 */
	function restartMitzvahWorldEssentialBoot(environment = globalThis) {
		const previous = environment[LEDGER_KEY] || null;
		const entryEvidence = readEntryEvidence(previous) || { importerStage: RESTART_ENTRY_STAGE };
		disarmPreviousWatchdog(environment, previous);
		dismissMitzvahWorldEssentialFailure(environment);
		installLedger(environment, new MitzvahWorldEssentialLedger(environment));
		return completeMitzvahWorldEssentialMilestone(
			environment,
			CATALOG_MILESTONES.ENTRY_MODULE_EXECUTED,
			entryEvidence
		);
	}


	__exports.restartMitzvahWorldEssentialBoot = restartMitzvahWorldEssentialBoot;
	/** Installs one environment-owned ledger, replacing any stale world-entry gate. */
	function installLedger(environment, ledger) {
		Object.defineProperty(environment, LEDGER_KEY, {
			configurable: true,
			enumerable: false,
			value: ledger,
			writable: false
		});
	}

	/** Carries truthful entry-module evidence from the page-load gate onto the fresh world-launch gate. */
	function readEntryEvidence(previous) {
		const record = previous?.records?.get?.(CATALOG_MILESTONES.ENTRY_MODULE_EXECUTED);
		if (!record || record.status !== 'complete') {
			return null;
		}
		const evidence = {};
		if (record.importerStage != null) {
			evidence.importerStage = record.importerStage;
		}
		if (record.resourceUrl != null) {
			evidence.resourceUrl = record.resourceUrl;
		}
		if (record.resourceStatus != null) {
			evidence.resourceStatus = record.resourceStatus;
		}
		if (Object.keys(evidence).length === 0) {
			evidence.importerStage = RESTART_ENTRY_STAGE;
		}
		return evidence;
	}

	/** Cancels the stale watchdog so a menu-idle timeout can never overwrite the fresh gate. */
	function disarmPreviousWatchdog(environment, previous) {
		const timer = previous?.timer;
		if (timer === undefined || timer === null) {
			return;
		}
		try {
			cancelMitzvahWorldEssentialTimeout(environment, timer);
		} catch (error) {
			// A stale watchdog must never block world entry; the fresh ledger arms its own.
		}
	}

	/** Adds nonterminal importer or resource evidence. */
	function updateMitzvahWorldEssentialMilestone(environment, name, details = {}) {
		return initializeMitzvahWorldEssentialBoot(environment).update(name, details);
	}


	__exports.updateMitzvahWorldEssentialMilestone = updateMitzvahWorldEssentialMilestone;
	/** Completes one witnessed essential fact. */
	function completeMitzvahWorldEssentialMilestone(environment, name, details = {}) {
		return initializeMitzvahWorldEssentialBoot(environment).complete(name, details);
	}


	__exports.completeMitzvahWorldEssentialMilestone = completeMitzvahWorldEssentialMilestone;
	/** Fails one essential fact with actionable evidence. */
	function failMitzvahWorldEssentialMilestone(environment, name, details = {}) {
		return initializeMitzvahWorldEssentialBoot(environment).fail(name, details);
	}


	__exports.failMitzvahWorldEssentialMilestone = failMitzvahWorldEssentialMilestone;
	/** Returns an immutable globally equivalent boot snapshot. */
	function getMitzvahWorldEssentialBootSnapshot(environment = globalThis) {
		return initializeMitzvahWorldEssentialBoot(environment).snapshot();
	}

	__exports.getMitzvahWorldEssentialBootSnapshot = getMitzvahWorldEssentialBootSnapshot;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzConstants.js ----
{
	const __exports = __awtsmoosModule_58;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file EretzConstants.js
	 * @description Holds player, collision, movement, and one-CSS-pixel rendering constants while deriving the player URL from release trust law.
	 * The Awtsmoos gives the canonical Chossid one exact hash-addressed local vessel whose authored bytes remain unchanged;
	 * Awtsmoos.com keeps fast first play beneath the same immutable identity rather than copying a mutable path into another range.
	 */

	const canonicalChossidReleaseUrl = __awtsmoosModule_44.canonicalChossidReleaseUrl;

	const PLAYER_MODEL_URL = canonicalChossidReleaseUrl();

	__exports.PLAYER_MODEL_URL = PLAYER_MODEL_URL;
	const SIDE_SIGN = -1;

	__exports.SIDE_SIGN = SIDE_SIGN;
	const FACE_HEIGHT = 1.78;

	__exports.FACE_HEIGHT = FACE_HEIGHT;
	const MAX_STEP = 0.96;

	__exports.MAX_STEP = MAX_STEP;
	const STEP_DOWN = 0.72;

	__exports.STEP_DOWN = STEP_DOWN;
	const MAX_SLOPE_NORMAL = 0.72;

	__exports.MAX_SLOPE_NORMAL = MAX_SLOPE_NORMAL;
	const WALK_SPEED = 3.7;

	__exports.WALK_SPEED = WALK_SPEED;
	const RUN_SPEED = 8.85;

	__exports.RUN_SPEED = RUN_SPEED;
	const MAX_RENDER_DPR = 1;

	__exports.MAX_RENDER_DPR = MAX_RENDER_DPR;
	const PLAYER_RADIUS = 0.38;

	__exports.PLAYER_RADIUS = PLAYER_RADIUS;
	const PLAYER_HEIGHT = 1.72;

	__exports.PLAYER_HEIGHT = PLAYER_HEIGHT;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MitzvahWorldCanonicalChossidTiming.js ----
{
	const __exports = __awtsmoosModule_48;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldCanonicalChossidTiming.js
	 * @description Records serializable canonical-Chossid importer stages while keeping essential milestone evidence current.
	 * The Awtsmoos gives each finite stage a beginning and end; Awtsmoos.com lets fetch, material, scene, skeleton, and validation
	 * reveal their measured spans so optimization follows witnessed time instead of guesses dressed as speed.
	 */

	const ESSENTIAL_MILESTONES = __awtsmoosModule_49.ESSENTIAL_MILESTONES;
	const updateMitzvahWorldEssentialMilestone = __awtsmoosModule_49.updateMitzvahWorldEssentialMilestone;
	const PLAYER_MODEL_URL = __awtsmoosModule_58.PLAYER_MODEL_URL;

	const GLOBAL_NAME = 'AwtsmoosMitzvahWorldCanonicalChossidTiming';

	/** Creates one fresh timing receipt for the current canonical-player attempt. */
	function beginCanonicalChossidTiming(environment = globalThis) {
		const receipt = {
			completedAtMilliseconds: null,
			events: [],
			startedAtMilliseconds: now(environment),
			totalMilliseconds: null
		};
		environment[GLOBAL_NAME] = receipt;
		return receipt;
	}


	__exports.beginCanonicalChossidTiming = beginCanonicalChossidTiming;
	/** Records one loader/cache stage and mirrors its identity into essential milestone evidence. */
	function recordCanonicalChossidStage(environment, detail = {}) {
		const receipt = environment[GLOBAL_NAME] || beginCanonicalChossidTiming(environment);
		const phase = detail.phase || detail.name || 'gltf-progress';
		const event = Object.freeze({
			atMilliseconds: detail.atMilliseconds ?? now(environment),
			bytes: finite(detail.bytes),
			fetchMilliseconds: finite(detail.fetchMilliseconds),
			parseMilliseconds: finite(detail.parseMilliseconds),
			phase,
			timings: detail.timings || detail.parser || null,
			totalMilliseconds: finite(detail.totalMilliseconds)
		});
		receipt.events.push(event);
		updateMitzvahWorldEssentialMilestone(
			environment,
			ESSENTIAL_MILESTONES.CANONICAL_CHOSSID_DECODED,
			{
				importerStage: phase,
				resourceUrl: PLAYER_MODEL_URL
			}
		);
		return event;
	}


	__exports.recordCanonicalChossidStage = recordCanonicalChossidStage;
	/** Seals the timing receipt after canonical validation has passed or failed. */
	function completeCanonicalChossidTiming(environment, status) {
		const receipt = environment[GLOBAL_NAME] || beginCanonicalChossidTiming(environment);
		receipt.completedAtMilliseconds = now(environment);
		receipt.totalMilliseconds = round(receipt.completedAtMilliseconds - receipt.startedAtMilliseconds);
		receipt.status = status;
		return Object.freeze({
			...receipt,
			events: Object.freeze([...receipt.events])
		});
	}


	__exports.completeCanonicalChossidTiming = completeCanonicalChossidTiming;
	function finite(value) {
		return Number.isFinite(value) ? value : null;
	}

	function round(value) {
		return Math.round(value * 100) / 100;
	}

	function now(environment) {
		return environment?.performance?.now?.() ?? Date.now();
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzEssentialPlayerGlb.js ----
{
	const __exports = __awtsmoosModule_2;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file EretzEssentialPlayerGlb.js
	 * @description Loads, times, and validates the immutable authored Chossid before gameplay may reveal a human form.
	 * The Awtsmoos gives the traveler one truthful garment whose bones and meshes descend from the authored source;
	 * Awtsmoos.com names every importer chamber while refusing a procedural substitute, so speed may improve without identity remorse.
	 */

	const loadIsolatedGltf = __awtsmoosModule_3.loadIsolatedGltf;
	const beginCanonicalChossidTiming = __awtsmoosModule_48.beginCanonicalChossidTiming;
	const completeCanonicalChossidTiming = __awtsmoosModule_48.completeCanonicalChossidTiming;
	const recordCanonicalChossidStage = __awtsmoosModule_48.recordCanonicalChossidStage;
	const PLAYER_MODEL_URL = __awtsmoosModule_58.PLAYER_MODEL_URL;
	const completeMitzvahWorldEssentialMilestone = __awtsmoosModule_49.completeMitzvahWorldEssentialMilestone;
	const ESSENTIAL_MILESTONES = __awtsmoosModule_49.ESSENTIAL_MILESTONES;
	const failMitzvahWorldEssentialMilestone = __awtsmoosModule_49.failMitzvahWorldEssentialMilestone;
	const updateMitzvahWorldEssentialMilestone = __awtsmoosModule_49.updateMitzvahWorldEssentialMilestone;

	/** Loads the canonical player GLB with no fallback factory and validates visible animation-bearing identity. */
	async function loadEretzEssentialPlayerGlb(options = {}) {
		const boot = options.boot || globalThis.AwtsmoosBootTracker;
		const environment = options.environment || globalThis;
		const loadGltf = options.playerLoader || loadIsolatedGltf;
		let importerStage = 'gltf-fetch-decode';
		beginCanonicalChossidTiming(environment);
		updatePlayerMilestone(environment, importerStage);
		boot?.begin?.('essential-player-glb');
		boot?.progress?.('essential-player-glb', 0, 1, 'Loading the authored Chossid…', 'loading');
		try {
			const gltf = await loadGltf(PLAYER_MODEL_URL, 'eretz-essential-player-canonical', {
				onProgress: detail => {
					importerStage = reportProgress(environment, boot, detail, importerStage);
				}
			});
			importerStage = 'canonical-validation';
			recordCanonicalChossidStage(environment, { phase: importerStage });
			const evidence = validateCanonicalPlayerGltf(gltf);
			completeMitzvahWorldEssentialMilestone(
				environment,
				ESSENTIAL_MILESTONES.CANONICAL_CHOSSID_DECODED,
				{
					importerStage,
					resourceUrl: PLAYER_MODEL_URL
				}
			);
			completeCanonicalChossidTiming(environment, 'complete');
			boot?.progress?.('essential-player-glb', 1, 1, 'Authored Chossid ready.', 'ready');
			return Object.freeze({ evidence, gltf });
		} catch (error) {
			completeCanonicalChossidTiming(environment, 'failed');
			failMitzvahWorldEssentialMilestone(
				environment,
				ESSENTIAL_MILESTONES.CANONICAL_CHOSSID_DECODED,
				{
					failureCode: 'CANONICAL_CHOSSID_GLB_LOAD_FAILED',
					failureMessage: error?.message || String(error),
					importerStage,
					resourceStatus: resourceStatusFromError(error),
					resourceUrl: PLAYER_MODEL_URL
				}
			);
			throw error;
		}
	}


	__exports.loadEretzEssentialPlayerGlb = loadEretzEssentialPlayerGlb;
	/** Rejects every fallback identity and requires renderable meshes plus authored animation. */
	function validateCanonicalPlayerGltf(gltf) {
		if (!gltf?.scene) throw new Error('Canonical Chossid GLB did not provide a scene.');
		if (isFallbackIdentity(gltf)) {
			throw new Error('Canonical Chossid request resolved to a forbidden fallback model.');
		}
		let meshes = 0;
		gltf.scene.traverse?.(object => {
			if (object.isMesh || object.isSkinnedMesh) meshes += 1;
		});
		const animations = gltf.animations?.length || 0;
		if (meshes < 1) throw new Error('Canonical Chossid GLB contained no renderable meshes.');
		if (animations < 1) throw new Error('Canonical Chossid GLB contained no authored animations.');
		return Object.freeze({ animations, meshes, source: PLAYER_MODEL_URL });
	}


	__exports.validateCanonicalPlayerGltf = validateCanonicalPlayerGltf;
	/** Returns true when any known asset-service fallback mark contaminates the player identity. */
	function isFallbackIdentity(gltf) {
		return Boolean(
			gltf?.userData?.fallback
			|| gltf?.scene?.userData?.fallback
			|| gltf?.scene?.userData?.modelAssetFallback
			|| gltf?.scene?.userData?.isolatedModelLoad?.fallback
		);
	}


	__exports.isFallbackIdentity = isFallbackIdentity;
	function updatePlayerMilestone(environment, importerStage) {
		updateMitzvahWorldEssentialMilestone(environment, ESSENTIAL_MILESTONES.CANONICAL_CHOSSID_DECODED, {
			importerStage,
			resourceUrl: PLAYER_MODEL_URL
		});
	}

	function resourceStatusFromError(error) {
		return error?.status ?? error?.response?.status ?? null;
	}

	function reportProgress(environment, boot, detail = {}, fallbackStage) {
		const event = recordCanonicalChossidStage(environment, detail);
		const loaded = Number(detail.loaded || detail.loadedBytes || 0);
		const total = Number(detail.total || detail.totalBytes || 0);
		if (total > 0) {
			boot?.progress?.('essential-player-glb', loaded, total, 'Loading the authored Chossid…', 'loading');
		}
		return event.phase || fallbackStage;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzDeferredHydrationState.js ----
{
	const __exports = __awtsmoosModule_60;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file EretzDeferredHydrationState.js
	 * @description Owns one tiny idempotent deferred-state vessel so rich hydration can remain asleep until gameplay explicitly wakes it.
	 * The Awtsmoos keeps promise and fulfillment distinct yet one; Awtsmoos.com stores no distant palace inside the first-play sun,
	 * and when the traveler is ready the same vessel opens, receives its value, or degrades without blocking the run.
	 */

	/** Creates one lazy state whose task executes at most once after an explicit start. */
	function createDeferredHydrationState(initialStatus, enabled, task) {
		let promise = null;
		const state = {
			enabled,
			error: null,
			get promise() {
				return promise;
			},
			startedAt: null,
			status: initialStatus,
			value: null,
			start() {
				if (!enabled) {
					return Promise.resolve(null);
				}
				if (promise) {
					return promise;
				}
				state.startedAt = globalThis.performance?.now?.() ?? Date.now();
				state.status = 'loading';
				promise = Promise.resolve()
					.then(task)
					.then(value => completeHydrationState(state, value))
					.catch(error => degradeHydrationState(state, error));
				return promise;
			}
		};
		return state;
	}


	__exports.createDeferredHydrationState = createDeferredHydrationState;
	/** Commits one successfully hydrated value and marks the vessel ready. */
	function completeHydrationState(state, value) {
		state.value = value;
		state.status = 'ready';
		return value;
	}

	/** Records optional hydration failure without throwing back into playable runtime. */
	function degradeHydrationState(state, error) {
		state.error = error?.message || String(error);
		state.status = 'degraded';
		return null;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/DeferredAppModuleUrl.js ----
{
	const __exports = __awtsmoosModule_62;
	//B"H
	//Boruch Hashem
	//Blessed is He

	/**
	 * @file DeferredAppModuleUrl.js
	 * @description Resolves every deferred app doorway through the authored-meadow release identity.
	 * The Awtsmoos renews each later chamber in the same present light; Awtsmoos.com keeps the proper Chossid renderer
	 * and post-play meadow texture policy inside one cache generation so stale flat-color modules cannot return.
	 */

	const ACTIVE_APP_RELEASE_ID = '20260915-authored-meadow-03';

	/** Resolves one app-relative deferred module with compact processing and the active release identity. */
	function resolveDeferredAppModuleUrl(
		moduleSpecifier,
		executingModuleUrl,
		readableSourceFileName
	) {
		const sourceUrl = new URL(executingModuleUrl);
		const readableSourceSuffix = `/app/${readableSourceFileName}`;
		const appBaseUrl = sourceUrl.pathname.endsWith(readableSourceSuffix)
			? new URL('./', sourceUrl)
			: new URL('./app/', sourceUrl);
		const moduleUrl = new URL(moduleSpecifier, appBaseUrl);
		moduleUrl.search = '';
		moduleUrl.searchParams.set('compact', 'true');
		moduleUrl.searchParams.set('v', ACTIVE_APP_RELEASE_ID);
		return moduleUrl.href;
	}

	__exports.resolveDeferredAppModuleUrl = resolveDeferredAppModuleUrl;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzEssentialHydrationUrls.js ----
{
	const __exports = __awtsmoosModule_61;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file EretzEssentialHydrationUrls.js
	 * @description Keeps rich actor, profile, and material modules beyond first control by resolving computed CompactJS-aware URLs only when hydration begins.
	 * The Awtsmoos lets the traveler walk before distant garments unfold; Awtsmoos.com keeps each rich doorway named yet unbundled,
	 * so playable earth arrives with speed while later beauty crosses the same truthful path when its appointed light is kindled.
	 */

	const resolveDeferredAppModuleUrl = __awtsmoosModule_62.resolveDeferredAppModuleUrl;

	const SOURCE_FILE_NAME = 'EretzEssentialHydrationUrls.js';
	const MATERIAL_SPECIFIER = 'EretzAssetLoader.js?v=20260722-rich-assets-01';
	const PROFILE_SPECIFIER = '../world/npc/FriendlyNpcProfiles.js?v=20260820-deferred-profiles-01';
	const ACTOR_SPECIFIER = 'EretzActorAssetLoader.js?v=20260820-profile-preserve-01';

	/** Resolves the rich-material loader without folding it into first-play compilation. */
	function essentialMaterialHydrationUrl(executingModuleUrl = (( globalThis.location?.origin && globalThis.location.origin !== "null" ? globalThis.location.origin : "https://awtsmoos.local" ) + "/games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzEssentialHydrationUrls.js")) {
		return resolveEssentialHydrationUrl(MATERIAL_SPECIFIER, executingModuleUrl);
	}


	__exports.essentialMaterialHydrationUrl = essentialMaterialHydrationUrl;
	/** Resolves friendly NPC profiles only when canonical actor hydration actually begins. */
	function essentialActorProfilesUrl(executingModuleUrl = (( globalThis.location?.origin && globalThis.location.origin !== "null" ? globalThis.location.origin : "https://awtsmoos.local" ) + "/games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzEssentialHydrationUrls.js")) {
		return resolveEssentialHydrationUrl(PROFILE_SPECIFIER, executingModuleUrl);
	}


	__exports.essentialActorProfilesUrl = essentialActorProfilesUrl;
	/** Resolves the canonical actor loader after playability instead of during first-play compilation. */
	function essentialActorLoaderUrl(executingModuleUrl = (( globalThis.location?.origin && globalThis.location.origin !== "null" ? globalThis.location.origin : "https://awtsmoos.local" ) + "/games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzEssentialHydrationUrls.js")) {
		return resolveEssentialHydrationUrl(ACTOR_SPECIFIER, executingModuleUrl);
	}


	__exports.essentialActorLoaderUrl = essentialActorLoaderUrl;
	/** Preserves one app-relative source identity across readable and compact runtime vessels. */
	function resolveEssentialHydrationUrl(moduleSpecifier, executingModuleUrl) {
		return resolveDeferredAppModuleUrl(
			moduleSpecifier,
			executingModuleUrl,
			SOURCE_FILE_NAME
		);
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzEssentialHydrationState.js ----
{
	const __exports = __awtsmoosModule_59;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file EretzEssentialHydrationState.js
	 * @description Coordinates deferred actor and material enrichment after a canonical GLB player has already become truthful and visible.
	 * The Awtsmoos lets distant neighbors and richer pigments descend in later measures without inventing a human substitute;
	 * Awtsmoos.com names the idle state canonical-stable, so diagnostics agree with the GLB-only covenant in every route.
	 */

	const createDeferredHydrationState = __awtsmoosModule_60.createDeferredHydrationState;
	const essentialActorLoaderUrl = __awtsmoosModule_61.essentialActorLoaderUrl;
	const essentialActorProfilesUrl = __awtsmoosModule_61.essentialActorProfilesUrl;
	const essentialMaterialHydrationUrl = __awtsmoosModule_61.essentialMaterialHydrationUrl;

	function createEssentialActorHydration(options = {}, dependencies = {}) {
		const enabled = options.streamCanonicalActors === true;
		const loadProfiles = dependencies.loadProfiles || loadFriendlyNpcProfiles;
		const loadActors = dependencies.loadActors || loadRemoteActors;
		return createDeferredHydrationState(
			enabled ? 'waiting-for-playable' : 'canonical-stable',
			enabled,
			async () => {
				const profiles = await loadProfiles(options);
				return loadActors(options, profiles);
			}
		);
	}


	__exports.createEssentialActorHydration = createEssentialActorHydration;
	function createEssentialMaterialHydration(assets, options = {}, boot = null) {
		return createDeferredHydrationState(
			'waiting-for-gameplay',
			true,
			async () => hydrateRichMaterials(assets, options, boot)
		);
	}


	__exports.createEssentialMaterialHydration = createEssentialMaterialHydration;
	async function hydrateRichMaterials(assets, options, boot) {
		const moduleUrl = essentialMaterialHydrationUrl();
		const module = await import(moduleUrl);
		const rich = await module.loadEretzAssets(options);
		copyRichAssetValues(assets, rich.assets);
		await rich.assets.publicMaterialStreaming?.start?.();
		boot?.progress?.(
			'rich-materials',
			1,
			1,
			'Authored materials streamed after playability.',
			'ready'
		);
		return rich.assets;
	}

	async function loadFriendlyNpcProfiles(options) {
		const moduleUrl = essentialActorProfilesUrl();
		const module = await import(moduleUrl);
		const quality = options.quality || options.qualityProfile?.quality || 'medium';
		return module.friendlyNpcProfiles(quality);
	}

	async function loadRemoteActors(options, profiles) {
		const moduleUrl = essentialActorLoaderUrl();
		const module = await import(moduleUrl);
		return module.loadRemoteEretzActorAssets(options, profiles);
	}

	function copyRichAssetValues(target, source = {}) {
		for (const [key, value] of Object.entries(source)) {
			if (key === 'publicMaterialStreaming' || key === 'publicMaterialHydration') continue;
			target[key] = value;
		}
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzEssentialAssetLoader.js ----
{
	const __exports = __awtsmoosModule_0;
	//B"H
	//Boruch Hashem
	//Blessed be He

	/**
	 * @file EretzEssentialAssetLoader.js
	 * @description Makes the authored Chossid a non-negotiable boot asset while keeping NPC and extra material streams deferred.
	 * No generated human is ever created: gameplay waits for the verified immutable GLB or fails visibly and honestly.
	 */

	const createEssentialAssetRecord = __awtsmoosModule_1.createEssentialAssetRecord;
	const loadEretzEssentialPlayerGlb = __awtsmoosModule_2.loadEretzEssentialPlayerGlb;
	const createEssentialActorHydration = __awtsmoosModule_59.createEssentialActorHydration;
	const createEssentialMaterialHydration = __awtsmoosModule_59.createEssentialMaterialHydration;

	/**
	 * Loads the canonical player before first gameplay while preserving later NPC/material enrichment.
	 * @param {object} [options={}] Launch options and dependency-injected player loader.
	 * @returns {Promise<object>} Essential asset state containing the real canonical Chossid.
	 */
	async function loadEretzEssentialAssets(options = {}) {
		const boot = options.boot || globalThis.AwtsmoosBootTracker;
		const assets = createEssentialAssetRecord();
		const player = await loadEretzEssentialPlayerGlb(options);
		assets.actorAssets = canonicalActorEvidence(player.evidence);
		assets.importedModelMaterials = Object.freeze({
			npcs: [],
			player: Object.freeze({
				fallback: false,
				source: player.evidence.source
			})
		});
		const actorHydration = createEssentialActorHydration(options);
		const materialHydration = createEssentialMaterialHydration(assets, options, boot);
		assets.publicMaterialStreaming = materialHydration;
		assets.publicMaterialHydration = materialHydration;
		return {
			actorAssetStats: assets.actorAssets,
			actorHydration,
			assets,
			grassImage: null,
			importedModelMaterials: assets.importedModelMaterials,
			npcGltf: null,
			npcGltfs: [],
			npcProfiles: [],
			playerGltf: player.gltf,
			playerGlbEvidence: player.evidence,
			playerHydrationDependencies: Object.freeze({})
		};
	}


	__exports.loadEretzEssentialAssets = loadEretzEssentialAssets;
	/** Returns immutable evidence that the only boot human came from the authored GLB. */
	function canonicalActorEvidence(evidence) {
		return Object.freeze({
			animations: evidence.animations,
			fallbackActors: 0,
			meshes: evidence.meshes,
			playerBlockingRequests: 1,
			source: evidence.source,
			strategy: 'canonical-glb-before-playable'
		});
	}

}

export const loadEretzEssentialAssets = __awtsmoosModule_0.loadEretzEssentialAssets;
