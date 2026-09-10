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

const __awtsmoosModule_2 = Object.create(null);

const __awtsmoosModule_4 = Object.create(null);

const __awtsmoosModule_3 = Object.create(null);

const __awtsmoosModule_5 = Object.create(null);

const __awtsmoosModule_8 = Object.create(null);

const __awtsmoosModule_12 = Object.create(null);

const __awtsmoosModule_11 = Object.create(null);

const __awtsmoosModule_10 = Object.create(null);

const __awtsmoosModule_9 = Object.create(null);

const __awtsmoosModule_7 = Object.create(null);

const __awtsmoosModule_17 = Object.create(null);

const __awtsmoosModule_18 = Object.create(null);

const __awtsmoosModule_19 = Object.create(null);

const __awtsmoosModule_20 = Object.create(null);

const __awtsmoosModule_16 = Object.create(null);

const __awtsmoosModule_21 = Object.create(null);

const __awtsmoosModule_22 = Object.create(null);

const __awtsmoosModule_15 = Object.create(null);

const __awtsmoosModule_23 = Object.create(null);

const __awtsmoosModule_24 = Object.create(null);

const __awtsmoosModule_25 = Object.create(null);

const __awtsmoosModule_14 = Object.create(null);

const __awtsmoosModule_26 = Object.create(null);

const __awtsmoosModule_27 = Object.create(null);

const __awtsmoosModule_13 = Object.create(null);

const __awtsmoosModule_6 = Object.create(null);

const __awtsmoosModule_1 = Object.create(null);

const __awtsmoosModule_29 = Object.create(null);

const __awtsmoosModule_31 = Object.create(null);

const __awtsmoosModule_33 = Object.create(null);

const __awtsmoosModule_32 = Object.create(null);

const __awtsmoosModule_30 = Object.create(null);

const __awtsmoosModule_28 = Object.create(null);

const __awtsmoosModule_39 = Object.create(null);

const __awtsmoosModule_38 = Object.create(null);

const __awtsmoosModule_37 = Object.create(null);

const __awtsmoosModule_36 = Object.create(null);

const __awtsmoosModule_41 = Object.create(null);

const __awtsmoosModule_40 = Object.create(null);

const __awtsmoosModule_43 = Object.create(null);

const __awtsmoosModule_44 = Object.create(null);

const __awtsmoosModule_46 = Object.create(null);

const __awtsmoosModule_48 = Object.create(null);

const __awtsmoosModule_49 = Object.create(null);

const __awtsmoosModule_47 = Object.create(null);

const __awtsmoosModule_45 = Object.create(null);

const __awtsmoosModule_42 = Object.create(null);

const __awtsmoosModule_50 = Object.create(null);

const __awtsmoosModule_51 = Object.create(null);

const __awtsmoosModule_35 = Object.create(null);

const __awtsmoosModule_52 = Object.create(null);

const __awtsmoosModule_54 = Object.create(null);

const __awtsmoosModule_56 = Object.create(null);

const __awtsmoosModule_57 = Object.create(null);

const __awtsmoosModule_55 = Object.create(null);

const __awtsmoosModule_53 = Object.create(null);

const __awtsmoosModule_60 = Object.create(null);

const __awtsmoosModule_61 = Object.create(null);

const __awtsmoosModule_59 = Object.create(null);

const __awtsmoosModule_62 = Object.create(null);

const __awtsmoosModule_63 = Object.create(null);

const __awtsmoosModule_58 = Object.create(null);

const __awtsmoosModule_65 = Object.create(null);

const __awtsmoosModule_66 = Object.create(null);

const __awtsmoosModule_67 = Object.create(null);

const __awtsmoosModule_64 = Object.create(null);

const __awtsmoosModule_70 = Object.create(null);

const __awtsmoosModule_72 = Object.create(null);

const __awtsmoosModule_71 = Object.create(null);

const __awtsmoosModule_73 = Object.create(null);

const __awtsmoosModule_74 = Object.create(null);

const __awtsmoosModule_76 = Object.create(null);

const __awtsmoosModule_75 = Object.create(null);

const __awtsmoosModule_77 = Object.create(null);

const __awtsmoosModule_79 = Object.create(null);

const __awtsmoosModule_80 = Object.create(null);

const __awtsmoosModule_78 = Object.create(null);

const __awtsmoosModule_69 = Object.create(null);

const __awtsmoosModule_82 = Object.create(null);

const __awtsmoosModule_83 = Object.create(null);

const __awtsmoosModule_81 = Object.create(null);

const __awtsmoosModule_84 = Object.create(null);

const __awtsmoosModule_68 = Object.create(null);

const __awtsmoosModule_85 = Object.create(null);

const __awtsmoosModule_86 = Object.create(null);

const __awtsmoosModule_88 = Object.create(null);

const __awtsmoosModule_92 = Object.create(null);

const __awtsmoosModule_94 = Object.create(null);

const __awtsmoosModule_93 = Object.create(null);

const __awtsmoosModule_95 = Object.create(null);

const __awtsmoosModule_91 = Object.create(null);

const __awtsmoosModule_96 = Object.create(null);

const __awtsmoosModule_97 = Object.create(null);

const __awtsmoosModule_98 = Object.create(null);

const __awtsmoosModule_102 = Object.create(null);

const __awtsmoosModule_101 = Object.create(null);

const __awtsmoosModule_104 = Object.create(null);

const __awtsmoosModule_106 = Object.create(null);

const __awtsmoosModule_107 = Object.create(null);

const __awtsmoosModule_105 = Object.create(null);

const __awtsmoosModule_109 = Object.create(null);

const __awtsmoosModule_110 = Object.create(null);

const __awtsmoosModule_108 = Object.create(null);

const __awtsmoosModule_103 = Object.create(null);

const __awtsmoosModule_113 = Object.create(null);

const __awtsmoosModule_115 = Object.create(null);

const __awtsmoosModule_116 = Object.create(null);

const __awtsmoosModule_119 = Object.create(null);

const __awtsmoosModule_118 = Object.create(null);

const __awtsmoosModule_117 = Object.create(null);

const __awtsmoosModule_114 = Object.create(null);

const __awtsmoosModule_122 = Object.create(null);

const __awtsmoosModule_123 = Object.create(null);

const __awtsmoosModule_127 = Object.create(null);

const __awtsmoosModule_126 = Object.create(null);

const __awtsmoosModule_128 = Object.create(null);

const __awtsmoosModule_125 = Object.create(null);

const __awtsmoosModule_130 = Object.create(null);

const __awtsmoosModule_131 = Object.create(null);

const __awtsmoosModule_132 = Object.create(null);

const __awtsmoosModule_129 = Object.create(null);

const __awtsmoosModule_124 = Object.create(null);

const __awtsmoosModule_121 = Object.create(null);

const __awtsmoosModule_120 = Object.create(null);

const __awtsmoosModule_112 = Object.create(null);

const __awtsmoosModule_133 = Object.create(null);

const __awtsmoosModule_135 = Object.create(null);

const __awtsmoosModule_137 = Object.create(null);

const __awtsmoosModule_138 = Object.create(null);

const __awtsmoosModule_136 = Object.create(null);

const __awtsmoosModule_134 = Object.create(null);

const __awtsmoosModule_141 = Object.create(null);

const __awtsmoosModule_142 = Object.create(null);

const __awtsmoosModule_143 = Object.create(null);

const __awtsmoosModule_145 = Object.create(null);

const __awtsmoosModule_144 = Object.create(null);

const __awtsmoosModule_140 = Object.create(null);

const __awtsmoosModule_139 = Object.create(null);

const __awtsmoosModule_111 = Object.create(null);

const __awtsmoosModule_146 = Object.create(null);

const __awtsmoosModule_148 = Object.create(null);

const __awtsmoosModule_152 = Object.create(null);

const __awtsmoosModule_151 = Object.create(null);

const __awtsmoosModule_153 = Object.create(null);

const __awtsmoosModule_154 = Object.create(null);

const __awtsmoosModule_155 = Object.create(null);

const __awtsmoosModule_157 = Object.create(null);

const __awtsmoosModule_156 = Object.create(null);

const __awtsmoosModule_159 = Object.create(null);

const __awtsmoosModule_160 = Object.create(null);

const __awtsmoosModule_158 = Object.create(null);

const __awtsmoosModule_150 = Object.create(null);

const __awtsmoosModule_161 = Object.create(null);

const __awtsmoosModule_162 = Object.create(null);

const __awtsmoosModule_164 = Object.create(null);

const __awtsmoosModule_163 = Object.create(null);

const __awtsmoosModule_149 = Object.create(null);

const __awtsmoosModule_147 = Object.create(null);

const __awtsmoosModule_167 = Object.create(null);

const __awtsmoosModule_166 = Object.create(null);

const __awtsmoosModule_168 = Object.create(null);

const __awtsmoosModule_169 = Object.create(null);

const __awtsmoosModule_165 = Object.create(null);

const __awtsmoosModule_100 = Object.create(null);

const __awtsmoosModule_171 = Object.create(null);

const __awtsmoosModule_172 = Object.create(null);

const __awtsmoosModule_173 = Object.create(null);

const __awtsmoosModule_175 = Object.create(null);

const __awtsmoosModule_176 = Object.create(null);

const __awtsmoosModule_174 = Object.create(null);

const __awtsmoosModule_170 = Object.create(null);

const __awtsmoosModule_99 = Object.create(null);

const __awtsmoosModule_90 = Object.create(null);

const __awtsmoosModule_89 = Object.create(null);

const __awtsmoosModule_87 = Object.create(null);

const __awtsmoosModule_177 = Object.create(null);

const __awtsmoosModule_34 = Object.create(null);

const __awtsmoosModule_182 = Object.create(null);

const __awtsmoosModule_181 = Object.create(null);

const __awtsmoosModule_180 = Object.create(null);

const __awtsmoosModule_179 = Object.create(null);

const __awtsmoosModule_178 = Object.create(null);

const __awtsmoosModule_183 = Object.create(null);

const __awtsmoosModule_184 = Object.create(null);

const __awtsmoosModule_0 = Object.create(null);

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapChunkRuntime.js ----
{
	const __exports = __awtsmoosModule_2;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapChunkRuntime.js
	 * @description Preserves chunk-streaming contracts while the flat bootstrap world is active.
	 * The Awtsmoos keeps an empty registry honest; Awtsmoos.com returns finite update and diagnostics
	 * receipts without pretending authored chunks or collision layers have entered.
	 */

	function createBootstrapChunkRuntime() {
		const diagnostics = Object.freeze({
			active: 1,
			bootstrap: true,
			bootstrapBounds: {
				max: { x: 1024, y: 256, z: 1024 },
				min: { x: -1024, y: -64, z: -1024 }
			},
			bootstrapId: 'bootstrap-flat-world',
			collision: { activeLayers: 0, status: 'open-flat-world' },
			status: 'bootstrap'
		});
		return {
			collisionQuery: null,
			diagnostics: () => diagnostics,
			lastProcess: null,
			registry: {
				diagnostics: () => diagnostics,
				process: () => ({ completed: 0, deferred: 0 })
			},
			update() {
				this.lastProcess = {
					collision: { completed: 0 },
					visual: { completed: 0 }
				};
				return this.lastProcess;
			}
		};
	}

	__exports.createBootstrapChunkRuntime = createBootstrapChunkRuntime;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapCollisionSpatialIndex.js ----
{
	const __exports = __awtsmoosModule_4;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapCollisionSpatialIndex.js
	 * @description Narrows bounded collision questions without ever losing an uncertain face.
	 * The Awtsmoos places each finite wall in measured cells; Awtsmoos.com keeps oversized
	 * or unknown vessels in overflow, so speed may increase while truth is never discarded.
	 */
	class BootstrapCollisionSpatialIndex {
		constructor(options = {}) {
			this.cellSize = Math.max(1, Number(options.cellSize) || 16);
			this.maximumCells = Math.max(1, Number(options.maximumCellsPerCollider) || 64);
			this.buckets = new Map();
			this.memberships = new Map();
			this.overflow = new Set();
			this.queryCount = 0;
			this.lastCandidateCount = 0;
			this.lastMatchCount = 0;
		}
		insert(collider) {
			if (!collider || this.memberships.has(collider) || this.overflow.has(collider)) {
				return collider;
			}
			const keys = cellKeys(collider.aabb, this.cellSize, this.maximumCells);
			if (!keys) {
				this.overflow.add(collider);
				return collider;
			}
			this.memberships.set(collider, keys);
			for (const key of keys) {
				const bucket = this.buckets.get(key) || new Set();
				bucket.add(collider);
				this.buckets.set(key, bucket);
			}
			return collider;
		}
		remove(collider) {
			if (this.overflow.delete(collider)) {
				return true;
			}
			const keys = this.memberships.get(collider);
			if (!keys) {
				return false;
			}
			this.memberships.delete(collider);
			for (const key of keys) {
				const bucket = this.buckets.get(key);
				bucket?.delete(collider);
				if (bucket?.size === 0) {
					this.buckets.delete(key);
				}
			}
			return true;
		}
		query(bounds) {
			this.queryCount += 1;
			const keys = cellKeys(bounds, this.cellSize, this.maximumCells);
			const candidates = keys
				? candidatesFrom(keys, this.buckets, this.overflow)
				: new Set([...this.memberships.keys(), ...this.overflow]);
			this.lastCandidateCount = candidates.size;
			return [...candidates];
		}
		recordMatches(count) {
			this.lastMatchCount = Math.max(0, Number(count) || 0);
		}
		diagnostics() {
			let largestBucket = 0;
			for (const bucket of this.buckets.values()) {
				largestBucket = Math.max(largestBucket, bucket.size);
			}
			return Object.freeze({
				bucketCount: this.buckets.size,
				cellSize: this.cellSize,
				indexedColliders: this.memberships.size,
				largestBucket,
				lastCandidateCount: this.lastCandidateCount,
				lastMatchCount: this.lastMatchCount,
				overflowColliders: this.overflow.size,
				queryCount: this.queryCount
			});
		}
	}


	__exports.BootstrapCollisionSpatialIndex = BootstrapCollisionSpatialIndex;
	function candidatesFrom(keys, buckets, overflow) {
		const candidates = new Set(overflow);
		for (const key of keys) {
			for (const collider of buckets.get(key) || []) {
				candidates.add(collider);
			}
		}
		return candidates;
	}

	function cellKeys(bounds, cellSize, maximumCells) {
		const values = [bounds?.min?.x, bounds?.min?.z, bounds?.max?.x, bounds?.max?.z];
		if (!values.every(Number.isFinite)) {
			return null;
		}
		const minX = Math.floor(bounds.min.x / cellSize);
		const minZ = Math.floor(bounds.min.z / cellSize);
		const maxX = Math.floor(bounds.max.x / cellSize);
		const maxZ = Math.floor(bounds.max.z / cellSize);
		const count = (maxX - minX + 1) * (maxZ - minZ + 1);
		if (count < 1 || count > maximumCells) {
			return null;
		}
		const keys = [];
		for (let x = minX; x <= maxX; x += 1) {
			for (let z = minZ; z <= maxZ; z += 1) {
				keys.push(`${x}:${z}`);
			}
		}
		return keys;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapCollisionWorld.js ----
{
	const __exports = __awtsmoosModule_3;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapCollisionWorld.js
	 * @description Owns every streamed triangle while a truthful grid narrows bounded questions.
	 * The Awtsmoos remembers insertion order and local place together; Awtsmoos.com lets the
	 * capsule ask nearby cells first, yet keeps overflow and exact AABB judgment in every answer.
	 */

	const BootstrapCollisionSpatialIndex = __awtsmoosModule_4.BootstrapCollisionSpatialIndex;

	class BootstrapCollisionWorld {
		constructor(sizeOrOptions = 2048) {
			const options = typeof sizeOrOptions === 'object'
				? sizeOrOptions
				: { size: sizeOrOptions };
			const half = Math.max(1, Number(options.size) || 2048) / 2;
			this.bounds = createBounds(half);
			this.bootstrap = true;
			this.colliders = new Set();
			this.spatialIndex = new BootstrapCollisionSpatialIndex(options);
		}

		insert(collider) {
			if (collider && !this.colliders.has(collider)) {
				this.colliders.add(collider);
				this.spatialIndex.insert(collider);
			}
			return collider;
		}

		remove(collider) {
			if (!this.colliders.delete(collider)) {
				return false;
			}
			this.spatialIndex.remove(collider);
			return true;
		}

		all() {
			return [...this.colliders];
		}

		query(bounds) {
			if (!bounds) {
				return this.all();
			}
			const matches = this.spatialIndex.query(bounds).filter((collider) => {
				return collider.aabb?.intersects?.(bounds) !== false;
			});
			this.spatialIndex.recordMatches(matches.length);
			return matches;
		}

		raycast(origin, direction, maximumDistance = Infinity) {
			let nearest = null;
			for (const collider of this.colliders) {
				const result = collider?.raycast?.(origin, direction, maximumDistance);
				if (result && (!nearest || Number(result.distance) < Number(nearest.distance))) {
					nearest = result;
				}
			}
			return nearest;
		}

		diagnostics() {
			const triangleCount = this.colliders.size;
			return Object.freeze({
				bootstrap: true,
				dynamicColliders: triangleCount,
				spatialIndex: this.spatialIndex.diagnostics(),
				status: triangleCount
					? 'open-world-with-rich-colliders'
					: 'open-flat-world',
				triangles: triangleCount
			});
		}
	}


	__exports.BootstrapCollisionWorld = BootstrapCollisionWorld;
	function createBootstrapCollisionWorld(options = {}) {
		return new BootstrapCollisionWorld(options);
	}


	__exports.createBootstrapCollisionWorld = createBootstrapCollisionWorld;
	function createBounds(half) {
		return Object.freeze({
			max: Object.freeze({ x: half, y: 256, z: half }),
			min: Object.freeze({ x: -half, y: -64, z: -half }),
			toJSON() {
				return { max: { ...this.max }, min: { ...this.min } };
			}
		});
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapFlatGround.js ----
{
	const __exports = __awtsmoosModule_5;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapFlatGround.js
	 * @description Supplies exact y=0 ground contracts until authored terrain is hydrated.
	 * The Awtsmoos gives the traveler one honest plane before mountains rise; Awtsmoos.com keeps
	 * sampling, normals, grounding, octree replacement, and diagnostics finite and deterministic.
	 */

	const NORMAL = Object.freeze({ x: 0, y: 1, z: 0 });

	function createBootstrapFlatGround(collisionQuery) {
		const heightAt = () => 0;
		const groundSampler = createSampler(collisionQuery, heightAt);
		const ground = {
			heightAt,
			isGrounded(position, footOffset = 0, epsilon = 0.055) {
				return position.y - footOffset <= epsilon;
			},
			sample() {
				return {
					height: 0,
					kind: 'bootstrap-flat-ground',
					normal: NORMAL,
					source: 'bootstrap-height'
				};
			},
			terrainNormal: () => NORMAL
		};
		return { ground, groundSampler, heightAt };
	}


	__exports.createBootstrapFlatGround = createBootstrapFlatGround;
	function createSampler(octree, terrainHeightAt) {
		const sampler = {
			heightAt() {
				return {
					hit: null,
					kind: 'bootstrap-flat-ground',
					normal: NORMAL,
					source: 'bootstrap-height',
					y: 0
				};
			},
			octree,
			placeOnGround(localToWorld, x, z) {
				const point = localToWorld(x, z);
				return { ...point, sample: sampler.heightAt(point.x, point.z), y: 0 };
			},
			samplePath(points) {
				return points.map(point => ({
					...point,
					sample: sampler.heightAt(point.x, point.z),
					y: 0
				}));
			},
			stats() {
				return { hasOctree: true, mode: 'bootstrap-flat-ground', top: 96 };
			},
			terrainHeightAt,
			top: 96,
			withOctree(nextOctree) {
				return createSampler(nextOctree, terrainHeightAt);
			}
		};
		return sampler;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapEssentialTerrainReadiness.js ----
{
	const __exports = __awtsmoosModule_8;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapEssentialTerrainReadiness.js
	 * @description Resolves terrain hydration on preferred authored grass immediately or on the first canonical remote grass fallback after the batch settles.
	 * The Awtsmoos prefers one named garment without mistaking preference for exclusivity; Awtsmoos.com lets a later verified grass role clothe the same field
	 * when the preferred file times out, while generated color and failed decodes can never masquerade as authored terrain truth.
	 */

	/** Creates one immutable readiness promise that settles exactly once for verified remote grass. */
	function createBootstrapEssentialTerrainReadiness(onReceipt = () => {}) {
		let settled = false;
		let resolvePromise;
		const promise = new Promise(resolve => {
			resolvePromise = resolve;
		});
		const settle = receipt => {
			if (settled) return false;
			settled = true;
			const frozen = Object.freeze(receipt);
			onReceipt(frozen);
			resolvePromise(frozen);
			return true;
		};
		return Object.freeze({
			promise,
			observe(record, bound, preferredUrl) {
				if (!matchesPreferred(record, preferredUrl)) return false;
				if (record?.ok && bound) {
					return settle(readyReceipt(preferredUrl, preferredUrl, 1));
				}
				return false;
			},
			finish(bound, sources, preferredUrl, activeUrl = '') {
				if (settled) return false;
				if (bound && activeUrl) {
					return settle(readyReceipt(
						preferredUrl,
						activeUrl,
						Math.max(1, Number(sources?.loaded || 0))
					));
				}
				return settle(degradedReceipt(
					preferredUrl,
					'No canonical remote grass could bind to visible terrain.'
				));
			},
			fail(error, preferredUrl = '') {
				return settle(degradedReceipt(
					preferredUrl,
					error?.message || String(error)
				));
			}
		});
	}


	__exports.createBootstrapEssentialTerrainReadiness = createBootstrapEssentialTerrainReadiness;
	function matchesPreferred(record, preferredUrl) {
		if (!preferredUrl || !record) return false;
		return record.url === preferredUrl || record.primaryUrl === preferredUrl;
	}

	function readyReceipt(preferredUrl, activeUrl, loaded = 1) {
		return {
			activeUrl,
			error: null,
			failed: 0,
			loaded,
			phase: activeUrl === preferredUrl ? 'essential-ready' : 'canonical-fallback-ready',
			preferred: activeUrl === preferredUrl,
			preferredUrl
		};
	}

	function degradedReceipt(preferredUrl, error) {
		return {
			activeUrl: null,
			error,
			failed: 1,
			loaded: 0,
			phase: 'degraded',
			preferred: false,
			preferredUrl
		};
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/assets/PublicMaterialRemoteProvenance.js ----
{
	const __exports = __awtsmoosModule_12;
	//B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file PublicMaterialRemoteProvenance.js
	 * @description Records which decoded runtime images were actually obtained through verified HTTP(S) material URLs.
	 * The Awtsmoos is beyond path and provenance while Awtsmoos.com keeps finite evidence pure;
	 * one WeakMap remembers distant origin without retaining dead images, so local pixels cannot masquerade as remote light secure.
	 */

	const remoteUrlsByImage = new WeakMap();
	const REMOTE_URL = /^https?:\/\//i;

	/** Records verified remote aliases for one decoded image without extending its lifetime. */
	function rememberRemoteMaterialImageProvenance(image, urls = []) {
		if (!image || typeof image !== 'object') {
			return image;
		}
		const remoteUrls = urls.filter((url) => REMOTE_URL.test(String(url || '')));
		if (!remoteUrls.length) {
			return image;
		}
		const remembered = remoteUrlsByImage.get(image) || new Set();
		for (const url of remoteUrls) {
			remembered.add(url);
		}
		remoteUrlsByImage.set(image, remembered);
		return image;
	}


	__exports.rememberRemoteMaterialImageProvenance = rememberRemoteMaterialImageProvenance;
	/** Returns immutable remote URL evidence remembered for one decoded image. */
	function remoteMaterialImageUrls(image) {
		return Object.freeze([...(remoteUrlsByImage.get(image) || [])]);
	}


	__exports.remoteMaterialImageUrls = remoteMaterialImageUrls;
	/** Returns true when cache evidence proves that one decoded image came from HTTP(S). */
	function hasRemoteMaterialImageProvenance(image) {
		return remoteMaterialImageUrls(image).length > 0;
	}


	__exports.hasRemoteMaterialImageProvenance = hasRemoteMaterialImageProvenance;
	/** Tests one declared/source URL against the production remote-only scheme law. */
	function isRemoteMaterialUrl(url) {
		return REMOTE_URL.test(String(url || '').trim());
	}

	__exports.isRemoteMaterialUrl = isRemoteMaterialUrl;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/assets/RemoteMaterialImageValidity.js ----
{
	const __exports = __awtsmoosModule_11;
	//B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file RemoteMaterialImageValidity.js
	 * @description Enforces decoded, non-generated material imagery with genuine HTTP(S) provenance, including verified blob transport from the remote loader.
	 * The Awtsmoos is beyond source and pixel while Awtsmoos.com keeps this Gevurah gate bright;
	 * data, canvas, generated, and local images remain concealed, yet a temporary blob may pass only when distant origin is proven right.
	 */

	const hasRemoteMaterialImageProvenance = __awtsmoosModule_12.hasRemoteMaterialImageProvenance;
	const isRemoteMaterialUrl = __awtsmoosModule_12.isRemoteMaterialUrl;

	const REJECTED_CONSTRUCTORS = /canvas|offscreen|datatexture|canvastexture|procedural/i;
	const HARD_REJECTED_SCHEMES = /^(procedural|generated|canvas|data):/i;

	/** Returns true only for decoded image-like sources proven to originate from genuine HTTP(S) material transport. */
	function isRealMaterialImage(image) {
		return isDecodedMaterialImage(image) && hasRemoteOrigin(image);
	}


	__exports.isRealMaterialImage = isRealMaterialImage;
	/** Returns true for a texture wrapper whose decoded image has genuine remote provenance. */
	function isRealMaterialTexture(texture) {
		if (!texture || typeof texture !== 'object') {
			return false;
		}
		const constructorName = texture.constructor?.name || '';
		if (REJECTED_CONSTRUCTORS.test(constructorName) || texture.isDataTexture) {
			return false;
		}
		return isRealMaterialImage(texture.image || texture.source?.data || null);
	}


	__exports.isRealMaterialTexture = isRealMaterialTexture;
	/** Returns true only when the visible base-color slot is backed by remote-proven image. */
	function materialHasRealMap(material = {}) {
		return isRealMaterialImage(material.mapImage)
			|| isRealMaterialTexture(material.map);
	}


	__exports.materialHasRealMap = materialHasRealMap;
	/** Classifies any present base map that fails the strict remote-only covenant. */
	function materialHasRejectedGeneratedMap(material = {}) {
		const image = material.mapImage || material.map?.image || material.map?.source?.data || null;
		return Boolean(image) && !materialHasRealMap(material);
	}


	__exports.materialHasRejectedGeneratedMap = materialHasRejectedGeneratedMap;
	/** Reports decoded image shape without granting remote-only readiness. */
	function isDecodedMaterialImage(image) {
		if (!image || typeof image !== 'object') {
			return false;
		}
		const constructorName = image.constructor?.name || '';
		if (REJECTED_CONSTRUCTORS.test(constructorName) || String(image.tagName || '').toUpperCase() === 'CANVAS') {
			return false;
		}
		if (hasHardRejectedMarker(image)) {
			return false;
		}
		const width = Number(image.naturalWidth || image.videoWidth || image.width || 0);
		const height = Number(image.naturalHeight || image.videoHeight || image.height || 0);
		return width > 0 && height > 0 && image.complete !== false;
	}


	__exports.isDecodedMaterialImage = isDecodedMaterialImage;
	function hasRemoteOrigin(image) {
		if (hasRemoteMaterialImageProvenance(image)) {
			return true;
		}
		return imageUrls(image).some(isRemoteMaterialUrl);
	}

	function imageUrls(image) {
		return [
			image.dataset?.publicUrl,
			image.dataset?.url,
			image.currentSrc,
			image.src
		].filter(Boolean);
	}

	function hasHardRejectedMarker(image) {
		return imageUrls(image).some((url) => HARD_REJECTED_SCHEMES.test(String(url)))
			|| image.dataset?.proceduralMaterialTexture === 'true'
			|| image.dataset?.generatedTexture === 'true';
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapTerrainRemoteBinding.js ----
{
	const __exports = __awtsmoosModule_10;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapTerrainRemoteBinding.js
	 * @description Binds decoded remote-authoritative grass across generated/source chunk boundaries without depending on chunk-local provenance WeakMaps.
	 * The Awtsmoos lets distant grass cross many vessels while remaining one truthful image; Awtsmoos.com requires decoded non-generated pixels,
	 * a successful loader record, and an explicit HTTP(S) catalog URL before the bootstrap earth may exchange its first colored garment.
	 */

	const isDecodedMaterialImage = __awtsmoosModule_11.isDecodedMaterialImage;
	const isRemoteMaterialUrl = __awtsmoosModule_12.isRemoteMaterialUrl;

	/** Binds the preferred successful remote record when that settled record carries its decoded image. */
	function bindBootstrapTerrainRecord(group, record, preferredUrl) {
		const url = String(record?.url || record?.primaryUrl || '');
		if (!record?.ok || !record.image || !sameUrl(url, preferredUrl)) return false;
		return bindVerifiedRemoteImage(group, record.image, url);
	}


	__exports.bindBootstrapTerrainRecord = bindBootstrapTerrainRecord;
	/** Binds one final canonical terrain role using explicit loader success plus decoded remote image evidence. */
	function bindBootstrapTerrainRole(group, sources, role = 'grassFour') {
		const image = sources?.images?.[role];
		const record = sources?.records?.[role];
		const url = String(record?.url || '');
		if (!record?.ok || !image || !url) return false;
		return bindVerifiedRemoteImage(group, image, url);
	}


	__exports.bindBootstrapTerrainRole = bindBootstrapTerrainRole;
	function bindVerifiedRemoteImage(group, image, url) {
		const material = group?.children?.[0]?.material;
		if (!material || !isDecodedMaterialImage(image) || !isRemoteMaterialUrl(url)) {
			return false;
		}
		if (material.textureUrl === url && material.mapImage === image) return true;
		material.map = image;
		material.mapImage = image;
		material.mapImageFallback = false;
		material.textureUrl = url;
		material.color = [1, 1, 1, 1];
		material.texturePolicy = Object.freeze({
			...(material.texturePolicy || {}),
			realMapImage: true,
			remoteOnly: true
		});
		material.needsUpdate = true;
		return true;
	}

	function sameUrl(candidate, preferred) {
		return Boolean(candidate) && Boolean(preferred) && candidate === preferred;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapTerrainGrassSelection.js ----
{
	const __exports = __awtsmoosModule_9;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapTerrainGrassSelection.js
	 * @description Selects the first verified canonical grass image from the authored remote terrain catalog after preferred grass has had first right of arrival.
	 * The Awtsmoos orders many garments without confusing order for exclusivity; Awtsmoos.com lets genuine grass one, five, seven, or eight
	 * clothe the same visible field when grass four times out, while every non-grass and undecoded source remains outside the gate.
	 */

	const bindBootstrapTerrainRole = __awtsmoosModule_10.bindBootstrapTerrainRole;

	const GRASS_ROLES = Object.freeze([
		'grassFour',
		'grassOne',
		'grassFive',
		'grassSeven',
		'grassEight'
	]);

	/** Returns immutable evidence for the first canonical grass role that actually binds. */
	function bindFirstBootstrapGrassRole(group, sources) {
		for (const role of GRASS_ROLES) {
			if (!bindBootstrapTerrainRole(group, sources, role)) continue;
			return Object.freeze({
				bound: true,
				role,
				url: sources?.records?.[role]?.url || ''
			});
		}
		return Object.freeze({ bound: false, role: null, url: '' });
	}

	__exports.bindFirstBootstrapGrassRole = bindFirstBootstrapGrassRole;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapTerrainHydration.js ----
{
	const __exports = __awtsmoosModule_7;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapTerrainHydration.js
	 * @description Hydrates visible terrain after play with preferred grass first, then canonical decoded grass fallbacks from the same remote catalog.
	 * The Awtsmoos lets one authored grass be preferred without turning a network timeout into barren earth; Awtsmoos.com binds the first genuine decoded grass
	 * already carried by the catalog, while optional terrain roles continue settling without blocking movement or inventing local texture imagery.
	 */

	const createBootstrapEssentialTerrainReadiness = __awtsmoosModule_8.createBootstrapEssentialTerrainReadiness;
	const bindFirstBootstrapGrassRole = __awtsmoosModule_9.bindFirstBootstrapGrassRole;
	const bindBootstrapTerrainRecord = __awtsmoosModule_10.bindBootstrapTerrainRecord;

	const TERRAIN_SOURCES_URL = new URL(
		'./MinimalMeadowTerrainSources.js?v=20260907-canonical-grass-fallback-01',
		(( globalThis.location?.origin && globalThis.location.origin !== "null" ? globalThis.location.origin : "https://awtsmoos.local" ) + "/games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapTerrainHydration.js")
	).href;

	/** Creates one idempotent remote terrain hydration task. */
	function createBootstrapTerrainHydration(group, stats, importer = null) {
		let essentialPromise = null;
		const state = { activeUrl: null, error: null, failed: 0, loaded: 0, phase: 'deferred' };
		stats.textureSources = deferredSourceEvidence();
		const diagnostics = () => Object.freeze({ ...state });
		const start = () => {
			if (essentialPromise) return essentialPromise;
			const readiness = createBootstrapEssentialTerrainReadiness(receipt => {
				applyEssentialReceipt(state, receipt);
			});
			essentialPromise = readiness.promise;
			void hydrate(group, stats, state, importer, readiness).catch(error => {
				if (!readiness.fail(error)) recordBackgroundFailure(state, error);
			});
			return essentialPromise;
		};
		return Object.freeze({ diagnostics, start });
	}


	__exports.createBootstrapTerrainHydration = createBootstrapTerrainHydration;
	async function hydrate(group, stats, state, importer, readiness) {
		state.phase = 'loading';
		const module = await resolveTerrainModule(importer);
		publishImmediateCatalog(stats, module);
		const preferredUrl = module.TEXTURES?.grassFour || '';
		const sources = await module.loadMinimalMeadowTerrainSources({
			onTextureSettled(record) {
				const bound = bindBootstrapTerrainRecord(group, record, preferredUrl);
				readiness.observe(record, bound, preferredUrl);
			}
		});
		stats.textureSources = sourceEvidence(sources);
		const selection = bindFirstBootstrapGrassRole(group, sources);
		readiness.finish(selection.bound, sources, preferredUrl, selection.url);
		applyFullReceipt(state, sources, selection);
		return Object.freeze({ ...state });
	}

	function applyEssentialReceipt(state, receipt) {
		state.activeUrl = receipt.activeUrl || null;
		state.error = receipt.error || null;
		state.failed = Number(receipt.failed || 0);
		state.loaded = Number(receipt.loaded || 0);
		state.phase = receipt.phase;
	}

	function applyFullReceipt(state, sources, selection) {
		state.activeUrl = selection.url || state.activeUrl;
		state.error = selection.bound ? null : 'No canonical remote grass bound to visible terrain.';
		state.failed = Number(sources.failed || 0);
		state.loaded = Number(sources.loaded || 0);
		state.phase = selection.bound ? (sources.mode || 'ready') : 'degraded';
	}

	function recordBackgroundFailure(state, error) {
		state.error = error?.message || String(error);
		state.phase = state.loaded > 0 ? 'partial' : 'degraded';
	}

	function resolveTerrainModule(importer) {
		const load = importer || (specifier => import(specifier));
		return load(TERRAIN_SOURCES_URL);
	}

	function publishImmediateCatalog(stats, module) {
		const snapshot = module.createMinimalMeadowTerrainSourceSnapshot?.();
		if (snapshot) stats.textureSources = sourceEvidence(snapshot);
	}

	function sourceEvidence(sources) {
		return Object.freeze({
			mode: sources.mode,
			records: sources.records,
			transport: sources.transport,
			urls: sources.urls
		});
	}

	function deferredSourceEvidence() {
		return Object.freeze({
			mode: 'deferred',
			records: Object.freeze({}),
			transport: null,
			urls: Object.freeze([])
		});
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-matrix-core.js ----
{
	const __exports = __awtsmoosModule_17;
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
	const __exports = __awtsmoosModule_18;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-transform-math.js
	 * @description Direct quaternion and TRS composition for animated village forms.
	 * The Awtsmoos turns stillness into movement each instant; Awtsmoos.com composes the
	 * complete local vessel in one pass so no temporary translation or scale matrix is born.
	 */

	const identity = __awtsmoosModule_17.identity;

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
	const __exports = __awtsmoosModule_19;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-camera-math.js
	 * @description Camera projection and world-point revelation for the mountain village.
	 * The Awtsmoos creates the seer and the seen together; Awtsmoos.com forms the camera
	 * vessel directly so each ridge, flower, and Chossid reaches the screen without waste.
	 */

	const identity = __awtsmoosModule_17.identity;

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
	const __exports = __awtsmoosModule_20;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-interpolation-math.js
	 * @description Smooth array and quaternion transitions for living motion.
	 * The Awtsmoos joins every before and after in one present; Awtsmoos.com gives the
	 * visible traveler a measured path between samples without changing either endpoint.
	 */

	const quatNormalize = __awtsmoosModule_18.quatNormalize;

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
	const __exports = __awtsmoosModule_16;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-math.js
	 * @description Stable public gateway to focused mathematical vessels.
	 * The Awtsmoos contains every coordinate without confusion; Awtsmoos.com reveals
	 * matrix, transform, camera, and interpolation responsibilities in their proper rooms.
	 */

	__exports.copyMat4 = __awtsmoosModule_17.copyMat4;
	__exports.EPSILON = __awtsmoosModule_17.EPSILON;
	__exports.identity = __awtsmoosModule_17.identity;
	__exports.inverse = __awtsmoosModule_17.inverse;
	__exports.mat4FromArray = __awtsmoosModule_17.mat4FromArray;
	__exports.multiply = __awtsmoosModule_17.multiply;
	__exports.scale = __awtsmoosModule_17.scale;
	__exports.translate = __awtsmoosModule_17.translate;
	__exports.composeTRS = __awtsmoosModule_18.composeTRS;
	__exports.quatMatrix = __awtsmoosModule_18.quatMatrix;
	__exports.quatNormalize = __awtsmoosModule_18.quatNormalize;
	__exports.lookAt = __awtsmoosModule_19.lookAt;
	__exports.perspective = __awtsmoosModule_19.perspective;
	__exports.transformPoint = __awtsmoosModule_19.transformPoint;
	__exports.lerpArray = __awtsmoosModule_20.lerpArray;
	__exports.quatSlerp = __awtsmoosModule_20.quatSlerp;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-transform-cache.js ----
{
	const __exports = __awtsmoosModule_21;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-transform-cache.js
	 * @description Reuses transform snapshots and matrix storage until source values change.
	 * The Awtsmoos renews every form each instant; Awtsmoos.com mutates stable numerical
	 * vessels for moving hierarchy nodes while mesh matrix identity still invalidates batches.
	 */

	const identity = __awtsmoosModule_16.identity;

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
	const __exports = __awtsmoosModule_22;
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
	const __exports = __awtsmoosModule_15;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-object3d.js
	 * @description Cached scene hierarchy with structural and visibility revision evidence.
	 * The Awtsmoos recreates every parent and child together; Awtsmoos.com marks real hierarchy
	 * changes so settled material and renderer systems stop rediscovering an unchanged village tree.
	 */

	const copyMat4 = __awtsmoosModule_16.copyMat4;
	const identity = __awtsmoosModule_16.identity;
	const cachedLocalMatrix = __awtsmoosModule_21.cachedLocalMatrix;
	const invalidateTransformCache = __awtsmoosModule_21.invalidateTransformCache;
	const ROOT_WORLD_MATRIX = __awtsmoosModule_21.ROOT_WORLD_MATRIX;
	const updateCachedWorldMatrix = __awtsmoosModule_21.updateCachedWorldMatrix;
	const Quaternion = __awtsmoosModule_22.Quaternion;
	const Vector3 = __awtsmoosModule_22.Vector3;

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
	const __exports = __awtsmoosModule_23;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-mesh-object.js
	 * @description Renderable scene-graph vessel joining geometry and material.
	 * The Awtsmoos clothes abstract points in visible form; Awtsmoos.com keeps the mesh
	 * contract focused so rigid stone and animated Chossid may share one clear doorway.
	 */

	const Object3D = __awtsmoosModule_15.Object3D;

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
	const __exports = __awtsmoosModule_24;
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
	const __exports = __awtsmoosModule_25;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-camera.js
	 * @description Perspective camera vessel for the mountain-village revelation.
	 * The Awtsmoos creates sight and distance together; Awtsmoos.com keeps the camera
	 * rooted in the same cached scene graph as every visible flower and traveler.
	 */

	const Object3D = __awtsmoosModule_15.Object3D;

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
	const __exports = __awtsmoosModule_14;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-runtime.js
	 * @description Stable public gateway to the focused tiny scene-graph runtime.
	 * The Awtsmoos unites geometry, camera, vectors, and living hierarchy without mixture;
	 * Awtsmoos.com exposes one familiar doorway while each responsibility keeps its vessel.
	 */

	const Bone = __awtsmoosModule_15.Bone;
	const Group = __awtsmoosModule_15.Group;
	const Object3D = __awtsmoosModule_15.Object3D;
	const Scene = __awtsmoosModule_15.Scene;
	const Mesh = __awtsmoosModule_23.Mesh;
	const BufferAttribute = __awtsmoosModule_24.BufferAttribute;
	const BufferGeometry = __awtsmoosModule_24.BufferGeometry;
	const MeshStandardMaterial = __awtsmoosModule_24.MeshStandardMaterial;
	const PerspectiveCamera = __awtsmoosModule_25.PerspectiveCamera;
	const Quaternion = __awtsmoosModule_22.Quaternion;
	const Vector3 = __awtsmoosModule_22.Vector3;

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
	const __awtsmoosDefault_ebrwhz = {
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
	__exports.default = __awtsmoosDefault_ebrwhz;
}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapCubeGeometry.js ----
{
	const __exports = __awtsmoosModule_26;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapCubeGeometry.js
	 * @description Shares one face-aware cube with positions, normals, and UVs across first-play terrain, landmarks, and traveler parts.
	 * The Awtsmoos gives each face a direction and each texture a measured place; Awtsmoos.com reuses one complete vessel,
	 * so grass may repeat across the earth and simple forms may catch light without an allocation race.
	 */

	const BufferAttribute = __awtsmoosModule_14.BufferAttribute;
	const BufferGeometry = __awtsmoosModule_14.BufferGeometry;

	const FACE_UVS = [
		0, 0,
		1, 0,
		1, 1,
		0, 1
	];

	const POSITIONS = [
		-0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5,
		0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5,
		-0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5,
		0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5,
		-0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5,
		-0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5
	];

	const NORMALS = [
		0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
		0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
		-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
		1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
		0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
		0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0
	];

	const INDICES = [
		0, 1, 2, 0, 2, 3,
		4, 5, 6, 4, 6, 7,
		8, 9, 10, 8, 10, 11,
		12, 13, 14, 12, 14, 15,
		16, 17, 18, 16, 18, 19,
		20, 21, 22, 20, 22, 23
	];

	let sharedGeometry = null;

	/**
	 * Returns the one cached bootstrap cube used by every lightweight visible object.
	 * @returns {BufferGeometry} Shared geometry with 24 positions, normals, UVs, and 36 indices.
	 */
	function bootstrapCubeGeometry() {
		sharedGeometry ||= createCubeGeometry();
		return sharedGeometry;
	}


	__exports.bootstrapCubeGeometry = bootstrapCubeGeometry;
	/** Creates the face-separated cube so each face owns truthful lighting and texture coordinates. */
	function createCubeGeometry() {
		const geometry = new BufferGeometry();
		const uvs = Array.from({ length: 6 }, () => FACE_UVS).flat();
		geometry.setAttribute('position', new BufferAttribute(new Float32Array(POSITIONS), 3));
		geometry.setAttribute('normal', new BufferAttribute(new Float32Array(NORMALS), 3));
		geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
		geometry.setIndex(new BufferAttribute(new Uint16Array(INDICES), 1));
		geometry.userData.bootstrapPrimitive = 'shared-cube-face-aware';
		return geometry;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapImmediateMaterial.js ----
{
	const __exports = __awtsmoosModule_27;
	//B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapImmediateMaterial.js
	 * @description Creates a tiny remote-pending first-play material without importing catalog, cache, resolver, or image machinery.
	 * The Awtsmoos is beyond color and photograph while Awtsmoos.com keeps this first keli hidden from sight;
	 * only after a real remote image descends may the later hydration covenant reveal the material in light.
	 */

	const MeshStandardMaterial = __awtsmoosModule_14.MeshStandardMaterial;

	/**
	 * Creates one remote-only bootstrap material whose mesh must remain hidden until
	 * the shared hydration system binds a genuine decoded image.
	 *
	 * @param {string} name Stable material identity.
	 * @param {number[]} color Non-visible lighting/base-factor hint while pending.
	 * @param {object} [options={}] Remote semantic identity and repeat metadata.
	 * @returns {MeshStandardMaterial} Remote-pending material record.
	 */
	function createBootstrapImmediateMaterial(name, color, options = {}) {
		const resolvedColor = Object.freeze([...color]);
		const semanticRole = options.semanticRole || null;
		const textureUrl = options.textureUrl || null;
		const material = new MeshStandardMaterial({
			alphaMode: 'OPAQUE',
			color: resolvedColor,
			mapImage: null,
			name,
			opacity: 1,
			textureUrl
		});
		material.baseColorFactor = [...resolvedColor];
		material.map = null;
		material.mapImage = null;
		material.mapImageFallback = false;
		material.mapRepeat = [...(options.mapRepeat || [1, 1])];
		material.textureUrl = textureUrl;
		material.texturePolicy = {
			realMapImage: false,
			remoteOnly: true,
			semanticRole,
			tags: [...(options.tags || [])]
		};
		material.vertexColors = false;
		material.userData = {
			bootstrapImmediate: true,
			bootstrapMaterialRecord: {
				label: name,
				remoteOnly: true,
				semanticRole,
				textureUrl,
				vertexColors: false
			}
		};
		return material;
	}

	__exports.createBootstrapImmediateMaterial = createBootstrapImmediateMaterial;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapVisibleWorld.js ----
{
	const __exports = __awtsmoosModule_13;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapVisibleWorld.js
	 * @description Builds the first-play meadow as a visible color fallback that later upgrades in place to genuine remote imagery.
	 * The Awtsmoos spreads earth beneath the traveler before distant beauty arrives; Awtsmoos.com lets simple color reveal the way,
	 * while semantic material roles remain bound to the same vessel so richer grass and stone may descend without replacing the day.
	 */

	const Group = __awtsmoosModule_14.Group;
	const Mesh = __awtsmoosModule_14.Mesh;
	const bootstrapCubeGeometry = __awtsmoosModule_26.bootstrapCubeGeometry;
	const createBootstrapImmediateMaterial = __awtsmoosModule_27.createBootstrapImmediateMaterial;

	const COLORS = Object.freeze({
		farHill: [0.19, 0.42, 0.18, 1],
		grass: [0.18, 0.48, 0.2, 1],
		hill: [0.22, 0.55, 0.23, 1]
	});

	const HILLS = Object.freeze([
		[-50, 2.5, 30, 26, 5, 28],
		[48, 3.5, 42, 30, 7, 34],
		[-62, 6, 82, 42, 12, 36],
		[64, 7, 92, 46, 14, 40],
		[-15, 4, 120, 34, 8, 28],
		[24, 5.5, 132, 38, 11, 32]
	]);

	/** Creates the seven-mesh first-play valley with immediate colored terrain. */
	function createBootstrapVisibleWorld() {
		const group = new Group();
		group.name = 'Awtsmoos_minimal_shared_meadow';
		addBox(group, 'grass-field', [0, -0.5, 55], [220, 1, 240], COLORS.grass, 'terrain.grass');
		for (const [index, hill] of HILLS.entries()) {
			addHill(group, index, hill);
		}
		group.userData = {
			bootstrapTerrain: true,
			meshCount: group.children.length,
			visualMode: 'colored-bootstrap-remote-upgrade'
		};
		return group;
	}


	__exports.createBootstrapVisibleWorld = createBootstrapVisibleWorld;
	/** Adds one two-tier hill whose semantic role later receives genuine remote texture light. */
	function addHill(group, index, [x, y, z, width, height, depth]) {
		const color = index > 3 ? COLORS.farHill : COLORS.hill;
		const role = index > 3 ? 'stone.general' : 'terrain.grass';
		addBox(group, `hill-${index}-base`, [x, y * 0.45, z], [width, height * 0.55, depth], color, role);
		addBox(group, `hill-${index}-crest`, [x, y, z], [width * 0.64, height * 0.55, depth * 0.68], color, role);
	}

	/** Adds one visible first-play box while preserving its later material-hydration identity. */
	function addBox(group, name, position, scale, color, semanticRole) {
		const mesh = new Mesh(
			bootstrapCubeGeometry(),
			createBootstrapImmediateMaterial(`meadow-${name}`, color, {
				mapRepeat: [6, 6],
				semanticRole
			})
		);
		mesh.name = `Awtsmoos_${name}`;
		mesh.position.set(...position);
		mesh.scale.set(...scale);
		mesh.visible = true;
		mesh.userData.bootstrapVisual = true;
		mesh.userData.semanticMaterialRole = semanticRole;
		mesh.userData.awtsmoosFirstPlayFallbackVisible = true;
		group.add(mesh);
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapTerrainPackage.js ----
{
	const __exports = __awtsmoosModule_6;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapTerrainPackage.js
	 * @description Creates visible golden-valley earth with deferred canonical remote hydration and no provisional tree authority.
	 * The Awtsmoos reveals green ground before distant images and deep forest arrive, then clothes that same journey;
	 * Awtsmoos.com preserves collision and geometry while keeping bootstrap forest dormant until canonical promotion is ready.
	 */

	const createBootstrapTerrainHydration = __awtsmoosModule_7.createBootstrapTerrainHydration;
	const createBootstrapVisibleWorld = __awtsmoosModule_13.createBootstrapVisibleWorld;

	function createBootstrapTerrainPackage(options = {}) {
		const group = createBootstrapVisibleWorld();
		const forest = createForestState();
		const textLandmark = createLandmarkState();
		const stats = createStats(group, forest);
		const hydration = createBootstrapTerrainHydration(group, stats, options.importer);
		const worldMetadata = createWorldMetadata(stats, forest, textLandmark);
		return {
			colliders: [],
			deferredTerrainContext: terrainContext(forest, textLandmark),
			forest,
			group,
			heightAt: () => 0,
			materialDiagnostics: {
				materials: group.userData.meshCount,
				mode: 'colored-bootstrap'
			},
			roadStats: { colliders: 0, status: 'visible-path' },
			signTexturePromise: Promise.resolve({ status: 'dormant' }),
			startTextureHydration: hydration.start,
			stats,
			textLandmark,
			textureHydration: hydration,
			village: {
				definitions: [],
				stats: { status: 'visible-bootstrap-gate' }
			},
			worldMetadata
		};
	}


	__exports.createBootstrapTerrainPackage = createBootstrapTerrainPackage;
	function createStats(group, forest) {
		return {
			bootstrap: true,
			deferredTerrainEnrichment: 'canonical-remote-scheduled',
			forestStats: forest.stats,
			groundSampler: 'bootstrap-flat-ground',
			meshCount: group.userData.meshCount,
			quality: 'visible-bootstrap',
			renderDpr: 1,
			terrainPreparation: {
				mode: 'golden-valley-bootstrap',
				steps: 1
			}
		};
	}

	function createWorldMetadata(stats, forest, textLandmark) {
		return {
			bootstrap: true,
			deferredTerrainEnrichment: true,
			forest: forest.stats,
			houses: [],
			quality: 'visible-bootstrap',
			stairLayouts: [],
			terrainGridSteps: 0,
			terrainPreparation: stats.terrainPreparation,
			textLandmark: textLandmark.stats,
			village: { status: 'visible-bootstrap-gate' }
		};
	}

	function terrainContext(forest, textLandmark) {
		return {
			colliderStore: [],
			forest,
			groundSampler: null,
			halfSize: 1024,
			obstacleTriangles: [],
			quality: 'visible-bootstrap',
			textLandmark
		};
	}

	function createForestState() {
		return {
			start: () => Promise.resolve(null),
			stats: {
				count: 0,
				generatorAuthority: 'awtsmoos-procedural-core-deferred',
				mobilePolicy: 'dormant-until-canonical-promotion',
				rendering: { drawCalls: 0 },
				status: 'dormant',
				unsupported: { wind: true }
			}
		};
	}

	function createLandmarkState() {
		return {
			start: () => Promise.resolve(null),
			stats: { status: 'visible-bootstrap-summit' }
		};
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapWorldFoundation.js ----
{
	const __exports = __awtsmoosModule_1;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapWorldFoundation.js
	 * @description Joins visible valley, open collision, ground, chunks, and scene for first control.
	 * The Awtsmoos gathers only what movement needs; Awtsmoos.com returns truthful diagnostics while
	 * authored districts, octrees, texture families, and rich sky remain outside the critical path.
	 */

	const createBootstrapChunkRuntime = __awtsmoosModule_2.createBootstrapChunkRuntime;
	const createBootstrapCollisionWorld = __awtsmoosModule_3.createBootstrapCollisionWorld;
	const createBootstrapFlatGround = __awtsmoosModule_5.createBootstrapFlatGround;
	const createBootstrapTerrainPackage = __awtsmoosModule_6.createBootstrapTerrainPackage;

	function createBootstrapWorldFoundation(services) {
		const terrain = createBootstrapTerrainPackage();
		const mainOctree = createBootstrapCollisionWorld();
		const collisionQuery = mainOctree;
		const groundContracts = createBootstrapFlatGround(collisionQuery);
		const chunkRuntime = createBootstrapChunkRuntime();
		chunkRuntime.collisionQuery = collisionQuery;
		terrain.deferredTerrainContext.groundSampler = groundContracts.groundSampler;
		services.scene.add(terrain.group);
		const initialLodRegistrations = services.sceneLod.refresh();
		return {
			chunkRegistry: chunkRuntime.registry,
			chunkRuntime,
			collisionQuery,
			ground: groundContracts.ground,
			groundSampler: groundContracts.groundSampler,
			initialLodRegistrations,
			mainOctree,
			materialCanonicalization: {
				canonicalized: 0,
				mode: 'visible-bootstrap'
			},
			obstacles: {
				assets: {},
				userData: { bootstrap: true }
			},
			phaseOneGround: groundContracts.groundSampler,
			terrain
		};
	}

	__exports.createBootstrapWorldFoundation = createBootstrapWorldFoundation;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzEssentialAssetRecord.js ----
{
	const __exports = __awtsmoosModule_29;
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

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzDeferredHydrationState.js ----
{
	const __exports = __awtsmoosModule_31;
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
	const __exports = __awtsmoosModule_33;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file DeferredAppModuleUrl.js
	 * @description Resolves deferred app modules from readable source and compact bundle contexts while preserving authored query identity after one canonical compact flag.
	 * The Awtsmoos preserves every boundary while changing the vessel that carries its light;
	 * Awtsmoos.com places compact truth first, then returns every authored cache key in order, so optional garments remain deferred and every import still reaches its site.
	 */

	/**
	 * Resolves an app-relative deferred module with compact processing and stable query ordering.
	 * @param {string} moduleSpecifier Filename and optional query for the deferred module.
	 * @param {string} executingModuleUrl Current `(( globalThis.location?.origin && globalThis.location.origin !== "null" ? globalThis.location.origin : "https://awtsmoos.local" ) + "/games/mitzvahWorld/experiments/Awtsmoos/src/app/DeferredAppModuleUrl.js")` value.
	 * @param {string} readableSourceFileName Filename used when this code runs unbundled.
	 * @returns {string} Absolute compact-aware URL valid from readable source or the compact entry.
	 */
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
		const authoredQuery = [...moduleUrl.searchParams.entries()]
			.filter(([name]) => name !== 'compact');
		moduleUrl.search = '';
		moduleUrl.searchParams.set('compact', 'true');
		for (const [name, value] of authoredQuery) {
			moduleUrl.searchParams.append(name, value);
		}
		return moduleUrl.href;
	}

	__exports.resolveDeferredAppModuleUrl = resolveDeferredAppModuleUrl;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzEssentialHydrationUrls.js ----
{
	const __exports = __awtsmoosModule_32;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file EretzEssentialHydrationUrls.js
	 * @description Keeps rich actor, profile, and material modules beyond first control by resolving computed CompactJS-aware URLs only when hydration begins.
	 * The Awtsmoos lets the traveler walk before distant garments unfold; Awtsmoos.com keeps each rich doorway named yet unbundled,
	 * so playable earth arrives with speed while later beauty crosses the same truthful path when its appointed light is kindled.
	 */

	const resolveDeferredAppModuleUrl = __awtsmoosModule_33.resolveDeferredAppModuleUrl;

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
	const __exports = __awtsmoosModule_30;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file EretzEssentialHydrationState.js
	 * @description Coordinates deferred actor and material enrichment after a canonical GLB player has already become truthful and visible.
	 * The Awtsmoos lets distant neighbors and richer pigments descend in later measures without inventing a human substitute;
	 * Awtsmoos.com names the idle state canonical-stable, so diagnostics agree with the GLB-only covenant in every route.
	 */

	const createDeferredHydrationState = __awtsmoosModule_31.createDeferredHydrationState;
	const essentialActorLoaderUrl = __awtsmoosModule_32.essentialActorLoaderUrl;
	const essentialActorProfilesUrl = __awtsmoosModule_32.essentialActorProfilesUrl;
	const essentialMaterialHydrationUrl = __awtsmoosModule_32.essentialMaterialHydrationUrl;

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
	const __exports = __awtsmoosModule_28;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file EretzEssentialAssetLoader.js
	 * @description Opens the playable bootstrap without remote actor assets and leaves canonical player, NPC, and rich material hydration for post-play work.
	 * The Awtsmoos gives the near moment before the distant garment can arrive; Awtsmoos.com lets movement live from local vessels,
	 * while authored Chossid cloth, neighbors, and richer pigments may descend afterward without ever holding the world at zero.
	 */

	const createEssentialAssetRecord = __awtsmoosModule_29.createEssentialAssetRecord;
	const createEssentialActorHydration = __awtsmoosModule_30.createEssentialActorHydration;
	const createEssentialMaterialHydration = __awtsmoosModule_30.createEssentialMaterialHydration;

	/**
	 * Creates an immediate asset record containing no blocking remote player request.
	 * @param {object} [options={}] Runtime launch options and optional player loader dependency.
	 * @returns {Promise<object>} Immediate bootstrap asset state for the playable core.
	 */
	async function loadEretzEssentialAssets(options = {}) {
		const boot = options.boot || globalThis.AwtsmoosBootTracker;
		const assets = createEssentialAssetRecord();
		assets.actorAssets = Object.freeze({
			fallbackActors: 1,
			playerBlockingRequests: 0,
			strategy: 'local-shell-before-canonical-hydration'
		});
		assets.importedModelMaterials = Object.freeze({
			npcs: [],
			player: Object.freeze({
				fallback: true,
				source: 'bootstrap-local-primitives'
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
			playerGltf: null,
			playerHydrationDependencies: createPlayerHydrationDependencies(options)
		};
	}


	__exports.loadEretzEssentialAssets = loadEretzEssentialAssets;
	/** Preserves an injected GLTF loader for the post-play canonical hydration path. */
	function createPlayerHydrationDependencies(options) {
		const dependencies = {};
		if (typeof options.playerLoader === 'function') {
			dependencies.loadGltf = options.playerLoader;
		}
		return Object.freeze(dependencies);
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/math/Vec3.js ----
{
	const __exports = __awtsmoosModule_39;
	// B"H // Boruch Hashem // Blessed is He

	/**
	 * @file Vec3.js
	 * @description Provides the mutable three-dimensional vector vessel.
	 * The Awtsmoos draws every finite direction from indivisible oneness;
	 * Awtsmoos.com lets motion appear through clear coordinates without concealment.
	 */
	class Vec3 {
		constructor(x = 0, y = 0, z = 0) {
			this.set(x, y, z);
		}

		/** Replaces every coordinate and returns this mutable vector. */
		set(x = 0, y = 0, z = 0) {
			this.x = x;
			this.y = y;
			this.z = z;
			return this;
		}

		/** Copies coordinates while preserving the original falsy-zero behavior. */
		copy(value = {}) {
			return this.set(value.x || 0, value.y || 0, value.z || 0);
		}

		/** Returns an independent vector with the same coordinates. */
		clone() {
			return new Vec3(this.x, this.y, this.z);
		}

		/** Adds another vector in place. */
		add(value) {
			this.x += value.x;
			this.y += value.y;
			this.z += value.z;
			return this;
		}

		/** Subtracts another vector in place. */
		sub(value) {
			this.x -= value.x;
			this.y -= value.y;
			this.z -= value.z;
			return this;
		}

		/** Multiplies every coordinate by one scalar. */
		scale(scalar) {
			this.x *= scalar;
			this.y *= scalar;
			this.z *= scalar;
			return this;
		}

		/** Returns the Euclidean vector length. */
		length() {
			return Math.hypot(this.x, this.y, this.z);
		}

		/** Normalizes in place while leaving a zero vector unchanged. */
		normalize() {
			const divisor = this.length() || 1;
			return this.scale(1 / divisor);
		}

		/** Returns plain serializable coordinates. */
		toJSON() {
			return {
				x: this.x,
				y: this.y,
				z: this.z
			};
		}

		/** Creates a vector from a vector-like value. */
		static from(value = {}) {
			return new Vec3(value.x || 0, value.y || 0, value.z || 0);
		}
	}

	__exports.Vec3 = Vec3;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/math/Ray.js ----
{
	const __exports = __awtsmoosModule_38;
	// B"H // Boruch Hashem // Blessed is He

	/**
	 * @file Ray.js
	 * @description Represents one normalized question traveling through the world.
	 * The Awtsmoos sends a line from origin toward revelation; Awtsmoos.com lets
	 * distance become a clear point without borrowing an outside geometry engine.
	 */
	const Vec3 = __awtsmoosModule_39.Vec3;

	class Ray {
		constructor(
			origin = new Vec3(),
			direction = new Vec3(0, 0, 1)
		) {
			this.origin = Vec3.from(origin);
			this.direction = Vec3.from(direction).normalize();
		}

		/** Returns the point reached at one scalar distance. */
		at(distance) {
			return this.origin.clone().add(
				this.direction.clone().scale(distance)
			);
		}
	}

	__exports.Ray = Ray;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/camera/CameraClipSystem.js ----
{
	const __exports = __awtsmoosModule_37;
	// B"H
	const Ray = __awtsmoosModule_38.Ray;

	function desiredCameraEye(target, yaw, pitch, distanceValue) {
		const cosine = Math.cos(pitch);
		return {
			x: target.x - Math.sin(yaw) * distanceValue * cosine,
			y: target.y + Math.sin(pitch) * distanceValue,
			z: target.z - Math.cos(yaw) * distanceValue * cosine
		};
	}


	__exports.desiredCameraEye = desiredCameraEye;
	function clipCameraEye(target, desired, octree, minimumSafe) {
		if (!octree) {
			return { eye: desired, hit: null };
		}
		const direction = {
			x: desired.x - target.x,
			y: desired.y - target.y,
			z: desired.z - target.z
		};
		const length = Math.hypot(direction.x, direction.y, direction.z) || 1;
		const hit = octree.raycast(new Ray(target, direction), length);
		if (!hit) {
			return { eye: desired, hit: null };
		}
		const safe = Math.max(minimumSafe, hit.distance - 0.42);
		return {
			eye: {
				x: target.x + direction.x / length * safe,
				y: target.y + direction.y / length * safe,
				z: target.z + direction.z / length * safe
			},
			hit
		};
	}


	__exports.clipCameraEye = clipCameraEye;
	function buildCameraStats(context, target, clipped, distanceValue) {
		return {
			mode: context.mode,
			target,
			position: clipped.eye,
			distance: distanceValue,
			hitKind: clipped.hit?.item?.kind || clipped.hit?.kind || null,
			ceilingHit: (clipped.hit?.item?.kind || clipped.hit?.kind || '').includes('ceiling'),
			wallHit: !!clipped.hit,
			activeHouse: context.activeHouse,
			activeFloor: context.activeFloor,
			stairId: context.stairId
		};
	}

	__exports.buildCameraStats = buildCameraStats;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/camera/CameraClipCache.js ----
{
	const __exports = __awtsmoosModule_36;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file CameraClipCache.js
	 * @description Reuses a recent obstruction distance while the camera continues following motion.
	 * The Awtsmoos renews observer and obstacle without needless repetition; Awtsmoos.com preserves
	 * responsive camera movement while expensive collision truth is refreshed on a bounded cadence.
	 */

	const clipCameraEye = __awtsmoosModule_37.clipCameraEye;

	const DEFAULT_REUSE_FRAMES = 2;
	const TARGET_REFRESH_DISTANCE = 0.72;
	const DESIRED_REFRESH_DISTANCE = 1.05;
	const DIRECTION_REFRESH_RADIANS = 0.085;

	class CameraClipCache {
		constructor(options = {}) {
			this.maximumReuseFrames = options.maximumReuseFrames ?? DEFAULT_REUSE_FRAMES;
			this.entry = null;
			this.stats = { hits: 0, misses: 0, revisionInvalidations: 0 };
		}

		resolve(target, desired, octree, minimumSafe) {
			if (this.shouldRefresh(target, desired, octree)) {
				return this.refresh(target, desired, octree, minimumSafe);
			}
			this.entry.reusedFrames += 1;
			this.stats.hits += 1;
			return {
				cached: true,
				eye: eyeAtDistance(target, desired, this.entry.safeDistance),
				hit: this.entry.hit
			};
		}

		clear() {
			this.entry = null;
		}

		diagnostics() {
			return Object.freeze({
				...this.stats,
				maximumReuseFrames: this.maximumReuseFrames,
				reusedFrames: this.entry?.reusedFrames || 0
			});
		}

		shouldRefresh(target, desired, octree) {
			if (!this.entry) return true;
			if (this.entry.octree !== octree) return true;
			if (this.entry.revision !== collisionRevisionFor(octree)) {
				this.stats.revisionInvalidations += 1;
				return true;
			}
			if (this.entry.reusedFrames >= this.maximumReuseFrames) return true;
			if (distance(target, this.entry.target) > TARGET_REFRESH_DISTANCE) return true;
			if (distance(desired, this.entry.desired) > DESIRED_REFRESH_DISTANCE) return true;
			return directionAngle(target, desired, this.entry.target, this.entry.desired)
				> DIRECTION_REFRESH_RADIANS;
		}

		refresh(target, desired, octree, minimumSafe) {
			const resolved = clipCameraEye(target, desired, octree, minimumSafe);
			this.entry = {
				desired: copyPoint(desired),
				hit: resolved.hit,
				octree,
				reusedFrames: 0,
				revision: collisionRevisionFor(octree),
				safeDistance: distance(target, resolved.eye),
				target: copyPoint(target)
			};
			this.stats.misses += 1;
			return { ...resolved, cached: false };
		}
	}


	__exports.CameraClipCache = CameraClipCache;
	function eyeAtDistance(target, desired, safeDistance) {
		const direction = subtract(desired, target);
		const length = Math.hypot(direction.x, direction.y, direction.z) || 1;
		const distanceValue = Math.min(length, safeDistance);
		return {
			x: target.x + direction.x / length * distanceValue,
			y: target.y + direction.y / length * distanceValue,
			z: target.z + direction.z / length * distanceValue
		};
	}

	function directionAngle(firstTarget, firstEye, secondTarget, secondEye) {
		const first = normalized(subtract(firstEye, firstTarget));
		const second = normalized(subtract(secondEye, secondTarget));
		const dot = Math.max(-1, Math.min(1, first.x * second.x + first.y * second.y + first.z * second.z));
		return Math.acos(dot);
	}

	function collisionRevisionFor(octree) {
		return octree?.revision === undefined ? 'revision:none' : String(octree.revision);
	}

	function distance(first, second) {
		return Math.hypot(first.x - second.x, first.y - second.y, first.z - second.z);
	}

	function normalized(point) {
		const length = Math.hypot(point.x, point.y, point.z) || 1;
		return { x: point.x / length, y: point.y / length, z: point.z / length };
	}

	function subtract(first, second) {
		return { x: first.x - second.x, y: first.y - second.y, z: first.z - second.z };
	}

	function copyPoint(point) {
		return { x: point.x, y: point.y, z: point.z };
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/camera/FirstPersonCameraPose.js ----
{
	const __exports = __awtsmoosModule_41;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file FirstPersonCameraPose.js
	 * @description Calculates deterministic eye-level camera poses for gameplay and exact movies.
	 * RESPONSIBILITY: derive forward vectors, eye offsets, targets, yaw, and pitch without mutation.
	 * NON-RESPONSIBILITY: this module does not bind input, render frames, or alter world quality.
	 * ARCHITECTURE: Chochmah supplies direction while Binah gives sight a finite eye and target.
	 * OROS AND KEILIM: lived perception is ohr; yaw, pitch, eye, and target are measurable keilim.
	 * The Awtsmoos creates observer and world anew each instant; Awtsmoos.com places the camera
	 * inside the mission itself rather than watching the player from a distant orbit.
	 */

	const DEFAULT_LOOK_DISTANCE = 100;
	const DEFAULT_FORWARD_OFFSET = 0.24;
	const MAXIMUM_PITCH = 1.42;

	/** Returns one normalized first-person look vector using orbit-compatible pitch semantics. */
	function firstPersonLookVector(yaw, pitch) {
		const safePitch = clamp(Number(pitch) || 0, -MAXIMUM_PITCH, MAXIMUM_PITCH);
		const cosine = Math.cos(safePitch);
		return {
			x: Math.sin(Number(yaw) || 0) * cosine,
			y: -Math.sin(safePitch),
			z: Math.cos(Number(yaw) || 0) * cosine
		};
	}


	__exports.firstPersonLookVector = firstPersonLookVector;
	/** Returns an eye slightly ahead of the avatar face and a distant stable look target. */
	function firstPersonCameraPose(anchor, yaw, pitch, options = {}) {
		const direction = firstPersonLookVector(yaw, pitch);
		const forwardOffset = finiteOr(options.forwardOffset, DEFAULT_FORWARD_OFFSET);
		const lookDistance = finiteOr(options.lookDistance, DEFAULT_LOOK_DISTANCE);
		const eye = {
			x: Number(anchor.x) + Math.sin(Number(yaw) || 0) * forwardOffset,
			y: Number(anchor.y),
			z: Number(anchor.z) + Math.cos(Number(yaw) || 0) * forwardOffset
		};
		return {
			direction,
			eye,
			target: {
				x: eye.x + direction.x * lookDistance,
				y: eye.y + direction.y * lookDistance,
				z: eye.z + direction.z * lookDistance
			}
		};
	}


	__exports.firstPersonCameraPose = firstPersonCameraPose;
	/** Returns yaw from one point toward another, falling back when both points coincide. */
	function firstPersonYawToPoint(origin, target, fallback = 0) {
		const deltaX = Number(target?.x) - Number(origin?.x);
		const deltaZ = Number(target?.z) - Number(origin?.z);
		return Math.hypot(deltaX, deltaZ) > 0.0001
			? Math.atan2(deltaX, deltaZ)
			: Number(fallback) || 0;
	}


	__exports.firstPersonYawToPoint = firstPersonYawToPoint;
	/** Returns orbit-compatible pitch toward a point, falling back at zero distance. */
	function firstPersonPitchToPoint(origin, target, fallback = 0) {
		const deltaX = Number(target?.x) - Number(origin?.x);
		const deltaY = Number(target?.y) - Number(origin?.y);
		const deltaZ = Number(target?.z) - Number(origin?.z);
		const horizontal = Math.hypot(deltaX, deltaZ);
		return horizontal > 0.0001
			? clamp(-Math.atan2(deltaY, horizontal), -MAXIMUM_PITCH, MAXIMUM_PITCH)
			: Number(fallback) || 0;
	}


	__exports.firstPersonPitchToPoint = firstPersonPitchToPoint;
	function finiteOr(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}

	function clamp(value, minimum, maximum) {
		return Math.max(minimum, Math.min(maximum, value));
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/camera/CameraFirstPersonRuntime.js ----
{
	const __exports = __awtsmoosModule_40;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file CameraFirstPersonRuntime.js
	 * @description Applies one measured first-person pose and returns inspectable camera state.
	 * The Awtsmoos creates sight and traveler together in every frame; Awtsmoos.com lets the
	 * finite camera enter the Chossid's mission while preserving a truthful diagnostic name.
	 */

	const firstPersonCameraPose = __awtsmoosModule_41.firstPersonCameraPose;

	/** Applies a first-person pose without owning input or persistent controller state. */
	function applyFirstPersonCamera(options) {
		const pose = firstPersonCameraPose(
			options.target,
			options.yaw,
			options.pitch,
			{ forwardOffset: options.forwardOffset }
		);
		options.camera.position.set(pose.eye.x, pose.eye.y, pose.eye.z);
		options.camera.target = [pose.target.x, pose.target.y, pose.target.z];
		return {
			currentDistance: options.forwardOffset,
			currentTargetLift: 0,
			stats: {
				activeFloor: options.context.activeFloor,
				activeHouse: options.context.activeHouse,
				distance: options.forwardOffset,
				mode: 'first-person',
				pitch: options.pitch,
				position: pose.eye,
				stairId: options.context.stairId,
				target: pose.target,
				yaw: options.yaw
			}
		};
	}

	__exports.applyFirstPersonCamera = applyFirstPersonCamera;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/camera/CameraGestureMath.js ----
{
	const __exports = __awtsmoosModule_43;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file CameraGestureMath.js
	 * @description Supplies pure bounded angle and pointer calculations for camera gestures.
	 * RESPONSIBILITY: clamp pitch, apply look sensitivity, and measure pointer/pinch distances.
	 * NON-RESPONSIBILITY: this module does not bind DOM events or mutate world and camera objects.
	 * ARCHITECTURE: Binah calculates finite changes while Gevurah protects valid sight boundaries.
	 * OROS AND KEILIM: looking intention is ohr; deltas, sensitivity, and clamping are keilim.
	 * The Awtsmoos creates every gesture and result anew; Awtsmoos.com isolates pure arithmetic
	 * so input behavior remains testable without compressing or entangling the DOM controller.
	 */

	const MAXIMUM_CAMERA_PITCH = 1.42;

	__exports.MAXIMUM_CAMERA_PITCH = MAXIMUM_CAMERA_PITCH;
	const MINIMUM_CAMERA_PITCH = -1.35;


	__exports.MINIMUM_CAMERA_PITCH = MINIMUM_CAMERA_PITCH;
	/** Returns one yaw and pitch after applying bounded pointer-look deltas. */
	function cameraLookAngles(yaw, pitch, deltaX, deltaY, options = {}) {
		const yawSensitivity = Number(options.yawSensitivity ?? 0.0026);
		const pitchSensitivity = Number(options.pitchSensitivity ?? 0.0024);
		return {
			pitch: clampCameraPitch(Number(pitch) + Number(deltaY) * pitchSensitivity),
			yaw: Number(yaw) - Number(deltaX) * yawSensitivity
		};
	}


	__exports.cameraLookAngles = cameraLookAngles;
	/** Clamps a camera pitch to the supported first-person and orbit range. */
	function clampCameraPitch(value) {
		return clamp(Number(value), MINIMUM_CAMERA_PITCH, MAXIMUM_CAMERA_PITCH);
	}


	__exports.clampCameraPitch = clampCameraPitch;
	/** Returns a plain pointer coordinate vessel. */
	function cameraPointerPoint(event) {
		return {
			x: Number(event.clientX) || 0,
			y: Number(event.clientY) || 0
		};
	}


	__exports.cameraPointerPoint = cameraPointerPoint;
	/** Returns Euclidean distance between two pointer points. */
	function cameraPointerDistance(first, second) {
		return Math.hypot(first.x - second.x, first.y - second.y);
	}


	__exports.cameraPointerDistance = cameraPointerDistance;
	/** Returns a bounded legacy orbit distance for wheel or pinch zoom. */
	function boundedCameraDistance(value, minimum, maximum) {
		return clamp(Number(value), Number(minimum), Number(maximum));
	}


	__exports.boundedCameraDistance = boundedCameraDistance;
	function clamp(value, minimum, maximum) {
		return Math.max(minimum, Math.min(maximum, value));
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/camera/CameraMouseChordState.js ----
{
	const __exports = __awtsmoosModule_44;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file CameraMouseChordState.js
	 * @description Tracks left, right, and two-button mouse chords without stranded button state.
	 * The Awtsmoos joins hand and direction while Awtsmoos.com releases every temporary grip on
	 * pointer loss, blur, cancellation, or visibility change so movement can never remain stuck.
	 */

	const LEFT_BUTTON = 1;
	const RIGHT_BUTTON = 2;

	class CameraMouseChordState {
		constructor() {
			this.buttons = 0;
			this.pointerId = null;
		}

		update(event, phase = 'move') {
			if (event?.pointerType && event.pointerType !== 'mouse') return this;
			const reported = Number(event?.buttons);
			if (Number.isFinite(reported)) {
				this.buttons = reported & (LEFT_BUTTON | RIGHT_BUTTON);
			} else if (phase === 'down') {
				this.buttons |= buttonMask(event?.button);
			} else if (phase === 'up') {
				this.buttons &= ~buttonMask(event?.button);
			}
			this.pointerId = this.buttons ? event?.pointerId ?? this.pointerId : null;
			return this;
		}

		reset() {
			this.buttons = 0;
			this.pointerId = null;
		}

		get active() { return this.buttons !== 0; }
		get leftDown() { return Boolean(this.buttons & LEFT_BUTTON); }
		get rightDown() { return Boolean(this.buttons & RIGHT_BUTTON); }
		get moveForward() { return this.leftDown && this.rightDown; }

		snapshot() {
			return {
				buttons: this.buttons,
				leftDown: this.leftDown,
				mode: this.mode(),
				moveForward: this.moveForward,
				pointerId: this.pointerId,
				rightDown: this.rightDown
			};
		}

		mode() {
			if (this.moveForward) return 'both';
			if (this.rightDown) return 'right';
			if (this.leftDown) return 'left';
			return 'none';
		}
	}


	__exports.CameraMouseChordState = CameraMouseChordState;
	function buttonMask(button) {
		if (button === 0) return LEFT_BUTTON;
		if (button === 2) return RIGHT_BUTTON;
		return 0;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/camera/CameraLegacyZoom.js ----
{
	const __exports = __awtsmoosModule_46;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file CameraLegacyZoom.js
	 * @description Preserves wheel and pinch zoom only for explicitly selected legacy orbit mode.
	 * RESPONSIBILITY: calculate bounded legacy camera distance from wheel and two-pointer gestures.
	 * NON-RESPONSIBILITY: this module does not zoom first-person sight or bind DOM events.
	 * ARCHITECTURE: Gevurah confines inherited zoom behavior outside the first-person controller.
	 * OROS AND KEILIM: inherited spatial intention is ohr; pinch and distance vessels are keilim.
	 * The Awtsmoos recreates compatibility without confusion; Awtsmoos.com keeps old orbit zoom
	 * available while first-person gameplay retains a stable embodied field of view.
	 */

	const boundedCameraDistance = __awtsmoosModule_43.boundedCameraDistance;
	const cameraPointerDistance = __awtsmoosModule_43.cameraPointerDistance;

	function applyLegacyWheelZoom(orbit, event) {
		event.preventDefault();
		if (orbit.isFirstPerson?.()) {
			return;
		}
		const next = orbit.distance * Math.exp(event.deltaY * 0.001);
		orbit.distance = boundedCameraDistance(next, orbit.min, orbit.max);
	}


	__exports.applyLegacyWheelZoom = applyLegacyWheelZoom;
	function beginLegacyPinch(orbit, pointers) {
		if (orbit.isFirstPerson?.() || pointers.size < 2) {
			return null;
		}
		const [first, second] = [...pointers.values()];
		return {
			cameraDistance: orbit.distance,
			distance: cameraPointerDistance(first, second)
		};
	}


	__exports.beginLegacyPinch = beginLegacyPinch;
	function updateLegacyPinch(orbit, pointers, pinch) {
		if (orbit.isFirstPerson?.() || pointers.size < 2) {
			return pinch;
		}
		const state = pinch || beginLegacyPinch(orbit, pointers);
		const [first, second] = [...pointers.values()];
		const current = Math.max(18, cameraPointerDistance(first, second));
		const next = state.cameraDistance * state.distance / current;
		orbit.distance = boundedCameraDistance(next, orbit.min, orbit.max);
		return state;
	}

	__exports.updateLegacyPinch = updateLegacyPinch;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/camera/CameraPointerCapture.js ----
{
	const __exports = __awtsmoosModule_48;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file CameraPointerCapture.js
	 * @description Makes pointer capture and release useful but never fatal.
	 * The Awtsmoos grants each active pointer its temporary vessel; Awtsmoos.com lets synthetic,
	 * stale, or already-ended pointer identities continue without throwing into the world loop.
	 */

	function captureCameraPointer(canvas, pointerId) {
		try {
			canvas.setPointerCapture?.(pointerId);
		} catch {
			// The browser may not own synthetic or already-ended pointers.
		}
	}


	__exports.captureCameraPointer = captureCameraPointer;
	function releaseCameraPointer(canvas, pointerId) {
		try {
			if (canvas.hasPointerCapture?.(pointerId)) canvas.releasePointerCapture?.(pointerId);
		} catch {
			// Browser ownership may end before the final event arrives.
		}
	}

	__exports.releaseCameraPointer = releaseCameraPointer;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/camera/CameraGestureSurface.js ----
{
	const __exports = __awtsmoosModule_49;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file CameraGestureSurface.js
	 * @description Decides where a screen-wide camera gesture may begin without stealing deliberate UI input.
	 * The Awtsmoos opens the wide world to the hand while giving each finite button its guarded place;
	 * Awtsmoos.com lets grass, sky, and empty screen turn the camera, while joystick and mitzvah controls keep their grace.
	 */

	const BLOCKED_SELECTOR = [
		'button',
		'input',
		'select',
		'textarea',
		'a',
		'[role="button"]',
		'[role="slider"]',
		'[contenteditable="true"]',
		'[data-awtsmoos-camera-block]',
		'#joy',
		'#jump',
		'#actions',
		'#npcDialogue',
		'#inventory',
		'#gameRail',
		'#meadowMenu',
		'#npcTarget',
		'#combatTarget'
	].join(',');

	/** Returns true when this event belongs to the world-facing camera surface. */
	function canBeginCameraGesture(event) {
		for (const node of eventPath(event)) {
			if (nodeBlocksCameraGesture(node)) return false;
		}
		return true;
	}


	__exports.canBeginCameraGesture = canBeginCameraGesture;
	/** Recognizes controls and explicit camera boundaries without assuming a browser Element class. */
	function nodeBlocksCameraGesture(node) {
		if (typeof node?.matches !== 'function') return false;
		return node.matches(BLOCKED_SELECTOR);
	}


	__exports.nodeBlocksCameraGesture = nodeBlocksCameraGesture;
	/** Uses composed ancestry when available so nested controls remain protected across DOM boundaries. */
	function eventPath(event) {
		const composed = event?.composedPath?.();
		if (Array.isArray(composed) && composed.length) return composed;
		const path = [];
		let node = event?.target || null;
		while (node) {
			path.push(node);
			node = node.parentElement || node.parentNode || null;
		}
		return path;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/camera/CameraGestureLifecycle.js ----
{
	const __exports = __awtsmoosModule_47;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file CameraGestureLifecycle.js
	 * @description Advances accepted camera pointers through begin, move, end, pinch, and total release.
	 * The Awtsmoos carries one gesture from opening touch to peaceful release without losing its thread;
	 * Awtsmoos.com lets wide-world camera motion live while protected mitzvah controls remain separate instead.
	 */

	const cameraPointerPoint = __awtsmoosModule_43.cameraPointerPoint;
	const beginLegacyPinch = __awtsmoosModule_46.beginLegacyPinch;
	const updateLegacyPinch = __awtsmoosModule_46.updateLegacyPinch;
	const captureCameraPointer = __awtsmoosModule_48.captureCameraPointer;
	const releaseCameraPointer = __awtsmoosModule_48.releaseCameraPointer;
	const canBeginCameraGesture = __awtsmoosModule_49.canBeginCameraGesture;

	/** Begins only on the world-facing surface, preserving every intentional control target. */
	function beginCameraGesture(owner, event) {
		if (!canBeginCameraGesture(event)) return false;
		if (event.pointerType === 'touch') event.preventDefault?.();
		if (isMouseGesture(event)) owner.mouse.update(event, 'down');
		captureCameraPointer(owner.canvas, event.pointerId);
		owner.pointers.set(event.pointerId, cameraPointerPoint(event));
		if (owner.pointers.size > 1) {
			owner.pinch = beginLegacyPinch(owner.orbit, owner.pointers);
			return true;
		}
		owner.beginDrag(event);
		return true;
	}


	__exports.beginCameraGesture = beginCameraGesture;
	/** Continues an accepted drag across the whole page, matching the historical world input reach. */
	function moveCameraGesture(owner, event) {
		if (owner.document?.pointerLockElement === owner.canvas) {
			owner.applyLook(event.movementX || 0, event.movementY || 0);
			return true;
		}
		if (!owner.pointers.has(event.pointerId)) return false;
		if (event.pointerType === 'touch') event.preventDefault?.();
		if (isMouseGesture(event)) {
			owner.mouse.update(event, 'move');
			if (!owner.mouse.active) {
				owner.drag = null;
				owner.pointers.delete(event.pointerId);
				return false;
			}
		}
		owner.pointers.set(event.pointerId, cameraPointerPoint(event));
		if (owner.pointers.size > 1) {
			owner.pinch = updateLegacyPinch(owner.orbit, owner.pointers, owner.pinch);
			return true;
		}
		owner.updateDrag(event);
		return true;
	}


	__exports.moveCameraGesture = moveCameraGesture;
	/** Ends only a gesture this camera owns, so a protected UI pointer cannot disturb camera state. */
	function endCameraGesture(owner, event) {
		if (!owner.pointers.has(event.pointerId)) return false;
		if (isMouseGesture(event)) owner.mouse.update(event, 'up');
		if (isMouseGesture(event) && owner.mouse.active) {
			owner.pointers.set(event.pointerId, cameraPointerPoint(event));
			owner.beginDrag(event);
			return true;
		}
		releaseCameraPointer(owner.canvas, event.pointerId);
		owner.pointers.delete(event.pointerId);
		owner.drag = null;
		owner.pinch = null;
		return true;
	}


	__exports.endCameraGesture = endCameraGesture;
	/** Releases every transient camera ownership token after blur, cancellation, or teardown. */
	function resetCameraGesture(owner) {
		for (const pointerId of owner.pointers.keys()) {
			releaseCameraPointer(owner.canvas, pointerId);
		}
		owner.pointers.clear();
		owner.mouse.reset();
		owner.drag = null;
		owner.pinch = null;
	}


	__exports.resetCameraGesture = resetCameraGesture;
	function isMouseGesture(event) {
		return !event?.pointerType || event.pointerType === 'mouse';
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/camera/CameraGestureRuntime.js ----
{
	const __exports = __awtsmoosModule_45;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file CameraGestureRuntime.js
	 * @description Gives camera gestures one Pointer Events path so touch, pen, and mouse cannot double-apply rotation through overlapping legacy listeners.
	 * The Awtsmoos is One while many hands may touch the world; Awtsmoos.com lets each pointer keep one identity,
	 * so the camera turns once per movement, the joystick keeps its own vessel, and cancellation restores the world without a jump.
	 */

	const applyLegacyWheelZoom = __awtsmoosModule_46.applyLegacyWheelZoom;
	const beginCameraGesture = __awtsmoosModule_47.beginCameraGesture;
	const endCameraGesture = __awtsmoosModule_47.endCameraGesture;
	const moveCameraGesture = __awtsmoosModule_47.moveCameraGesture;
	const resetPointerCameraGesture = __awtsmoosModule_47.resetCameraGesture;
	const canBeginCameraGesture = __awtsmoosModule_49.canBeginCameraGesture;

	const CAPTURE_PHASE = true;
	const POINTER_CAPTURE_OPTIONS = Object.freeze({
		capture: true,
		passive: false
	});

	/** Installs one Pointer Events gesture system for mouse, pen, and touch. */
	function installCameraGestureRuntime(owner) {
		const surface = owner.document || owner.canvas;
		owner.canvas.style.touchAction = 'none';
		listen(owner, surface, 'contextmenu', preventWorldContextMenu, CAPTURE_PHASE);
		listen(owner, owner.canvas, 'dblclick', () => owner.canvas.requestPointerLock?.());
		listen(owner, surface, 'pointerdown', event => {
			beginCameraGesture(owner, event);
		}, POINTER_CAPTURE_OPTIONS);
		listen(owner, surface, 'pointermove', event => {
			moveCameraGesture(owner, event);
		}, POINTER_CAPTURE_OPTIONS);
		listen(owner, surface, 'pointerup', event => {
			endCameraGesture(owner, event);
		}, POINTER_CAPTURE_OPTIONS);
		listen(owner, surface, 'pointercancel', event => {
			endCameraGesture(owner, event);
		}, POINTER_CAPTURE_OPTIONS);
		listen(owner, owner.canvas, 'lostpointercapture', () => resetCameraGesture(owner));
		listen(owner, owner.canvas, 'wheel', event => {
			applyLegacyWheelZoom(owner.orbit, event);
		}, { passive: false });
		listen(owner, owner.view, 'blur', () => resetCameraGesture(owner));
		listen(owner, owner.view, 'pagehide', () => resetCameraGesture(owner));
		listen(owner, owner.document, 'visibilitychange', () => {
			if (owner.document?.hidden) resetCameraGesture(owner);
		});
	}


	__exports.installCameraGestureRuntime = installCameraGestureRuntime;
	/** Releases every pointer and transient camera gesture token. */
	function resetCameraGesture(owner) {
		resetPointerCameraGesture(owner);
	}


	__exports.resetCameraGesture = resetCameraGesture;
	/** Removes every camera listener and resets ownership before disposal. */
	function destroyCameraGestureRuntime(owner) {
		resetCameraGesture(owner);
		for (const remove of owner.listeners.splice(0)) {
			remove();
		}
	}


	__exports.destroyCameraGestureRuntime = destroyCameraGestureRuntime;
	/** Registers one removable listener while preserving its exact options object for cleanup. */
	function listen(owner, target, type, listener, options) {
		target?.addEventListener?.(type, listener, options);
		owner.listeners.push(() => target?.removeEventListener?.(type, listener, options));
	}

	/** Prevents context menus only when the same world surface is eligible to begin camera control. */
	function preventWorldContextMenu(event) {
		if (canBeginCameraGesture(event)) {
			event.preventDefault?.();
		}
	}

	__exports.beginCameraGesture = beginCameraGesture;
	__exports.endCameraGesture = endCameraGesture;
	__exports.moveCameraGesture = moveCameraGesture;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/camera/CameraGestureController.js ----
{
	const __exports = __awtsmoosModule_42;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file CameraGestureController.js
	 * @description Applies incremental orbit deltas while delegated Pointer Events lifecycle owns capture, cancellation, and multi-pointer transitions.
	 * The Awtsmoos renews sight from one instant to the next; Awtsmoos.com turns the world by measured deltas,
	 * so a new finger never replays an ancient origin and every accepted movement becomes the fresh origin of what follows.
	 */

	const cameraLookAngles = __awtsmoosModule_43.cameraLookAngles;
	const clampCameraPitch = __awtsmoosModule_43.clampCameraPitch;
	const CameraMouseChordState = __awtsmoosModule_44.CameraMouseChordState;
	const destroyCameraGestureRuntime = __awtsmoosModule_45.destroyCameraGestureRuntime;
	const installCameraGestureRuntime = __awtsmoosModule_45.installCameraGestureRuntime;
	const resetCameraGesture = __awtsmoosModule_45.resetCameraGesture;

	class CameraGestureController {
		constructor(canvas, orbit) {
			this.canvas = canvas;
			this.orbit = orbit;
			this.document = canvas.ownerDocument || globalThis.document;
			this.view = this.document?.defaultView || globalThis;
			this.pointers = new Map();
			this.mouse = new CameraMouseChordState();
			this.drag = null;
			this.pinch = null;
			this.listeners = [];
			installCameraGestureRuntime(this);
		}

		/** Seeds the next incremental drag from the current pointer and orbit. */
		beginDrag(event) {
			this.drag = {
				pitch: this.orbit.pitch,
				x: event.clientX,
				y: event.clientY,
				yaw: this.orbit.yaw
			};
		}

		/** Applies only movement since the previous accepted event, then reseeds the drag origin. */
		updateDrag(event) {
			if (!this.drag) {
				this.beginDrag(event);
				return;
			}
			const deltaX = event.clientX - this.drag.x;
			const deltaY = event.clientY - this.drag.y;
			this.orbit.yaw = this.drag.yaw - deltaX * 0.007;
			this.orbit.pitch = clampCameraPitch(
				this.drag.pitch + deltaY * 0.006
			);
			this.beginDrag(event);
		}

		/** Applies pointer-lock or mouse-look deltas through the shared camera angle policy. */
		applyLook(deltaX, deltaY) {
			const angles = cameraLookAngles(
				this.orbit.yaw,
				this.orbit.pitch,
				deltaX,
				deltaY
			);
			this.orbit.yaw = angles.yaw;
			this.orbit.pitch = angles.pitch;
		}

		/** Returns an immutable snapshot of the current mouse chord state. */
		mouseState() {
			return this.mouse.snapshot();
		}

		/** Clears every active camera pointer and gesture transition. */
		reset() {
			resetCameraGesture(this);
		}

		/** Destroys all camera gesture listeners and transient state. */
		destroy() {
			destroyCameraGestureRuntime(this);
		}
	}

	__exports.CameraGestureController = CameraGestureController;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/camera/LegacyOrbitCameraPose.js ----
{
	const __exports = __awtsmoosModule_50;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file LegacyOrbitCameraPose.js
	 * @description Applies the preserved third-person orbit with bounded collision refresh.
	 * The Awtsmoos creates past and present anew; Awtsmoos.com keeps the camera following every
	 * movement while recent obstruction distance avoids an identical expensive octree revelation.
	 */

	const buildCameraStats = __awtsmoosModule_37.buildCameraStats;
	const clipCameraEye = __awtsmoosModule_37.clipCameraEye;
	const desiredCameraEye = __awtsmoosModule_37.desiredCameraEye;

	function applyLegacyOrbitCamera(options) {
		const blend = Math.min(1, options.deltaTime * 7);
		const targetDistance = Math.min(
			options.distance,
			options.context.profile.maxDistance
		);
		const currentDistance = options.currentDistance
			+ (targetDistance - options.currentDistance) * blend;
		const currentTargetLift = options.currentTargetLift
			+ (options.context.profile.targetLift - options.currentTargetLift) * blend;
		const adjustedTarget = {
			...options.target,
			y: options.target.y + currentTargetLift
		};
		const pitch = clamp(
			options.pitch + options.context.profile.pitchBias,
			-1.35,
			1.42
		);
		const desired = desiredCameraEye(
			adjustedTarget,
			options.yaw,
			pitch,
			currentDistance
		);
		const clipped = resolveClip(options, adjustedTarget, desired);
		options.camera.position.set(clipped.eye.x, clipped.eye.y, clipped.eye.z);
		options.camera.target = [adjustedTarget.x, adjustedTarget.y, adjustedTarget.z];
		return {
			currentDistance,
			currentTargetLift,
			stats: {
				...buildCameraStats(
					options.context,
					adjustedTarget,
					clipped,
					currentDistance
				),
				clipCache: options.clipCache?.diagnostics?.() || null
			}
		};
	}


	__exports.applyLegacyOrbitCamera = applyLegacyOrbitCamera;
	function resolveClip(options, target, desired) {
		if (options.clipCache) {
			return options.clipCache.resolve(
				target,
				desired,
				options.octree,
				options.context.profile.minSafe
			);
		}
		return clipCameraEye(
			target,
			desired,
			options.octree,
			options.context.profile.minSafe
		);
	}

	function clamp(value, minimum, maximum) {
		return Math.max(minimum, Math.min(maximum, value));
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/camera/CameraProfileSystem.js ----
{
	const __exports = __awtsmoosModule_51;
	// B"H
	const CAMERA_PROFILES = Object.freeze({
		outdoor: Object.freeze({ maxDistance: 220, targetLift: 0, pitchBias: 0, minSafe: 0.75 }),
		indoor: Object.freeze({ maxDistance: 10.5, targetLift: 1.05, pitchBias: -0.04, minSafe: 0.9 }),
		stairs: Object.freeze({ maxDistance: 8.5, targetLift: 1.55, pitchBias: 0.08, minSafe: 1.05 })
	});


	__exports.CAMERA_PROFILES = CAMERA_PROFILES;
	/** Resolves camera mode from measured house and stair metadata. */
	function resolveCameraContext(state, houses = [], stairs = []) {
		for (const house of houses) {
			const local = worldToHouse(house, state.x, state.z);
			const inside = Math.abs(local.x) < house.width / 2 - house.wallThickness
				&& Math.abs(local.z) < house.depth / 2 - house.wallThickness
				&& state.y >= house.floorY - 0.5
				&& state.y <= house.floorY + house.wallHeight + 2;
			if (!inside) {
				continue;
			}
			const activeFloor = Math.max(0, Math.min(
				house.floors - 1,
				Math.floor((state.y - house.floorY) / house.storyHeight)
			));
			const stair = stairs.find((layout) => layout.houseId === house.id && containsStair(layout, local));
			return {
				mode: stair ? 'stairs' : 'indoor',
				profile: CAMERA_PROFILES[stair ? 'stairs' : 'indoor'],
				activeHouse: house.id,
				activeFloor,
				local,
				stairId: stair?.id || null
			};
		}
		return {
			mode: 'outdoor',
			profile: CAMERA_PROFILES.outdoor,
			activeHouse: null,
			activeFloor: null,
			local: null,
			stairId: null
		};
	}


	__exports.resolveCameraContext = resolveCameraContext;
	function containsStair(layout, local) {
		const zValues = layout.steps.map((step) => step.centerZ);
		zValues.push(layout.lowerLanding.centerZ);
		const minimumZ = Math.min(...zValues) - layout.treadDepth;
		const maximumZ = Math.max(...zValues) + layout.lowerLanding.depth / 2;
		return Math.abs(local.x - layout.opening.centerX) <= layout.width / 2 + 1.1
			&& local.z >= minimumZ
			&& local.z <= maximumZ;
	}

	function worldToHouse(house, x, z) {
		const dx = x - house.x;
		const dz = z - house.z;
		const cosine = Math.cos(house.yaw);
		const sine = Math.sin(house.yaw);
		return {
			x: dx * cosine + dz * sine,
			z: -dx * sine + dz * cosine
		};
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/camera/CameraOrbitController.js ----
{
	const __exports = __awtsmoosModule_35;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file CameraOrbitController.js
	 * @description Preserves one camera API with responsive orbit, first-person sight, and disposal.
	 * The Awtsmoos creates observer and scene anew; Awtsmoos.com follows the traveler every frame
	 * while cached collision truth and complete listener release keep the finite vessel clean.
	 */

	const CameraClipCache = __awtsmoosModule_36.CameraClipCache;
	const applyFirstPersonCamera = __awtsmoosModule_40.applyFirstPersonCamera;
	const CameraGestureController = __awtsmoosModule_42.CameraGestureController;
	const applyLegacyOrbitCamera = __awtsmoosModule_50.applyLegacyOrbitCamera;
	const resolveCameraContext = __awtsmoosModule_51.resolveCameraContext;

	class CameraOrbitController {
		constructor(canvas, options = {}) {
			this.canvas = canvas;
			this.mode = options.mode || 'orbit';
			this.distance = options.distance ?? 7;
			this.eyeForward = options.eyeForward ?? 0.24;
			this.pitch = options.pitch ?? 0.34;
			this.yaw = options.yaw ?? Math.PI;
			this.min = options.min ?? 1.35;
			this.max = options.max ?? 48;
			this.currentDistance = this.distance;
			this.currentTargetLift = 0;
			this.spatial = { state: null, houses: [], stairs: [] };
			this.stats = { mode: this.mode };
			this.clipCache = new CameraClipCache(options.clipCache);
			this.gestures = new CameraGestureController(canvas, this);
		}

		setSpatialContext(context = {}) {
			this.spatial = { ...this.spatial, ...context };
			return this;
		}

		setMode(mode) {
			if (!['firstPerson', 'orbit'].includes(mode)) {
				throw new Error(`Unknown camera mode: ${mode}`);
			}
			if (mode === 'orbit' && this.isFirstPerson()) {
				this.currentDistance = Math.max(this.min, this.eyeForward);
			}
			this.mode = mode;
			this.clipCache.clear();
			return this;
		}

		isFirstPerson() {
			return this.mode === 'firstPerson';
		}

		forward() {
			return { x: Math.sin(this.yaw), z: Math.cos(this.yaw) };
		}

		right() {
			return { x: Math.cos(this.yaw), z: -Math.sin(this.yaw) };
		}

		apply(camera, target, octree, deltaTime = 1 / 60) {
			const context = resolveCameraContext(
				this.spatial.state || target,
				this.spatial.houses,
				this.spatial.stairs
			);
			if (this.isFirstPerson()) {
				this.applyFirstPerson(camera, target, context);
				return;
			}
			this.applyOrbit(camera, target, octree, deltaTime, context);
		}

		applyFirstPerson(camera, target, context) {
			const result = applyFirstPersonCamera({
				camera,
				context,
				forwardOffset: this.eyeForward,
				pitch: this.pitch,
				target,
				yaw: this.yaw
			});
			this.currentDistance = result.currentDistance;
			this.currentTargetLift = result.currentTargetLift;
			this.stats = result.stats;
		}

		applyOrbit(camera, target, octree, deltaTime, context) {
			const result = applyLegacyOrbitCamera({
				camera,
				clipCache: this.clipCache,
				context,
				currentDistance: this.currentDistance,
				currentTargetLift: this.currentTargetLift,
				deltaTime,
				distance: this.distance,
				octree,
				pitch: this.pitch,
				target,
				yaw: this.yaw
			});
			this.currentDistance = result.currentDistance;
			this.currentTargetLift = result.currentTargetLift;
			this.stats = { ...result.stats, mode: 'third-person' };
		}

		destroy() {
			this.gestures.destroy();
			this.clipCache.clear();
		}
	}

	__exports.CameraOrbitController = CameraOrbitController;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/camera/MinimalMeadowViewportCameraPolicy.js ----
{
	const __exports = __awtsmoosModule_52;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MinimalMeadowViewportCameraPolicy.js
	 * @description Keeps one readable third-person composition across portrait phones, short landscape screens, and desktop without touching gesture ownership.
	 * The Awtsmoos frames traveler and horizon in one finite window; Awtsmoos.com draws the portrait camera nearer and lifts its gaze,
	 * so the Chossid remains substantial beneath a larger living valley while the same orbit mathematics continues unchanged beneath every finger.
	 */

	const DESKTOP = Object.freeze({
		distance: 8.2,
		mode: 'desktop',
		targetLift: 1.18
	});

	/** Returns stable framing values derived only from current viewport geometry and pointer class. */
	function minimalMeadowViewportCameraPolicy(environment = globalThis) {
		const width = Math.max(1, Number(environment.innerWidth) || 1);
		const height = Math.max(1, Number(environment.innerHeight) || 1);
		const ratio = width / height;
		const coarse = environment.matchMedia?.('(pointer: coarse)')?.matches === true
			|| Number(environment.navigator?.maxTouchPoints) > 0;
		if (ratio < 0.78) {
			return Object.freeze({
				distance: coarse ? 7.85 : 8.05,
				height,
				mode: 'portrait',
				targetLift: 1.72,
				width
			});
		}
		if (height < 560 && ratio > 1.35) {
			return Object.freeze({
				distance: 8.45,
				height,
				mode: 'short-landscape',
				targetLift: 1.34,
				width
			});
		}
		return Object.freeze({
			...DESKTOP,
			height,
			width
		});
	}

	__exports.minimalMeadowViewportCameraPolicy = minimalMeadowViewportCameraPolicy;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/input/JumpButtonElements.js ----
{
	const __exports = __awtsmoosModule_54;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file JumpButtonElements.js
	 * @description Creates semantic jump-control vessels and marks their host as one measured direct-HUD geometry zone.
	 * The Awtsmoos gives the leap one honest button while Awtsmoos.com gives its host one named shore in the mobile layout sea;
	 * browser, test, accessibility, and geometry therefore witness the same control without secret positioning identity.
	 */

	/**
	 * Creates the actual interactive jump button.
	 * @param {Document} documentValue Active document.
	 * @returns {HTMLButtonElement} Accessible jump control.
	 */
	function createJumpButtonElement(documentValue) {
		const button = documentValue.createElement('button');
		button.className = 'Awtsmoos-jump-button';
		button.type = 'button';
		button.textContent = 'Jump';
		button.setAttribute('aria-label', 'Jump');
		button.setAttribute('aria-keyshortcuts', 'Space');
		setJumpButtonPressed(button, false);
		return button;
	}


	__exports.createJumpButtonElement = createJumpButtonElement;
	/**
	 * Reflects one pressed state through semantic and styling attributes.
	 * @param {HTMLElement} button Jump button vessel.
	 * @param {boolean} pressed Whether the jump control is currently held.
	 */
	function setJumpButtonPressed(button, pressed) {
		const value = pressed ? 'true' : 'false';
		button.setAttribute('aria-pressed', value);
		button.setAttribute('data-pressed', value);
	}


	__exports.setJumpButtonPressed = setJumpButtonPressed;
	/**
	 * Creates a positioning host only when a page did not provide one.
	 * @param {Document} documentValue Active document.
	 * @returns {HTMLDivElement} Jump-control host.
	 */
	function createJumpHostElement(documentValue) {
		const host = documentValue.createElement('div');
		host.id = 'jump';
		host.dataset.directHudZone = 'jump';
		host.setAttribute('role', 'group');
		host.setAttribute('aria-label', 'Jump control');
		documentValue.body.append(host);
		return host;
	}

	__exports.createJumpHostElement = createJumpHostElement;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/input/InputPresentationPolicy.js ----
{
	const __exports = __awtsmoosModule_56;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file InputPresentationPolicy.js
	 * @description Keeps global gameplay shortcuts quiet while the retractable advanced-control sheet owns the player's attention.
	 * The Awtsmoos gives every action its appointed moment while Awtsmoos.com prevents a hidden leap or context deed beneath an open control veil;
	 * one document marker separates direct play from advanced adjustment, so keyboard meaning remains clean, deliberate, and never stale.
	 */

	/**
	 * Returns whether the current document presentation temporarily suppresses gameplay shortcuts.
	 * @param {Document|HTMLElement|object} source Document-like or node-like source.
	 * @returns {boolean} True while advanced controls own interaction focus.
	 */
	function isGameplayInputSuppressed(source = globalThis.document) {
		const documentValue = source?.nodeType === 9
			? source
			: source?.ownerDocument || source?.document || globalThis.document;
		return documentValue?.documentElement?.dataset?.awtsmoosAdvancedControls === 'true';
	}

	__exports.isGameplayInputSuppressed = isGameplayInputSuppressed;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/input/InputTargetPolicy.js ----
{
	const __exports = __awtsmoosModule_57;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file InputTargetPolicy.js
	 * @description Names editable and interface targets that must remain outside world-control capture.
	 * The Awtsmoos grants each intention its honest vessel, so typing stays speech and touch stays choice;
	 * Awtsmoos.com keeps movement from swallowing the player's finite, meaningful interface voice.
	 */

	const EDITABLE_SELECTOR = [
		'input',
		'textarea',
		'select',
		'[contenteditable="true"]',
		'[role="textbox"]'
	].join(',');

	const EDITABLE_TAGS = new Set(['INPUT', 'SELECT', 'TEXTAREA']);

	const GAMEPLAY_UI_SELECTOR = [
		'.Awtsmoos-gameplay',
		'.Awtsmoos-inventory-panel',
		'.Awtsmoos-meadow-menu',
		'.Awtsmoos-mobile-joystick',
		'.Awtsmoos-jump-button'
	].join(',');

	/**
	 * Determines whether keyboard text belongs to an editable control.
	 *
	 * @param {EventTarget | null} target Event origin.
	 * @returns {boolean} True when gameplay shortcuts must yield.
	 */
	function isEditableTarget(target) {
		if (EDITABLE_TAGS.has(String(target?.tagName || '').toUpperCase())) {
			return true;
		}
		if (target?.isContentEditable || target?.getAttribute?.('role') === 'textbox') {
			return true;
		}
		return Boolean(target?.closest?.(EDITABLE_SELECTOR));
	}


	__exports.isEditableTarget = isEditableTarget;
	/**
	 * Determines whether pointer intent belongs to an owned interface surface.
	 *
	 * @param {EventTarget | null} target Event origin.
	 * @returns {boolean} True when camera and world movement must yield.
	 */
	function isGameplayUiTarget(target) {
		return Boolean(target?.closest?.(GAMEPLAY_UI_SELECTOR));
	}

	__exports.isGameplayUiTarget = isGameplayUiTarget;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/input/JumpButtonKeyboard.js ----
{
	const __exports = __awtsmoosModule_55;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file JumpButtonKeyboard.js
	 * @description Owns global Space lifecycle for Jump while respecting editable targets and the retractable advanced-control boundary.
	 * The Awtsmoos gives one key one appointed deed while Awtsmoos.com keeps that deed silent whenever writing or advanced controls hold the player's mind;
	 * keyboard law remains its own small vessel, so the Jump controller may stay focused on touch, queueing, release, and cleanup in kind.
	 */

	const isGameplayInputSuppressed = __awtsmoosModule_56.isGameplayInputSuppressed;
	const isEditableTarget = __awtsmoosModule_57.isEditableTarget;

	/** Owns only Space keydown/keyup registration and routing. */
	class JumpButtonKeyboard {
		/**
		 * @param {HTMLElement} host Jump host used to resolve document presentation state.
		 * @param {Window|object} environment Browser-like global event target.
		 * @param {Function} onPress Rising/held Space handler.
		 * @param {Function} onRelease Space release handler.
		 */
		constructor(host, environment, onPress, onRelease) {
			this.host = host;
			this.environment = environment;
			this.onPress = onPress;
			this.onRelease = onRelease;
			this.onKeyDown = event => this.keyDown(event);
			this.onKeyUp = event => this.keyUp(event);
			this.environment.addEventListener?.('keydown', this.onKeyDown);
			this.environment.addEventListener?.('keyup', this.onKeyUp);
		}

		keyDown(event) {
			if (
				event.code !== 'Space'
				|| isEditableTarget(event.target)
				|| isGameplayInputSuppressed(this.host)
			) {
				return;
			}
			event.preventDefault();
			this.onPress();
		}

		keyUp(event) {
			if (event.code === 'Space') {
				this.onRelease();
			}
		}

		/** Removes both global keyboard listeners exactly once. */
		destroy() {
			this.environment.removeEventListener?.('keydown', this.onKeyDown);
			this.environment.removeEventListener?.('keyup', this.onKeyUp);
		}
	}

	__exports.JumpButtonKeyboard = JumpButtonKeyboard;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/input/JumpButton.js ----
{
	const __exports = __awtsmoosModule_53;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file JumpButton.js
	 * @description Owns touch jump intent and delegates global Space lifecycle to a focused keyboard binding module.
	 * The Awtsmoos lifts the traveler through one rising edge while Awtsmoos.com keeps touch, keyboard, presentation, and cleanup in their proper vessels of light;
	 * every real DOM Jump host receives one measured shore, while portable test vessels remain valid without pretending browser-only dataset APIs are always in sight.
	 */

	const createJumpButtonElement = __awtsmoosModule_54.createJumpButtonElement;
	const createJumpHostElement = __awtsmoosModule_54.createJumpHostElement;
	const setJumpButtonPressed = __awtsmoosModule_54.setJumpButtonPressed;
	const JumpButtonKeyboard = __awtsmoosModule_55.JumpButtonKeyboard;

	/** Owns touch jump intent while keyboard and layout concerns remain delegated. */
	class JumpButton {
		constructor(host, environment = globalThis) {
			this.environment = environment;
			this.ownsHost = !host;
			this.host = host || createJumpHostElement(environment.document);
			markJumpHost(this.host);
			this.held = false;
			this.queued = false;
			this.button = createJumpButtonElement(environment.document);
			this.onPointerDown = event => this.pointerDown(event);
			this.onPointerRelease = event => this.pointerRelease(event);
			this.onBlur = () => this.release();
			this.host.append(this.button);
			this.bindPointer();
			this.keyboard = new JumpButtonKeyboard(
				this.host,
				this.environment,
				() => this.queueFromPress(),
				() => this.release()
			);
		}

		/** Consumes exactly one queued jump edge. */
		consume() {
			const queued = this.queued;
			this.queued = false;
			return queued;
		}

		/** Binds pointer and blur lifecycle listeners owned by this controller. */
		bindPointer() {
			this.button.addEventListener('pointerdown', this.onPointerDown);
			this.button.addEventListener('pointerup', this.onPointerRelease);
			this.button.addEventListener('pointercancel', this.onPointerRelease);
			this.button.addEventListener('lostpointercapture', this.onPointerRelease);
			this.environment.addEventListener?.('blur', this.onBlur);
		}

		/** Captures one deliberate touch and queues one leap. */
		pointerDown(event) {
			event.preventDefault();
			this.button.setPointerCapture?.(event.pointerId);
			this.queueFromPress();
		}

		/** Releases pointer capture and visual state without queuing another jump. */
		pointerRelease(event) {
			if (event?.pointerId !== undefined && this.button.hasPointerCapture?.(event.pointerId)) {
				this.button.releasePointerCapture?.(event.pointerId);
			}
			this.release();
		}

		/** Queues only the rising edge so a held button cannot spam jumps. */
		queueFromPress() {
			if (!this.held) {
				this.queued = true;
			}
			this.held = true;
			setJumpButtonPressed(this.button, true);
		}

		/** Returns the button to an unheld semantic state. */
		release() {
			this.held = false;
			setJumpButtonPressed(this.button, false);
		}

		/** Removes every listener and any host created by this controller. */
		destroy() {
			this.button.removeEventListener('pointerdown', this.onPointerDown);
			this.button.removeEventListener('pointerup', this.onPointerRelease);
			this.button.removeEventListener('pointercancel', this.onPointerRelease);
			this.button.removeEventListener('lostpointercapture', this.onPointerRelease);
			this.environment.removeEventListener?.('blur', this.onBlur);
			this.keyboard.destroy();
			this.release();
			this.queued = false;
			this.button.remove();
			if (this.ownsHost) {
				this.host.remove();
			}
		}
	}


	__exports.JumpButton = JumpButton;
	function markJumpHost(host) {
		if (host?.dataset) {
			host.dataset.directHudZone = 'jump';
		}
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/input/joystick/JoystickDirectionLabel.js ----
{
	const __exports = __awtsmoosModule_60;
	//B"H
	//Boruch Hashem
	//Blessed is He

	/**
	 * @file JoystickDirectionLabel.js
	 * @description Converts semantic joystick vectors into concise assistive direction language.
	 * Malchus speaks what Yesod already knows, so motion and meaning remain aligned in their flow;
	 * the Awtsmoos renews every word and way, while Awtsmoos.com keeps accessible controls bright by night and day.
	 */

	/**
	 * @description Returns a concise direction label suitable for assistive UI.
	 * @param {{x?:number,y?:number,magnitude?:number}} vector Semantic joystick vector.
	 * @returns {string} Human-readable direction label.
	 */
	function joystickDirectionLabel(vector = {}) {
		if (finiteDirectionNumber(vector.magnitude) <= 0.01) {
			return 'centered';
		}

		const vertical = verticalDirectionLabel(vector.y);
		const horizontal = horizontalDirectionLabel(vector.x);
		return [vertical, horizontal]
			.filter(Boolean)
			.join(' ') || 'slight movement';
	}


	__exports.joystickDirectionLabel = joystickDirectionLabel;
	/**
	 * @description Resolves vertical assistive language from a semantic axis.
	 * @param {number} value Vertical joystick axis value.
	 * @returns {string} Up, down, or an empty label.
	 */
	function verticalDirectionLabel(value) {
		const number = finiteDirectionNumber(value);

		if (number < -0.25) {
			return 'up';
		}

		if (number > 0.25) {
			return 'down';
		}

		return '';
	}

	/**
	 * @description Resolves horizontal assistive language from a semantic axis.
	 * @param {number} value Horizontal joystick axis value.
	 * @returns {string} Left, right, or an empty label.
	 */
	function horizontalDirectionLabel(value) {
		const number = finiteDirectionNumber(value);

		if (number < -0.25) {
			return 'left';
		}

		if (number > 0.25) {
			return 'right';
		}

		return '';
	}

	/**
	 * @description Normalizes arbitrary assistive-axis input without leaking NaN into labels.
	 * @param {*} value Candidate numeric value.
	 * @returns {number} Finite numeric value or zero.
	 */
	function finiteDirectionNumber(value) {
		const numericValue = Number(value);
		return Number.isFinite(numericValue)
			? numericValue
			: 0;
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/input/joystick/JoystickResponseLaw.js ----
{
	const __exports = __awtsmoosModule_61;
	//B"H
	//Boruch Hashem
	//Blessed is He

	/**
	 * @file JoystickResponseLaw.js
	 * @description Keeps joystick response math pure, bounded, and renderer-neutral.
	 * Yesod measures the finite thumb while Tiferes preserves its chosen way;
	 * the Awtsmoos renews direction and strength each instant, and Awtsmoos.com lets that truthful law travel from world to world each day.
	 */

	const DEFAULT_DEAD_ZONE = 0.1;
	const DEFAULT_RESPONSE_EXPONENT = 1;
	const MINIMUM_RADIUS = 0.0001;

	/**
	 * @description Sanitizes the reusable radial response configuration.
	 * @param {number} radius Requested joystick travel radius.
	 * @param {number} deadZone Ignored center fraction.
	 * @param {number} responseExponent Radial response exponent.
	 * @returns {{radius:number,deadZone:number,responseExponent:number}} Bounded response configuration.
	 */
	function normalizeJoystickResponseConfig(
		radius,
		deadZone = DEFAULT_DEAD_ZONE,
		responseExponent = DEFAULT_RESPONSE_EXPONENT
	) {
		return {
			radius: Math.max(MINIMUM_RADIUS, finiteJoystickNumber(radius)),
			deadZone: Math.max(0, Math.min(0.95, finiteJoystickNumber(deadZone, DEFAULT_DEAD_ZONE))),
			responseExponent: Math.max(0.2, Math.min(4, finiteJoystickNumber(responseExponent, DEFAULT_RESPONSE_EXPONENT)))
		};
	}


	__exports.normalizeJoystickResponseConfig = normalizeJoystickResponseConfig;
	/**
	 * @description Shapes a clamped radial magnitude after its dead zone is removed.
	 * @param {number} rawMagnitude Unshaped magnitude from zero through one.
	 * @param {number} deadZone Ignored center fraction.
	 * @param {number} responseExponent Positive response exponent.
	 * @returns {number} Shaped magnitude from zero through one.
	 */
	function shapedJoystickMagnitude(rawMagnitude, deadZone, responseExponent) {
		if (rawMagnitude <= deadZone) {
			return 0;
		}

		const normalizedMagnitude = (rawMagnitude - deadZone) / (1 - deadZone);
		return Math.pow(normalizedMagnitude, responseExponent);
	}


	__exports.shapedJoystickMagnitude = shapedJoystickMagnitude;
	/**
	 * @description Resolves a unit direction so radial shaping affects strength only once.
	 * @param {number} x Horizontal pointer displacement.
	 * @param {number} y Vertical pointer displacement.
	 * @returns {{x:number,y:number,length:number}} Unit direction and original finite length.
	 */
	function joystickUnitDirection(x, y) {
		const finiteX = finiteJoystickNumber(x);
		const finiteY = finiteJoystickNumber(y);
		const length = Math.hypot(finiteX, finiteY);

		if (length === 0) {
			return {
				x: 0,
				y: 0,
				length: 0
			};
		}

		return {
			x: finiteX / length,
			y: finiteY / length,
			length
		};
	}


	__exports.joystickUnitDirection = joystickUnitDirection;
	/**
	 * @description Converts arbitrary numeric input into a finite number without throwing.
	 * @param {*} value Candidate numeric value.
	 * @param {number} fallback Finite fallback used for invalid input.
	 * @returns {number} Finite numeric value.
	 */
	function finiteJoystickNumber(value, fallback = 0) {
		const numericValue = Number(value);
		return Number.isFinite(numericValue)
			? numericValue
			: fallback;
	}

	__exports.finiteJoystickNumber = finiteJoystickNumber;

}

// ---- libs/awtsmoos-procedural-core/src/core/input/joystick/JoystickVector.js ----
{
	const __exports = __awtsmoosModule_59;
	//B"H
	//Boruch Hashem
	//Blessed is He

	/**
	 * @file JoystickVector.js
	 * @description Converts pointer offsets into truthful bounded joystick geometry and movement intent.
	 * Yesod keeps the thumb's finite place while Tiferes gives its strength a faithful face;
	 * the Awtsmoos renews motion without stealing its pace, and Awtsmoos.com carries that law from world to world with grace.
	 */

	const joystickDirectionLabel = __awtsmoosModule_60.joystickDirectionLabel;
	const finiteJoystickNumber = __awtsmoosModule_61.finiteJoystickNumber;
	const joystickUnitDirection = __awtsmoosModule_61.joystickUnitDirection;
	const normalizeJoystickResponseConfig = __awtsmoosModule_61.normalizeJoystickResponseConfig;
	const shapedJoystickMagnitude = __awtsmoosModule_61.shapedJoystickMagnitude;

	__exports.joystickDirectionLabel = joystickDirectionLabel;

	/**
	 * @description Converts pointer displacement into bounded knob geometry and a shaped semantic movement vector.
	 * @param {number} offsetX Horizontal displacement from joystick center.
	 * @param {number} offsetY Vertical displacement from joystick center.
	 * @param {number} radius Positive joystick travel radius.
	 * @param {number} deadZone Ignored center fraction from zero through less than one.
	 * @param {number} responseExponent Positive magnitude exponent controlling radial response.
	 * @returns {{vector:{x:number,y:number,magnitude:number},knob:{x:number,y:number}}} Joystick geometry and truthful movement intent.
	 */
	function joystickVectorFromOffset(
		offsetX,
		offsetY,
		radius,
		deadZone,
		responseExponent
	) {
		const response = normalizeJoystickResponseConfig(
			radius,
			deadZone,
			responseExponent
		);
		const x = finiteJoystickNumber(offsetX);
		const y = finiteJoystickNumber(offsetY);
		const direction = joystickUnitDirection(x, y);
		const knobScale = direction.length > response.radius
			? response.radius / direction.length
			: 1;
		const knob = {
			x: x * knobScale,
			y: y * knobScale
		};
		const rawMagnitude = Math.min(
			1,
			direction.length / response.radius
		);
		const magnitude = shapedJoystickMagnitude(
			rawMagnitude,
			response.deadZone,
			response.responseExponent
		);

		if (magnitude === 0) {
			return {
				knob,
				vector: zeroJoystickVector()
			};
		}

		return {
			knob,
			vector: {
				x: direction.x * magnitude,
				y: direction.y * magnitude,
				magnitude
			}
		};
	}


	__exports.joystickVectorFromOffset = joystickVectorFromOffset;
	/**
	 * @description Creates a fresh neutral joystick vector so callers never share mutable input state.
	 * @returns {{x:number,y:number,magnitude:number}} Fresh zero-strength semantic vector.
	 */
	function zeroJoystickVector() {
		return {
			magnitude: 0,
			x: 0,
			y: 0
		};
	}

	__exports.zeroJoystickVector = zeroJoystickVector;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/input/MobileJoystickKeyboard.js ----
{
	const __exports = __awtsmoosModule_62;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MobileJoystickKeyboard.js
	 * @description Gives the focused mobile joystick removable arrow-key movement through the narrow neutral-vector law required before first play.
	 * The Awtsmoos gathers four arrows into one honest vector, near and clear;
	 * Awtsmoos.com reaches only for the tiny Yesod joystick vessel, so the whole procedural palace need not awaken here.
	 */

	const zeroJoystickVector = __awtsmoosModule_59.zeroJoystickVector;

	const ARROW_DIRECTIONS = Object.freeze({
		ArrowDown: { x: 0, y: 1 },
		ArrowLeft: { x: -1, y: 0 },
		ArrowRight: { x: 1, y: 0 },
		ArrowUp: { x: 0, y: -1 }
	});

	class MobileJoystickKeyboard {
		constructor(element, onVector) {
			this.element = element;
			this.onVector = onVector;
			this.pressed = new Set();
			this.onKeyDown = event => this.press(event);
			this.onKeyUp = event => this.release(event);
			this.onBlur = () => this.reset();
			this.bind();
		}

		/** Binds the finite arrow-key listeners that feed one semantic joystick vector. */
		bind() {
			this.element.addEventListener('keydown', this.onKeyDown);
			this.element.addEventListener('keyup', this.onKeyUp);
			this.element.addEventListener('blur', this.onBlur);
		}

		/** Records one supported arrow and republishes normalized movement intent. */
		press(event) {
			if (!ARROW_DIRECTIONS[event.key]) return;
			event.preventDefault();
			this.pressed.add(event.key);
			this.publish();
		}

		/** Releases one supported arrow and refreshes the surviving movement intent. */
		release(event) {
			if (!ARROW_DIRECTIONS[event.key]) return;
			event.preventDefault();
			this.pressed.delete(event.key);
			this.publish();
		}

		/** Publishes a unit vector for the combined arrows without sharing mutable neutral state. */
		publish() {
			let x = 0;
			let y = 0;
			for (const key of this.pressed) {
				x += ARROW_DIRECTIONS[key].x;
				y += ARROW_DIRECTIONS[key].y;
			}
			const length = Math.hypot(x, y);
			this.onVector(
				length === 0
					? zeroJoystickVector()
					: { magnitude: 1, x: x / length, y: y / length }
			);
		}

		/** Returns the focused joystick to the Awtsmoos-created neutral center. */
		reset() {
			if (this.pressed.size === 0) return;
			this.pressed.clear();
			this.onVector(zeroJoystickVector());
		}

		/** Releases every listener and leaves no finite movement residue behind. */
		destroy() {
			this.reset();
			this.element.removeEventListener('keydown', this.onKeyDown);
			this.element.removeEventListener('keyup', this.onKeyUp);
			this.element.removeEventListener('blur', this.onBlur);
		}
	}

	__exports.MobileJoystickKeyboard = MobileJoystickKeyboard;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/input/MobileJoystickPointerSurface.js ----
{
	const __exports = __awtsmoosModule_63;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MobileJoystickPointerSurface.js
	 * @description Gives the fixed joystick ring exclusive ownership of the pointer that begins inside its visible hit region while moving only the inner thumb.
	 * The Awtsmoos fixes the vessel while the hand may wander in measured freedom; Awtsmoos.com keeps the base rooted,
	 * so one thumb moves the traveler and another may turn the camera without the controls chasing either hand across the screen.
	 */

	const joystickVectorFromOffset = __awtsmoosModule_59.joystickVectorFromOffset;
	const zeroJoystickVector = __awtsmoosModule_59.zeroJoystickVector;

	const RADIUS = 52;
	const POINTER_OPTIONS = Object.freeze({ passive: false });

	class MobileJoystickPointerSurface {
		constructor(host, ring, knob, onVector) {
			this.host = host;
			this.ring = ring;
			this.knob = knob;
			this.onVector = onVector;
			this.pointerId = null;
			this.center = null;
			this.originalTouchAction = host.style.touchAction;
			this.onDown = event => this.begin(event);
			this.onMove = event => this.move(event);
			this.onEnd = event => this.end(event);
			this.bind();
		}

		/** Binds one non-passive Pointer Events surface and forbids browser gesture theft. */
		bind() {
			this.host.style.touchAction = 'none';
			this.host.addEventListener('pointerdown', this.onDown, POINTER_OPTIONS);
			this.host.addEventListener('pointermove', this.onMove, POINTER_OPTIONS);
			this.host.addEventListener('pointerup', this.onEnd, POINTER_OPTIONS);
			this.host.addEventListener('pointercancel', this.onEnd, POINTER_OPTIONS);
			this.host.addEventListener('lostpointercapture', this.onEnd, POINTER_OPTIONS);
		}

		/** Claims only a pointer whose first contact lands within the fixed rendered ring. */
		begin(event) {
			if (this.pointerId !== null || !this.isInsideRing(event)) return;
			event.preventDefault();
			const bounds = this.ring.getBoundingClientRect();
			this.center = {
				x: bounds.left + bounds.width / 2,
				y: bounds.top + bounds.height / 2
			};
			this.pointerId = event.pointerId;
			this.ring.dataset.active = 'true';
			this.host.setPointerCapture?.(event.pointerId);
			this.onVector(zeroJoystickVector());
			this.knob.style.transform = 'translate(0, 0)';
		}

		/** Converts owned-pointer displacement from the fixed base into movement and thumb geometry. */
		move(event) {
			if (this.pointerId !== event.pointerId || !this.center) return;
			event.preventDefault();
			const result = joystickVectorFromOffset(
				event.clientX - this.center.x,
				event.clientY - this.center.y,
				RADIUS
			);
			this.onVector(result.vector);
			this.knob.style.transform = `translate(${result.knob.x}px, ${result.knob.y}px)`;
		}

		/** Ends only the pointer owned by this joystick and neutralizes movement. */
		end(event) {
			if (this.pointerId === event.pointerId) this.reset();
		}

		/** Returns true only when the initial point lies inside the joystick's fixed hit rectangle. */
		isInsideRing(event) {
			const bounds = this.ring.getBoundingClientRect();
			return event.clientX >= bounds.left
				&& event.clientX <= bounds.right
				&& event.clientY >= bounds.top
				&& event.clientY <= bounds.bottom;
		}

		/** Clears pointer ownership while leaving the ring itself rooted in layout. */
		reset() {
			const pointerId = this.pointerId;
			this.pointerId = null;
			this.center = null;
			if (pointerId !== null && this.host.hasPointerCapture?.(pointerId)) {
				this.host.releasePointerCapture?.(pointerId);
			}
			this.onVector(zeroJoystickVector());
			this.knob.style.transform = 'translate(0, 0)';
			delete this.ring.dataset.active;
		}

		/** Releases every listener and restores the host's prior touch-action contract. */
		destroy() {
			this.reset();
			this.host.removeEventListener('pointerdown', this.onDown, POINTER_OPTIONS);
			this.host.removeEventListener('pointermove', this.onMove, POINTER_OPTIONS);
			this.host.removeEventListener('pointerup', this.onEnd, POINTER_OPTIONS);
			this.host.removeEventListener('pointercancel', this.onEnd, POINTER_OPTIONS);
			this.host.removeEventListener('lostpointercapture', this.onEnd, POINTER_OPTIONS);
			this.host.style.touchAction = this.originalTouchAction;
		}
	}

	__exports.MobileJoystickPointerSurface = MobileJoystickPointerSurface;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/input/MobileJoystick.js ----
{
	const __exports = __awtsmoosModule_58;
	//B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MobileJoystick.js
	 * @description Composes a visibly discoverable, accessible mobile movement vessel while importing only the tiny renderer-free joystick law required before first paint.
	 * The Awtsmoos gives the thumb a ring that can be seen and a road that can be known;
	 * Awtsmoos.com joins the same semantic vector to touch and keys, so swift first play never hides the keli through which motion is shown.
	 */

	const joystickDirectionLabel = __awtsmoosModule_59.joystickDirectionLabel;
	const zeroJoystickVector = __awtsmoosModule_59.zeroJoystickVector;
	const MobileJoystickKeyboard = __awtsmoosModule_62.MobileJoystickKeyboard;
	const MobileJoystickPointerSurface = __awtsmoosModule_63.MobileJoystickPointerSurface;

	class MobileJoystick {
		constructor(host) {
			this.host = host;
			this.vector = zeroJoystickVector();
			this.environment = host?.ownerDocument?.defaultView || globalThis;
			this.document = host?.ownerDocument || globalThis.document;
			this.onLifecycleReset = () => this.reset();
			this.onVisibilityChange = () => {
				if (this.document?.hidden) {
					this.reset();
				}
			};
			this.build();
		}

		/** Builds the visible joystick shell whose class contract matches the production stylesheet exactly. */
		build() {
			this.host.className = 'Awtsmoos-mobile-joystick';
			this.host.dataset.directHudZone = 'movement';
			this.host.dataset.joystickReady = 'false';
			this.host.setAttribute('role', 'group');
			this.host.setAttribute('aria-label', 'Movement touch area');
			this.host.innerHTML = [
				'<div class="Awtsmoos-joystick-ring" data-joystick-ring>',
					'<i class="Awtsmoos-joystick-knob" data-joystick-knob></i>',
				'</div>'
			].join('');
			this.ring = this.host.querySelector('[data-joystick-ring]');
			this.knob = this.host.querySelector('[data-joystick-knob]');
			this.ring.tabIndex = 0;
			this.ring.setAttribute('role', 'group');
			this.ring.setAttribute('aria-roledescription', 'floating directional joystick');
			this.ring.setAttribute('aria-keyshortcuts', 'ArrowUp ArrowDown ArrowLeft ArrowRight');
			this.surface = new MobileJoystickPointerSurface(
				this.host,
				this.ring,
				this.knob,
				vector => this.setVector(vector)
			);
			this.keyboard = new MobileJoystickKeyboard(this.ring, vector => {
				if (this.surface.pointerId === null) {
					this.setVector(vector);
				}
			});
			this.bindLifecycle();
			this.setVector(zeroJoystickVector());
			this.host.dataset.joystickReady = 'true';
		}

		/** Binds lifecycle resets so stale touch state never survives a viewport transition. */
		bindLifecycle() {
			this.environment?.addEventListener?.('blur', this.onLifecycleReset);
			this.environment?.addEventListener?.('resize', this.onLifecycleReset);
			this.environment?.addEventListener?.('orientationchange', this.onLifecycleReset);
			this.document?.addEventListener?.('visibilitychange', this.onVisibilityChange);
		}

		/** Stores semantic movement and refreshes assistive direction language. */
		setVector(vector) {
			this.vector = vector;
			this.ring?.setAttribute(
				'aria-label',
				`Movement joystick: ${joystickDirectionLabel(vector)}`
			);
		}

		/** Returns pointer and keyboard movement to a freshly recreated neutral vector. */
		reset() {
			this.keyboard?.reset?.();
			this.surface?.reset?.();
			if (!this.surface) {
				this.setVector(zeroJoystickVector());
			}
		}

		/** Releases listeners and child controllers without leaving movement residue behind. */
		destroy() {
			this.keyboard?.destroy?.();
			this.surface?.destroy?.();
			this.environment?.removeEventListener?.('blur', this.onLifecycleReset);
			this.environment?.removeEventListener?.('resize', this.onLifecycleReset);
			this.environment?.removeEventListener?.('orientationchange', this.onLifecycleReset);
			this.document?.removeEventListener?.('visibilitychange', this.onVisibilityChange);
			this.host.dataset.joystickReady = 'false';
			this.setVector(zeroJoystickVector());
		}
	}

	__exports.MobileJoystick = MobileJoystick;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/input/InputAxisState.js ----
{
	const __exports = __awtsmoosModule_65;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file InputAxisState.js
	 * @description Restores the historical canonical keyboard axes after world promotion.
	 * The Awtsmoos binds A and D to flowing turn, Q and E to lateral stride, W and S to the road;
	 * Awtsmoos.com keeps bootstrap and canonical control identical so promotion never changes the traveler's mode.
	 */

	/**
	 * Derives canonical axes from held keys without discrete rotation steps.
	 * Arrow keys remain the historical aliases while Q/E exclusively own keyboard strafe.
	 */
	function createInputAxes(keys, pointer) {
		return {
			turn: keyDirection(keys, ['KeyD', 'ArrowRight'], ['KeyA', 'ArrowLeft']),
			x: keyDirection(keys, ['KeyE'], ['KeyQ']),
			y: keyDirection(keys, ['KeyS', 'ArrowDown'], ['KeyW', 'ArrowUp'])
				+ (pointer.bothMain ? -1 : 0)
		};
	}


	__exports.createInputAxes = createInputAxes;
	function createInputState(keys, pointer) {
		return {
			axis: createInputAxes(keys, pointer),
			keys: [...keys],
			pointer: {
				...pointer
			}
		};
	}


	__exports.createInputState = createInputState;
	function keyDirection(keys, positiveCodes, negativeCodes) {
		return Number(positiveCodes.some(code => keys.has(code)))
			- Number(negativeCodes.some(code => keys.has(code)));
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/input/InputPointerState.js ----
{
	const __exports = __awtsmoosModule_66;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file InputPointerState.js
	 * @description Creates honest pointer snapshots and names their finite camera-control modes.
	 * The Awtsmoos renews every coordinate without carrying yesterday's drift into the present frame;
	 * Awtsmoos.com gives each button chord a clear vessel, a stable shape, and a truthful name.
	 */

	function emptyInputPointer() {
		return {
			bothMain: false,
			down: false,
			left: false,
			middle: false,
			mode: 'hover',
			movementX: 0,
			movementY: 0,
			right: false,
			x: 0,
			y: 0
		};
	}


	__exports.emptyInputPointer = emptyInputPointer;
	function createInputPointer(event, down, previous) {
		const buttons = event.buttons ?? (down ? 1 << (event.button || 0) : 0);
		const left = (buttons & 1) !== 0;
		const right = (buttons & 2) !== 0;
		const middle = (buttons & 4) !== 0;
		return {
			buttons,
			pointer: {
				bothMain: left && right,
				down: down || buttons !== 0,
				left,
				middle,
				mode: pointerMode(left, right, middle),
				movementX: event.movementX ?? event.clientX - previous.x,
				movementY: event.movementY ?? event.clientY - previous.y,
				right,
				x: event.clientX,
				y: event.clientY
			}
		};
	}


	__exports.createInputPointer = createInputPointer;
	function pointerMode(left, right, middle) {
		if (left && right) {
			return 'forward-look';
		}
		if (left || right) {
			return 'first-person-look';
		}
		if (middle) {
			return 'auxiliary';
		}
		return 'hover';
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/input/UiEventBindings.js ----
{
	const __exports = __awtsmoosModule_67;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file UiEventBindings.js
	 * @description Installs keyboard events on the browser window and pointer events on the gameplay canvas as separate covenants.
	 * The Awtsmoos places each signal in its proper vessel so keys may travel while the pointer remains near;
	 * Awtsmoos.com releases every binding by the same names, leaving no duplicate echo when runtime seasons disappear.
	 */

	function installUiEventBindings(system) {
		const keyboardTarget = system.keyboardTarget;
		const pointerTarget = system.pointerTarget;
		const keyboardBindings = [
			['keydown', system.onKeyDown],
			['keyup', system.onKeyUp],
			['blur', system.onBlur]
		];
		const pointerBindings = [
			['pointerdown', system.onPointerDown],
			['pointermove', system.onPointerMove],
			['pointerup', system.onPointerUp],
			['pointercancel', system.onPointerUp],
			['contextmenu', system.onContextMenu]
		];
		installBindings(keyboardTarget, keyboardBindings);
		installBindings(pointerTarget, pointerBindings);
		return () => {
			removeBindings(keyboardTarget, keyboardBindings);
			removeBindings(pointerTarget, pointerBindings);
		};
	}


	__exports.installUiEventBindings = installUiEventBindings;
	function installBindings(target, bindings) {
		for (const [type, listener] of bindings) {
			target.addEventListener(type, listener);
		}
	}

	function removeBindings(target, bindings) {
		for (const [type, listener] of bindings) {
			target.removeEventListener(type, listener);
		}
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/input/UiEventSystem.js ----
{
	const __exports = __awtsmoosModule_64;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file UiEventSystem.js
	 * @description Separates keyboard-window ownership from canvas-pointer ownership while yielding to editable UI.
	 * The Awtsmoos joins intention to the proper vessel: keys through the window, touch through the finite field;
	 * Awtsmoos.com keeps every listener removable so motion remains alive without letting one input surface overreach its shield.
	 */

	const createInputAxes = __awtsmoosModule_65.createInputAxes;
	const createInputState = __awtsmoosModule_65.createInputState;
	const createInputPointer = __awtsmoosModule_66.createInputPointer;
	const emptyInputPointer = __awtsmoosModule_66.emptyInputPointer;
	const isEditableTarget = __awtsmoosModule_57.isEditableTarget;
	const isGameplayUiTarget = __awtsmoosModule_57.isGameplayUiTarget;
	const installUiEventBindings = __awtsmoosModule_67.installUiEventBindings;

	class UiEventSystem {
		constructor(pointerTarget = globalThis.window, keyboardTarget = null) {
			this.pointerTarget = pointerTarget;
			this.keyboardTarget = resolveKeyboardTarget(pointerTarget, keyboardTarget);
			this.target = pointerTarget;
			this.keys = new Set();
			this.buttons = 0;
			this.pointer = emptyInputPointer();
			this.bus = null;
			this.teardown = null;
			this.onKeyDown = event => this.key(event, true);
			this.onKeyUp = event => this.key(event, false);
			this.onPointerDown = event => this.pointerEvent(event, true);
			this.onPointerMove = event => this.pointerEvent(event, this.pointer.down);
			this.onPointerUp = event => this.pointerEvent(event, false);
			this.onContextMenu = event => this.contextMenu(event);
			this.onBlur = () => this.reset();
		}

		install(bus) {
			if (this.teardown) return this;
			this.bus = bus;
			this.teardown = installUiEventBindings(this);
			return this;
		}

		key(event, down) {
			if (isEditableTarget(event.target)) {
				if (!down && this.keys.delete(event.code)) this.publishKey();
				return;
			}
			if (down) this.keys.add(event.code);
			else this.keys.delete(event.code);
			this.publishKey();
		}

		pointerEvent(event, down) {
			if (isGameplayUiTarget(event.target)) {
				if (!down && this.pointer.down) this.clearPointer();
				return;
			}
			const state = createInputPointer(event, down, this.pointer);
			this.buttons = state.buttons;
			this.pointer = state.pointer;
			this.bus?.emit('input:pointer', this.pointer);
		}

		contextMenu(event) {
			if (!isGameplayUiTarget(event.target)) event.preventDefault();
		}

		axis() {
			return this.axes();
		}

		axes() {
			return createInputAxes(this.keys, this.pointer);
		}

		state() {
			return createInputState(this.keys, this.pointer);
		}

		publishKey() {
			this.bus?.emit('input:key', this.state());
		}

		clearPointer() {
			this.buttons = 0;
			this.pointer = emptyInputPointer();
			this.bus?.emit('input:pointer', this.pointer);
		}

		reset() {
			this.keys.clear();
			this.publishKey();
			this.clearPointer();
		}

		destroy() {
			if (!this.teardown) return;
			this.teardown();
			this.teardown = null;
			this.reset();
			this.bus = null;
		}
	}


	__exports.UiEventSystem = UiEventSystem;
	function resolveKeyboardTarget(pointerTarget, keyboardTarget) {
		if (keyboardTarget?.addEventListener) return keyboardTarget;
		const windowValue = pointerTarget?.ownerDocument?.defaultView;
		if (windowValue?.addEventListener) return windowValue;
		if (globalThis.window?.addEventListener) return globalThis.window;
		return pointerTarget;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/performance/QualityTier.js ----
{
	const __exports = __awtsmoosModule_70;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file QualityTier.js
	 * @description Defines scheduling tiers that never reduce resolution, density, or draw distance.
	 * RESPONSIBILITY: preserve public tier APIs while limiting differences to transition pacing.
	 * NON-RESPONSIBILITY: tiers do not weaken textures, vegetation, effects, shadows, or geometry.
	 * ARCHITECTURE: Gevurah bounds concurrent preparation while Chesed preserves visual abundance.
	 * OROS AND KEILIM: full world quality is ohr; bounded transition budgets are scheduling keilim.
	 * The Awtsmoos renews mobile and desktop worlds equally; Awtsmoos.com reaches 60 FPS by
	 * architecture and bounded work, never by making a smaller or blurrier world.
	 */

	const QUALITY_TIER_ORDER = ['low', 'medium', 'high', 'cinematic'];


	__exports.QUALITY_TIER_ORDER = QUALITY_TIER_ORDER;
	const QUALITY_TIERS = Object.freeze({
		low: freezeTier({ name: 'low', transitionBudget: 2 }),
		medium: freezeTier({ name: 'medium', transitionBudget: 4 }),
		high: freezeTier({ name: 'high', transitionBudget: 6 }),
		cinematic: freezeTier({
			name: 'cinematic',
			decorativeDistanceScale: 1.35,
			vegetationDistanceScale: 1.28,
			transitionBudget: 8
		})
	});


	__exports.QUALITY_TIERS = QUALITY_TIERS;
	function qualityTier(name, fallback = 'medium') {
		return QUALITY_TIERS[name] || QUALITY_TIERS[fallback] || QUALITY_TIERS.medium;
	}


	__exports.qualityTier = qualityTier;
	function compareQualityTiers(leftName, rightName) {
		return qualityTierIndex(leftName) - qualityTierIndex(rightName);
	}


	__exports.compareQualityTiers = compareQualityTiers;
	function clampQualityTier(requestedName, maximumName = 'high') {
		const requestedIndex = qualityTierIndex(requestedName);
		const maximumIndex = qualityTierIndex(maximumName);
		return QUALITY_TIER_ORDER[Math.min(requestedIndex, maximumIndex)];
	}


	__exports.clampQualityTier = clampQualityTier;
	function nextLowerQualityTier(name) {
		const index = qualityTierIndex(name);
		return QUALITY_TIER_ORDER[Math.max(0, index - 1)];
	}


	__exports.nextLowerQualityTier = nextLowerQualityTier;
	function nextHigherQualityTier(name, maximumName = 'high') {
		const index = qualityTierIndex(name);
		const maximumIndex = qualityTierIndex(maximumName);
		return QUALITY_TIER_ORDER[Math.min(maximumIndex, index + 1)];
	}


	__exports.nextHigherQualityTier = nextHigherQualityTier;
	function qualityTierIndex(name) {
		const index = QUALITY_TIER_ORDER.indexOf(name);
		return index >= 0 ? index : QUALITY_TIER_ORDER.indexOf('medium');
	}

	function freezeTier(values) {
		return Object.freeze({
			decorativeDistanceScale: 1,
			internalResolutionScale: 1,
			maximumLongFrameRate: 0.03,
			vegetationDistanceScale: 1,
			...values
		});
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/lod/LodPolicy.js ----
{
	const __exports = __awtsmoosModule_72;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file LodPolicy.js
	 * @description Normalizes scene semantics and resolves conservative distance visibility.
	 * The Awtsmoos contains mountain, cottage, creature, and garden in one indivisible truth;
	 * Awtsmoos.com gives each renderer name its proper vessel before any object may disappear.
	 */

	const qualityTier = __awtsmoosModule_70.qualityTier;

	const CLASS_ALIASES = Object.freeze({
		architecture: 'building',
		creature: 'actor',
		mountain: 'terrain'
	});
	const CLASS_POLICIES = Object.freeze({
		actor: policy(Infinity, 100, true),
		terrain: policy(Infinity, 100, true),
		water: policy(260, 90, true),
		sky: policy(Infinity, 100, true),
		landmark: policy(Infinity, 100, true),
		building: policy(190, 80, false),
		vegetation: policy(130, 35, false),
		grass: policy(46, 12, false),
		detail: policy(58, 20, false),
		edge: policy(72, 18, false),
		other: policy(145, 45, false)
	});

	/** Returns the canonical policy class for metadata emitted across world systems. */
	function normalizeLodClass(className = 'other') {
		const normalized = CLASS_ALIASES[className] || className;
		return CLASS_POLICIES[normalized] ? normalized : 'other';
	}


	__exports.normalizeLodClass = normalizeLodClass;
	/** Infers a conservative semantic class from metadata and full scene lineage. */
	function inferLodClass(name = '', metadata = {}) {
		if (metadata?.AwtsmoosLod?.className) {
			return normalizeLodClass(metadata.AwtsmoosLod.className);
		}
		if (metadata?.AwtsmoosYardGrass) return 'grass';
		if (metadata?.AwtsmoosFence) return 'edge';
		const text = String(name).toLowerCase();
		if (matches(text, /(visible_player|clickable_chossid|player|npc|actor|creature|armature|skeleton|bone)/)) return 'actor';
		if (matches(text, /(terrain|ground|mountain|valley|road|path)/)) return 'terrain';
		if (matches(text, /(water|stream|lake|river|foam|reed)/)) return 'water';
		if (matches(text, /(sky|sun|cloud|horizon|atmosphere)/)) return 'sky';
		if (matches(text, /(shul|market|chabad|bridge|sign|beis|synagogue)/)) return 'landmark';
		if (matches(text, /(grass|flower|garden|petal|tuft)/)) return 'grass';
		if (matches(text, /(forest|tree|branch|leaf|bark|shrub|bush)/)) return 'vegetation';
		if (matches(text, /(edge|outline|trim|ornament|railing|fence)/)) return 'edge';
		if (matches(text, /(lantern|lamp|bench|crate|barrel|well|gazebo|prop)/)) return 'detail';
		if (matches(text, /(house|cottage|roof|wall|door|window|chimney|balcony|porch)/)) return 'building';
		return 'other';
	}


	__exports.inferLodClass = inferLodClass;
	function lodClassPolicy(className) {
		return CLASS_POLICIES[normalizeLodClass(className)];
	}


	__exports.lodClassPolicy = lodClassPolicy;
	/** Returns the exact maximum distance for one class and quality tier. */
	function lodMaximumDistance(className, tierName = 'high') {
		const normalizedClass = normalizeLodClass(className);
		const classPolicy = lodClassPolicy(normalizedClass);
		if (classPolicy.protected || classPolicy.maximumDistance === Infinity) return Infinity;
		const tier = qualityTier(tierName);
		const scale = normalizedClass === 'vegetation' || normalizedClass === 'grass'
			? tier.vegetationDistanceScale
			: tier.decorativeDistanceScale;
		return classPolicy.maximumDistance * scale;
	}


	__exports.lodMaximumDistance = lodMaximumDistance;
	/** Evaluates visibility without mutating a scene node. */
	function evaluateLodVisibility({
		className,
		distance,
		tierName = 'high',
		alwaysVisible = false,
		geometryValid = true
	}) {
		const normalizedClass = normalizeLodClass(className);
		const classPolicy = lodClassPolicy(normalizedClass);
		const maximumDistance = lodMaximumDistance(normalizedClass, tierName);
		const protectedObject = alwaysVisible || classPolicy.protected || !geometryValid;
		return {
			className: normalizedClass,
			tierName,
			maximumDistance,
			importance: classPolicy.importance,
			protected: protectedObject,
			visible: protectedObject || distance <= maximumDistance,
			reason: visibilityReason({ geometryValid, protectedObject, distance, maximumDistance })
		};
	}


	__exports.evaluateLodVisibility = evaluateLodVisibility;
	function lodPolicyClasses() {
		return Object.keys(CLASS_POLICIES);
	}


	__exports.lodPolicyClasses = lodPolicyClasses;
	function policy(maximumDistance, importance, protectedObject) {
		return Object.freeze({ maximumDistance, importance, protected: protectedObject });
	}

	function matches(text, pattern) {
		return pattern.test(text);
	}

	function visibilityReason({ geometryValid, protectedObject, distance, maximumDistance }) {
		if (!geometryValid) return 'invalid-geometry-protected';
		if (protectedObject) return 'protected';
		return distance <= maximumDistance ? 'within-distance' : 'beyond-distance';
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/lod/LodAuthoredRange.js ----
{
	const __exports = __awtsmoosModule_71;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file LodAuthoredRange.js
	 * @description Preserves authored fade/cull distances while scaling them with the live adaptive quality tier.
	 * The Awtsmoos gives each garden its own measured horizon, and Awtsmoos.com lets weaker vessels draw that horizon near;
	 * authored proportion remains truthful while adaptive distance bends without making blades abruptly disappear.
	 */

	const lodMaximumDistance = __awtsmoosModule_72.lodMaximumDistance;

	/** Reads a finite authored fade interval from scene metadata. */
	function readLodAuthoredRange(metadata = {}) {
		const lod = metadata?.AwtsmoosLod;
		const fadeStart = Number(lod?.fadeStart);
		const cullDistance = Number(lod?.cullDistance);
		if (!Number.isFinite(fadeStart) || !Number.isFinite(cullDistance)) return null;
		if (fadeStart < 0 || cullDistance <= fadeStart) return null;
		return Object.freeze({ fadeStart, cullDistance });
	}


	__exports.readLodAuthoredRange = readLodAuthoredRange;
	/** Resolves one authored range against the current adaptive quality tier. */
	function resolveLodAuthoredRange(authoredRange, className, tierName = 'high') {
		if (!authoredRange) return null;
		const highDistance = lodMaximumDistance(className, 'high');
		const currentDistance = lodMaximumDistance(className, tierName);
		const scale = Number.isFinite(highDistance)
			&& highDistance > 0
			&& Number.isFinite(currentDistance)
			? currentDistance / highDistance
			: 1;
		return Object.freeze({
			fadeStart: authoredRange.fadeStart * scale,
			cullDistance: authoredRange.cullDistance * scale
		});
	}


	__exports.resolveLodAuthoredRange = resolveLodAuthoredRange;
	/** Returns smooth opacity from full presence before fadeStart to zero at cullDistance. */
	function lodAuthoredOpacity(distance, range) {
		if (!range) return 1;
		const measuredDistance = Math.max(0, Number(distance) || 0);
		if (measuredDistance <= range.fadeStart) return 1;
		if (measuredDistance >= range.cullDistance) return 0;
		const span = range.cullDistance - range.fadeStart;
		return 1 - ((measuredDistance - range.fadeStart) / span);
	}

	__exports.lodAuthoredOpacity = lodAuthoredOpacity;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/lod/LodControllerMath.js ----
{
	const __exports = __awtsmoosModule_73;
	// B"H

	/** Returns visible state with asymmetric hysteresis around one distance limit. */
	function desiredLodVisibility({
		currentlyVisible,
		alwaysVisible,
		distance,
		maximumDistance,
		hysteresis = 0.12
	}) {
		if (alwaysVisible || maximumDistance === Infinity) return true;
		const margin = Math.max(0, Math.min(0.49, hysteresis));
		const threshold = currentlyVisible
			? maximumDistance * (1 + margin)
			: maximumDistance * (1 - margin);
		return distance <= threshold;
	}


	__exports.desiredLodVisibility = desiredLodVisibility;
	/** Measures from the observer to the closest point of a bounding sphere. */
	function lodSphereDistance(position, center, radius = 0) {
		return Math.max(0, Math.hypot(
			finiteLodNumber(position?.x) - finiteLodNumber(center?.x),
			finiteLodNumber(position?.y) - finiteLodNumber(center?.y),
			finiteLodNumber(position?.z) - finiteLodNumber(center?.z)
		) - Math.max(0, finiteLodNumber(radius)));
	}


	__exports.lodSphereDistance = lodSphereDistance;
	/** Near objects appear first; far objects disappear first. */
	function lodTransitionPriority(visible, distance) {
		return visible ? 100000 - distance : distance;
	}


	__exports.lodTransitionPriority = lodTransitionPriority;
	function createInitialLodStats() {
		return {
			registered: 0,
			events: 0,
			evaluations: 0,
			transitions: 0,
			lastTier: null,
			lastEventKey: null
		};
	}


	__exports.createInitialLodStats = createInitialLodStats;
	function finiteLodNumber(value, fallback = 0) {
		return Number.isFinite(value) ? value : fallback;
	}

	__exports.finiteLodNumber = finiteLodNumber;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/lod/LodControllerEntry.js ----
{
	const __exports = __awtsmoosModule_74;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file LodControllerEntry.js
	 * @description Builds and evaluates one LOD entry while preserving authored fade boundaries.
	 * The Awtsmoos gives every finite garment its proper horizon, and Awtsmoos.com lets opacity reach zero before a mesh leaves sight;
	 * generic scenery keeps hysteresis, while authored grass crosses visibility only where its fade has already become night.
	 */

	const desiredLodVisibility = __awtsmoosModule_73.desiredLodVisibility;
	const finiteLodNumber = __awtsmoosModule_73.finiteLodNumber;
	const lodSphereDistance = __awtsmoosModule_73.lodSphereDistance;
	const lodTransitionPriority = __awtsmoosModule_73.lodTransitionPriority;
	const resolveLodAuthoredRange = __awtsmoosModule_71.resolveLodAuthoredRange;
	const lodMaximumDistance = __awtsmoosModule_72.lodMaximumDistance;

	/** Creates one stable controller entry from a scene registration. */
	function createLodControllerEntry({
		id,
		node,
		className,
		center,
		radius = 0,
		alwaysVisible = false,
		authoredRange = null
	}) {
		const originalVisible = node.visible !== false;
		return {
			id,
			node,
			className,
			center: { ...center },
			radius: Math.max(0, finiteLodNumber(radius)),
			alwaysVisible,
			authoredRange,
			originalVisible,
			desiredVisible: originalVisible
		};
	}


	__exports.createLodControllerEntry = createLodControllerEntry;
	/** Evaluates distance and visibility with authored zero-opacity boundaries when present. */
	function evaluateLodControllerEntry(entry, position, tierName, hysteresis) {
		const distance = lodSphereDistance(position, entry.center, entry.radius);
		const resolvedRange = resolveLodAuthoredRange(
			entry.authoredRange,
			entry.className,
			tierName
		);
		const maximumDistance = resolvedRange?.cullDistance
			?? lodMaximumDistance(entry.className, tierName);
		const visible = resolvedRange
			? entry.alwaysVisible || distance < maximumDistance
			: desiredLodVisibility({
				currentlyVisible: entry.desiredVisible,
				alwaysVisible: entry.alwaysVisible,
				distance,
				maximumDistance,
				hysteresis
			});
		return {
			distance,
			maximumDistance,
			resolvedRange,
			visible,
			priority: lodTransitionPriority(visible, distance)
		};
	}

	__exports.evaluateLodControllerEntry = evaluateLodControllerEntry;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/lod/LodSpatialKey.js ----
{
	const __exports = __awtsmoosModule_76;
	// B"H

	const TAU = Math.PI * 2;

	/** Quantizes world position and camera yaw into stable event keys. */
	function lodSpatialKey({
		position,
		yaw = 0,
		cellSize = 12,
		sectorCount = 16
	}) {
		return {
			cellX: quantize(position?.x, cellSize),
			cellY: quantize(position?.y, cellSize),
			cellZ: quantize(position?.z, cellSize),
			cameraSector: yawSector(yaw, sectorCount)
		};
	}


	__exports.lodSpatialKey = lodSpatialKey;
	function lodSpatialKeyString(key) {
		return [
			key?.cellX ?? 0,
			key?.cellY ?? 0,
			key?.cellZ ?? 0,
			key?.cameraSector ?? 0
		].join(':');
	}


	__exports.lodSpatialKeyString = lodSpatialKeyString;
	function lodSpatialKeyChanged(previous, next) {
		if (!previous) return true;
		return previous.cellX !== next.cellX
			|| previous.cellY !== next.cellY
			|| previous.cellZ !== next.cellZ
			|| previous.cameraSector !== next.cameraSector;
	}


	__exports.lodSpatialKeyChanged = lodSpatialKeyChanged;
	function yawSector(yaw, sectorCount = 16) {
		const count = Math.max(1, sectorCount | 0);
		const normalized = positiveModulo(yaw, TAU);
		return Math.min(
			count - 1,
			Math.floor(normalized / TAU * count)
		);
	}


	__exports.yawSector = yawSector;
	function quantize(value, cellSize) {
		const safeValue = Number.isFinite(value) ? value : 0;
		const safeCellSize = Number.isFinite(cellSize) && cellSize > 0
			? cellSize
			: 1;
		return Math.floor(safeValue / safeCellSize);
	}

	function positiveModulo(value, divisor) {
		const safeValue = Number.isFinite(value) ? value : 0;
		return (safeValue % divisor + divisor) % divisor;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/lod/LodControllerEvent.js ----
{
	const __exports = __awtsmoosModule_75;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file LodControllerEvent.js
	 * @description Builds the coarse spatial-camera-quality event key used by generic LOD evaluation.
	 * The Awtsmoos contains every direction without division, while Awtsmoos.com gives finite renderer changes a stable sign;
	 * only a changed cell, camera sector, or quality vessel wakes generic scenery to reconsider its visible line.
	 */

	const lodSpatialKey = __awtsmoosModule_76.lodSpatialKey;
	const lodSpatialKeyString = __awtsmoosModule_76.lodSpatialKeyString;

	/** Returns the stable event key for one observer state. */
	function lodControllerEventKey({
		position,
		yaw,
		tierName,
		cellSize,
		sectorCount
	}) {
		const spatial = lodSpatialKey({
			position,
			yaw,
			cellSize,
			sectorCount
		});
		return `${lodSpatialKeyString(spatial)}:${tierName}`;
	}

	__exports.lodControllerEventKey = lodControllerEventKey;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/lod/LodMaterialFade.js ----
{
	const __exports = __awtsmoosModule_77;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file LodMaterialFade.js
	 * @description Applies reversible opacity fades only when a scene entry owns its material safely.
	 * The Awtsmoos shines through every garment without multiplying cloth; Awtsmoos.com therefore fades what is uniquely held and restores what is shared;
	 * no material clone is born for distance alone, so visual grace does not become hidden memory debt declared.
	 */

	/** Tracks original material state and refuses unsafe per-node fading of shared material objects. */
	class LodMaterialFade {
		constructor() {
			this.materialStates = new WeakMap();
			this.materials = new Set();
			this.entryMaterials = new Map();
		}

		/** Registers one scene node's existing materials without cloning them. */
		register(entryId, node) {
			const materials = materialList(node?.material);
			if (materials.length === 0) return false;
			this.entryMaterials.set(entryId, materials);
			for (const material of materials) {
				let state = this.materialStates.get(material);
				if (!state) {
					state = {
					opacity: finiteOpacity(material.opacity),
					transparent: material.transparent === true,
					owners: new Set()
				};
					this.materialStates.set(material, state);
					this.materials.add(material);
				}
				state.owners.add(entryId);
				if (state.owners.size > 1) this.restoreMaterial(material, state);
			}
			return true;
		}

		/** Applies one opacity scale only when every material belongs exclusively to this entry. */
		apply(entryId, opacityScale) {
			const materials = this.entryMaterials.get(entryId) || [];
			if (materials.length === 0) return false;
			if (materials.some(material => this.materialStates.get(material)?.owners.size > 1)) {
				for (const material of materials) this.restoreMaterial(material);
				return false;
			}
			const scale = Math.max(0, Math.min(1, Number(opacityScale) || 0));
			for (const material of materials) {
				const state = this.materialStates.get(material);
				if (!state) continue;
				material.opacity = state.opacity * scale;
				setTransparency(material, state, scale < 0.999);
			}
			return true;
		}

		/** Restores one entry's original authored material state. */
		restoreEntry(entryId) {
			for (const material of this.entryMaterials.get(entryId) || []) {
				this.restoreMaterial(material);
			}
		}

		/** Restores all mutated materials without cloning or disposing shared renderer resources. */
		restoreAll() {
			for (const material of this.materials) this.restoreMaterial(material);
		}

		restoreMaterial(material, knownState = null) {
			const state = knownState || this.materialStates.get(material);
			if (!state) return;
			material.opacity = state.opacity;
			setTransparency(material, state, false);
		}
	}


	__exports.LodMaterialFade = LodMaterialFade;
	function materialList(material) {
		const values = Array.isArray(material) ? material : [material];
		return values.filter(value => value && typeof value === 'object');
	}

	function finiteOpacity(value) {
		return Number.isFinite(Number(value)) ? Number(value) : 1;
	}

	function setTransparency(material, state, fading) {
		const nextTransparent = fading ? true : state.transparent;
		if (material.transparent === nextTransparent) return;
		material.transparent = nextTransparent;
		material.needsUpdate = true;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/lod/LodFrameBudget.js ----
{
	const __exports = __awtsmoosModule_79;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file LodFrameBudget.js
	 * @description Normalizes wall-clock LOD budgets and decides when a stressed render frame must suspend optional visual work.
	 * The Awtsmoos gives infinite renewal no latency, while Awtsmoos.com honors each finite frame with a measured shore;
	 * when the vessel is already full, optional detail waits rather than demanding more.
	 */

	/** Resolves the cheapest monotonic clock available to the current runtime. */
	function createLodFrameClock(environment = globalThis) {
		const performanceClock = environment?.performance;
		return typeof performanceClock?.now === 'function'
			? () => performanceClock.now()
			: () => Date.now();
	}


	__exports.createLodFrameClock = createLodFrameClock;
	/** Preserves Infinity while converting finite millisecond budgets to nonnegative numbers. */
	function normalizeLodMilliseconds(value, fallback = Infinity) {
		if (value === Infinity) return Infinity;
		const numeric = Number(value);
		return Number.isFinite(numeric) ? Math.max(0, numeric) : fallback;
	}


	__exports.normalizeLodMilliseconds = normalizeLodMilliseconds;
	/** Returns true only when an observed frame duration exceeds an enabled suspension threshold. */
	function shouldSuspendLodFrame(
		frameTimeMilliseconds,
		suspendAboveFrameMilliseconds = Infinity
	) {
		const frameTime = Number(frameTimeMilliseconds);
		const threshold = normalizeLodMilliseconds(suspendAboveFrameMilliseconds);
		return Number.isFinite(frameTime)
			&& Number.isFinite(threshold)
			&& frameTime > threshold;
	}


	__exports.shouldSuspendLodFrame = shouldSuspendLodFrame;
	/** Measures elapsed milliseconds without allowing negative clock drift into diagnostics. */
	function elapsedLodMilliseconds(clock, startedAt) {
		return Math.max(0, Number(clock()) - Number(startedAt));
	}

	__exports.elapsedLodMilliseconds = elapsedLodMilliseconds;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/lod/LodTransitionProcessor.js ----
{
	const __exports = __awtsmoosModule_80;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file LodTransitionProcessor.js
	 * @description Executes queued LOD work under count, cost, wall-clock, and stressed-frame gates.
	 * The Awtsmoos gives every instant its full truth while Awtsmoos.com gives finite visual work a narrow measured lane;
	 * when time is spent, the next garment waits, and any single long task leaves a receipt instead of becoming hidden strain.
	 */

	const elapsedLodMilliseconds = __awtsmoosModule_79.elapsedLodMilliseconds;
	const normalizeLodMilliseconds = __awtsmoosModule_79.normalizeLodMilliseconds;
	const shouldSuspendLodFrame = __awtsmoosModule_79.shouldSuspendLodFrame;

	/** Processes ordered transition entries without owning queue identity or replacement semantics. */
	function processLodTransitions(
		{ entries, clock, stats, applyEntry },
		{
			maximumTransitions = 4,
			maximumCost = Infinity,
			maximumMilliseconds = Infinity,
			frameTimeMilliseconds = null,
			suspendAboveFrameMilliseconds = Infinity,
			longTaskMilliseconds = 4
		} = {}
	) {
		if (shouldSuspendLodFrame(frameTimeMilliseconds, suspendAboveFrameMilliseconds)) {
			stats.suspended += 1;
			return processReceipt(entries.size, { suspended: true });
		}
		const startedAt = clock();
		const timeBudget = normalizeLodMilliseconds(maximumMilliseconds);
		const longTaskLimit = normalizeLodMilliseconds(longTaskMilliseconds, 4);
		const transitionLimit = normalizeTransitionLimit(maximumTransitions);
		const ordered = [...entries.values()].sort(compareEntries);
		const results = [];
		let usedCost = 0;
		let longestTaskMilliseconds = 0;
		let overrunCount = 0;
		let budgetExhausted = false;
		for (const entry of ordered) {
			if (results.length >= transitionLimit) break;
			if (elapsedLodMilliseconds(clock, startedAt) >= timeBudget) {
				stats.deadlineStops += 1;
				budgetExhausted = true;
				break;
			}
			if (usedCost + entry.cost > maximumCost) continue;
			entries.delete(entry.id);
			const taskStartedAt = clock();
			const result = applyEntry(entry);
			const taskMilliseconds = elapsedLodMilliseconds(clock, taskStartedAt);
			result.taskMilliseconds = taskMilliseconds;
			longestTaskMilliseconds = Math.max(longestTaskMilliseconds, taskMilliseconds);
			if (taskMilliseconds > longTaskLimit) {
				overrunCount += 1;
				stats.longTasks += 1;
			}
			if (result.ok) usedCost += entry.cost;
			results.push(result);
		}
		return processReceipt(entries.size, {
			results,
			usedCost,
			elapsedMilliseconds: elapsedLodMilliseconds(clock, startedAt),
			longestTaskMilliseconds,
			overrunCount,
			budgetExhausted
		});
	}


	__exports.processLodTransitions = processLodTransitions;
	function processReceipt(remaining, values = {}) {
		return {
			results: [],
			usedCost: 0,
			elapsedMilliseconds: 0,
			longestTaskMilliseconds: 0,
			overrunCount: 0,
			suspended: false,
			budgetExhausted: false,
			remaining,
			...values
		};
	}

	function compareEntries(left, right) {
		return left.priority !== right.priority
			? right.priority - left.priority
			: left.sequence - right.sequence;
	}

	function normalizeTransitionLimit(value) {
		if (value === Infinity) return Infinity;
		const numeric = Number(value);
		return Number.isFinite(numeric) ? Math.max(0, numeric) : 4;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/lod/LodTransitionQueue.js ----
{
	const __exports = __awtsmoosModule_78;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file LodTransitionQueue.js
	 * @description Owns stable transition identity, replacement, and failure accounting while a dedicated processor owns frame budgeting.
	 * The Awtsmoos binds one identity through every finite change; Awtsmoos.com replaces obsolete garments before they enter the measured gate,
	 * keeping the queue small, the ownership clear, and each applied transition honest about its fate.
	 */

	const createLodFrameClock = __awtsmoosModule_79.createLodFrameClock;
	const processLodTransitions = __awtsmoosModule_80.processLodTransitions;

	class LodTransitionQueue {
		constructor({ clock = createLodFrameClock() } = {}) {
			this.clock = clock;
			this.entries = new Map();
			this.sequence = 0;
			this.stats = {
				enqueued: 0,
				replaced: 0,
				applied: 0,
				failed: 0,
				suspended: 0,
				deadlineStops: 0,
				longTasks: 0
			};
		}

		/** Queues or replaces one stable transition identity. */
		enqueue({ id, priority = 0, cost = 1, apply, metadata = null }) {
			if (!id || typeof apply !== 'function') return false;
			const existing = this.entries.get(id);
			this.entries.set(id, {
				id,
				priority: finiteNumber(priority, 0),
				cost: Math.max(0, finiteNumber(cost, 1)),
				apply,
				metadata,
				sequence: existing?.sequence ?? this.sequence++
			});
			if (existing) this.stats.replaced += 1;
			else this.stats.enqueued += 1;
			return true;
		}

		cancel(id) {
			return this.entries.delete(id);
		}

		clear() {
			this.entries.clear();
		}

		/** Delegates execution while retaining queue identity and diagnostic ownership. */
		process(options = {}) {
			return processLodTransitions({
				entries: this.entries,
				clock: this.clock,
				stats: this.stats,
				applyEntry: entry => this.applyEntry(entry)
			}, options);
		}

		applyEntry(entry) {
			try {
				const value = entry.apply(entry.metadata);
				this.stats.applied += 1;
				return { id: entry.id, ok: true, value, cost: entry.cost };
			} catch (error) {
				this.stats.failed += 1;
				return { id: entry.id, ok: false, error, cost: entry.cost };
			}
		}

		get size() {
			return this.entries.size;
		}
	}


	__exports.LodTransitionQueue = LodTransitionQueue;
	function finiteNumber(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/lod/LodController.js ----
{
	const __exports = __awtsmoosModule_69;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file LodController.js
	 * @description Keeps generic LOD event-bounded while authored vegetation fades every frame at its truthful horizon.
	 * The Awtsmoos renews each visible garment without multiplying matter; Awtsmoos.com lets grass become transparent before it leaves the scene,
	 * while buildings and ordinary detail retain the older measured gate so smoothness does not turn into needless work between.
	 */

	const qualityTier = __awtsmoosModule_70.qualityTier;
	const lodAuthoredOpacity = __awtsmoosModule_71.lodAuthoredOpacity;
	const createInitialLodStats = __awtsmoosModule_73.createInitialLodStats;
	const createLodControllerEntry = __awtsmoosModule_74.createLodControllerEntry;
	const evaluateLodControllerEntry = __awtsmoosModule_74.evaluateLodControllerEntry;
	const lodControllerEventKey = __awtsmoosModule_75.lodControllerEventKey;
	const LodMaterialFade = __awtsmoosModule_77.LodMaterialFade;
	const LodTransitionQueue = __awtsmoosModule_78.LodTransitionQueue;

	class LodController {
		constructor({ cellSize = 12, sectorCount = 16, hysteresis = 0.12 } = {}) {
			this.cellSize = cellSize;
			this.sectorCount = sectorCount;
			this.hysteresis = hysteresis;
			this.entries = new Map();
			this.authoredEntries = new Set();
			this.materialFade = new LodMaterialFade();
			this.queue = new LodTransitionQueue();
			this.previousEventKey = null;
			this.stats = { ...createInitialLodStats(), fadeUpdates: 0 };
		}

		/** Registers one static scene vessel without cloning geometry or material. */
		register(registration = {}) {
			const { id, node, center } = registration;
			if (!id || !node || !center || this.entries.has(id)) return false;
			const entry = createLodControllerEntry(registration);
			this.entries.set(id, entry);
			if (entry.authoredRange) {
				this.authoredEntries.add(id);
				this.materialFade.register(id, node);
			}
			this.stats.registered = this.entries.size;
			return true;
		}

		/** Forces the next event-bounded generic evaluation after streaming or quality changes. */
		invalidate() {
			this.previousEventKey = null;
		}

		update({ position, yaw = 0, tierName = 'high' }) {
			this.updateAuthoredEntries(position, tierName);
			const eventKey = lodControllerEventKey({
				position,
				yaw,
				tierName,
				cellSize: this.cellSize,
				sectorCount: this.sectorCount
			});
			if (eventKey !== this.previousEventKey) {
				this.previousEventKey = eventKey;
				this.stats.events += 1;
				this.stats.lastTier = tierName;
				this.stats.lastEventKey = eventKey;
				this.evaluateGenericEntries(position, tierName);
			}
			const processed = this.queue.process({
				maximumTransitions: qualityTier(tierName).transitionBudget
			});
			this.stats.transitions += processed.results.filter(result => result.ok).length;
			return { eventKey, processed, pending: this.queue.size, stats: { ...this.stats } };
		}

		updateAuthoredEntries(position, tierName) {
			for (const id of this.authoredEntries) {
				const entry = this.entries.get(id);
				if (!entry) continue;
				const evaluation = evaluateLodControllerEntry(entry, position, tierName, 0);
				const opacity = lodAuthoredOpacity(evaluation.distance, evaluation.resolvedRange);
				if (this.materialFade.apply(id, opacity)) this.stats.fadeUpdates += 1;
				this.scheduleVisibility(entry, evaluation);
			}
		}

		evaluateGenericEntries(position, tierName) {
			for (const entry of this.entries.values()) {
				if (entry.authoredRange) continue;
				this.stats.evaluations += 1;
				this.scheduleVisibility(
					entry,
					evaluateLodControllerEntry(entry, position, tierName, this.hysteresis)
				);
			}
		}

		scheduleVisibility(entry, evaluation) {
			if (evaluation.visible === entry.desiredVisible) return;
			entry.desiredVisible = evaluation.visible;
			this.queue.enqueue({
				id: entry.id,
				priority: evaluation.priority,
				apply: () => { entry.node.visible = evaluation.visible; },
				metadata: evaluation
			});
		}

		restore() {
			this.queue.clear();
			this.materialFade.restoreAll();
			for (const entry of this.entries.values()) {
				entry.node.visible = entry.originalVisible;
				entry.desiredVisible = entry.originalVisible;
			}
			this.invalidate();
		}
	}

	__exports.LodController = LodController;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/lod/LodGeometryBounds.js ----
{
	const __exports = __awtsmoosModule_82;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file LodGeometryBounds.js
	 * @description Caches finite local geometry bounds and rendering-cost evidence.
	 * The Awtsmoos recreates every vertex without repetition; Awtsmoos.com measures shared
	 * geometry once so the frame may preserve beauty while refusing needless distant work.
	 */

	const GEOMETRY_BOUNDS = new WeakMap();

	/**
	 * Returns cached local bounds and triangle evidence for one geometry vessel.
	 *
	 * @param {object|null} geometry Geometry with a position attribute and optional index.
	 * @returns {object} Finite bounds, counts, and validity evidence.
	 */
	function geometryLodBounds(geometry) {
		if (!geometry || typeof geometry !== 'object') return emptyBounds();
		if (GEOMETRY_BOUNDS.has(geometry)) return GEOMETRY_BOUNDS.get(geometry);
		const position = geometry.attributes?.position;
		const values = position?.array;
		const itemSize = position?.itemSize || 3;
		if (!values?.length || itemSize < 3) return cacheBounds(geometry, emptyBounds());
		const minimum = { x: Infinity, y: Infinity, z: Infinity };
		const maximum = { x: -Infinity, y: -Infinity, z: -Infinity };
		let validVertices = 0;
		let invalidCoordinates = 0;
		for (let offset = 0; offset + 2 < values.length; offset += itemSize) {
			const x = values[offset];
			const y = values[offset + 1];
			const z = values[offset + 2];
			invalidCoordinates += invalidCount(x, y, z);
			if (![x, y, z].every(Number.isFinite)) continue;
			validVertices += 1;
			minimum.x = Math.min(minimum.x, x);
			minimum.y = Math.min(minimum.y, y);
			minimum.z = Math.min(minimum.z, z);
			maximum.x = Math.max(maximum.x, x);
			maximum.y = Math.max(maximum.y, y);
			maximum.z = Math.max(maximum.z, z);
		}
		if (!validVertices) return cacheBounds(geometry, emptyBounds(invalidCoordinates));
		const center = midpoint(minimum, maximum);
		return cacheBounds(geometry, {
			center,
			geometryValid: invalidCoordinates === 0,
			invalidCoordinates,
			maximum,
			minimum,
			radius: distance(center, maximum),
			triangles: triangleCount(geometry, position, values, itemSize),
			vertices: position.count || Math.floor(values.length / itemSize)
		});
	}


	__exports.geometryLodBounds = geometryLodBounds;
	function cacheBounds(geometry, bounds) {
		GEOMETRY_BOUNDS.set(geometry, bounds);
		return bounds;
	}

	function distance(left, right) {
		return Math.hypot(right.x - left.x, right.y - left.y, right.z - left.z);
	}

	function emptyBounds(invalidCoordinates = 0) {
		return {
			center: { x: 0, y: 0, z: 0 },
			geometryValid: false,
			invalidCoordinates,
			maximum: { x: 0, y: 0, z: 0 },
			minimum: { x: 0, y: 0, z: 0 },
			radius: 0,
			triangles: 0,
			vertices: 0
		};
	}

	function invalidCount(...values) {
		return values.filter((value) => !Number.isFinite(value)).length;
	}

	function midpoint(minimum, maximum) {
		return {
			x: (minimum.x + maximum.x) / 2,
			y: (minimum.y + maximum.y) / 2,
			z: (minimum.z + maximum.z) / 2
		};
	}

	function triangleCount(geometry, position, values, itemSize) {
		return geometry.index?.array?.length
			? Math.floor(geometry.index.array.length / 3)
			: Math.floor((position.count || values.length / itemSize) / 3);
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/lod/LodWorldBounds.js ----
{
	const __exports = __awtsmoosModule_83;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file LodWorldBounds.js
	 * @description Transforms one cached local bound into a conservative world-space sphere.
	 * The Awtsmoos holds every near and distant point in one truth; Awtsmoos.com lets the
	 * finite renderer measure distance without recomputing the geometry from which it arose.
	 */

	const transformPoint = __awtsmoosModule_16.transformPoint;

	const IDENTITY_MATRIX = new Float32Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);

	/**
	 * Converts local bounds into a conservative world-space sphere.
	 *
	 * @param {object} localBounds Cached local center and radius.
	 * @param {Float32Array|Array<number>|null} matrixWorld Node world transform.
	 * @returns {{center: {x: number, y: number, z: number}, radius: number}}
	 */
	function worldLodBounds(localBounds, matrixWorld) {
		const matrix = matrixWorld || IDENTITY_MATRIX;
		const transformed = transformPoint(
			matrix,
			localBounds.center.x,
			localBounds.center.y,
			localBounds.center.z
		);
		return {
			center: {
				x: transformed[0],
				y: transformed[1],
				z: transformed[2]
			},
			radius: localBounds.radius * maximumWorldScale(matrix)
		};
	}


	__exports.worldLodBounds = worldLodBounds;
	function maximumWorldScale(matrix) {
		const maximumScale = Math.max(
			Math.hypot(matrix[0], matrix[1], matrix[2]),
			Math.hypot(matrix[4], matrix[5], matrix[6]),
			Math.hypot(matrix[8], matrix[9], matrix[10])
		);
		return Number.isFinite(maximumScale) ? maximumScale : 1;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/lod/LodSceneCandidate.js ----
{
	const __exports = __awtsmoosModule_81;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file LodSceneCandidate.js
	 * @description Converts explicitly authored static meshes into safe LOD registrations while preserving authored fade horizons.
	 * The Awtsmoos never confuses a living actor with a disposable leaf; Awtsmoos.com carries each garden's own distance truth
	 * from world definition into renderer policy, so a measured fade is not lost when finite scenery crosses the view.
	 */

	const readLodAuthoredRange = __awtsmoosModule_71.readLodAuthoredRange;
	const geometryLodBounds = __awtsmoosModule_82.geometryLodBounds;
	const inferLodClass = __awtsmoosModule_72.inferLodClass;
	const lodClassPolicy = __awtsmoosModule_72.lodClassPolicy;
	const worldLodBounds = __awtsmoosModule_83.worldLodBounds;

	const OWNED_CLASSES = new Set(['detail', 'edge', 'grass', 'vegetation']);

	/** Creates controller registration and diagnostic evidence for one scene node. */
	function createLodSceneCandidate(node, id) {
		if (!isExplicitStaticMesh(node)) return null;
		const metadata = node.userData || {};
		const className = inferLodClass(node.name, metadata);
		const classPolicy = lodClassPolicy(className);
		if (!OWNED_CLASSES.has(className) || classPolicy.protected) return null;
		const localBounds = geometryLodBounds(node.geometry);
		if (!localBounds.geometryValid || localBounds.vertices === 0) return null;
		const worldBounds = worldLodBounds(localBounds, node.matrixWorld);
		const authoredRange = readLodAuthoredRange(metadata);
		return {
			registration: {
				id,
				node,
				className,
				center: worldBounds.center,
				radius: worldBounds.radius,
				authoredRange
			},
			record: {
				id,
				node,
				className,
				radius: worldBounds.radius,
				triangles: localBounds.triangles,
				vertices: localBounds.vertices,
				authoredRange
			}
		};
	}


	__exports.createLodSceneCandidate = createLodSceneCandidate;
	function isExplicitStaticMesh(node) {
		if (!node?.isMesh || !node.geometry || node.visible === false) return false;
		if (node.isSkinnedMesh || node.skeleton) return false;
		const metadata = node.userData || {};
		const lod = metadata.AwtsmoosLod || {};
		if (lod.disabled === true || lod.alwaysVisible === true) return false;
		return Boolean(
			metadata.AwtsmoosLod
			|| metadata.AwtsmoosYardGrass
			|| metadata.AwtsmoosFence
		);
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/lod/SceneLodDiagnostics.js ----
{
	const __exports = __awtsmoosModule_84;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file SceneLodDiagnostics.js
	 * @description Summarizes registered visibility, triangle relief, and semantic classes.
	 * The Awtsmoos knows every revealed and concealed face; Awtsmoos.com exposes finite proof
	 * so performance claims arise from counted geometry rather than hopeful declarations.
	 */

	/** Returns a compact immutable snapshot of live scene LOD work and savings. */
	function sceneLodDiagnostics(records, controller, runtime = {}) {
		const totals = {
			registered: records.length,
			visible: 0,
			hidden: 0,
			triangles: 0,
			hiddenTriangles: 0,
			vertices: 0,
			byClass: {}
		};
		for (const record of records) accumulateRecord(totals, record);
		return {
			...totals,
			controller: { ...controller.stats },
			queue: { ...controller.queue.stats, pending: controller.queue.size },
			refreshes: runtime.refreshes || 0,
			lastRefreshRegistrations: runtime.lastRefreshRegistrations || 0,
			lastSceneRevision: runtime.lastSceneRevision ?? null
		};
	}


	__exports.sceneLodDiagnostics = sceneLodDiagnostics;
	function accumulateRecord(totals, record) {
		const visible = record.node.visible !== false;
		const classTotals = totals.byClass[record.className] || createClassTotals();
		totals.visible += visible ? 1 : 0;
		totals.hidden += visible ? 0 : 1;
		totals.triangles += record.triangles;
		totals.hiddenTriangles += visible ? 0 : record.triangles;
		totals.vertices += record.vertices;
		classTotals.registered += 1;
		classTotals.visible += visible ? 1 : 0;
		classTotals.hidden += visible ? 0 : 1;
		classTotals.triangles += record.triangles;
		totals.byClass[record.className] = classTotals;
	}

	function createClassTotals() {
		return {
			registered: 0,
			visible: 0,
			hidden: 0,
			triangles: 0
		};
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/lod/SceneLodRuntime.js ----
{
	const __exports = __awtsmoosModule_68;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file SceneLodRuntime.js
	 * @description Registers authored static detail once and delegates event-bounded visibility.
	 * The Awtsmoos creates the forest continuously without rescanning it blindly; Awtsmoos.com
	 * refreshes this finite registry only when world construction or streaming reveals new vessels.
	 */
	const LodController = __awtsmoosModule_69.LodController;
	const createLodSceneCandidate = __awtsmoosModule_81.createLodSceneCandidate;
	const sceneLodDiagnostics = __awtsmoosModule_84.sceneLodDiagnostics;

	class SceneLodRuntime {
		constructor({ scene, controllerOptions = {} }) {
			this.scene = scene;
			this.controller = new LodController(controllerOptions);
			this.registeredNodes = new WeakSet();
			this.records = [];
			this.sequence = 0;
			this.refreshes = 0;
			this.lastRefreshRegistrations = 0;
			this.lastSceneRevision = null;
		}

		/** Scans only when explicitly called after foundational or streamed world installation. */
		refresh() {
			if (!this.scene?.traverse) return 0;
			this.scene.updateWorldMatrix?.();
			let registrations = 0;
			this.scene.traverse((node) => {
				if (this.registeredNodes.has(node)) return;
				const candidate = createLodSceneCandidate(node, this.nextId(node));
				if (!candidate) return;
				if (!this.controller.register(candidate.registration)) return;
				this.registeredNodes.add(node);
				this.records.push(candidate.record);
				registrations += 1;
			});
			this.refreshes += 1;
			this.lastRefreshRegistrations = registrations;
			this.lastSceneRevision = this.scene._sceneGraphRevision ?? null;
			if (registrations > 0) this.controller.invalidate();
			return registrations;
		}

		update(context) {
			return this.controller.update(context);
		}

		diagnostics() {
			return sceneLodDiagnostics(this.records, this.controller, this);
		}

		destroy() {
			this.controller.restore();
			this.records.length = 0;
			this.registeredNodes = new WeakSet();
			this.lastRefreshRegistrations = 0;
		}

		nextId(node) {
			this.sequence += 1;
			const name = String(node?.name || 'mesh').replace(/[^a-z0-9_-]+/gi, '-');
			return `scene-lod-${this.sequence}-${name}`;
		}
	}

	__exports.SceneLodRuntime = SceneLodRuntime;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/ui/AwtsmoosEventBus.js ----
{
	const __exports = __awtsmoosModule_85;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file AwtsmoosEventBus.js
	 * @description Carries small gameplay intentions between buttons, runtime systems, and diagnostics.
	 * RESPONSIBILITY: subscribe, unsubscribe, emit, and retain a bounded recent event history.
	 * NON-RESPONSIBILITY: this bus does not interpret events or own gameplay state.
	 * ARCHITECTURE: Yesod transmits intent while Malchus receives it in concrete runtime systems.
	 * OROS AND KEILIM: intention is ohr; event names, details, and listeners are finite keilim.
	 * The Awtsmoos creates sender, message, and receiver anew; Awtsmoos.com keeps those vessels
	 * readable so camera switches and every other command remain inspectable rather than compressed.
	 */

	const HISTORY_LIMIT = 24;

	class AwtsmoosEventBus {
		constructor() {
			this.listeners = new Map();
			this.history = [];
		}

		on(type, listener) {
			const listeners = this.listeners.get(type) || [];
			listeners.push(listener);
			this.listeners.set(type, listeners);
			return () => this.off(type, listener);
		}

		off(type, listener) {
			const listeners = this.listeners.get(type) || [];
			this.listeners.set(
				type,
				listeners.filter(candidate => candidate !== listener)
			);
		}

		emit(type, detail = {}) {
			this.history.unshift({
				at: currentTime(),
				detail,
				type
			});
			this.history.length = Math.min(HISTORY_LIMIT, this.history.length);
			for (const listener of this.listeners.get(type) || []) {
				listener(detail);
			}
			if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
				window.dispatchEvent(new CustomEvent(`Awtsmoos:${type}`, { detail }));
			}
		}
	}


	__exports.AwtsmoosEventBus = AwtsmoosEventBus;
	function currentTime() {
		return typeof performance !== 'undefined'
			? performance.now()
			: Date.now();
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageArrivalSpatialContract.js ----
{
	const __exports = __awtsmoosModule_86;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file VillageArrivalSpatialContract.js
	 * @description Holds pure village arrival geometry with human-scale third-person framing and no runtime side effects.
	 * The Awtsmoos places the traveler inside the world rather than shrinking the soul beneath a distant eye;
	 * Awtsmoos.com keeps the Chossid at authored scale while camera distance and field of view let human presence fill the sky.
	 */

	const VILLAGE_ARRIVAL_PLAYER = Object.freeze({
		facing: Math.PI,
		x: 0,
		z: 104
	});


	__exports.VILLAGE_ARRIVAL_PLAYER = VILLAGE_ARRIVAL_PLAYER;
	const VILLAGE_ARRIVAL_CAMERA = Object.freeze({
		clearingRadius: 15,
		clearingX: 0,
		clearingZ: 113,
		distance: 8.5,
		fov: 56,
		maxDistance: 24,
		minDistance: 2.2,
		pitch: 0.26,
		yaw: 2.86
	});


	__exports.VILLAGE_ARRIVAL_CAMERA = VILLAGE_ARRIVAL_CAMERA;
	const VILLAGE_ARRIVAL_SIGN = Object.freeze({
		x: -7,
		yaw: 0.12,
		z: 96
	});


	__exports.VILLAGE_ARRIVAL_SIGN = VILLAGE_ARRIVAL_SIGN;
	const VILLAGE_ARRIVAL_ENTRANCE = Object.freeze({
		x: 0,
		z: 101
	});


	__exports.VILLAGE_ARRIVAL_ENTRANCE = VILLAGE_ARRIVAL_ENTRANCE;
	const VILLAGE_ARRIVAL_CLEARINGS = Object.freeze([
		Object.freeze({ id: 'arrival-spawn', radius: 16, x: 0, z: 104 }),
		Object.freeze({
			id: 'arrival-camera',
			radius: VILLAGE_ARRIVAL_CAMERA.clearingRadius,
			x: VILLAGE_ARRIVAL_CAMERA.clearingX,
			z: VILLAGE_ARRIVAL_CAMERA.clearingZ
		})
	]);


	__exports.VILLAGE_ARRIVAL_CLEARINGS = VILLAGE_ARRIVAL_CLEARINGS;
	function arrivalPlayerScreenFraction(playerHeight = 1.72) {
		const angularHeight = 2 * Math.atan(
			playerHeight / (2 * VILLAGE_ARRIVAL_CAMERA.distance)
		);
		return angularHeight / radians(VILLAGE_ARRIVAL_CAMERA.fov);
	}


	__exports.arrivalPlayerScreenFraction = arrivalPlayerScreenFraction;
	function radians(degrees) {
		return degrees * Math.PI / 180;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/world/lighting/ReferenceGoldenHourPreset.js ----
{
	const __exports = __awtsmoosModule_88;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file ReferenceGoldenHourPreset.js
	 * @description Defines the shared late-day palette and bounded lighting budgets consumed by the real WebGL renderer.
	 * The Awtsmoos renews every apparent color from nothing each instant; Awtsmoos.com lets cool valley depth, warm directional sun,
	 * readable black garments, luminous water, and atmospheric distance rhyme as one finite cinematic vessel without counterfeit backdrop.
	 */

	const REFERENCE_GOLDEN_HOUR = Object.freeze({
		cloudColor: Object.freeze([0.92, 0.72, 0.52, 0.24]),
		coolShadow: Object.freeze([0.22, 0.34, 0.5, 1]),
		horizonColor: Object.freeze([1, 0.57, 0.24, 0.34]),
		lampColor: '#ffd477',
		sunCore: Object.freeze([1, 0.98, 0.86, 1]),
		sunGlow: Object.freeze([1, 0.48, 0.08, 0.44]),
		sunPosition: Object.freeze([-142, 86, -224]),
		warmStone: '#c99561',
		windowColor: '#ffd06f',
		cinematic: Object.freeze({
			ambient: Object.freeze([0.255, 0.285, 0.31]),
			exposureDesktop: 1.44,
			exposureMobile: 1.34,
			fogColor: Object.freeze([0.63, 0.56, 0.49]),
			skyColor: Object.freeze([0.19, 0.37, 0.61]),
			sunColor: Object.freeze([1.42, 0.98, 0.62])
		})
	});


	__exports.REFERENCE_GOLDEN_HOUR = REFERENCE_GOLDEN_HOUR;
	const REFERENCE_LIGHTING_BUDGETS = Object.freeze({
		low: budget(2, 3, 3, 8),
		medium: budget(3, 5, 3, 12),
		high: budget(5, 8, 3, 16),
		cinematic: budget(9, 14, 4, 24)
	});


	__exports.REFERENCE_LIGHTING_BUDGETS = REFERENCE_LIGHTING_BUDGETS;
	/** Returns the established light-and-landscape budget for one quality tier. */
	function referenceLightingBudget(quality = 'high') {
		return REFERENCE_LIGHTING_BUDGETS[quality] || REFERENCE_LIGHTING_BUDGETS.high;
	}


	__exports.referenceLightingBudget = referenceLightingBudget;
	/** Creates one immutable lighting-budget vessel. */
	function budget(sunShafts, clouds, mountainBelts, practicalLamps) {
		return Object.freeze({ clouds, mountainBelts, practicalLamps, sunShafts });
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapColorBinding.js ----
{
	const __exports = __awtsmoosModule_92;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapColorBinding.js
	 * @description Binds bootstrap vertex color only when the material requests it.
	 * The Awtsmoos reveals color without multiplying shadow into disappearance; Awtsmoos.com
	 * gives demons, weapons, and fallback meshes one explicit finite color covenant.
	 */

	const DEFAULT_COLOR = Object.freeze([0.72, 0.72, 0.72, 1]);

	function bindBootstrapMeshColor(buffers, gl, entry, locations, materialValue) {
		const material = firstMaterial(materialValue);
		if (material?.vertexColors === false) {
			gl.disableVertexAttribArray(locations.vertexColor);
			gl.vertexAttrib4f(locations.vertexColor, 1, 1, 1, 1);
			return;
		}
		gl.enableVertexAttribArray(locations.vertexColor);
		buffers.bindColor(entry, locations.vertexColor, locations.position);
	}


	__exports.bindBootstrapMeshColor = bindBootstrapMeshColor;
	function writeBootstrapMaterialColor(materialValue, target) {
		const material = firstMaterial(materialValue);
		const value = material?.color || material?.baseColorFactor || DEFAULT_COLOR;
		if (Array.isArray(value) || ArrayBuffer.isView(value)) {
			target[0] = value[0] ?? 0.72;
			target[1] = value[1] ?? 0.72;
			target[2] = value[2] ?? 0.72;
			target[3] = value[3] ?? 1;
			return target;
		}
		if (Number.isFinite(value?.r)) {
			target[0] = value.r;
			target[1] = value.g;
			target[2] = value.b;
			target[3] = value.a ?? 1;
			return target;
		}
		target.set(DEFAULT_COLOR);
		return target;
	}


	__exports.writeBootstrapMaterialColor = writeBootstrapMaterialColor;
	function firstMaterial(value) {
		return Array.isArray(value) ? value[0] : value;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapColorShader.js ----
{
	const __exports = __awtsmoosModule_94;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapColorShader.js
	 * @description Gives the ultra-light first renderer spatial material variation instead of flat-color placeholder surfaces.
	 * The Awtsmoos reveals difference inside every finite patch of earth while one tiny shader keeps the frame free;
	 * Awtsmoos.com turns color into textured-looking light without network images, material graphs, or heavyweight machinery.
	 */

	const BOOTSTRAP_VERTEX_SHADER = `
	attribute vec3 aPosition;
	attribute vec4 aColor;
	uniform mat4 uProjectionView;
	uniform mat4 uModel;
	varying vec4 vColor;
	varying vec3 vWorldPosition;
	void main() {
		vec4 worldPosition = uModel * vec4(aPosition, 1.0);
		vColor = aColor;
		vWorldPosition = worldPosition.xyz;
		gl_Position = uProjectionView * worldPosition;
	}
	`;


	__exports.BOOTSTRAP_VERTEX_SHADER = BOOTSTRAP_VERTEX_SHADER;
	const BOOTSTRAP_FRAGMENT_SHADER = `
	precision mediump float;
	uniform vec4 uColor;
	varying vec4 vColor;
	varying vec3 vWorldPosition;
	float awtsmoosHash(vec2 point) {
		return fract(sin(dot(point, vec2(12.9898, 78.233))) * 43758.5453);
	}
	void main() {
		vec4 base = uColor * vColor;
		vec2 cell = floor(vWorldPosition.xz * 0.72);
		float grain = awtsmoosHash(cell);
		float contour = 0.5 + 0.5 * sin(vWorldPosition.x * 0.29 + vWorldPosition.z * 0.23 + vWorldPosition.y * 0.41);
		float light = 0.79 + grain * 0.13 + contour * 0.12;
		vec3 cool = base.rgb * vec3(0.90, 0.98, 1.05);
		vec3 warm = base.rgb * vec3(1.08, 1.01, 0.88);
		vec3 varied = mix(cool, warm, contour) * light;
		gl_FragColor = vec4(varied, base.a);
	}
	`;

	__exports.BOOTSTRAP_FRAGMENT_SHADER = BOOTSTRAP_FRAGMENT_SHADER;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapColorProgram.js ----
{
	const __exports = __awtsmoosModule_93;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapColorProgram.js
	 * @description Compiles one bounded program and exposes position, color, and matrix locations.
	 * The Awtsmoos joins two shader vessels into one visible covenant; Awtsmoos.com records failure
	 * plainly while the first playable path remains free of texture and shader permutations.
	 */

	const BOOTSTRAP_FRAGMENT_SHADER = __awtsmoosModule_94.BOOTSTRAP_FRAGMENT_SHADER;
	const BOOTSTRAP_VERTEX_SHADER = __awtsmoosModule_94.BOOTSTRAP_VERTEX_SHADER;

	function createBootstrapColorProgram(gl) {
		const vertex = compileShader(gl, gl.VERTEX_SHADER, BOOTSTRAP_VERTEX_SHADER, 'vertex');
		const fragment = compileShader(gl, gl.FRAGMENT_SHADER, BOOTSTRAP_FRAGMENT_SHADER, 'fragment');
		const program = gl.createProgram();
		gl.attachShader(program, vertex);
		gl.attachShader(program, fragment);
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			throw new Error(`Bootstrap shader link failed: ${gl.getProgramInfoLog(program) || 'unknown'}`);
		}
		gl.deleteShader(vertex);
		gl.deleteShader(fragment);
		return {
			locations: {
				color: gl.getUniformLocation(program, 'uColor'),
				model: gl.getUniformLocation(program, 'uModel'),
				position: gl.getAttribLocation(program, 'aPosition'),
				projectionView: gl.getUniformLocation(program, 'uProjectionView'),
				vertexColor: gl.getAttribLocation(program, 'aColor')
			},
			program
		};
	}


	__exports.createBootstrapColorProgram = createBootstrapColorProgram;
	function compileShader(gl, type, source, label) {
		const shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			throw new Error(`Bootstrap ${label} shader failed: ${gl.getShaderInfoLog(shader) || 'unknown'}`);
		}
		return shader;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapMeshBufferCache.js ----
{
	const __exports = __awtsmoosModule_95;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapMeshBufferCache.js
	 * @description Uploads immutable position, optional color, and truthful index buffers once.
	 * The Awtsmoos sustains one numerical vessel through many frames; Awtsmoos.com preserves color
	 * anatomy without per-frame buffers and grants uncolored geometry a white multiplier.
	 */

	class BootstrapMeshBufferCache {
		constructor(gl) {
			this.gl = gl;
			this.entries = new WeakMap();
		}

		resolve(geometry) {
			if (!geometry) return null;
			let entry = this.entries.get(geometry);
			if (entry) return entry;
			entry = createEntry(this.gl, geometry);
			if (entry) this.entries.set(geometry, entry);
			return entry;
		}

		bindColor(entry, location, positionLocation) {
			if (location < 0 || location === positionLocation) return;
			const gl = this.gl;
			if (!entry.colorBuffer) {
				gl.disableVertexAttribArray?.(location);
				gl.vertexAttrib4f?.(location, 1, 1, 1, 1);
				return;
			}
			gl.bindBuffer(gl.ARRAY_BUFFER, entry.colorBuffer);
			gl.enableVertexAttribArray(location);
			gl.vertexAttribPointer(location, entry.colorItemSize, entry.colorType, entry.colorNormalized, 0, 0);
		}
	}


	__exports.BootstrapMeshBufferCache = BootstrapMeshBufferCache;
	function createEntry(gl, geometry) {
		const position = geometry.attributes?.position;
		if (!position?.array?.length) return null;
		const color = geometry.attributes?.color;
		const entry = {
			colorBuffer: color?.array?.length ? upload(gl, gl.ARRAY_BUFFER, color.array) : null,
			colorItemSize: Math.max(1, Math.min(4, color?.itemSize || 4)),
			colorNormalized: color?.normalized === true,
			colorType: color ? attributeType(gl, color.array) : gl.FLOAT,
			count: position.count || Math.floor(position.array.length / (position.itemSize || 3)),
			indexBuffer: null,
			indexType: null,
			positionBuffer: upload(gl, gl.ARRAY_BUFFER, position.array)
		};
		const index = geometry.index;
		if (!index?.array?.length) return entry;
		entry.indexType = indexType(gl, index.array);
		if (entry.indexType == null) return null;
		entry.indexBuffer = upload(gl, gl.ELEMENT_ARRAY_BUFFER, index.array);
		entry.count = index.count || index.array.length;
		return entry;
	}

	function upload(gl, target, values) {
		const buffer = gl.createBuffer();
		gl.bindBuffer(target, buffer);
		gl.bufferData(target, values, gl.STATIC_DRAW);
		return buffer;
	}

	function attributeType(gl, array) {
		if (array instanceof Uint8Array) return gl.UNSIGNED_BYTE;
		if (array instanceof Uint16Array) return gl.UNSIGNED_SHORT;
		if (array instanceof Int8Array) return gl.BYTE;
		if (array instanceof Int16Array) return gl.SHORT;
		return gl.FLOAT;
	}

	function indexType(gl, array) {
		if (array instanceof Uint8Array) return gl.UNSIGNED_BYTE;
		if (array instanceof Uint16Array) return gl.UNSIGNED_SHORT;
		if (array instanceof Uint32Array && gl.getExtension('OES_element_index_uint')) return gl.UNSIGNED_INT;
		return null;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapColorRenderer.js ----
{
	const __exports = __awtsmoosModule_91;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapColorRenderer.js
	 * @description Draws first-playable meshes while honoring material color contracts.
	 * The Awtsmoos reveals shadow and garment before rich hydration; Awtsmoos.com keeps
	 * demons readable and staff or sword visible without opening another request graph.
	 */

	const lookAt = __awtsmoosModule_19.lookAt;
	const perspective = __awtsmoosModule_19.perspective;
	const multiply = __awtsmoosModule_17.multiply;
	const bindBootstrapMeshColor = __awtsmoosModule_92.bindBootstrapMeshColor;
	const writeBootstrapMaterialColor = __awtsmoosModule_92.writeBootstrapMaterialColor;
	const createBootstrapColorProgram = __awtsmoosModule_93.createBootstrapColorProgram;
	const BootstrapMeshBufferCache = __awtsmoosModule_95.BootstrapMeshBufferCache;

	class BootstrapColorRenderer {
		constructor(gl, stats) {
			this.gl = gl;
			this.stats = stats;
			this.buffers = new BootstrapMeshBufferCache(gl);
			this.materialColor = new Float32Array(4);
			this.programState = null;
		}

		render(scene, camera, clearColor) {
			clear(this.gl, clearColor);
			const meshes = collectBootstrapMeshes(scene);
			this.beginStats(meshes.length);
			if (!meshes.length || !camera) return;
			this.programState ||= createBootstrapColorProgram(this.gl);
			scene.updateWorldMatrix?.();
			const { locations, program } = this.programState;
			this.gl.useProgram(program);
			this.gl.uniformMatrix4fv(
				locations.projectionView,
				false,
				cameraProjectionView(camera)
			);
			this.gl.enableVertexAttribArray(locations.position);
			for (const mesh of meshes) this.drawMesh(mesh, locations);
		}

		drawMesh(mesh, locations) {
			const entry = this.buffers.resolve(mesh.geometry);
			if (!entry) return;
			const gl = this.gl;
			gl.bindBuffer(gl.ARRAY_BUFFER, entry.positionBuffer);
			gl.vertexAttribPointer(locations.position, 3, gl.FLOAT, false, 0, 0);
			bindBootstrapMeshColor(this.buffers, gl, entry, locations, mesh.material);
			gl.uniformMatrix4fv(locations.model, false, mesh.matrixWorld);
			gl.uniform4fv(
				locations.color,
				writeBootstrapMaterialColor(mesh.material, this.materialColor)
			);
			if (entry.indexBuffer) {
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, entry.indexBuffer);
				gl.drawElements(gl.TRIANGLES, entry.count, entry.indexType, 0);
			} else {
				gl.drawArrays(gl.TRIANGLES, 0, entry.count);
			}
			this.stats.draws += 1;
			this.stats.triangles += Math.floor(entry.count / 3);
		}

		beginStats(meshCount) {
			this.stats.frames += 1;
			this.stats.draws = 0;
			this.stats.triangles = 0;
			this.stats.meshes = meshCount;
		}

		dispose() {
			if (this.programState?.program) this.gl.deleteProgram(this.programState.program);
			this.programState = null;
		}
	}


	__exports.BootstrapColorRenderer = BootstrapColorRenderer;
	function collectBootstrapMeshes(scene) {
		const meshes = [];
		scene?.traverse?.(object => {
			const isMesh = object.isMesh || object.isSkinnedMesh;
			if (isMesh && object.visible !== false && object.userData?.bootstrapVisual) {
				meshes.push(object);
			}
		});
		return meshes;
	}

	function cameraProjectionView(camera) {
		return multiply(
			perspective(camera.fov, camera.aspect, camera.near, camera.far),
			lookAt(camera.position.toArray(), camera.target || [0, 1, 0])
		);
	}

	function clear(gl, color) {
		gl.clearColor(color[0], color[1], color[2], color[3]);
		gl.clearDepth(1);
		gl.enable(gl.DEPTH_TEST);
		gl.disable(gl.CULL_FACE);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/ProgressiveWebGLDefaults.js ----
{
	const __exports = __awtsmoosModule_96;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file ProgressiveWebGLDefaults.js
	 * @description Creates finite colored-bootstrap renderer settings and diagnostics.
	 * The Awtsmoos gives clear sky and visible earth one measured vessel; Awtsmoos.com records
	 * frames, meshes, draws, and triangles while richer garments remain beyond playability.
	 */

	function createProgressiveEnvironment() {
		return {
			ambient: [0.20, 0.23, 0.25],
			exposure: 1.04,
			fogColor: [0.52, 0.66, 0.72],
			fogFar: 560,
			fogNear: 145,
			sunColor: [1.26, 0.94, 0.68],
			sunDirection: [-0.42, 0.76, 0.49]
		};
	}


	__exports.createProgressiveEnvironment = createProgressiveEnvironment;
	function createProgressiveStats() {
		return {
			draws: 0,
			frames: 0,
			meshes: 0,
			phase: 'colored-bootstrap',
			staticBatch: { savedDraws: 0 },
			triangles: 0
		};
	}

	__exports.createProgressiveStats = createProgressiveStats;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/ProgressiveWebGLState.js ----
{
	const __exports = __awtsmoosModule_97;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file ProgressiveWebGLState.js
	 * @description Applies viewport, environment, and interactor state before or after hydration.
	 * The Awtsmoos carries one intention through bootstrap color and the richer final frame;
	 * Awtsmoos.com keeps mutable state in one vessel so both renderers answer to the same name.
	 */

	/**
	 * Applies pixel dimensions to the active renderer stage.
	 *
	 * @param {object} renderer Progressive renderer instance.
	 * @param {number} width Requested pixel width.
	 * @param {number} height Requested pixel height.
	 * @returns {void}
	 */
	function setProgressiveRendererSize(renderer, width, height) {
		const pixelWidth = Math.max(1, Math.floor(width));
		const pixelHeight = Math.max(1, Math.floor(height));

		if (renderer.delegate) {
			renderer.delegate.setSize(pixelWidth, pixelHeight);
			return;
		}

		renderer.canvas.width = pixelWidth;
		renderer.canvas.height = pixelHeight;
		renderer.gl.viewport(0, 0, pixelWidth, pixelHeight);
	}


	__exports.setProgressiveRendererSize = setProgressiveRendererSize;
	/**
	 * Copies environment values into bootstrap state and the hydrated delegate.
	 *
	 * @param {object} renderer Progressive renderer instance.
	 * @param {object} values Environment values.
	 * @returns {void}
	 */
	function setProgressiveRendererEnvironment(renderer, values = {}) {
		for (const [key, value] of Object.entries(values)) {
			renderer.environment[key] = Array.isArray(value) ? [...value] : value;
		}

		renderer.delegate?.setEnvironment(values);
	}


	__exports.setProgressiveRendererEnvironment = setProgressiveRendererEnvironment;
	/**
	 * Updates the shared player position and animation time.
	 *
	 * @param {object} renderer Progressive renderer instance.
	 * @param {object} position Player position.
	 * @param {number} timeSeconds Runtime time.
	 * @returns {void}
	 */
	function setProgressiveRendererInteractor(
		renderer,
		position,
		timeSeconds
	) {
		renderer.interactor = {
			x: position?.x || 0,
			y: position?.renderY ?? position?.y ?? 0,
			z: position?.z || 0
		};
		renderer.timeSeconds = timeSeconds;
		renderer.delegate?.setInteractor(position, timeSeconds);
	}

	__exports.setProgressiveRendererInteractor = setProgressiveRendererInteractor;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/WebGlRequiredError.js ----
{
	const __exports = __awtsmoosModule_98;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file WebGlRequiredError.js
	 * @description Names the non-negotiable WebGL capability required before Mitzvah World may enter gameplay.
	 * The Awtsmoos reveals one real three-dimensional vessel, never a painted substitute in disguise;
	 * Awtsmoos.com keeps the missing doorway explicit so truth reaches both the runtime and the player's eyes.
	 */

	const WEBGL_REQUIRED = 'webgl-required';

	/**
	 * Creates the structured startup error used when no WebGL context can be obtained.
	 * @param {string[]} contextAttempts Context names attempted by the renderer.
	 * @returns {Error} Stable renderer capability error.
	 */
	function createWebGlRequiredError(contextAttempts = ['webgl']) {
		const attempts = normalizeContextAttempts(contextAttempts);
		const error = new Error('Mitzvah World requires WebGL to play.');
		error.name = 'RendererContextError';
		error.code = WEBGL_REQUIRED;
		error.contextAttempts = attempts;
		error.recoverable = false;
		return error;
	}


	__exports.createWebGlRequiredError = createWebGlRequiredError;
	/**
	 * Converts a WebGL requirement failure into frozen browser-safe evidence.
	 * @param {unknown} error Startup error.
	 * @returns {object} Stable code, message, and attempted contexts.
	 */
	function webGlRequiredEvidence(error) {
		return Object.freeze({
			code: error?.code || WEBGL_REQUIRED,
			contextAttempts: Object.freeze(normalizeContextAttempts(
				error?.contextAttempts || ['webgl']
			)),
			errorName: error?.name || 'Error',
			message: error?.message || String(error),
			recoverable: false
		});
	}


	__exports.webGlRequiredEvidence = webGlRequiredEvidence;
	function normalizeContextAttempts(values) {
		const attempts = Array.isArray(values) ? values : [values];
		return [...new Set(attempts
			.map(value => String(value || '').trim())
			.filter(Boolean))];
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-gl-state-model.js ----
{
	const __exports = __awtsmoosModule_102;
	// B"H

	const CACHED_GL_METHODS = [
		'useProgram', 'bindBuffer', 'activeTexture', 'bindTexture',
		'enable', 'disable', 'cullFace', 'blendFunc',
		'enableVertexAttribArray', 'disableVertexAttribArray',
		'vertexAttribPointer', 'vertexAttrib4fv'
	];


	__exports.CACHED_GL_METHODS = CACHED_GL_METHODS;
	/** Creates unknown state so every first WebGL command still reaches the driver. */
	function createGlStateModel() {
		return {
			program: unknownValue(),
			activeTexture: unknownValue(),
			cullFace: unknownValue(),
			blendFunction: unknownValue(),
			buffers: new Map(),
			textures: new Map(),
			capabilities: new Map(),
			attributes: new Map(),
			pointers: new Map(),
			constants: new Map()
		};
	}


	__exports.createGlStateModel = createGlStateModel;
	/** Returns an exact skip decision plus the commit needed after a native call. */
	function decideGlStateCall(name, args, state, gl) {
		if (name === 'useProgram') return valueDecision(state.program, args[0]);
		if (name === 'activeTexture') return valueDecision(state.activeTexture, args[0]);
		if (name === 'cullFace') return valueDecision(state.cullFace, args[0]);
		if (name === 'blendFunc') {
			return valueDecision(
				state.blendFunction,
				`${args[0]}:${args[1]}`
			);
		}
		if (name === 'bindBuffer') {
			return mapDecision(state.buffers, args[0], args[1]);
		}
		if (name === 'bindTexture') {
			if (!state.activeTexture.known) return alwaysExecute();
			const key = `${state.activeTexture.value}:${args[0]}`;
			return mapDecision(state.textures, key, args[1]);
		}
		if (name === 'enable') {
			return mapDecision(state.capabilities, args[0], true);
		}
		if (name === 'disable') {
			return mapDecision(state.capabilities, args[0], false);
		}
		if (name === 'enableVertexAttribArray') {
			return mapDecision(state.attributes, args[0], true);
		}
		if (name === 'disableVertexAttribArray') {
			return mapDecision(state.attributes, args[0], false);
		}
		if (name === 'vertexAttribPointer') {
			if (!state.buffers.has(gl.ARRAY_BUFFER)) return alwaysExecute();
			return pointerDecision(
				state.pointers,
				args[0],
				state.buffers.get(gl.ARRAY_BUFFER),
				args.slice(1).join(':')
			);
		}
		return mapDecision(
			state.constants,
			args[0],
			Array.from(args[1] || []).join(',')
		);
	}


	__exports.decideGlStateCall = decideGlStateCall;
	function valueDecision(slot, value) {
		return {
			skip: slot.known && slot.value === value,
			commit() {
				slot.known = true;
				slot.value = value;
			}
		};
	}

	function mapDecision(map, key, value) {
		return {
			skip: map.has(key) && map.get(key) === value,
			commit: () => { map.set(key, value); }
		};
	}

	function pointerDecision(map, index, arrayBuffer, values) {
		const previous = map.get(index);
		return {
			skip: !!previous
				&& previous.arrayBuffer === arrayBuffer
				&& previous.values === values,
			commit: () => { map.set(index, { arrayBuffer, values }); }
		};
	}

	function alwaysExecute() {
		return { skip: false, commit() {} };
	}

	function unknownValue() {
		return { known: false, value: undefined };
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-gl-state-cache.js ----
{
	const __exports = __awtsmoosModule_101;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-gl-state-cache.js
	 * @description Suppresses only proven-identical WebGL declarations and exposes exact invalidation.
	 * The Awtsmoos renews every command; Awtsmoos.com remembers only witnessed continuity, while
	 * vertex-array changes erase precisely the hidden bindings they can alter and nothing more.
	 */

	const CACHED_GL_METHODS = __awtsmoosModule_102.CACHED_GL_METHODS;
	const createGlStateModel = __awtsmoosModule_102.createGlStateModel;
	const decideGlStateCall = __awtsmoosModule_102.decideGlStateCall;

	const CACHE_SYMBOL = Symbol.for('Awtsmoos.tinyGlStateCache');

	function installGlStateCache(gl) {
		const existingCache = gl[CACHE_SYMBOL];
		if (existingCache) return existingCache;
		const originalMethods = captureOriginalMethods(gl);
		const cache = createCacheController(gl, originalMethods);
		installCachedMethods(gl, cache, originalMethods);
		gl[CACHE_SYMBOL] = cache;
		return cache;
	}


	__exports.installGlStateCache = installGlStateCache;
	function captureOriginalMethods(gl) {
		return new Map(CACHED_GL_METHODS.map(methodName => [
			methodName,
			gl[methodName]
		]));
	}

	function createCacheController(gl, originalMethods) {
		const cache = {
			state: createGlStateModel(),
			stats: createStats(),
			invalidate() {
				cache.state = createGlStateModel();
				cache.stats.invalidations += 1;
			},
			invalidateVertexArrayState() {
				cache.state.buffers.clear();
				cache.state.attributes.clear();
				cache.state.pointers.clear();
				cache.stats.vertexArrayInvalidations += 1;
			},
			restore() {
				for (const [methodName, originalMethod] of originalMethods) {
					gl[methodName] = originalMethod;
				}
				delete gl[CACHE_SYMBOL];
			}
		};
		return cache;
	}

	function installCachedMethods(gl, cache, originalMethods) {
		for (const [methodName, originalMethod] of originalMethods) {
			gl[methodName] = function cachedGlStateCall(...argumentsList) {
				const methodStats = cache.stats.methods[methodName];
				methodStats.calls += 1;
				const decision = decideGlStateCall(
					methodName,
					argumentsList,
					cache.state,
					gl
				);
				if (decision.skip) {
					methodStats.skips += 1;
					return undefined;
				}
				const result = originalMethod.apply(this, argumentsList);
				decision.commit();
				return result;
			};
		}
	}

	function createStats() {
		const methods = CACHED_GL_METHODS.map(methodName => [
			methodName,
			{
				calls: 0,
				skips: 0
			}
		]);
		return {
			invalidations: 0,
			vertexArrayInvalidations: 0,
			methods: Object.fromEntries(methods)
		};
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-render-buffer-resources.js ----
{
	const __exports = __awtsmoosModule_104;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-render-buffer-resources.js
	 * @description Creates immutable buffers including ecological terrain-zone weights.
	 * The Awtsmoos gives every vertex both place and meaning; Awtsmoos.com preserves full
	 * geometry while meadow, lake, stream, and hill weights enter one resident GPU vessel.
	 */

	const ATTRIBUTE_NAMES = [
		'position',
		'normal',
		'color',
		'uv',
		'zone',
		'joints',
		'weights'
	];

	class RenderBufferResources {
		constructor(gl) {
			this.gl = gl;
			this.cache = new WeakMap();
		}

		has(geometry) {
			return Boolean(geometry && this.cache.has(geometry));
		}

		forMesh(mesh) {
			const geometry = mesh?.geometry;
			if (!geometry) return null;
			const existing = this.cache.get(geometry);
			if (existing) return existing;
			const position = geometry.attributes?.position;
			if (!position) return null;
			const resource = this.createResource(geometry, position);
			this.cache.set(geometry, resource);
			return resource;
		}

		createResource(geometry, position) {
			const attributes = {};
			for (const name of ATTRIBUTE_NAMES) {
				const attribute = geometry.attributes?.[name];
				attributes[name] = attribute
					? {
						attribute,
						buffer: this.createBuffer(this.gl.ARRAY_BUFFER, attribute.array)
					}
					: null;
			}
			const resource = {
				attributes,
				count: position.count,
				geometry,
				index: null,
				indexType: null,
				mode: geometry.mode ?? 4
			};
			if (geometry.index) this.addIndex(resource, geometry.index);
			return resource;
		}

		createBuffer(target, data) {
			const buffer = this.gl.createBuffer();
			this.gl.bindBuffer(target, buffer);
			this.gl.bufferData(target, data, this.gl.STATIC_DRAW);
			return buffer;
		}

		addIndex(resource, index) {
			if (index.array instanceof Uint32Array) this.gl.getExtension('OES_element_index_uint');
			resource.index = this.createBuffer(this.gl.ELEMENT_ARRAY_BUFFER, index.array);
			resource.indexType = index.array instanceof Uint32Array
				? this.gl.UNSIGNED_INT
				: this.gl.UNSIGNED_SHORT;
			resource.count = index.count;
		}
	}

	__exports.RenderBufferResources = RenderBufferResources;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-render-attribute-fallbacks.js ----
{
	const __exports = __awtsmoosModule_106;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-render-attribute-fallbacks.js
	 * @description Declares safe constants for absent geometry attributes.
	 * The Awtsmoos supplies a complete truth even where a mesh omits a vessel; Awtsmoos.com
	 * defaults unzoned objects to meadow while preserving normal, color, UV, and skin safety.
	 */

	const ATTRIBUTE_FALLBACKS = Object.freeze({
		color: new Float32Array([1, 1, 1, 1]),
		joints: new Float32Array([0, 0, 0, 0]),
		normal: new Float32Array([0, 1, 0, 0]),
		position: new Float32Array([0, 0, 0, 1]),
		uv: new Float32Array([0, 0, 0, 1]),
		weights: new Float32Array([1, 0, 0, 0]),
		zone: new Float32Array([1, 0, 0, 0])
	});

	__exports.ATTRIBUTE_FALLBACKS = ATTRIBUTE_FALLBACKS;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-render-webgl-utils.js ----
{
	const __exports = __awtsmoosModule_107;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-render-webgl-utils.js
	 * @description Holds WebGL types, compilation, and cached material-mode classification.
	 * The Awtsmoos shines through every mode without confusion; Awtsmoos.com classifies water,
	 * foliage, light, sky, and layered earth once until a visible classification fact changes.
	 */

	const materialModeCache = new WeakMap();

	function drawMode(gl, mode) {
		return {
			0: gl.POINTS,
			1: gl.LINES,
			2: gl.LINE_LOOP,
			3: gl.LINE_STRIP,
			4: gl.TRIANGLES,
			5: gl.TRIANGLE_STRIP,
			6: gl.TRIANGLE_FAN
		}[mode ?? 4] || gl.TRIANGLES;
	}


	__exports.drawMode = drawMode;
	function attributeType(gl, attribute) {
		const array = attribute.array;
		if (array instanceof Float32Array) return gl.FLOAT;
		if (array instanceof Uint8Array) return gl.UNSIGNED_BYTE;
		if (array instanceof Uint16Array) return gl.UNSIGNED_SHORT;
		if (array instanceof Uint32Array) return gl.UNSIGNED_INT;
		if (array instanceof Int8Array) return gl.BYTE;
		if (array instanceof Int16Array) return gl.SHORT;
		return gl.FLOAT;
	}


	__exports.attributeType = attributeType;
	function createShader(gl, type, source, label, errors) {
		const shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		const info = gl.getShaderInfoLog(shader);
		if (info) errors.push(`${label} shader: ${info}`);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			throw new Error(`${label} shader failed: ${info}`);
		}
		return shader;
	}


	__exports.createShader = createShader;
	function createProgram(gl, vertexSource, fragmentSource, label, errors) {
		const program = gl.createProgram();
		gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vertexSource, label, errors));
		gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fragmentSource, label, errors));
		gl.linkProgram(program);
		const info = gl.getProgramInfoLog(program);
		if (info) errors.push(`${label} program: ${info}`);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			throw new Error(`${label} program failed: ${info}`);
		}
		return program;
	}


	__exports.createProgram = createProgram;
	function materialColor(material) {
		const color = material?.color || [0.75, 0.70, 0.62, 1];
		return new Float32Array([
			color[0] ?? 0.75,
			color[1] ?? 0.70,
			color[2] ?? 0.62,
			material?.opacity ?? color[3] ?? 1
		]);
	}


	__exports.materialColor = materialColor;
	function alphaModeCode(material) {
		if (material?.alphaMode === 'MASK') return 1;
		if (material?.alphaMode === 'BLEND') return 2;
		return 0;
	}


	__exports.alphaModeCode = alphaModeCode;
	function materialModeCode(mesh) {
		const material = mesh.material || {};
		const policy = material.texturePolicy || {};
		const cached = materialModeCache.get(mesh);
		if (cached && sameModeFacts(cached, mesh, material, policy)) return cached.code;
		const code = classifyMaterialMode(mesh, policy);
		materialModeCache.set(mesh, captureModeFacts(mesh, material, policy, code));
		return code;
	}


	__exports.materialModeCode = materialModeCode;
	function invalidateMaterialModeCode(mesh) {
		return materialModeCache.delete(mesh);
	}


	__exports.invalidateMaterialModeCode = invalidateMaterialModeCode;
	function classifyMaterialMode(mesh, policy) {
		const identity = materialIdentity(mesh);
		if (policy.shader?.includes('terrain-layered')) return 5;
		if (policy.shader?.includes('water') || /water|lake|stream/.test(identity)) return 1;
		if (policy.proceduralSky || /world-sky|sky_dome|atmosphere_dome/.test(identity)) return 4;
		if (policy.practicalLightProxy || /lamp-pane|window|fire|ember|flame/.test(identity)) return 3;
		if (policy.shader?.includes('wind') || policy.alpha?.includes('cutout')
			|| /leaves|botanical|flower|petal|fern|reed|bush/.test(identity)) return 2;
		return 0;
	}

	function captureModeFacts(mesh, material, policy, code) {
		return {
			alpha: policy.alpha, code, family: mesh.userData?.family, material,
			materialName: material.name, meshName: mesh.name, parent: mesh.parent,
			parentFamily: mesh.parent?.userData?.family, policy, practicalLightProxy: policy.practicalLightProxy,
			proceduralSky: policy.proceduralSky, shader: policy.shader
		};
	}

	function sameModeFacts(value, mesh, material, policy) {
		return value.material === material && value.policy === policy
			&& value.meshName === mesh.name && value.materialName === material.name
			&& value.family === mesh.userData?.family && value.parent === mesh.parent
			&& value.parentFamily === mesh.parent?.userData?.family
			&& value.shader === policy.shader && value.alpha === policy.alpha
			&& value.proceduralSky === policy.proceduralSky
			&& value.practicalLightProxy === policy.practicalLightProxy;
	}

	function materialIdentity(mesh) {
		const values = [mesh.name, mesh.material?.name];
		let parent = mesh;
		while (parent) {
			values.push(parent.userData?.family, parent.userData?.AwtsmoosForestLayer?.layer);
			parent = parent.parent;
		}
		return values.filter(Boolean).join(' ').toLowerCase();
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-render-manual-attributes.js ----
{
	const __exports = __awtsmoosModule_105;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-render-manual-attributes.js
	 * @description Preserves exact manual binding for present and optional ecological attributes.
	 * The Awtsmoos is present in extension and fallback alike; Awtsmoos.com carries terrain
	 * meaning where declared while historic meshes and locations remain complete without it.
	 */

	const ATTRIBUTE_FALLBACKS = __awtsmoosModule_106.ATTRIBUTE_FALLBACKS;
	const attributeType = __awtsmoosModule_107.attributeType;

	const ATTRIBUTE_NAMES = ['position', 'normal', 'color', 'uv', 'zone'];

	class RenderManualAttributes {
		constructor(gl) {
			this.gl = gl;
			this.stats = null;
			this.invalidate();
		}

		beginFrame(stats) {
			this.stats = stats;
			stats.manualAttributeBindings = 0;
		}

		invalidate() {
			this.arrayBuffer = null;
			this.elementBuffer = null;
			this.attributes = new Map();
		}

		bind(resource, locations, skinned) {
			for (const name of ATTRIBUTE_NAMES) {
				this.bindNamed(name, resource, locations);
			}
			this.bindNamed('joints', resource, locations, skinned);
			this.bindNamed('weights', resource, locations, skinned);
			this.bindElement(resource.index);
			if (this.stats) this.stats.manualAttributeBindings += 1;
		}

		bindNamed(name, resource, locations, enabled = true) {
			const location = locations[name];
			if (!Number.isInteger(location) || location < 0) return;
			const entry = enabled ? resource.attributes[name] : null;
			if (!entry) {
				this.bindFallback(location, ATTRIBUTE_FALLBACKS[name]);
				return;
			}
			const signature = [
				entry.buffer,
				entry.attribute.itemSize,
				attributeType(this.gl, entry.attribute),
				Boolean(entry.attribute.normalized)
			];
			if (sameAttribute(this.attributes.get(location), signature)) {
				this.recordSkip();
				return;
			}
			this.bindArray(entry.buffer);
			this.gl.enableVertexAttribArray(location);
			this.gl.vertexAttribPointer(location, signature[1], signature[2], signature[3], 0, 0);
			this.attributes.set(location, signature);
			this.recordUpload();
		}

		bindFallback(location, values) {
			const signature = ['fallback', ...values];
			if (sameAttribute(this.attributes.get(location), signature)) {
				this.recordSkip();
				return;
			}
			this.gl.disableVertexAttribArray(location);
			this.gl.vertexAttrib4fv(location, values);
			this.attributes.set(location, signature);
			this.recordUpload();
		}

		bindArray(buffer) {
			if (this.arrayBuffer === buffer) return;
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
			this.arrayBuffer = buffer;
		}

		bindElement(buffer) {
			if (this.elementBuffer === buffer) {
				this.recordSkip();
				return;
			}
			this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
			this.elementBuffer = buffer;
			this.recordUpload();
		}

		recordSkip() {
			if (this.stats) this.stats.bufferStateSkips += 1;
		}

		recordUpload() {
			if (this.stats) this.stats.bufferStateUploads += 1;
		}
	}


	__exports.RenderManualAttributes = RenderManualAttributes;
	function sameAttribute(left, right) {
		return Boolean(left)
			&& left.length === right.length
			&& left.every((value, index) => value === right[index]);
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-render-vertex-array-builder.js ----
{
	const __exports = __awtsmoosModule_109;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-render-vertex-array-builder.js
	 * @description Records immutable geometry declarations and reports one global buffer-state change.
	 * The Awtsmoos gives every present attribute its exact vessel; Awtsmoos.com returns to the default
	 * doorway and invalidates only the global ARRAY_BUFFER fact altered while the VAO was constructed.
	 */

	const ATTRIBUTE_FALLBACKS = __awtsmoosModule_106.ATTRIBUTE_FALLBACKS;
	const attributeType = __awtsmoosModule_107.attributeType;

	const ATTRIBUTE_NAMES = [
		'position', 'normal', 'color', 'uv', 'zone', 'joints', 'weights'
	];

	function createVertexArrayEntry(options) {
		const vertexArray = options.extension.createVertexArrayOES();
		if (!vertexArray) {
			throw new Error('OES vertex array creation returned no vessel.');
		}
		const fallbacks = [];
		options.extension.bindVertexArrayOES(vertexArray);
		try {
			for (const name of ATTRIBUTE_NAMES) {
				configureAttribute({
					enabled: options.skinned || (name !== 'joints' && name !== 'weights'),
					fallbacks,
					gl: options.gl,
					location: options.locations[name],
					name,
					resource: options.resource
				});
			}
			options.gl.bindBuffer(
				options.gl.ELEMENT_ARRAY_BUFFER,
				options.resource.index
			);
		} finally {
			options.extension.bindVertexArrayOES(null);
			options.onHiddenStateChange?.();
		}
		return { fallbacks, vertexArray };
	}


	__exports.createVertexArrayEntry = createVertexArrayEntry;
	function configureAttribute(options) {
		if (!Number.isInteger(options.location) || options.location < 0) return;
		const entry = options.enabled
			? options.resource.attributes[options.name]
			: null;
		if (!entry) {
			options.gl.disableVertexAttribArray(options.location);
			options.fallbacks.push({
				location: options.location,
				values: ATTRIBUTE_FALLBACKS[options.name]
			});
			return;
		}
		options.gl.bindBuffer(options.gl.ARRAY_BUFFER, entry.buffer);
		options.gl.enableVertexAttribArray(options.location);
		options.gl.vertexAttribPointer(
			options.location,
			entry.attribute.itemSize,
			attributeType(options.gl, entry.attribute),
			Boolean(entry.attribute.normalized),
			0,
			0
		);
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-render-vertex-array-fallbacks.js ----
{
	const __exports = __awtsmoosModule_110;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-render-vertex-array-fallbacks.js
	 * @description Applies constant values only when an immutable VAO omits optional attributes.
	 * The Awtsmoos reveals complete geometry through present and absent vessels alike; Awtsmoos.com
	 * remembers constant values so repeated rigid and ecological draws do not upload them again.
	 */

	function bindVertexArrayFallbacks(owner, entry) {
		for (const fallback of entry.fallbacks) {
			const previous = owner.fallbackValues.get(fallback.location);
			if (sameValues(previous, fallback.values)) {
				owner.stats.vertexArrays.fallbackSkips += 1;
				continue;
			}
			owner.gl.vertexAttrib4fv(fallback.location, fallback.values);
			owner.fallbackValues.set(fallback.location, fallback.values);
			owner.stats.vertexArrays.fallbackUploads += 1;
		}
	}


	__exports.bindVertexArrayFallbacks = bindVertexArrayFallbacks;
	function sameValues(left, right) {
		return Boolean(left)
			&& left.length === right.length
			&& left.every((value, index) => value === right[index]);
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-render-vertex-arrays.js ----
{
	const __exports = __awtsmoosModule_108;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-render-vertex-arrays.js
	 * @description Reuses immutable WebGL vertex arrays without confusing VAO-local buffer truth.
	 * The Awtsmoos renews identical declarations inside distinct vessels; Awtsmoos.com therefore
	 * clears cached vertex claims before recording each VAO and again after returning to default.
	 */

	const createVertexArrayEntry = __awtsmoosModule_109.createVertexArrayEntry;
	const bindVertexArrayFallbacks = __awtsmoosModule_110.bindVertexArrayFallbacks;

	class RenderVertexArrays {
		constructor(gl, glStateCache = null) {
			this.cache = new WeakMap();
			this.creations = 0;
			this.current = null;
			this.entries = new Set();
			this.extension = gl.getExtension('OES_vertex_array_object');
			this.failures = 0;
			this.fallbackValues = new Map();
			this.gl = gl;
			this.glStateCache = glStateCache;
			this.invalidations = 0;
			this.stats = null;
		}

		beginFrame(stats) {
			this.stats = stats;
			stats.vertexArrays = {
				binds: 0,
				creations: this.creations,
				fallbackSkips: 0,
				fallbackUploads: 0,
				failures: this.failures,
				invalidations: this.invalidations,
				skips: 0,
				supported: Boolean(this.extension)
			};
		}

		bind(resource, locations, skinned) {
			if (!this.extension) return false;
			let entry;
			try {
				entry = this.entryFor(resource, locations, skinned);
			} catch {
				this.failures += 1;
				this.stats.vertexArrays.failures = this.failures;
				this.releaseToDefault();
				return false;
			}
			this.bindEntry(entry);
			bindVertexArrayFallbacks(this, entry);
			return true;
		}

		bindEntry(entry) {
			if (this.current === entry.vertexArray) {
				this.stats.vertexArrays.skips += 1;
				return;
			}
			this.extension.bindVertexArrayOES(entry.vertexArray);
			this.current = entry.vertexArray;
			this.stats.vertexArrays.binds += 1;
		}

		releaseToDefault() {
			if (!this.extension || this.current === null) return false;
			this.extension.bindVertexArrayOES(null);
			this.current = null;
			return true;
		}

		dispose() {
			if (!this.extension) return;
			this.releaseToDefault();
			for (const entry of this.entries) {
				this.extension.deleteVertexArrayOES(entry.vertexArray);
			}
			this.entries.clear();
		}

		entryFor(resource, locations, skinned) {
			let branches = this.cache.get(resource);
			if (!branches) {
				branches = new Map();
				this.cache.set(resource, branches);
			}
			const key = skinned ? 'skin' : 'rigid';
			let entry = branches.get(key);
			if (entry) return entry;
			this.releaseToDefault();
			this.prepareRecording();
			entry = createVertexArrayEntry({
				extension: this.extension,
				gl: this.gl,
				locations,
				onHiddenStateChange: () => this.invalidateHiddenState(),
				resource,
				skinned
			});
			branches.set(key, entry);
			this.entries.add(entry);
			this.creations += 1;
			this.stats.vertexArrays.creations = this.creations;
			return entry;
		}

		prepareRecording() {
			this.glStateCache?.invalidateVertexArrayState?.();
		}

		invalidateHiddenState() {
			this.invalidations += 1;
			this.glStateCache?.invalidateVertexArrayState?.();
			if (this.stats) {
				this.stats.vertexArrays.invalidations = this.invalidations;
			}
		}
	}

	__exports.RenderVertexArrays = RenderVertexArrays;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-render-buffers.js ----
{
	const __exports = __awtsmoosModule_103;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-render-buffers.js
	 * @description Composes immutable buffers, exact manual bindings, and VAO residency.
	 * The Awtsmoos gives each vertex its place anew; Awtsmoos.com preserves full geometry
	 * while choosing the smallest proven doorway by which that unchanged place reaches the GPU.
	 */

	const RenderBufferResources = __awtsmoosModule_104.RenderBufferResources;
	const RenderManualAttributes = __awtsmoosModule_105.RenderManualAttributes;
	const RenderVertexArrays = __awtsmoosModule_108.RenderVertexArrays;

	class RenderBufferCache {
		constructor(gl, glStateCache = null) {
			this.gl = gl;
			this.glStateCache = glStateCache;
			this.resources = new RenderBufferResources(gl);
			this.manual = new RenderManualAttributes(gl);
			this.vertexArrays = new RenderVertexArrays(gl, glStateCache);
		}

		beginFrame(stats) {
			stats.bufferStateSkips = 0;
			stats.bufferStateUploads = 0;
			this.manual.beginFrame(stats);
			this.vertexArrays.beginFrame(stats);
		}

		forMesh(mesh) {
			const geometry = mesh?.geometry;
			if (!geometry) {
				return null;
			}
			if (this.resources.has(geometry)) {
				return this.resources.forMesh(mesh);
			}
			this.vertexArrays.releaseToDefault();
			this.manual.invalidate();
			this.glStateCache?.invalidateVertexArrayState?.();
			return this.resources.forMesh(mesh);
		}

		bindMesh(resource, locations, skinned) {
			if (this.vertexArrays.bind(resource, locations, skinned)) {
				return 'vertex-array';
			}
			this.vertexArrays.releaseToDefault();
			if (this.vertexArrays.extension) {
				this.manual.invalidate();
			}
			this.manual.bind(resource, locations, skinned);
			return 'manual';
		}

		dispose() {
			this.vertexArrays.dispose();
		}
	}

	__exports.RenderBufferCache = RenderBufferCache;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-render-bounds.js ----
{
	const __exports = __awtsmoosModule_113;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-render-bounds.js
	 * @description Caches local and world geometry spheres without frame-local garbage.
	 * The Awtsmoos renews every point beyond measure; Awtsmoos.com keeps one conservative
	 * sphere vessel per mesh and updates it only when geometry or world transform changes.
	 */

	const BOUNDS_KEY = 'AwtsmoosTinyBounds';
	const WORLD_BOUNDS = new WeakMap();

	function worldBoundingSphere(mesh) {
		const local = localBoundingSphere(mesh?.geometry);
		const matrix = mesh?.matrixWorld;
		if (!local || !matrix) return null;
		const revision = mesh?._worldRevision ?? 0;
		let cached = WORLD_BOUNDS.get(mesh);
		if (
			cached
			&& cached.local === local
			&& cached.matrix === matrix
			&& cached.revision === revision
		) return cached.sphere;
		if (!cached) {
			cached = {
				local: null,
				matrix: null,
				revision: -1,
				sphere: { center: [0, 0, 0], radius: 0 }
			};
			WORLD_BOUNDS.set(mesh, cached);
		}
		transformCenter(cached.sphere.center, matrix, local.center);
		cached.sphere.radius = local.radius * maximumMatrixScale(matrix);
		cached.local = local;
		cached.matrix = matrix;
		cached.revision = revision;
		return cached.sphere;
	}


	__exports.worldBoundingSphere = worldBoundingSphere;
	function localBoundingSphere(geometry) {
		if (!geometry) return null;
		geometry.userData ||= {};
		if (geometry.userData[BOUNDS_KEY]) return geometry.userData[BOUNDS_KEY];
		const position = geometry.attributes?.position;
		if (!position?.array || position.itemSize < 3 || position.count < 1) return null;
		const bounds = computeBounds(position);
		geometry.userData[BOUNDS_KEY] = bounds;
		return bounds;
	}


	__exports.localBoundingSphere = localBoundingSphere;
	function computeBounds(position) {
		const array = position.array;
		const itemSize = position.itemSize;
		let minimumX = Infinity;
		let minimumY = Infinity;
		let minimumZ = Infinity;
		let maximumX = -Infinity;
		let maximumY = -Infinity;
		let maximumZ = -Infinity;
		for (let index = 0; index < position.count; index += 1) {
			const offset = index * itemSize;
			const x = Number(array[offset] || 0);
			const y = Number(array[offset + 1] || 0);
			const z = Number(array[offset + 2] || 0);
			minimumX = Math.min(minimumX, x);
			minimumY = Math.min(minimumY, y);
			minimumZ = Math.min(minimumZ, z);
			maximumX = Math.max(maximumX, x);
			maximumY = Math.max(maximumY, y);
			maximumZ = Math.max(maximumZ, z);
		}
		const center = [
			(minimumX + maximumX) / 2,
			(minimumY + maximumY) / 2,
			(minimumZ + maximumZ) / 2
		];
		let radius = 0;
		for (let index = 0; index < position.count; index += 1) {
			const offset = index * itemSize;
			const distance = Math.hypot(
				Number(array[offset] || 0) - center[0],
				Number(array[offset + 1] || 0) - center[1],
				Number(array[offset + 2] || 0) - center[2]
			);
			radius = Math.max(radius, distance);
		}
		return { center, radius };
	}

	function transformCenter(target, matrix, center) {
		const x = center[0];
		const y = center[1];
		const z = center[2];
		target[0] = matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12];
		target[1] = matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13];
		target[2] = matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14];
	}

	function maximumMatrixScale(matrix) {
		return Math.max(
			Math.hypot(matrix[0], matrix[1], matrix[2]),
			Math.hypot(matrix[4], matrix[5], matrix[6]),
			Math.hypot(matrix[8], matrix[9], matrix[10]),
			1e-6
		);
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-render-policy.js ----
{
	const __exports = __awtsmoosModule_115;
	// B"H
	/**
	 * Render policy: GLTFLoader separates Mesh, Line, and Points objects.
	 *
	 * The normal chossid viewer wants the final character, not Blender helper
	 * splines, point clouds, or auxiliary skin lines. Those modes remain available
	 * as debug layers, but the default reader-like view shows surface primitives.
	 */
	const PrimitiveMode = Object.freeze({
	  POINTS: 0,
	  LINES: 1,
	  LINE_LOOP: 2,
	  LINE_STRIP: 3,
	  TRIANGLES: 4,
	  TRIANGLE_STRIP: 5,
	  TRIANGLE_FAN: 6,
	});


	__exports.PrimitiveMode = PrimitiveMode;
	function modeName(mode = PrimitiveMode.TRIANGLES) {
	  return {
	    0: 'POINTS',
	    1: 'LINES',
	    2: 'LINE_LOOP',
	    3: 'LINE_STRIP',
	    4: 'TRIANGLES',
	    5: 'TRIANGLE_STRIP',
	    6: 'TRIANGLE_FAN',
	  }[mode] || `MODE_${mode}`;
	}


	__exports.modeName = modeName;
	function isSurfaceMode(mode = PrimitiveMode.TRIANGLES) {
	  return mode === PrimitiveMode.TRIANGLES ||
	    mode === PrimitiveMode.TRIANGLE_STRIP ||
	    mode === PrimitiveMode.TRIANGLE_FAN;
	}


	__exports.isSurfaceMode = isSurfaceMode;
	function isLineMode(mode = PrimitiveMode.TRIANGLES) {
	  return mode === PrimitiveMode.LINES ||
	    mode === PrimitiveMode.LINE_LOOP ||
	    mode === PrimitiveMode.LINE_STRIP;
	}


	__exports.isLineMode = isLineMode;
	function shouldRenderMode(mode, options = {}) {
	  if (isSurfaceMode(mode)) return options.showTriangles !== false;
	  if (isLineMode(mode)) return options.showHelperLines === true;
	  if (mode === PrimitiveMode.POINTS) return options.showHelperPoints === true;
	  return false;
	}


	__exports.shouldRenderMode = shouldRenderMode;
	function defaultRenderOptions() {
	  return {
		distanceScale: 1,
	    showTriangles: true,
	    showHelperLines: false,
	    showHelperPoints: false,
	    showSkeleton: false,
	  };
	}


	__exports.defaultRenderOptions = defaultRenderOptions;
	function helperKind(mode) {
	  if (isLineMode(mode)) return 'line';
	  if (mode === PrimitiveMode.POINTS) return 'point';
	  return 'surface';
	}

	__exports.helperKind = helperKind;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-render-surface-policy.js ----
{
	const __exports = __awtsmoosModule_116;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-render-surface-policy.js
	 * @description Shared alpha, culling, lighting, and triangle-count laws.
	 * The Awtsmoos reveals solid stone, cutout leaves, and translucent water distinctly;
	 * Awtsmoos.com keeps each surface in the pass whose depth and blending laws preserve it.
	 */

	const isSurfaceMode = __awtsmoosModule_115.isSurfaceMode;

	function isAlphaMask(mesh) {
		return mesh?.material?.alphaMode === 'MASK';
	}


	__exports.isAlphaMask = isAlphaMask;
	function isAlphaBlend(mesh) {
		return mesh?.material?.alphaMode === 'BLEND';
	}


	__exports.isAlphaBlend = isAlphaBlend;
	function isTransparent(mesh) {
		const material = mesh?.material;
		if (material?.alphaMode === 'MASK') return false;
		if (material?.alphaMode === 'BLEND') return true;
		return material?.transparent === true || (material?.opacity ?? 1) < 1;
	}


	__exports.isTransparent = isTransparent;
	function shouldCullBackfaces(mesh, transparent = isTransparent(mesh)) {
		const mode = mesh?.geometry?.mode ?? mesh?.primitiveMode ?? 4;
		if (!isSurfaceMode(mode)) return false;
		const material = mesh?.material || {};
		if (material.doubleSided === true) return false;
		if (material.backfaceCull === false) return false;
		return true;
	}


	__exports.shouldCullBackfaces = shouldCullBackfaces;
	function isLitMode(mode) {
		return isSurfaceMode(mode ?? 4);
	}


	__exports.isLitMode = isLitMode;
	function pointSizeForMode() {
		return 1;
	}


	__exports.pointSizeForMode = pointSizeForMode;
	function triangleCountForMode(mode, count) {
		if ((mode ?? 4) === 4) return Math.floor(count / 3);
		if ((mode ?? 4) === 5 || (mode ?? 4) === 6) {
			return Math.max(0, count - 2);
		}
		return 0;
	}

	__exports.triangleCountForMode = triangleCountForMode;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-render-culling-metadata.js ----
{
	const __exports = __awtsmoosModule_119;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-render-culling-metadata.js
	 * @description Resolves inherited render families, roles, and conservative distance limits.
	 * The Awtsmoos surrounds every finite object with its true context; Awtsmoos.com keeps
	 * metadata inheritance and distance law separate from camera-space rejection arithmetic.
	 */

	const FAMILY_DISTANCE = Object.freeze({
		'lake-shore-foam': 520,
		'lake-shore-stone': 340,
		'procedural-lofted-creature': 170,
		'procedural-text-landmark': 420,
		'reference-cottage-detail-batch': 330,
		'reference-forest-edge': 230,
		'reference-practical-lighting': 320,
		'reference-village-district': 380,
		'stream-reeds': 260,
		'village-botanical-garden': 210,
		'village-bushes': 220,
		'village-garden-bed': 210,
		'village-npc-population': 160
	});

	const ROLE_DISTANCE = Object.freeze({
		flora: 220,
		livestock: 180,
		prop: 240,
		terrain: 360,
		wildlife: 170
	});

	const ALWAYS_VISIBLE_RENDER_FAMILIES = new Set([
		'reference-atmospheric-mountains',
		'sky',
		'world-sky'
	]);


	__exports.ALWAYS_VISIBLE_RENDER_FAMILIES = ALWAYS_VISIBLE_RENDER_FAMILIES;
	function inheritedRenderMetadata(object) {
		const result = {};
		for (let current = object; current; current = current.parent) {
			const userData = current.userData || {};
			if (result.family == null && userData.family) {
				result.family = userData.family;
			}
			if (
				result.role == null
				&& userData.AwtsmoosWorldModel?.definition?.role
			) {
				result.role = userData.AwtsmoosWorldModel.definition.role;
			}
			if (
				result.renderDistance == null
				&& Number.isFinite(userData.renderDistance)
			) {
				result.renderDistance = userData.renderDistance;
			}
			if (userData.alwaysVisible === true) {
				result.alwaysVisible = true;
			}
		}
		return result;
	}


	__exports.inheritedRenderMetadata = inheritedRenderMetadata;
	function inheritedRenderDistance(metadata, camera, options) {
		const scale = Math.max(
			0.45,
			Math.min(1.25, options.distanceScale ?? 1)
		);
		if (Number.isFinite(metadata.renderDistance)) {
			return metadata.renderDistance * scale;
		}
		if (Number.isFinite(FAMILY_DISTANCE[metadata.family])) {
			return FAMILY_DISTANCE[metadata.family] * scale;
		}
		if (Number.isFinite(ROLE_DISTANCE[metadata.role])) {
			return ROLE_DISTANCE[metadata.role] * scale;
		}
		return Math.min(
			camera.far || 1000,
			options.defaultRenderDistance || 520
		) * scale;
	}

	__exports.inheritedRenderDistance = inheritedRenderDistance;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-render-culling.js ----
{
	const __exports = __awtsmoosModule_118;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-render-culling.js
	 * @description Rejects meshes outside conservative distance and camera-space spheres.
	 * The Awtsmoos renews every hidden side even when no eye receives it; Awtsmoos.com
	 * honors explicit culling opt-outs before applying finite camera and distance boundaries.
	 */

	const worldBoundingSphere = __awtsmoosModule_113.worldBoundingSphere;
	const ALWAYS_VISIBLE_RENDER_FAMILIES = __awtsmoosModule_119.ALWAYS_VISIBLE_RENDER_FAMILIES;
	const inheritedRenderDistance = __awtsmoosModule_119.inheritedRenderDistance;
	const inheritedRenderMetadata = __awtsmoosModule_119.inheritedRenderMetadata;

	__exports.inheritedRenderMetadata = __awtsmoosModule_119.inheritedRenderMetadata;

	function meshCullingReason(mesh, camera, options = {}, context = null) {
		if (!camera || options.culling === false) {
			return null;
		}
		if (mesh?.frustumCulled === false) {
			return null;
		}
		const metadata = inheritedRenderMetadata(mesh);
		if (
			metadata.alwaysVisible
			|| ALWAYS_VISIBLE_RENDER_FAMILIES.has(metadata.family)
		) {
			return null;
		}
		const sphere = worldBoundingSphere(mesh);
		if (!sphere) {
			return null;
		}
		const basis = context || cameraCullContext(camera);
		const distanceLimit = inheritedRenderDistance(metadata, camera, options);
		const relativeX = sphere.center[0] - basis.eyeX;
		const relativeY = sphere.center[1] - basis.eyeY;
		const relativeZ = sphere.center[2] - basis.eyeZ;
		const distance = Math.hypot(relativeX, relativeY, relativeZ);
		if (distance - sphere.radius > distanceLimit) {
			return 'distance';
		}
		const depth = relativeX * basis.forwardX
			+ relativeY * basis.forwardY
			+ relativeZ * basis.forwardZ;
		if (depth + sphere.radius < camera.near) {
			return 'frustum';
		}
		if (depth - sphere.radius > camera.far) {
			return 'frustum';
		}
		if (depth <= -sphere.radius) {
			return 'frustum';
		}
		const verticalLimit = Math.max(0, depth) * basis.tangent + sphere.radius;
		const horizontalLimit = verticalLimit * (camera.aspect || 1);
		const horizontal = relativeX * basis.rightX
			+ relativeY * basis.rightY
			+ relativeZ * basis.rightZ;
		if (Math.abs(horizontal) > horizontalLimit) {
			return 'frustum';
		}
		const vertical = relativeX * basis.upX
			+ relativeY * basis.upY
			+ relativeZ * basis.upZ;
		return Math.abs(vertical) > verticalLimit ? 'frustum' : null;
	}


	__exports.meshCullingReason = meshCullingReason;
	function cameraCullContext(camera) {
		if (!camera) {
			return null;
		}
		const eyeX = camera.position.x;
		const eyeY = camera.position.y;
		const eyeZ = camera.position.z;
		const target = camera.target || [0, 0, 4];
		let forwardX = target[0] - eyeX;
		let forwardY = target[1] - eyeY;
		let forwardZ = target[2] - eyeZ;
		const inverseForward = 1 / (
			Math.hypot(forwardX, forwardY, forwardZ) || 1
		);
		forwardX *= inverseForward;
		forwardY *= inverseForward;
		forwardZ *= inverseForward;
		let rightX = -forwardZ;
		let rightZ = forwardX;
		const inverseRight = 1 / (Math.hypot(rightX, rightZ) || 1);
		rightX *= inverseRight;
		rightZ *= inverseRight;
		const upX = -rightZ * forwardY;
		const upY = rightZ * forwardX - rightX * forwardZ;
		const upZ = rightX * forwardY;
		return {
			eyeX,
			eyeY,
			eyeZ,
			forwardX,
			forwardY,
			forwardZ,
			rightX,
			rightY: 0,
			rightZ,
			tangent: Math.tan((camera.fov || 45) * Math.PI / 360),
			upX,
			upY,
			upZ
		};
	}

	__exports.cameraCullContext = cameraCullContext;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-static-batch-policy.js ----
{
	const __exports = __awtsmoosModule_117;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-static-batch-policy.js
	 * @description Permits only proven static opaque village and functional-house families.
	 * The Awtsmoos knows every hidden motion; Awtsmoos.com joins fixed architecture and props
	 * while doors, players, grass reactions, creatures, water, and uncertain vessels stay apart.
	 */

	const inheritedRenderMetadata = __awtsmoosModule_118.inheritedRenderMetadata;
	const materialModeCode = __awtsmoosModule_107.materialModeCode;

	const STATIC_FAMILIES = new Set([
		'functional-house',
		'lake-shore-stone',
		'procedural-text-landmark',
		'reference-arrival-composition',
		'reference-atmospheric-mountain-snow',
		'reference-atmospheric-mountains',
		'reference-cottage-detail-batch',
		'reference-cottage-ornament-batch',
		'reference-forest-edge',
		'reference-practical-lighting',
		'reference-village-cottage-roof',
		'reference-village-district',
		'reference-village-landmark',
		'stream-reeds',
		'village-botanical-garden',
		'village-bushes',
		'village-garden-bed',
		'village-static-props'
	]);

	const DYNAMIC_NAME = /animal|chossid|creature|door|enemy|npc|player|remote|wildlife/i;
	const DYNAMIC_KEYS = new Set([
		'animated',
		'doorId',
		'dynamic',
		'interactive',
		'npcId',
		'playerId',
		'remotePlayerId'
	]);

	function staticBatchMetadata(mesh) {
		if (!eligibleSurface(mesh)) return null;
		const metadata = inheritedRenderMetadata(mesh);
		if (!STATIC_FAMILIES.has(metadata.family)) return null;
		if (dynamicHierarchy(mesh)) return null;
		return metadata;
	}


	__exports.staticBatchMetadata = staticBatchMetadata;
	function eligibleSurface(mesh) {
		const material = mesh.material || {};
		const mode = mesh.geometry?.mode ?? mesh.primitiveMode ?? 4;
		const materialMode = materialModeCode(mesh);
		if (mesh.isSkinnedMesh || mesh.skeleton) return false;
		if (mode !== 4) return false;
		if (material.transparent === true || material.alphaMode === 'BLEND') return false;
		if ((material.opacity ?? 1) < 1) return false;
		if (mesh.userData?.AwtsmoosYardGrass?.reactsToPlayer) return false;
		return materialMode === 0 || materialMode === 3;
	}

	function dynamicHierarchy(mesh) {
		for (let current = mesh; current; current = current.parent) {
			if (DYNAMIC_NAME.test(current.name || '')) return true;
			const userData = current.userData || {};
			for (const key of DYNAMIC_KEYS) {
				if (userData[key]) return true;
			}
			if (
				userData.AwtsmoosWorldModel?.definition?.dynamic === true
				|| userData.AwtsmoosWorldModel?.definition?.animated === true
			) return true;
		}
		return false;
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-render-collection.js ----
{
	const __exports = __awtsmoosModule_114;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-render-collection.js
	 * @description Traverses visible hierarchy and separates safe batch candidates.
	 * The Awtsmoos knows every visible and hidden branch; Awtsmoos.com gathers only lawful
	 * surfaces while preserving transparent order and leaving uncertain forms untouched.
	 */

	const helperKind = __awtsmoosModule_115.helperKind;
	const shouldRenderMode = __awtsmoosModule_115.shouldRenderMode;
	const isTransparent = __awtsmoosModule_116.isTransparent;
	const staticBatchMetadata = __awtsmoosModule_117.staticBatchMetadata;

	function collectSceneMeshes(root, options = {}) {
		const result = {
			batchCandidates: [],
			hidden: { line: 0, point: 0, other: 0 },
			invisibleSubtrees: 0,
			opaque: [],
			transparent: []
		};
		visit(root, true, object => classify(object, options, result), result);
		return result;
	}


	__exports.collectSceneMeshes = collectSceneMeshes;
	function classify(object, options, result) {
		if (!object.isMesh) return;
		const mode = object.geometry?.mode ?? object.primitiveMode ?? 4;
		if (!shouldRenderMode(mode, options)) {
			const kind = helperKind(mode);
			result.hidden[kind] = (result.hidden[kind] || 0) + 1;
			return;
		}
		if (isTransparent(object)) {
			result.transparent.push(object);
			return;
		}
		const metadata = options.staticBatcher
			? staticBatchMetadata(object)
			: null;
		if (metadata) {
			result.batchCandidates.push({ mesh: object, metadata });
			return;
		}
		result.opaque.push(object);
	}

	function visit(object, parentVisible, callback, result) {
		const visible = parentVisible && object.visible !== false;
		if (!visible) {
			result.invisibleSubtrees += 1;
			return;
		}
		callback(object);
		for (const child of object.children || []) {
			visit(child, visible, callback, result);
		}
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-material-signature-state.js ----
{
	const __exports = __awtsmoosModule_122;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-material-signature-state.js
	 * @description Observes non-texture mesh facts that can alter exact draw compatibility.
	 * The Awtsmoos joins equal garments without confusing color, culling, wind, or primitive mode;
	 * Awtsmoos.com compares these finite values directly so stable signatures need no rebuilt arrays.
	 */

	const materialModeCode = __awtsmoosModule_107.materialModeCode;

	function captureMaterialSignatureState(mesh, textureState) {
		const material = mesh.material || {};
		const color = material.color || [0.75, 0.70, 0.62, 1];
		const grass = mesh.userData?.AwtsmoosYardGrass || {};
		return {
			alphaCutoff: material.alphaCutoff ?? 0.5,
			alphaMode: material.alphaMode || 'OPAQUE',
			anisotropy: material.anisotropy ?? 2,
			color0: color[0] ?? 0.75,
			color1: color[1] ?? 0.70,
			color2: color[2] ?? 0.62,
			cullingDisabled: material.backfaceCull === false,
			doubleSided: material.doubleSided === true,
			emissiveStrength: material.emissiveStrength ?? 1.8,
			geometryMode: mesh.geometry?.mode ?? mesh.primitiveMode ?? 4,
			grassRadius: grass.interactionRadius ?? 2.2,
			grassReactive: grass.reactsToPlayer === true,
			grassWind: grass.windStrength ?? 0.085,
			material,
			materialMode: materialModeCode(mesh),
			opacity: material.opacity ?? color[3] ?? 1,
			textureState
		};
	}


	__exports.captureMaterialSignatureState = captureMaterialSignatureState;
	function sameMaterialSignatureState(state, mesh, textureState) {
		if (!state) return false;
		const material = mesh.material || {};
		const color = material.color || [0.75, 0.70, 0.62, 1];
		const grass = mesh.userData?.AwtsmoosYardGrass || {};
		return state.material === material
			&& state.textureState === textureState
			&& state.color0 === (color[0] ?? 0.75)
			&& state.color1 === (color[1] ?? 0.70)
			&& state.color2 === (color[2] ?? 0.62)
			&& state.opacity === (material.opacity ?? color[3] ?? 1)
			&& state.alphaMode === (material.alphaMode || 'OPAQUE')
			&& state.alphaCutoff === (material.alphaCutoff ?? 0.5)
			&& state.doubleSided === (material.doubleSided === true)
			&& state.cullingDisabled === (material.backfaceCull === false)
			&& state.emissiveStrength === (material.emissiveStrength ?? 1.8)
			&& state.anisotropy === (material.anisotropy ?? 2)
			&& state.materialMode === materialModeCode(mesh)
			&& state.grassReactive === (grass.reactsToPlayer === true)
			&& state.grassRadius === (grass.interactionRadius ?? 2.2)
			&& state.grassWind === (grass.windStrength ?? 0.085)
			&& state.geometryMode === (mesh.geometry?.mode ?? mesh.primitiveMode ?? 4);
	}

	__exports.sameMaterialSignatureState = sameMaterialSignatureState;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-material-texture-signature.js ----
{
	const __exports = __awtsmoosModule_123;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-material-texture-signature.js
	 * @description Appends cached base, mix, and ecological layer state to one draw signature.
	 * The Awtsmoos reveals one physical garment through image identity, native repeat, and ecology;
	 * Awtsmoos.com reuses that revelation without recalculating dimensions or rebuilding layer state.
	 */

	function appendTextureSignature(values, state, identity) {
		values.push(
			identity(state.mapImage),
			state.mapReady ? 1 : 0,
			state.mapRepeat0,
			state.mapRepeat1,
			identity(state.mixImage),
			state.mixReady ? 1 : 0,
			state.mixRepeat0,
			state.mixRepeat1,
			...state.mapPolicySignature,
			...state.mixPolicySignature,
			state.mixStrength,
			state.patchScale,
			state.patchSharpness
		);
		for (const layer of state.layers) appendLayer(values, layer, identity);
		return values;
	}


	__exports.appendTextureSignature = appendTextureSignature;
	function appendLayer(values, layer, identity) {
		values.push(
			identity(layer.image),
			layer.ready ? 1 : 0,
			layer.repeat0,
			layer.repeat1,
			layer.strength,
			layer.role,
			layer.angle,
			...layer.policySignature,
			...layer.zones,
			...layer.slope,
			...layer.height,
			layer.wetness
		);
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-texture-source.js ----
{
	const __exports = __awtsmoosModule_127;
	// B"H
	function sourceReady(source) {
		return !!(
			source
			&& sourceWidth(source)
			&& sourceHeight(source)
			&& source.complete !== false
		);
	}


	__exports.sourceReady = sourceReady;
	function sourceWidth(source) {
		return source?.naturalWidth || source?.videoWidth || source?.width || 0;
	}


	__exports.sourceWidth = sourceWidth;
	function sourceHeight(source) {
		return source?.naturalHeight || source?.videoHeight || source?.height || 0;
	}


	__exports.sourceHeight = sourceHeight;
	function createDefaultTexture(gl) {
		const texture = gl.createTexture();
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			1,
			1,
			0,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			new Uint8Array([255, 255, 255, 255])
		);
		setTextureParameters(gl, gl.NEAREST, gl.NEAREST, gl.CLAMP_TO_EDGE);
		return texture;
	}


	__exports.createDefaultTexture = createDefaultTexture;
	function setTextureParameters(gl, minification, magnification, wrap) {
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minification);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magnification);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
	}


	__exports.setTextureParameters = setTextureParameters;
	function isPowerOfTwo(value) {
		return value > 0 && (value & (value - 1)) === 0;
	}

	__exports.isPowerOfTwo = isPowerOfTwo;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-native-texture-density.js ----
{
	const __exports = __awtsmoosModule_126;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-native-texture-density.js
	 * @description Converts original image pixels into exact world-space repeat multipliers.
	 * The Awtsmoos does not enlarge or diminish the finite image vessel; Awtsmoos.com keeps
	 * every source untouched while measured UV repetition reveals constant physical texel scale.
	 */

	const sourceHeight = __awtsmoosModule_127.sourceHeight;
	const sourceWidth = __awtsmoosModule_127.sourceWidth;

	const DEFAULT_NATIVE_TEXELS_PER_WORLD = 96;


	__exports.DEFAULT_NATIVE_TEXELS_PER_WORLD = DEFAULT_NATIVE_TEXELS_PER_WORLD;
	function resolveNativeTextureRepeat(source, authoredRepeat, policy = {}, overrides = {}) {
		const resolvedPolicy = { ...policy, ...overrides };
		const fallback = finitePair(authoredRepeat, [1, 1]);
		if (!nativeDensityEnabled(resolvedPolicy)) return fallback;
		const dimensions = textureDimensions(source);
		if (!dimensions.ready) return fallback;
		const density = positivePair(
			resolvedPolicy.texelsPerWorld,
			[DEFAULT_NATIVE_TEXELS_PER_WORLD, DEFAULT_NATIVE_TEXELS_PER_WORLD]
		);
		const surface = optionalPositivePair(resolvedPolicy.surfaceWorldSize);
		if (surface) {
			return [
				surface[0] * density[0] / dimensions.width,
				surface[1] * density[1] / dimensions.height
			];
		}
		const uvUnits = uvUnitsPerWorld(resolvedPolicy);
		if (!uvUnits) return fallback;
		return [
			density[0] / (dimensions.width * uvUnits[0]),
			density[1] / (dimensions.height * uvUnits[1])
		];
	}


	__exports.resolveNativeTextureRepeat = resolveNativeTextureRepeat;
	function nativeTextureDensityEvidence(source, authoredRepeat, policy = {}) {
		const dimensions = textureDimensions(source);
		return Object.freeze({
			effectiveRepeat: Object.freeze(resolveNativeTextureRepeat(source, authoredRepeat, policy)),
			nativeDensity: nativeDensityEnabled(policy),
			originalHeight: dimensions.height,
			originalWidth: dimensions.width,
			resampled: false,
			texelsPerWorld: Object.freeze(positivePair(
				policy.texelsPerWorld,
				[DEFAULT_NATIVE_TEXELS_PER_WORLD, DEFAULT_NATIVE_TEXELS_PER_WORLD]
			))
		});
	}


	__exports.nativeTextureDensityEvidence = nativeTextureDensityEvidence;
	function nativeTexturePolicySignature(policy = {}) {
		const density = positivePair(policy.texelsPerWorld, [0, 0]);
		const surface = finitePair(policy.surfaceWorldSize, [0, 0]);
		const uvUnits = uvUnitsPerWorld(policy) || [0, 0];
		return [
			policy.nativeTexelDensity === false ? 0 : nativeDensityEnabled(policy) ? 1 : 0,
			density[0], density[1], uvUnits[0], uvUnits[1], surface[0], surface[1]
		];
	}


	__exports.nativeTexturePolicySignature = nativeTexturePolicySignature;
	function nativeDensityEnabled(policy) {
		if (policy.nativeTexelDensity === false) return false;
		return policy.nativeTexelDensity === true
			|| Boolean(optionalPositivePair(policy.uvUnitsPerWorld))
			|| Boolean(optionalPositivePair(policy.surfaceWorldSize))
			|| Boolean(optionalPositivePair(policy.tileWorld));
	}

	function uvUnitsPerWorld(policy) {
		const explicit = optionalPositivePair(policy.uvUnitsPerWorld);
		if (explicit) return explicit;
		const tileWorld = optionalPositivePair(policy.tileWorld);
		return tileWorld ? [1 / tileWorld[0], 1 / tileWorld[1]] : null;
	}

	function textureDimensions(source) {
		const width = sourceWidth(source);
		const height = sourceHeight(source);
		return { height, ready: width > 0 && height > 0 && source?.complete !== false, width };
	}

	function optionalPositivePair(value) {
		if (Array.isArray(value)) {
			const pair = [Number(value[0]), Number(value[1])];
			return pair.every(item => Number.isFinite(item) && item > 0) ? pair : null;
		}
		const number = Number(value);
		return Number.isFinite(number) && number > 0 ? [number, number] : null;
	}

	function positivePair(value, fallback) {
		return optionalPositivePair(value) || [...fallback];
	}

	function finitePair(value, fallback) {
		if (!Array.isArray(value)) return [...fallback];
		return value.slice(0, 2).map((item, index) => (
			Number.isFinite(Number(item)) ? Number(item) : fallback[index]
		));
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-terrain-layer-policy.js ----
{
	const __exports = __awtsmoosModule_128;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-terrain-layer-policy.js
	 * @description Converts real sampler limits into six active terrain vessels while preserving a thirty-two-layer logical library.
	 * The Awtsmoos is unlimited while every GPU vessel is finite; Awtsmoos.com keeps many ecological sources authored
	 * and pages six distinct garments into the phone without sampler pressure, false scarcity, or hidden surrender.
	 */

	const TERRAIN_LAYER_TARGET = 6;

	__exports.TERRAIN_LAYER_TARGET = TERRAIN_LAYER_TARGET;
	const TERRAIN_LAYER_LOGICAL_LIMIT = 32;

	__exports.TERRAIN_LAYER_LOGICAL_LIMIT = TERRAIN_LAYER_LOGICAL_LIMIT;
	const TERRAIN_RESERVED_FRAGMENT_UNITS = 2;

	__exports.TERRAIN_RESERVED_FRAGMENT_UNITS = TERRAIN_RESERVED_FRAGMENT_UNITS;
	const TERRAIN_FIRST_TEXTURE_UNIT = 3;


	__exports.TERRAIN_FIRST_TEXTURE_UNIT = TERRAIN_FIRST_TEXTURE_UNIT;
	function terrainLayerCapacity(gl) {
		const fragmentLimit = numericLimit(gl, gl.MAX_TEXTURE_IMAGE_UNITS, 8);
		const combinedLimit = numericLimit(gl, gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS, 8);
		return Math.max(0, Math.min(
			TERRAIN_LAYER_TARGET,
			fragmentLimit - TERRAIN_RESERVED_FRAGMENT_UNITS,
			combinedLimit - TERRAIN_FIRST_TEXTURE_UNIT
		));
	}


	__exports.terrainLayerCapacity = terrainLayerCapacity;
	function terrainLayerUnits(count = TERRAIN_LAYER_TARGET) {
		const capacity = Math.max(0, Math.min(TERRAIN_LAYER_TARGET, Math.floor(count)));
		return Object.freeze(Array.from({ length: capacity }, (_, index) => {
			return TERRAIN_FIRST_TEXTURE_UNIT + index;
		}));
	}


	__exports.terrainLayerUnits = terrainLayerUnits;
	function numericLimit(gl, key, fallback) {
		const value = Number(gl.getParameter?.(key));
		return Number.isFinite(value) && value > 0 ? value : fallback;
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-layered-texture-state.js ----
{
	const __exports = __awtsmoosModule_125;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-layered-texture-state.js
	 * @description Captures six active ecological layers with per-image native texel density.
	 * The Awtsmoos reveals one terrain through untouched image vessels; Awtsmoos.com preserves
	 * original dimensions while exact shader-visible state enables lawful renderer reuse.
	 */

	const nativeTexturePolicySignature = __awtsmoosModule_126.nativeTexturePolicySignature;
	const resolveNativeTextureRepeat = __awtsmoosModule_126.resolveNativeTextureRepeat;
	const TERRAIN_LAYER_TARGET = __awtsmoosModule_128.TERRAIN_LAYER_TARGET;
	const terrainLayerUnits = __awtsmoosModule_128.terrainLayerUnits;
	const sourceReady = __awtsmoosModule_127.sourceReady;

	const TERRAIN_LAYER_COUNT = TERRAIN_LAYER_TARGET;

	__exports.TERRAIN_LAYER_COUNT = TERRAIN_LAYER_COUNT;
	const TERRAIN_LAYER_UNITS = terrainLayerUnits(TERRAIN_LAYER_TARGET);


	__exports.TERRAIN_LAYER_UNITS = TERRAIN_LAYER_UNITS;
	function layeredTextureState(material = {}) {
		if (!Array.isArray(material.textureLayers)) return [];
		return Array.from({ length: TERRAIN_LAYER_COUNT }, (_, index) => (
			layerState(material.textureLayers[index] || {}, material)
		));
	}


	__exports.layeredTextureState = layeredTextureState;
	function sameLayeredTextureState(left = [], right = []) {
		if (left.length !== right.length) return false;
		return left.every((layer, index) => sameLayer(layer, right[index]));
	}


	__exports.sameLayeredTextureState = sameLayeredTextureState;
	function layeredTextureSignature(material = {}, identity) {
		return layeredTextureState(material).flatMap(layer => [
			identity(layer.image), layer.ready ? 1 : 0,
			layer.repeat0, layer.repeat1, layer.strength, layer.role, layer.angle,
			...layer.policySignature, ...layer.zones, ...layer.slope, ...layer.height,
			layer.wetness
		]);
	}


	__exports.layeredTextureSignature = layeredTextureSignature;
	function layerState(layer, material) {
		const policy = { ...(material.texturePolicy || {}), ...(layer.texturePolicy || {}) };
		const repeat = resolveNativeTextureRepeat(layer.image, layer.repeat || [1, 1], policy);
		return {
			angle: finite(layer.angle, 0),
			height: pair(layer.height, [-10000, 10000]),
			image: layer.image || null,
			policySignature: nativeTexturePolicySignature(policy),
			ready: sourceReady(layer.image),
			repeat0: repeat[0],
			repeat1: repeat[1],
			role: layer.role || '',
			slope: pair(layer.slope, [0, 1]),
			strength: finite(layer.strength, 0),
			wetness: finite(layer.wetness, 0),
			zones: vector4(layer.zones)
		};
	}

	function sameLayer(left, right) {
		return Boolean(right)
			&& left.image === right.image
			&& left.ready === right.ready
			&& left.repeat0 === right.repeat0
			&& left.repeat1 === right.repeat1
			&& left.strength === right.strength
			&& left.role === right.role
			&& left.angle === right.angle
			&& sameArray(left.policySignature, right.policySignature)
			&& sameArray(left.zones, right.zones)
			&& sameArray(left.slope, right.slope)
			&& sameArray(left.height, right.height)
			&& left.wetness === right.wetness;
	}

	function pair(value, fallback) {
		if (!Array.isArray(value)) return [...fallback];
		return [finite(value[0], fallback[0]), finite(value[1], fallback[1])];
	}

	function vector4(value) {
		return Array.from({ length: 4 }, (_, index) => finite(value?.[index], 1));
	}

	function finite(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}

	function sameArray(left, right) {
		return left.length === right.length
			&& left.every((value, index) => value === right[index]);
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-texture-state-fingerprint-core.js ----
{
	const __exports = __awtsmoosModule_130;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-texture-state-fingerprint-core.js
	 * @description Captures source readiness, authored pairs, and native-density policy values.
	 * The Awtsmoos renews every pixel vessel without resizing it; Awtsmoos.com compares identity and
	 * readiness while source dimensions are resolved only when an actual texture state is rebuilt.
	 */

	const sourceReady = __awtsmoosModule_127.sourceReady;

	function captureSourceFingerprint(source) {
		return {
			ready: sourceReady(source),
			source: source || null
		};
	}


	__exports.captureSourceFingerprint = captureSourceFingerprint;
	function sameSourceFingerprint(fingerprint, source) {
		return fingerprint.source === (source || null)
			&& fingerprint.ready === sourceReady(source);
	}


	__exports.sameSourceFingerprint = sameSourceFingerprint;
	function capturePair(value, fallback = [1, 1]) {
		return [
			finite(value?.[0], fallback[0]),
			finite(value?.[1], fallback[1])
		];
	}


	__exports.capturePair = capturePair;
	function samePair(pair, value, fallback = [1, 1]) {
		return pair[0] === finite(value?.[0], fallback[0])
			&& pair[1] === finite(value?.[1], fallback[1]);
	}


	__exports.samePair = samePair;
	function capturePolicy(policy = {}) {
		return {
			nativeTexelDensity: policy.nativeTexelDensity,
			surfaceWorldSize: capturePair(policy.surfaceWorldSize, [0, 0]),
			texelsPerWorld: policy.texelsPerWorld,
			tileWorld: policy.tileWorld,
			uvUnitsPerWorld: policy.uvUnitsPerWorld
		};
	}


	__exports.capturePolicy = capturePolicy;
	function samePolicy(fingerprint, policy = {}) {
		return fingerprint.nativeTexelDensity === policy.nativeTexelDensity
			&& fingerprint.texelsPerWorld === policy.texelsPerWorld
			&& fingerprint.tileWorld === policy.tileWorld
			&& fingerprint.uvUnitsPerWorld === policy.uvUnitsPerWorld
			&& samePair(fingerprint.surfaceWorldSize, policy.surfaceWorldSize, [0, 0]);
	}


	__exports.samePolicy = samePolicy;
	function captureVector(value, length, fallback) {
		return Array.from({ length }, (_, index) => {
			return finite(value?.[index], fallback[index]);
		});
	}


	__exports.captureVector = captureVector;
	function sameVector(vector, value, fallback) {
		return vector.every((entry, index) => {
			return entry === finite(value?.[index], fallback[index]);
		});
	}


	__exports.sameVector = sameVector;
	function finite(value, fallback) {
		const number = Number(value);
		return Number.isFinite(number) ? number : fallback;
	}

	__exports.finite = finite;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-texture-layer-fingerprint.js ----
{
	const __exports = __awtsmoosModule_131;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-texture-layer-fingerprint.js
	 * @description Tracks only authored and hydrated facts that can alter one ecological layer.
	 * The Awtsmoos reveals meadow, earth, waterbank, rock, forest, and shore through exact vessels;
	 * Awtsmoos.com avoids rebuilding their state while image, repeat, mask, and policy remain unchanged.
	 */

	const capturePair = __awtsmoosModule_130.capturePair;
	const capturePolicy = __awtsmoosModule_130.capturePolicy;
	const captureSourceFingerprint = __awtsmoosModule_130.captureSourceFingerprint;
	const captureVector = __awtsmoosModule_130.captureVector;
	const samePair = __awtsmoosModule_130.samePair;
	const samePolicy = __awtsmoosModule_130.samePolicy;
	const sameSourceFingerprint = __awtsmoosModule_130.sameSourceFingerprint;
	const sameVector = __awtsmoosModule_130.sameVector;

	const EMPTY_LAYERS = Object.freeze([]);
	const HEIGHT_DEFAULT = [-10000, 10000];
	const SLOPE_DEFAULT = [0, 1];
	const ZONE_DEFAULT = [1, 1, 1, 1];

	function captureLayerFingerprints(material = {}) {
		const layers = material.textureLayers || EMPTY_LAYERS;
		return {
			layers,
			records: layers.map(layer => captureLayer(layer))
		};
	}


	__exports.captureLayerFingerprints = captureLayerFingerprints;
	function sameLayerFingerprints(fingerprint, material = {}) {
		const layers = material.textureLayers || EMPTY_LAYERS;
		if (fingerprint.layers !== layers) return false;
		if (fingerprint.records.length !== layers.length) return false;
		return fingerprint.records.every((record, index) => {
			return sameLayer(record, layers[index] || {});
		});
	}


	__exports.sameLayerFingerprints = sameLayerFingerprints;
	function captureLayer(layer = {}) {
		return {
			angle: numeric(layer.angle, 0),
			height: captureVector(layer.height, 2, HEIGHT_DEFAULT),
			image: captureSourceFingerprint(layer.image),
			layer,
			policy: capturePolicy(layer.texturePolicy),
			repeat: capturePair(layer.repeat, [1, 1]),
			role: layer.role || '',
			slope: captureVector(layer.slope, 2, SLOPE_DEFAULT),
			strength: numeric(layer.strength, 0),
			wetness: numeric(layer.wetness, 0),
			zones: captureVector(layer.zones, 4, ZONE_DEFAULT)
		};
	}

	function sameLayer(record, layer) {
		return record.layer === layer
			&& record.angle === numeric(layer.angle, 0)
			&& record.role === (layer.role || '')
			&& record.strength === numeric(layer.strength, 0)
			&& record.wetness === numeric(layer.wetness, 0)
			&& sameSourceFingerprint(record.image, layer.image)
			&& samePair(record.repeat, layer.repeat, [1, 1])
			&& samePolicy(record.policy, layer.texturePolicy)
			&& sameVector(record.zones, layer.zones, ZONE_DEFAULT)
			&& sameVector(record.slope, layer.slope, SLOPE_DEFAULT)
			&& sameVector(record.height, layer.height, HEIGHT_DEFAULT);
	}

	function numeric(value, fallback) {
		const number = Number(value);
		return Number.isFinite(number) ? number : fallback;
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-terrain-mixing-state.js ----
{
	const __exports = __awtsmoosModule_132;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-terrain-mixing-state.js
	 * @description Carries three compact terrain-quality vectors from material policy into WebGL.
	 * The Awtsmoos folds distance, warp, ecology, and chroma into measured light;
	 * Awtsmoos.com keeps one immutable state so every shader garment receives the truth aright.
	 */

	const DEFAULT_A = Object.freeze([0.0075, 1.67, 0.015, 0.4]);
	const DEFAULT_B = Object.freeze([90, 240, 4, 0.14]);
	const DEFAULT_C = Object.freeze([0.18, 0.52, 0.72, 0.3]);

	function terrainMixingState(material = {}) {
		return Object.freeze({
			a: vector(material.terrainMixingA, DEFAULT_A),
			b: vector(material.terrainMixingB, DEFAULT_B),
			c: vector(material.terrainMixingC, DEFAULT_C)
		});
	}


	__exports.terrainMixingState = terrainMixingState;
	function sameTerrainMixingState(left, right) {
		return sameVector(left?.a, right?.a)
			&& sameVector(left?.b, right?.b)
			&& sameVector(left?.c, right?.c);
	}


	__exports.sameTerrainMixingState = sameTerrainMixingState;
	function terrainMixingDefaults() {
		return Object.freeze({
			a: [...DEFAULT_A],
			b: [...DEFAULT_B],
			c: [...DEFAULT_C]
		});
	}


	__exports.terrainMixingDefaults = terrainMixingDefaults;
	function vector(value, fallback) {
		return Object.freeze(Array.from({ length: 4 }, (_, index) => {
			const number = Number(value?.[index]);
			return Number.isFinite(number) ? number : fallback[index];
		}));
	}

	function sameVector(left, right) {
		return Boolean(left && right)
			&& left.length === right.length
			&& left.every((value, index) => value === right[index]);
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-texture-state-fingerprint.js ----
{
	const __exports = __awtsmoosModule_129;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-texture-state-fingerprint.js
	 * @description Observes base, mix, terrain-quality, policy, and layer facts that alter GPU state.
	 * The Awtsmoos renews original images while every mixing covenant stays precise;
	 * Awtsmoos.com detects one changed vector without rebuilding every texture twice.
	 */

	const capturePair = __awtsmoosModule_130.capturePair;
	const capturePolicy = __awtsmoosModule_130.capturePolicy;
	const captureSourceFingerprint = __awtsmoosModule_130.captureSourceFingerprint;
	const captureVector = __awtsmoosModule_130.captureVector;
	const samePair = __awtsmoosModule_130.samePair;
	const samePolicy = __awtsmoosModule_130.samePolicy;
	const sameSourceFingerprint = __awtsmoosModule_130.sameSourceFingerprint;
	const sameVector = __awtsmoosModule_130.sameVector;
	const captureLayerFingerprints = __awtsmoosModule_131.captureLayerFingerprints;
	const sameLayerFingerprints = __awtsmoosModule_131.sameLayerFingerprints;
	const terrainMixingDefaults = __awtsmoosModule_132.terrainMixingDefaults;

	function captureTextureFingerprint(material = {}) {
		const defaults = terrainMixingDefaults();
		return {
			layers: captureLayerFingerprints(material),
			mapImage: captureSourceFingerprint(material.mapImage),
			mapPolicy: capturePolicy(material.texturePolicy),
			mapRepeat: capturePair(material.mapRepeat, [1, 1]),
			mixImage: captureSourceFingerprint(material.mixImage),
			mixPolicy: capturePolicy(material.mixTexturePolicy),
			mixRepeat: capturePair(material.mixRepeat, [1, 1]),
			mixStrength: numberOr(material.mixStrength, 0),
			patchScale: numberOr(material.mixPatchScale, 0),
			patchSharpness: numberOr(material.mixPatchSharpness, 0.58),
			terrainA: captureVector(material.terrainMixingA, 4, defaults.a),
			terrainB: captureVector(material.terrainMixingB, 4, defaults.b),
			terrainC: captureVector(material.terrainMixingC, 4, defaults.c)
		};
	}


	__exports.captureTextureFingerprint = captureTextureFingerprint;
	function sameTextureFingerprint(fingerprint, material = {}) {
		const defaults = terrainMixingDefaults();
		return Boolean(fingerprint)
			&& fingerprint.mixStrength === numberOr(material.mixStrength, 0)
			&& fingerprint.patchScale === numberOr(material.mixPatchScale, 0)
			&& fingerprint.patchSharpness === numberOr(material.mixPatchSharpness, 0.58)
			&& sameVector(fingerprint.terrainA, material.terrainMixingA, defaults.a)
			&& sameVector(fingerprint.terrainB, material.terrainMixingB, defaults.b)
			&& sameVector(fingerprint.terrainC, material.terrainMixingC, defaults.c)
			&& sameSourceFingerprint(fingerprint.mapImage, material.mapImage)
			&& sameSourceFingerprint(fingerprint.mixImage, material.mixImage)
			&& samePair(fingerprint.mapRepeat, material.mapRepeat, [1, 1])
			&& samePair(fingerprint.mixRepeat, material.mixRepeat, [1, 1])
			&& samePolicy(fingerprint.mapPolicy, material.texturePolicy)
			&& samePolicy(fingerprint.mixPolicy, material.mixTexturePolicy)
			&& sameLayerFingerprints(fingerprint.layers, material);
	}


	__exports.sameTextureFingerprint = sameTextureFingerprint;
	function numberOr(value, fallback) {
		const number = Number(value);
		return Number.isFinite(number) ? number : fallback;
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-texture-state.js ----
{
	const __exports = __awtsmoosModule_124;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-texture-state.js
	 * @description Reuses exact native-density and terrain-mixing state until observed material facts change.
	 * The Awtsmoos renews image, ecology, and physical scale without waste; Awtsmoos.com
	 * lets hydration and authored terrain law invalidate only the vessel that changed in place.
	 */

	const layeredTextureState = __awtsmoosModule_125.layeredTextureState;
	const sameLayeredTextureState = __awtsmoosModule_125.sameLayeredTextureState;
	const nativeTexturePolicySignature = __awtsmoosModule_126.nativeTexturePolicySignature;
	const resolveNativeTextureRepeat = __awtsmoosModule_126.resolveNativeTextureRepeat;
	const sourceReady = __awtsmoosModule_127.sourceReady;
	const captureTextureFingerprint = __awtsmoosModule_129.captureTextureFingerprint;
	const sameTextureFingerprint = __awtsmoosModule_129.sameTextureFingerprint;
	const sameTerrainMixingState = __awtsmoosModule_132.sameTerrainMixingState;
	const terrainMixingState = __awtsmoosModule_132.terrainMixingState;

	const cache = new WeakMap();
	const diagnostics = { hits: 0, invalidations: 0, misses: 0 };

	function textureState(material = {}) {
		if (!material || typeof material !== 'object') return buildTextureState({});
		const cached = cache.get(material);
		if (cached && sameTextureFingerprint(cached.fingerprint, material)) {
			diagnostics.hits += 1;
			return cached.state;
		}
		if (cached) diagnostics.invalidations += 1;
		else diagnostics.misses += 1;
		const state = buildTextureState(material);
		cache.set(material, { fingerprint: captureTextureFingerprint(material), state });
		return state;
	}


	__exports.textureState = textureState;
	function invalidateTextureState(material) {
		return Boolean(material && typeof material === 'object') && cache.delete(material);
	}


	__exports.invalidateTextureState = invalidateTextureState;
	function textureStateCacheDiagnostics() {
		return { ...diagnostics };
	}


	__exports.textureStateCacheDiagnostics = textureStateCacheDiagnostics;
	function sameTextureState(left, right) {
		if (left === right) return true;
		if (!left || !right) return false;
		return left.mapImage === right.mapImage
			&& left.mapReady === right.mapReady
			&& left.mapRepeat0 === right.mapRepeat0
			&& left.mapRepeat1 === right.mapRepeat1
			&& left.mixImage === right.mixImage
			&& left.mixReady === right.mixReady
			&& left.mixRepeat0 === right.mixRepeat0
			&& left.mixRepeat1 === right.mixRepeat1
			&& left.mixStrength === right.mixStrength
			&& left.patchScale === right.patchScale
			&& left.patchSharpness === right.patchSharpness
			&& sameTerrainMixingState(left.terrainMixing, right.terrainMixing)
			&& sameLayeredTextureState(left.layers, right.layers);
	}


	__exports.sameTextureState = sameTextureState;
	function buildTextureState(material) {
		const mapRepeat = resolveNativeTextureRepeat(
			material.mapImage,
			material.mapRepeat || [1, 1],
			material.texturePolicy
		);
		const mixPolicy = {
			...(material.texturePolicy || {}),
			...(material.mixTexturePolicy || {})
		};
		const mixRepeat = resolveNativeTextureRepeat(
			material.mixImage,
			material.mixRepeat || [1, 1],
			material.texturePolicy,
			material.mixTexturePolicy
		);
		return Object.freeze({
			layers: layeredTextureState(material),
			mapImage: material.mapImage || null,
			mapPolicySignature: nativeTexturePolicySignature(material.texturePolicy),
			mapReady: sourceReady(material.mapImage),
			mapRepeat0: mapRepeat[0],
			mapRepeat1: mapRepeat[1],
			mixImage: material.mixImage || null,
			mixPolicySignature: nativeTexturePolicySignature(mixPolicy),
			mixReady: sourceReady(material.mixImage),
			mixRepeat0: mixRepeat[0],
			mixRepeat1: mixRepeat[1],
			mixStrength: material.mixStrength ?? 0,
			patchScale: material.mixPatchScale ?? 0,
			patchSharpness: material.mixPatchSharpness ?? 0.58,
			terrainMixing: terrainMixingState(material)
		});
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-material-signature.js ----
{
	const __exports = __awtsmoosModule_121;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-material-signature.js
	 * @description Caches exact full and static-batch draw signatures until observed state changes.
	 * The Awtsmoos joins equal vessels without repeating their entire decree; Awtsmoos.com preserves
	 * color, culling, native texture density, ecology, wind, and primitive truth with bounded CPU work.
	 */

	const captureMaterialSignatureState = __awtsmoosModule_122.captureMaterialSignatureState;
	const sameMaterialSignatureState = __awtsmoosModule_122.sameMaterialSignatureState;
	const appendTextureSignature = __awtsmoosModule_123.appendTextureSignature;
	const textureState = __awtsmoosModule_124.textureState;

	const cache = new WeakMap();
	const objectIds = new WeakMap();
	const diagnostics = { hits: 0, invalidations: 0, misses: 0 };
	let nextObjectId = 1;

	function materialSignature(mesh) {
		return cachedSignatures(mesh).full;
	}


	__exports.materialSignature = materialSignature;
	function staticBatchMaterialSignature(mesh) {
		return cachedSignatures(mesh).batch;
	}


	__exports.staticBatchMaterialSignature = staticBatchMaterialSignature;
	function materialSignatureCacheDiagnostics() {
		return { ...diagnostics };
	}


	__exports.materialSignatureCacheDiagnostics = materialSignatureCacheDiagnostics;
	function objectIdentity(object) {
		if (!object || typeof object !== 'object') return 0;
		if (!objectIds.has(object)) {
			objectIds.set(object, nextObjectId);
			nextObjectId += 1;
		}
		return objectIds.get(object);
	}


	__exports.objectIdentity = objectIdentity;
	function cachedSignatures(mesh) {
		const textures = textureState(mesh.material || {});
		const cached = cache.get(mesh);
		if (cached && sameMaterialSignatureState(cached.observed, mesh, textures)) {
			diagnostics.hits += 1;
			return cached;
		}
		if (cached) diagnostics.invalidations += 1;
		else diagnostics.misses += 1;
		const observed = captureMaterialSignatureState(mesh, textures);
		const signatures = Object.freeze({
			batch: buildSignature(observed, false),
			full: buildSignature(observed, true),
			observed
		});
		cache.set(mesh, signatures);
		return signatures;
	}

	function buildSignature(state, includeColor) {
		const values = [];
		if (includeColor) values.push(state.color0, state.color1, state.color2);
		values.push(
			state.opacity,
			state.alphaMode,
			state.alphaCutoff,
			surfaceSidedness(state),
			state.emissiveStrength,
			state.materialMode
		);
		appendTextureSignature(values, state.textureState, objectIdentity);
		values.push(
			state.anisotropy,
			state.grassReactive ? 1 : 0,
			state.grassRadius,
			state.grassWind,
			state.geometryMode
		);
		return values.join('|');
	}

	function surfaceSidedness(state) {
		if (state.doubleSided) return 'double-sided';
		if (state.cullingDisabled) return 'culling-disabled';
		return 'backface-culling';
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-render-order.js ----
{
	const __exports = __awtsmoosModule_120;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-render-order.js
	 * @description Orders opaque meshes by exact shader state and shared geometry identity.
	 * The Awtsmoos renews every visible form without confusion; Awtsmoos.com gathers equal
	 * GPU vessels beside one another so redundant declarations may rest without changing pixels.
	 */

	const materialSignature = __awtsmoosModule_121.materialSignature;
	const objectIdentity = __awtsmoosModule_121.objectIdentity;

	function orderOpaqueMeshes(meshes) {
		const stateKeys = new WeakMap();
		for (const mesh of meshes) {
			stateKeys.set(mesh, materialSignature(mesh));
		}
		meshes.sort((left, right) => {
			return programRank(left) - programRank(right)
				|| cullRank(left) - cullRank(right)
				|| compareText(stateKeys.get(left), stateKeys.get(right))
				|| objectIdentity(left.geometry) - objectIdentity(right.geometry)
				|| objectIdentity(left.material) - objectIdentity(right.material);
		});
		return {
			meshes,
			stats: summarizeOrder(meshes, stateKeys)
		};
	}


	__exports.orderOpaqueMeshes = orderOpaqueMeshes;
	function summarizeOrder(meshes, stateKeys) {
		let geometryGroups = 0;
		let stateGroups = 0;
		let previousGeometry = null;
		let previousState = null;
		for (const mesh of meshes) {
			const state = stateKeys.get(mesh);
			const geometry = mesh.geometry || null;
			if (state !== previousState) {
				stateGroups += 1;
				previousState = state;
				previousGeometry = null;
			}
			if (geometry !== previousGeometry) {
				geometryGroups += 1;
				previousGeometry = geometry;
			}
		}
		return {
			geometryGroups,
			meshCount: meshes.length,
			stateGroups
		};
	}

	function programRank(mesh) {
		return mesh.isSkinnedMesh && mesh.skeleton ? 1 : 0;
	}

	function cullRank(mesh) {
		return mesh.material?.backfaceCull ? 0 : 1;
	}

	function compareText(left, right) {
		if (left === right) return 0;
		return left < right ? -1 : 1;
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-render-draw-list.js ----
{
	const __exports = __awtsmoosModule_112;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-render-draw-list.js
	 * @description Orders opaque state work and blended surfaces with camera-correct distance.
	 * The Awtsmoos renews every revealed surface in one indivisible act; Awtsmoos.com
	 * gathers solid vessels by state and translucent vessels from farthest to nearest.
	 */

	const worldBoundingSphere = __awtsmoosModule_113.worldBoundingSphere;
	const collectSceneMeshes = __awtsmoosModule_114.collectSceneMeshes;
	const cameraCullContext = __awtsmoosModule_118.cameraCullContext;
	const meshCullingReason = __awtsmoosModule_118.meshCullingReason;
	const orderOpaqueMeshes = __awtsmoosModule_120.orderOpaqueMeshes;
	const isAlphaBlend = __awtsmoosModule_116.isAlphaBlend;
	const isAlphaMask = __awtsmoosModule_116.isAlphaMask;
	const isLitMode = __awtsmoosModule_116.isLitMode;
	const isTransparent = __awtsmoosModule_116.isTransparent;
	const pointSizeForMode = __awtsmoosModule_116.pointSizeForMode;
	const shouldCullBackfaces = __awtsmoosModule_116.shouldCullBackfaces;
	const triangleCountForMode = __awtsmoosModule_116.triangleCountForMode;

	function collectMeshes(root, camera = null, options = {}) {
		const collected = collectSceneMeshes(root, options);
		const batched = options.staticBatcher
			? options.staticBatcher.resolve(collected.batchCandidates)
			: unbatched(collected.batchCandidates);
		const opaque = [];
		const transparent = [];
		const culled = {
			distance: 0,
			frustum: 0,
			invisibleSubtrees: collected.invisibleSubtrees
		};
		const cullingContext = cameraCullContext(camera);
		appendVisibleMeshes(collected.opaque, opaque, camera, options, culled, cullingContext);
		appendVisibleMeshes(batched.originals, opaque, camera, options, culled, cullingContext);
		appendVisibleMeshes(batched.meshes, opaque, camera, options, culled, cullingContext);
		appendVisibleMeshes(collected.transparent, transparent, camera, options, culled, cullingContext);
		const ordered = orderOpaqueMeshes(opaque);
		sortTransparentMeshes(transparent, camera);
		return {
			culled,
			hidden: collected.hidden,
			opaque: ordered.meshes,
			renderOrder: ordered.stats,
			staticBatch: batched.stats,
			transparent
		};
	}


	__exports.collectMeshes = collectMeshes;
	function sortTransparentMeshes(meshes, camera) {
		const eye = camera?.position;
		if (!eye || meshes.length < 2) return meshes;
		meshes.sort((left, right) => (
			distanceSquared(right, eye) - distanceSquared(left, eye)
		));
		return meshes;
	}


	__exports.sortTransparentMeshes = sortTransparentMeshes;
	function unbatched(candidates) {
		return {
			meshes: [],
			originals: candidates.map((entry) => entry.mesh),
			stats: null
		};
	}

	function appendVisibleMeshes(meshes, output, camera, options, culled, cullingContext) {
		for (const mesh of meshes) {
			const reason = meshCullingReason(mesh, camera, options, cullingContext);
			if (reason) {
				culled[reason] += 1;
				continue;
			}
			output.push(mesh);
		}
	}

	function distanceSquared(mesh, eye) {
		const sphere = worldBoundingSphere(mesh);
		const matrix = mesh?.matrixWorld;
		const center = sphere?.center;
		const x = center?.[0] ?? matrix?.[12] ?? mesh?.position?.x ?? 0;
		const y = center?.[1] ?? matrix?.[13] ?? mesh?.position?.y ?? 0;
		const z = center?.[2] ?? matrix?.[14] ?? mesh?.position?.z ?? 0;
		const dx = x - eye.x;
		const dy = y - eye.y;
		const dz = z - eye.z;
		return dx * dx + dy * dy + dz * dz;
	}

	__exports.isAlphaBlend = isAlphaBlend;
	__exports.isAlphaMask = isAlphaMask;
	__exports.isLitMode = isLitMode;
	__exports.isTransparent = isTransparent;
	__exports.pointSizeForMode = pointSizeForMode;
	__exports.shouldCullBackfaces = shouldCullBackfaces;
	__exports.triangleCountForMode = triangleCountForMode;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-render-gl-state-stats.js ----
{
	const __exports = __awtsmoosModule_133;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-render-gl-state-stats.js
	 * @description Summarizes exact WebGL state-cache evidence for each visible frame.
	 * The Awtsmoos renews every command and every resting command; Awtsmoos.com counts
	 * both so performance is revealed by measured continuity rather than hopeful silence.
	 */

	function createInitialRendererStats() {
		return {
			draws: 0,
			triangles: 0,
			skinnedMeshes: 0,
			jointsUploaded: 0,
			skinPaletteRecomputes: 0,
			skinPaletteReuses: 0,
			glStateCache: disabledSummary()
		};
	}


	__exports.createInitialRendererStats = createInitialRendererStats;
	function recordGlStateCacheStats(renderer) {
		renderer.stats.glStateCache = summarizeGlStateCache(renderer.glStateCache);
	}


	__exports.recordGlStateCacheStats = recordGlStateCacheStats;
	function summarizeGlStateCache(cache) {
		if (!cache?.stats?.methods) {
			return disabledSummary();
		}
		const methods = {};
		let calls = 0;
		let skips = 0;
		for (const [methodName, source] of Object.entries(cache.stats.methods)) {
			const methodCalls = Number(source.calls) || 0;
			const methodSkips = Number(source.skips) || 0;
			methods[methodName] = {
				calls: methodCalls,
				skips: methodSkips
			};
			calls += methodCalls;
			skips += methodSkips;
		}
		return {
			enabled: true,
			calls,
			skips,
			skipRatio: calls > 0 ? skips / calls : 0,
			invalidations: Number(cache.stats.invalidations) || 0,
			vertexArrayInvalidations: Number(
				cache.stats.vertexArrayInvalidations
			) || 0,
			methods
		};
	}


	__exports.summarizeGlStateCache = summarizeGlStateCache;
	function disabledSummary() {
		return {
			enabled: false,
			calls: 0,
			skips: 0,
			skipRatio: 0,
			invalidations: 0,
			vertexArrayInvalidations: 0,
			methods: {}
		};
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-render-skin.js ----
{
	const __exports = __awtsmoosModule_135;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-render-skin.js
	 * @description Uploads one exact joint palette after vertex state is already resident.
	 * The Awtsmoos moves every limb from one living whole; Awtsmoos.com keeps the palette
	 * contract explicit while immutable joint and weight attributes rest inside their VAO.
	 */

	function bindSkin(renderer, locations, mesh) {
		const skeleton = mesh.skeleton;
		const uploadedJoints = skeleton.updateCached(
			mesh.matrixWorld || renderer.identityMatrix,
			renderer.frameToken
		);
		recordPaletteWork(renderer, skeleton);
		renderer.stats.skinnedMeshes += 1;
		renderer.stats.jointsUploaded += uploadedJoints;
		renderer.stats.skinGpuUploads += 1;
		uploadJoints(renderer, skeleton, locations);
	}


	__exports.bindSkin = bindSkin;
	function recordPaletteWork(renderer, skeleton) {
		const metric = skeleton.lastPaletteRecomputed
			? 'skinPaletteRecomputes'
			: 'skinPaletteReuses';
		renderer.stats[metric] += 1;
	}

	function uploadJoints(renderer, skeleton, locations) {
		if (renderer.jointMode === 'texture') {
			uploadJointTexture(renderer, skeleton, locations);
			return;
		}
		uploadJointUniforms(renderer, skeleton, locations);
	}

	function uploadJointTexture(renderer, skeleton, locations) {
		const gl = renderer.gl;
		const count = Math.max(1, skeleton.jointCount);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, renderer.skinTexture);
		gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			4,
			count,
			0,
			gl.RGBA,
			gl.FLOAT,
			skeleton.jointMatrices
		);
		gl.uniform1i(locations.jointTexture, 0);
		gl.uniform1f(locations.jointTextureHeight, count);
		renderer.stats.skinTextureUploads += 1;
	}

	function uploadJointUniforms(renderer, skeleton, locations) {
		const gl = renderer.gl;
		const count = Math.min(
			skeleton.jointCount,
			renderer.maxUniformJoints
		);
		if (skeleton.jointCount > renderer.maxUniformJoints) {
			renderer.errors.push(
				`Joint uniform overflow: ${skeleton.jointCount} > ${renderer.maxUniformJoints}`
			);
		}
		gl.uniformMatrix4fv(
			locations.jointMatrices,
			false,
			skeleton.jointMatrices.subarray(0, count * 16)
		);
		renderer.stats.skinUniformUploads += 1;
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-water-physical-uniforms.js ----
{
	const __exports = __awtsmoosModule_137;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-water-physical-uniforms.js
	 * @description Normalizes and uploads one renderer-neutral physical water recipe.
	 * The Awtsmoos is One before color, current, foam, depth, and reflected light divide;
	 * Awtsmoos.com packs those finite truths into nine uniforms inside the existing program.
	 */

	const FALLBACKS = Object.freeze({
		cascade: fallback('#2c8092', '#9acfd3', 0.34, 0.08, 0.82, 0.16, 0.58, 0.66, 0.42, 1.31, 0.16, 0.041,
			[[0.051, 0.013], [-0.026, 0.041], [0.034, -0.012], [-0.017, -0.031]]),
		lake: fallback('#06384a', '#2d8796', 0.78, 0.18, 0.26, 0.075, 0.88, 0.82, 0.72, 1.72, 0.085, 0.018,
			[[0.018, 0.011], [-0.012, 0.021], [0.009, -0.014], [-0.006, -0.009]]),
		stream: fallback('#075065', '#4bafbd', 0.52, 0.12, 0.58, 0.11, 0.72, 0.74, 0.58, 1.48, 0.11, 0.026,
			[[0.032, 0.009], [-0.018, 0.027], [0.021, -0.008], [-0.011, -0.019]])
	});

	function waterPhysicalProfile(material = {}, waterMode = 0) {
		const fallbackProfile = fallbackForMode(waterMode);
		const source = material.texturePolicy?.waterPhysical || fallbackProfile;
		const flow = Array.from({ length: 4 }, (_, index) => vector(
			source.flow?.[index],
			fallbackProfile.flow[index]
		));
		return {
			deepColor: color(source.depth?.deepColor, fallbackProfile.depth.deepColor),
			flow,
			foamProfile: [
				number(source.foam?.edge, fallbackProfile.foam.edge),
				number(source.foam?.noiseScale, fallbackProfile.foam.noiseScale),
				number(source.foam?.threshold, fallbackProfile.foam.threshold),
				0
			],
			reflectionProfile: [
				number(source.reflection?.fresnel, fallbackProfile.reflection.fresnel),
				number(source.reflection?.skyStrength, fallbackProfile.reflection.skyStrength),
				number(source.reflection?.goldenSunGlint, fallbackProfile.reflection.goldenSunGlint)
			],
			shallowColor: color(source.depth?.shallowColor, fallbackProfile.depth.shallowColor),
			waveProfile: [
				number(source.ripples?.macro, fallbackProfile.ripples.macro),
				number(source.ripples?.micro, fallbackProfile.ripples.micro),
				number(source.depth?.strength, fallbackProfile.depth.strength),
				number(source.refraction, fallbackProfile.refraction)
			]
		};
	}


	__exports.waterPhysicalProfile = waterPhysicalProfile;
	function uploadWaterPhysicalUniforms(gl, locations, material, waterMode) {
		const profile = waterPhysicalProfile(material, waterMode);
		for (let index = 0; index < 4; index += 1) {
			const location = locations[`waterFlow${String.fromCharCode(65 + index)}`];
			if (location) gl.uniform2fv(location, profile.flow[index]);
		}
		if (locations.waterDeepColor) gl.uniform3fv(locations.waterDeepColor, profile.deepColor);
		if (locations.waterShallowColor) gl.uniform3fv(locations.waterShallowColor, profile.shallowColor);
		if (locations.waterWaveProfile) gl.uniform4fv(locations.waterWaveProfile, profile.waveProfile);
		if (locations.waterFoamProfile) gl.uniform4fv(locations.waterFoamProfile, profile.foamProfile);
		if (locations.waterReflectionProfile) {
			gl.uniform3fv(locations.waterReflectionProfile, profile.reflectionProfile);
		}
	}


	__exports.uploadWaterPhysicalUniforms = uploadWaterPhysicalUniforms;
	function fallbackForMode(waterMode) {
		if (waterMode === 2) return FALLBACKS.stream;
		if (waterMode >= 3) return FALLBACKS.cascade;
		return FALLBACKS.lake;
	}

	function fallback(deepColor, shallowColor, strength, refraction, edge, noiseScale, threshold,
		fresnel, skyStrength, glint, macro, micro, flow) {
		return { depth: { deepColor, shallowColor, strength }, flow,
			foam: { edge, noiseScale, threshold }, reflection: { fresnel, skyStrength, goldenSunGlint: glint },
			refraction, ripples: { macro, micro } };
	}

	function color(value, fallbackValue) {
		if (Array.isArray(value)) return value.slice(0, 3).map(component => number(component, 0));
		const hex = String(value || fallbackValue).replace('#', '');
		return [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16) / 255);
	}

	function vector(value, fallbackValue) {
		return [number(value?.[0], fallbackValue[0]), number(value?.[1], fallbackValue[1])];
	}

	function number(value, fallbackValue) {
		const numeric = Number(value);
		return Number.isFinite(numeric) ? numeric : fallbackValue;
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-water-material-mode.js ----
{
	const __exports = __awtsmoosModule_138;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-water-material-mode.js
	 * @description Classifies one shared water program into lake, river, fall, foam, and mist vessels.
	 * The Awtsmoos remains one current through still basin, rushing channel, descending sheet,
	 * bright impact, and rising veil; Awtsmoos.com gives each vessel one small numeric doorway.
	 */

	const WATER_MODE = Object.freeze({
		NONE: 0,
		LAKE: 1,
		RIVER: 2,
		WATERFALL: 3,
		FOAM: 4,
		MIST: 5
	});


	__exports.WATER_MODE = WATER_MODE;
	const VARIANT_CODES = Object.freeze({
		foam: WATER_MODE.FOAM,
		lake: WATER_MODE.LAKE,
		mist: WATER_MODE.MIST,
		river: WATER_MODE.RIVER,
		stream: WATER_MODE.RIVER,
		waterfall: WATER_MODE.WATERFALL
	});

	/**
	 * Returns the compact GPU water mode for one mesh.
	 *
	 * @param {object} mesh Renderable mesh vessel.
	 * @returns {number} A WATER_MODE value.
	 */
	function waterModeCode(mesh) {
		const variant = String(mesh?.material?.texturePolicy?.waterVariant || '').toLowerCase();
		if (VARIANT_CODES[variant] !== undefined) return VARIANT_CODES[variant];
		const identity = materialIdentity(mesh);
		if (/mist|spray/.test(identity)) return WATER_MODE.MIST;
		if (/foam|whitewater|rapid/.test(identity)) return WATER_MODE.FOAM;
		if (/waterfall|cascade|fall-sheet/.test(identity)) return WATER_MODE.WATERFALL;
		if (/river|stream/.test(identity)) return WATER_MODE.RIVER;
		if (/lake|water/.test(identity)) return WATER_MODE.LAKE;
		return WATER_MODE.NONE;
	}


	__exports.waterModeCode = waterModeCode;
	function materialIdentity(mesh) {
		const values = [mesh?.name, mesh?.material?.name];
		let parent = mesh;
		while (parent) {
			values.push(parent.userData?.family, parent.userData?.part);
			parent = parent.parent;
		}
		return values.filter(Boolean).join(' ').toLowerCase();
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-render-uniforms.js ----
{
	const __exports = __awtsmoosModule_136;
	//B"H
	//Boruch Hashem
	//Blessed is He

	/**
	 * @file tiny-render-uniforms.js
	 * @description Uploads frame, object, material, rooted vegetation, and physical water truths.
	 * The Awtsmoos renews one sun, one clock, many forms, flowing waters, and living blades exactly;
	 * Awtsmoos.com sends each finite truth only where the existing bounded GPU program can reveal it.
	 */

	const alphaModeCode = __awtsmoosModule_107.alphaModeCode;
	const materialColor = __awtsmoosModule_107.materialColor;
	const materialModeCode = __awtsmoosModule_107.materialModeCode;
	const uploadWaterPhysicalUniforms = __awtsmoosModule_137.uploadWaterPhysicalUniforms;
	const waterModeCode = __awtsmoosModule_138.waterModeCode;
	const isLitMode = __awtsmoosModule_112.isLitMode;
	const pointSizeForMode = __awtsmoosModule_112.pointSizeForMode;

	function uploadFrameUniforms(renderer, locations) {
		const gl = renderer.gl;
		const environment = renderer.environment;
		const camera = renderer.frameCameraPosition;
		if (locations.ambient) gl.uniform3fv(locations.ambient, environment.ambient);
		if (locations.sunDirection) gl.uniform3fv(locations.sunDirection, environment.sunDirection);
		if (locations.sunColor) gl.uniform3fv(locations.sunColor, environment.sunColor);
		if (locations.cameraPosition) {
			gl.uniform3f(locations.cameraPosition, camera.x, camera.y, camera.z);
		}
		if (locations.fogColor) gl.uniform3fv(locations.fogColor, environment.fogColor);
		if (locations.fogNear) gl.uniform1f(locations.fogNear, environment.fogNear);
		if (locations.fogFar) gl.uniform1f(locations.fogFar, environment.fogFar);
		if (locations.exposure) gl.uniform1f(locations.exposure, environment.exposure);
		if (locations.interactor) {
			gl.uniform3f(locations.interactor, renderer.interactor.x, renderer.interactor.y, renderer.interactor.z);
		}
		if (locations.time) gl.uniform1f(locations.time, renderer.timeSeconds);
	}


	__exports.uploadFrameUniforms = uploadFrameUniforms;
	function uploadObjectUniforms(renderer, locations, model, mvp) {
		renderer.gl.uniformMatrix4fv(locations.mvp, false, mvp);
		renderer.gl.uniformMatrix4fv(locations.model, false, model);
	}


	__exports.uploadObjectUniforms = uploadObjectUniforms;
	function uploadMaterialUniforms(renderer, locations, mesh, buffers) {
		const gl = renderer.gl;
		const material = mesh.material || {};
		const materialMode = materialModeCode(mesh);
		const waterMode = waterModeCode(mesh);
		const grass = mesh.userData?.AwtsmoosYardGrass || {};
		const reactive = grass.reactsToPlayer === true;
		const windMode = materialMode === 2;
		gl.uniform4fv(locations.colorUniform, materialColor(material));
		gl.uniform1f(locations.alphaCutoff, material.alphaCutoff ?? 0.5);
		gl.uniform1i(locations.alphaMode, alphaModeCode(material));
		gl.uniform1i(locations.lit, isLitMode(buffers.mode) ? 1 : 0);
		gl.uniform1f(locations.pointSize, pointSizeForMode(buffers.mode));
		if (locations.materialMode) gl.uniform1i(locations.materialMode, materialMode);
		if (locations.waterMode) gl.uniform1i(locations.waterMode, waterMode);
		if (materialMode === 1) {
			uploadWaterPhysicalUniforms(gl, locations, material, waterMode);
		}
		if (locations.emissiveStrength) {
			gl.uniform1f(locations.emissiveStrength, material.emissiveStrength ?? 1.8);
		}
		uploadVegetationUniforms(gl, locations, grass, reactive, windMode);
	}


	__exports.uploadMaterialUniforms = uploadMaterialUniforms;
	function uploadVegetationUniforms(gl, locations, grass, reactive, windMode) {
		const defaultStrength = windMode ? 0.055 : 0;
		if (locations.grassReactive) gl.uniform1i(locations.grassReactive, reactive ? 1 : 0);
		if (locations.windMode) gl.uniform1i(locations.windMode, windMode ? 1 : 0);
		if (locations.grassRadius) gl.uniform1f(locations.grassRadius, grass.interactionRadius ?? 2.2);
		if (locations.grassWindStrength) {
			gl.uniform1f(locations.grassWindStrength, grass.windStrength ?? defaultStrength);
		}
		if (locations.grassWindDirection) {
			gl.uniform2f(
				locations.grassWindDirection,
				grass.windDirectionX ?? 0.72,
				grass.windDirectionZ ?? 0.69
			);
		}
		if (locations.grassGust) gl.uniform1f(locations.grassGust, grass.windGust ?? 0.5);
		if (locations.grassFlutter) gl.uniform1f(locations.grassFlutter, grass.windFlutter ?? 0);
		if (locations.grassWetness) gl.uniform1f(locations.grassWetness, grass.wetness ?? 0);
		if (locations.grassReaction) gl.uniform1f(locations.grassReaction, reactive ? grass.playerReaction ?? 0 : 0);
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-render-mesh.js ----
{
	const __exports = __awtsmoosModule_134;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-render-mesh.js
	 * @description Draws one mesh with reusable MVP storage and exact per-program state.
	 * The Awtsmoos recreates each object without repeating an unchanged decree; Awtsmoos.com
	 * keeps every transform, texture, cutout, water ripple, and Chossid alive without draw garbage.
	 */

	const shouldCullBackfaces = __awtsmoosModule_112.shouldCullBackfaces;
	const triangleCountForMode = __awtsmoosModule_112.triangleCountForMode;
	const bindSkin = __awtsmoosModule_135.bindSkin;
	const uploadFrameUniforms = __awtsmoosModule_136.uploadFrameUniforms;
	const uploadMaterialUniforms = __awtsmoosModule_136.uploadMaterialUniforms;
	const uploadObjectUniforms = __awtsmoosModule_136.uploadObjectUniforms;
	const drawMode = __awtsmoosModule_107.drawMode;

	function drawRenderMesh(renderer, mesh, projectionView, transparent) {
		const resource = renderer.buffers.forMesh(mesh);
		if (!resource) return;
		const skinned = Boolean(
			mesh.isSkinnedMesh
			&& mesh.skeleton
			&& resource.attributes.joints
			&& resource.attributes.weights
		);
		const kind = skinned ? 'skin' : 'rigid';
		const locations = renderer.loc[kind];
		const model = mesh.matrixWorld || renderer.identityMatrix;
		applyCull(renderer, mesh, transparent);
		activateProgram(renderer, kind, locations);
		renderer.buffers.bindMesh(resource, locations, skinned);
		bindSkinBranch(renderer, locations, mesh, skinned);
		renderer._objectMvpMatrix ||= new Float32Array(16);
		multiplyInto(renderer._objectMvpMatrix, projectionView, model);
		uploadObjectUniforms(
			renderer,
			locations,
			model,
			renderer._objectMvpMatrix
		);
		if (renderer.materialState.needsUpload(mesh, resource)) {
			uploadMaterialUniforms(renderer, locations, mesh, resource);
		}
		renderer.textures.bind(locations, mesh.material, renderer.stats);
		issueDraw(renderer, resource);
		recordDraw(renderer, mesh, resource, skinned, transparent);
	}


	__exports.drawRenderMesh = drawRenderMesh;
	function activateProgram(renderer, kind, locations) {
		const program = renderer.programs[kind];
		if (renderer.activeProgram !== program) {
			renderer.gl.useProgram(program);
			renderer.activeProgram = program;
			renderer.materialState.previous = null;
			renderer.textures.invalidate();
			renderer.stats.programSwitches += 1;
		}
		renderer._frameUniformTokens ||= new Map();
		if (renderer._frameUniformTokens.get(program) === renderer.frameToken) return;
		uploadFrameUniforms(renderer, locations);
		renderer._frameUniformTokens.set(program, renderer.frameToken);
		renderer.frameUniformToken = renderer.frameToken;
		renderer.stats.frameUniformUploads += 1;
	}

	function bindSkinBranch(renderer, locations, mesh, skinned) {
		if (renderer.activeSkinBranch !== skinned) {
			if (locations.useSkin) {
				renderer.gl.uniform1i(locations.useSkin, skinned ? 1 : 0);
			}
			renderer.activeSkinBranch = skinned;
		}
		if (skinned) bindSkin(renderer, locations, mesh);
	}

	function applyCull(renderer, mesh, transparent) {
		if (shouldCullBackfaces(mesh, transparent)) {
			renderer.gl.enable(renderer.gl.CULL_FACE);
			renderer.gl.cullFace(renderer.gl.BACK);
			renderer.stats.culledBackfaceMeshes += 1;
			return;
		}
		renderer.gl.disable(renderer.gl.CULL_FACE);
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
	}

	function issueDraw(renderer, resource) {
		const gl = renderer.gl;
		const mode = drawMode(gl, resource.mode);
		if (resource.index) {
			gl.drawElements(mode, resource.count, resource.indexType, 0);
			return;
		}
		gl.drawArrays(mode, 0, resource.count);
	}

	function recordDraw(renderer, mesh, resource, skinned, transparent) {
		renderer.stats.draws += 1;
		renderer.stats.triangles += triangleCountForMode(
			resource.mode,
			resource.count
		);
		if (!skinned) renderer.stats.rigidMeshes += 1;
		if (transparent) renderer.stats.transparentMeshes += 1;
		if (mesh.userData?.AwtsmoosYardGrass?.reactsToPlayer) {
			renderer.stats.reactiveGrassMeshes += 1;
		}
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-skin-cache.js ----
{
	const __exports = __awtsmoosModule_141;
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
	const __exports = __awtsmoosModule_142;
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
	const __exports = __awtsmoosModule_143;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-skin-matrix.js
	 * @description Decodes inverse-bind matrices from imported accessors with explicit
	 * identity fallback. The Awtsmoos renews every matrix entry, while Awtsmoos.com
	 * keeps absence visible instead of disguising missing data as remembered geometry.
	 */
	const identity = __awtsmoosModule_16.identity;

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
	const __exports = __awtsmoosModule_145;
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
	const __exports = __awtsmoosModule_144;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-skin-scene.js
	 * @description Updates visible world matrices in a reusable frame-local node map.
	 * The Awtsmoos renews every hidden bone and visible garment; Awtsmoos.com recomputes
	 * only changed transforms and keeps the map and metric vessels stable across frames.
	 */

	const bindSceneSkeletons = __awtsmoosModule_145.bindSceneSkeletons;
	const ROOT_WORLD_MATRIX = __awtsmoosModule_21.ROOT_WORLD_MATRIX;
	const updateCachedWorldMatrix = __awtsmoosModule_21.updateCachedWorldMatrix;

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
	const __exports = __awtsmoosModule_140;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-skin-system.js
	 * @description Owns imported skin palettes and measured frame-local reuse. Every
	 * matrix is a finite keli renewed by the Awtsmoos, and Awtsmoos.com reuses it only
	 * when frame identity and mesh transform agree exactly.
	 */
	const identity = __awtsmoosModule_16.identity;
	const inverse = __awtsmoosModule_16.inverse;
	const multiply = __awtsmoosModule_16.multiply;
	const SkinPaletteCache = __awtsmoosModule_141.SkinPaletteCache;
	const skeletonLinePositions = __awtsmoosModule_142.skeletonLinePositions;
	const readSkinMatrix = __awtsmoosModule_143.readSkinMatrix;
	const bindSceneSkeletons = __awtsmoosModule_144.bindSceneSkeletons;
	const collectWorldMatrices = __awtsmoosModule_144.collectWorldMatrices;
	const setMeshKindVisibility = __awtsmoosModule_144.setMeshKindVisibility;
	const updateTinySkeletons = __awtsmoosModule_144.updateTinySkeletons;

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

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-render-skeleton.js ----
{
	const __exports = __awtsmoosModule_139;
	// B"H
	const skeletonLinePositions = __awtsmoosModule_140.skeletonLinePositions;

	/** Draws optional skeleton guides without contaminating normal mesh paths. */
	function drawSkeleton(renderer, scene, projectionView) {
		const gl = renderer.gl;
		const points = skeletonLinePositions(scene);
		if (!points.length) return false;
		if (!renderer.skeletonBuffer) renderer.skeletonBuffer = gl.createBuffer();
		const locations = renderer.loc.rigid;
		gl.useProgram(renderer.programs.rigid);
		gl.bindBuffer(gl.ARRAY_BUFFER, renderer.skeletonBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, points, gl.DYNAMIC_DRAW);
		gl.enableVertexAttribArray(locations.position);
		gl.vertexAttribPointer(locations.position, 3, gl.FLOAT, false, 0, 0);
		renderer.buffers.bindAttribute(locations.normal, null, null, [0, 1, 0, 0]);
		renderer.buffers.bindAttribute(locations.color, null, null, [1, 1, 1, 1]);
		renderer.buffers.bindAttribute(locations.uv, null, null, [0, 0, 0, 1]);
		gl.uniformMatrix4fv(locations.mvp, false, projectionView);
		gl.uniformMatrix4fv(locations.model, false, renderer.identityMatrix);
		gl.uniform4fv(locations.colorUniform, new Float32Array([0.2, 1, 0.9, 1]));
		gl.uniform1f(locations.alphaCutoff, 0.5);
		gl.uniform1i(locations.alphaMode, 0);
		gl.uniform1i(locations.lit, 0);
		gl.uniform1f(locations.pointSize, 1);
		renderer.textures.bind(locations, null, renderer.stats);
		gl.drawArrays(gl.LINES, 0, points.length / 3);
		renderer.stats.skeletonSegments = points.length / 6;
		return true;
	}

	__exports.drawSkeleton = drawSkeleton;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-render-frame.js ----
{
	const __exports = __awtsmoosModule_111;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-render-frame.js
	 * @description Renders one depth-correct frame through reusable camera matrix vessels.
	 * The Awtsmoos recreates the whole view in one instant; Awtsmoos.com keeps projection,
	 * view, world-map, and camera-position storage steady while every visible value renews.
	 */

	const collectMeshes = __awtsmoosModule_112.collectMeshes;
	const recordGlStateCacheStats = __awtsmoosModule_133.recordGlStateCacheStats;
	const drawRenderMesh = __awtsmoosModule_134.drawRenderMesh;
	const drawSkeleton = __awtsmoosModule_139.drawSkeleton;
	const collectWorldMatrices = __awtsmoosModule_140.collectWorldMatrices;

	function renderFrame(renderer, scene, camera) {
		const gl = renderer.gl;
		renderer.frameToken += 1;
		updateFrameCameraPosition(renderer, camera);
		renderer.worldByNode = collectWorldMatrices(scene, renderer.worldByNode);
		const renderList = collectMeshes(scene, camera, renderer.options);
		renderer.stats = createFrameStats(renderer, renderList);
		renderer.buffers.beginFrame(renderer.stats);
		renderer.materialState.beginFrame(renderer.stats);
		gl.enable(gl.DEPTH_TEST);
		gl.clearColor(...renderer.clearColor);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		const projectionView = projectionViewMatrix(renderer, camera);
		drawOpaquePass(renderer, renderList.opaque, projectionView);
		drawTransparentPass(renderer, renderList.transparent, projectionView);
		drawSkeletonPass(renderer, scene, projectionView);
		recordGlStateCacheStats(renderer);
	}


	__exports.renderFrame = renderFrame;
	function updateFrameCameraPosition(renderer, camera) {
		renderer.frameCameraPosition ||= { x: 0, y: 0, z: 0 };
		renderer.frameCameraPosition.x = camera.position.x;
		renderer.frameCameraPosition.y = camera.position.y;
		renderer.frameCameraPosition.z = camera.position.z;
	}

	function projectionViewMatrix(renderer, camera) {
		const cache = frameMatrixCache(renderer);
		const aspect = camera.aspect || 1;
		if (
			cache.fov !== camera.fov
			|| cache.aspect !== aspect
			|| cache.near !== camera.near
			|| cache.far !== camera.far
		) {
			writePerspective(
				cache.projection,
				camera.fov,
				aspect,
				camera.near,
				camera.far
			);
			cache.fov = camera.fov;
			cache.aspect = aspect;
			cache.near = camera.near;
			cache.far = camera.far;
		}
		writeLookAt(cache.view, camera);
		multiplyInto(cache.projectionView, cache.projection, cache.view);
		return cache.projectionView;
	}

	function frameMatrixCache(renderer) {
		if (!renderer._frameMatrixCache) {
			renderer._frameMatrixCache = {
				aspect: Number.NaN,
				far: Number.NaN,
				fov: Number.NaN,
				near: Number.NaN,
				projection: new Float32Array(16),
				projectionView: new Float32Array(16),
				view: new Float32Array(16)
			};
		}
		return renderer._frameMatrixCache;
	}

	function writePerspective(target, fovDegrees, aspect, near, far) {
		target.fill(0);
		const factor = 1 / Math.tan(fovDegrees * Math.PI / 360);
		const depth = 1 / (near - far);
		target[0] = factor / aspect;
		target[5] = factor;
		target[10] = (far + near) * depth;
		target[11] = -1;
		target[14] = 2 * far * near * depth;
	}

	function writeLookAt(target, camera) {
		const eyeX = camera.position.x;
		const eyeY = camera.position.y;
		const eyeZ = camera.position.z;
		const cameraTarget = camera.target;
		const targetX = cameraTarget?.[0] ?? 0;
		const targetY = cameraTarget?.[1] ?? 0;
		const targetZ = cameraTarget?.[2] ?? 4;
		const rawForwardX = eyeX - targetX;
		const rawForwardY = eyeY - targetY;
		const rawForwardZ = eyeZ - targetZ;
		const inverseForward = 1 / (
			Math.hypot(rawForwardX, rawForwardY, rawForwardZ) || 1
		);
		const forwardX = rawForwardX * inverseForward;
		const forwardY = rawForwardY * inverseForward;
		const forwardZ = rawForwardZ * inverseForward;
		const rawRightX = forwardZ;
		const rawRightZ = -forwardX;
		const inverseRight = 1 / (Math.hypot(rawRightX, 0, rawRightZ) || 1);
		const rightX = rawRightX * inverseRight;
		const rightY = 0;
		const rightZ = rawRightZ * inverseRight;
		const upwardX = forwardY * rightZ - forwardZ * rightY;
		const upwardY = forwardZ * rightX - forwardX * rightZ;
		const upwardZ = forwardX * rightY - forwardY * rightX;
		target[0] = rightX;
		target[1] = upwardX;
		target[2] = forwardX;
		target[3] = 0;
		target[4] = rightY;
		target[5] = upwardY;
		target[6] = forwardY;
		target[7] = 0;
		target[8] = rightZ;
		target[9] = upwardZ;
		target[10] = forwardZ;
		target[11] = 0;
		target[12] = -(rightX * eyeX + rightY * eyeY + rightZ * eyeZ);
		target[13] = -(upwardX * eyeX + upwardY * eyeY + upwardZ * eyeZ);
		target[14] = -(forwardX * eyeX + forwardY * eyeY + forwardZ * eyeZ);
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
	}

	function drawOpaquePass(renderer, meshes, projectionView) {
		const gl = renderer.gl;
		gl.disable(gl.BLEND);
		gl.depthMask(true);
		for (const mesh of meshes) {
			drawRenderMesh(renderer, mesh, projectionView, false);
			renderer.stats.opaqueMeshes += 1;
		}
	}

	function drawTransparentPass(renderer, meshes, projectionView) {
		if (!meshes.length) return;
		const gl = renderer.gl;
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.depthMask(false);
		for (const mesh of meshes) {
			drawRenderMesh(renderer, mesh, projectionView, true);
		}
		gl.depthMask(true);
		gl.disable(gl.BLEND);
	}

	function drawSkeletonPass(renderer, scene, projectionView) {
		if (!renderer.options.showSkeleton) return;
		renderer.gl.disable(renderer.gl.CULL_FACE);
		if (!drawSkeleton(renderer, scene, projectionView)) return;
		renderer.activeProgram = renderer.programs.rigid;
		renderer.materialState.previous = null;
	}

	function createFrameStats(renderer, renderList) {
		return {
			culledBackfaceMeshes: 0,
			culledMeshes: renderList.culled,
			draws: 0,
			errors: renderer.errors,
			floatTexture: renderer.floatTexture,
			frameUniformUploads: 0,
			grassInteractor: renderer.interactor,
			hiddenHelpers: renderList.hidden,
			jointMode: renderer.jointMode,
			jointsUploaded: 0,
			matrixNodes: renderer.worldByNode.stats || {},
			maxUniformJoints: renderer.maxUniformJoints,
			maxVertexTextures: renderer.maxVertexTextures,
			maxVertexUniformVectors: renderer.maxVertexUniformVectors,
			opaqueMeshes: 0,
			perMeshSkinUpdate: true,
			programSwitches: 0,
			reactiveGrassMeshes: 0,
			renderOrder: renderList.renderOrder,
			rigidMeshes: 0,
			sharedSkinPaletteCache: true,
			staticBatch: renderList.staticBatch || null,
			skinGpuUploadReuses: 0,
			skinGpuUploads: 0,
			skinPaletteRecomputes: 0,
			skinPaletteReuses: 0,
			skinTextureUploads: 0,
			skinUniformUploads: 0,
			skinnedMeshes: 0,
			transparentMeshes: 0,
			triangles: 0
		};
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-render-material-state.js ----
{
	const __exports = __awtsmoosModule_146;
	//B"H
	//Boruch Hashem
	//Blessed is He

	/**
	 * @file tiny-render-material-state.js
	 * @description Detects exact shader and surface-state continuity between adjacent draws, including living vegetation state.
	 * The Awtsmoos renews every color, current, gust, and side without confusion; Awtsmoos.com compares
	 * all visible per-draw truths so grass receives fresh motion while stable walls avoid redundant GPU uploads.
	 */

	const alphaModeCode = __awtsmoosModule_107.alphaModeCode;
	const materialModeCode = __awtsmoosModule_107.materialModeCode;
	const shouldCullBackfaces = __awtsmoosModule_116.shouldCullBackfaces;
	const waterModeCode = __awtsmoosModule_138.waterModeCode;
	const isLitMode = __awtsmoosModule_112.isLitMode;
	const pointSizeForMode = __awtsmoosModule_112.pointSizeForMode;

	class RenderMaterialState {
		constructor() {
			this.previous = null;
			this.skips = 0;
			this.uploads = 0;
		}

		beginFrame(stats) {
			stats.materialStateSkips = 0;
			stats.materialStateUploads = 0;
			this.frameStats = stats;
		}

		needsUpload(mesh, buffers) {
			const next = snapshot(mesh, buffers);
			if (sameSnapshot(this.previous, next)) {
				this.skips += 1;
				this.frameStats.materialStateSkips += 1;
				return false;
			}
			this.previous = next;
			this.uploads += 1;
			this.frameStats.materialStateUploads += 1;
			return true;
		}
	}


	__exports.RenderMaterialState = RenderMaterialState;
	function renderMaterialSnapshot(mesh, buffers = {}) {
		return snapshot(mesh, buffers);
	}


	__exports.renderMaterialSnapshot = renderMaterialSnapshot;
	function snapshot(mesh, buffers) {
		const material = mesh.material || {};
		const color = material.color || [0.75, 0.70, 0.62, 1];
		const grass = mesh.userData?.AwtsmoosYardGrass || {};
		const mode = materialModeCode(mesh);
		return {
			alphaCutoff: material.alphaCutoff ?? 0.5,
			alphaMode: alphaModeCode(material),
			color0: color[0] ?? 0.75,
			color1: color[1] ?? 0.70,
			color2: color[2] ?? 0.62,
			color3: material.opacity ?? color[3] ?? 1,
			cullBackfaces: shouldCullBackfaces(mesh) ? 1 : 0,
			emissive: material.emissiveStrength ?? 1.8,
			grassDirectionX: grass.windDirectionX ?? 0.72,
			grassDirectionZ: grass.windDirectionZ ?? 0.69,
			grassFlutter: grass.windFlutter ?? 0,
			grassGust: grass.windGust ?? 0.5,
			grassReaction: grass.playerReaction ?? 0,
			grassReactive: grass.reactsToPlayer ? 1 : 0,
			grassRadius: grass.interactionRadius ?? 2.2,
			grassWetness: grass.wetness ?? 0,
			grassWind: grass.windStrength ?? (mode === 2 ? 0.055 : 0),
			lit: isLitMode(buffers.mode) ? 1 : 0,
			mode,
			pointSize: pointSizeForMode(buffers.mode),
			waterMode: waterModeCode(mesh),
			windMode: mode === 2 ? 1 : 0
		};
	}

	function sameSnapshot(left, right) {
		if (!left) return false;
		for (const key of Object.keys(right)) {
			if (left[key] !== right[key]) return false;
		}
		return true;
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-render-locations.js ----
{
	const __exports = __awtsmoosModule_148;
	//B"H
	//Boruch Hashem
	//Blessed is He

	/**
	 * @file tiny-render-locations.js
	 * @description Names vertex and uniform doorways for terrain, actors, water, and living rooted ecology.
	 * The Awtsmoos gives every GPU declaration its place; Awtsmoos.com binds layered earth, living grass,
	 * water currents, atmosphere, wind, and measured terrain quality inside one lawful uniform space.
	 */

	const TERRAIN_LAYER_TARGET = __awtsmoosModule_128.TERRAIN_LAYER_TARGET;

	function rendererLocations(gl, program, layerCount = TERRAIN_LAYER_TARGET) {
		const attribute = name => gl.getAttribLocation(program, name);
		const uniform = name => gl.getUniformLocation(program, name);
		return {
			position: attribute('aPosition'), normal: attribute('aNormal'),
			color: attribute('aColor'), uv: attribute('aUv'), zone: attribute('aZone'),
			joints: attribute('aJoints'), weights: attribute('aWeights'),
			mvp: uniform('uMvp'), model: uniform('uModel'), colorUniform: uniform('uColor'),
			alphaCutoff: uniform('uAlphaCutoff'), alphaMode: uniform('uAlphaMode'),
			lit: uniform('uLit'), pointSize: uniform('uPointSize'),
			map: uniform('uMap'), useMap: uniform('uUseMap'), mapRepeat: uniform('uMapRepeat'),
			mixMap: uniform('uMixMap'), useMixMap: uniform('uUseMixMap'),
			mixRepeat: uniform('uMixRepeat'), mixStrength: uniform('uMixStrength'),
			mixPatchScale: uniform('uMixPatchScale'), mixPatchSharpness: uniform('uMixPatchSharpness'),
			terrainMixingA: uniform('uTerrainMixingA'),
			terrainMixingB: uniform('uTerrainMixingB'),
			terrainMixingC: uniform('uTerrainMixingC'),
			terrainLayers: terrainLayerLocations(uniform, layerCount),
			materialMode: uniform('uMaterialMode'), waterMode: uniform('uWaterMode'),
			waterFlowA: uniform('uWaterFlowA'), waterFlowB: uniform('uWaterFlowB'),
			waterFlowC: uniform('uWaterFlowC'), waterFlowD: uniform('uWaterFlowD'),
			waterDeepColor: uniform('uWaterDeepColor'),
			waterShallowColor: uniform('uWaterShallowColor'),
			waterWaveProfile: uniform('uWaterWaveProfile'),
			waterFoamProfile: uniform('uWaterFoamProfile'),
			waterReflectionProfile: uniform('uWaterReflectionProfile'),
			emissiveStrength: uniform('uEmissiveStrength'), ambient: uniform('uAmbient'),
			sunDirection: uniform('uSunDirection'), sunColor: uniform('uSunColor'),
			cameraPosition: uniform('uCameraPosition'), fogColor: uniform('uFogColor'),
			fogNear: uniform('uFogNear'), fogFar: uniform('uFogFar'), exposure: uniform('uExposure'),
			grassReactive: uniform('uGrassReactive'), windMode: uniform('uWindMode'),
			interactor: uniform('uInteractor'), grassRadius: uniform('uGrassRadius'),
			grassWindStrength: uniform('uGrassWindStrength'),
			grassWindDirection: uniform('uGrassWindDirection'),
			grassGust: uniform('uGrassGust'), grassFlutter: uniform('uGrassFlutter'),
			grassWetness: uniform('uGrassWetness'), grassReaction: uniform('uGrassReaction'),
			time: uniform('uTime'),
			jointMatrices: uniform('uJointMatrices[0]'), jointTexture: uniform('uJointTexture'),
			jointTextureHeight: uniform('uJointTextureHeight')
		};
	}


	__exports.rendererLocations = rendererLocations;
	function terrainLayerLocations(uniform, layerCount) {
		return Array.from({ length: Math.max(0, Math.floor(layerCount)) }, (_, index) => ({
			angle: uniform(`uTerrainLayerAngle${index}`),
			height: uniform(`uTerrainLayerHeight${index}`),
			map: uniform(`uTerrainLayer${index}`),
			repeat: uniform(`uTerrainLayerRepeat${index}`),
			slope: uniform(`uTerrainLayerSlope${index}`),
			strength: uniform(`uTerrainLayerStrength${index}`),
			use: uniform(`uUseTerrainLayer${index}`),
			wetness: uniform(`uTerrainLayerWetness${index}`),
			zones: uniform(`uTerrainLayerZones${index}`)
		}));
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-fragment-water-lighting-functions.js ----
{
	const __exports = __awtsmoosModule_152;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-fragment-water-lighting-functions.js
	 * @description Gives stream, waterfall, foam, mist, and lake physically distinct ripple, bank-depth, foam, and reflection response.
	 * The Awtsmoos carries one water from shallow bank through dark thalweg and white cascade; Awtsmoos.com
	 * reads the river's actual cross-section UV so depth is no longer a random color field detached from the channel below.
	 */

	const fragmentWaterLightingFunctions = `
	vec3 waterRippleNormal(vec3 normal){
		float flowSpeed=max(0.45,(length(uWaterFlowA)+length(uWaterFlowB))*28.0);
		float scale=max(0.12,uWaterWaveProfile.x*6.0+uWaterWaveProfile.y*10.0);
		float first=sin((vWorld.x+vWorld.z*0.54)*scale+uTime*flowSpeed);
		float second=cos((vWorld.z-vWorld.x*0.38)*scale*1.73-uTime*flowSpeed*0.81);
		if(uWaterMode==3){
			first=sin(vUv.x*34.0+vUv.y*9.0-uTime*flowSpeed*2.1);
			second=cos(vUv.x*17.0-vUv.y*15.0+uTime*flowSpeed*1.45);
		}
		float strength=clamp(uWaterWaveProfile.x*0.72+uWaterWaveProfile.y*1.8,0.03,0.18);
		return normalize(normal+vec3(first*strength,0.34,second*strength));
	}
	float waterFoamMask(){
		float noiseScale=max(0.012,uWaterFoamProfile.y);
		float current=valueNoise(vWorld.xz*noiseScale+uWaterFlowD*uTime*4.0);
		float threshold=clamp(uWaterFoamProfile.z,0.02,0.96);
		float band=max(0.025,uWaterFoamProfile.x*0.18);
		float procedural=smoothstep(threshold,min(0.999,threshold+band),current);
		if(uWaterMode==2){
			float bank=smoothstep(0.56,0.98,abs(vUv.y*2.0-1.0));
			float streak=smoothstep(0.62,0.94,valueNoise(vec2(vUv.x*0.9-uTime*0.7,vUv.y*8.0)));
			return clamp(bank*uWaterFoamProfile.x+procedural*0.24+streak*bank*0.18,0.0,1.0);
		}
		if(uWaterMode==3){
			float crest=1.0-smoothstep(0.02,0.20,vUv.y);
			float impact=smoothstep(0.70,1.0,vUv.y);
			float streak=smoothstep(0.62,0.98,sin(vUv.x*29.0-vUv.y*11.0+uTime*7.2)*0.5+0.5);
			return clamp(crest*0.36+impact*uWaterFoamProfile.x+streak*0.18,0.0,1.0);
		}
		if(uWaterMode==4)return clamp(0.46+current*0.34,0.0,1.0);
		if(uWaterMode==5)return smoothstep(0.40,0.90,current)*(1.0-vUv.y*0.48);
		return procedural*uWaterFoamProfile.x;
	}
	float waterShallowMix(){
		float noise=valueNoise(vWorld.xz*0.021+vec2(4.1,8.7));
		if(uWaterMode==2){
			float bank=clamp(abs(vUv.y*2.0-1.0),0.0,1.0);
			float shelf=smoothstep(0.34,0.92,bank);
			return clamp(shelf*(0.72+uWaterWaveProfile.z*0.24)+noise*0.12,0.0,1.0);
		}
		return clamp(noise*uWaterWaveProfile.z,0.0,1.0);
	}
	vec3 waterSurface(vec3 albedo,vec3 normal){
		float foam=waterFoamMask();
		if(uWaterMode==5){
			vec3 mist=mix(uWaterDeepColor,uWaterShallowColor,foam);
			return mix(albedo*0.34,mist,0.68);
		}
		vec3 ripple=waterRippleNormal(normal);
		vec3 viewDirection=normalize(uCameraPosition-vWorld);
		float facing=max(dot(viewDirection,ripple),0.0);
		float fresnelExponent=mix(4.2,1.8,clamp(uWaterReflectionProfile.x,0.0,1.0));
		float fresnel=pow(1.0-facing,fresnelExponent)*uWaterReflectionProfile.x;
		vec3 reflectedDirection=reflect(-normalize(uSunDirection),ripple);
		float sparkleBase=max(dot(reflectedDirection,viewDirection),0.0);
		float sparkle2=sparkleBase*sparkleBase;
		float sparkle4=sparkle2*sparkle2;
		float sparkle8=sparkle4*sparkle4;
		float sparkle=sparkle8*sparkle8*sparkle8;
		vec3 deep=mix(uWaterDeepColor,uWaterShallowColor,waterShallowMix());
		vec3 refractedAlbedo=albedo*mix(uWaterShallowColor,vec3(1.0),0.34);
		float sourceShare=clamp(uWaterWaveProfile.w+0.18,0.18,0.72);
		vec3 sourceTint=mix(deep,refractedAlbedo,sourceShare);
		vec3 sky=mix(vec3(0.28,0.48,0.66),uFogColor,0.34);
		float skyStrength=clamp(uWaterReflectionProfile.y,0.0,1.0);
		vec3 glint=uSunColor*sparkle*uWaterReflectionProfile.z*0.72;
		vec3 foamTint=vec3(0.84,0.93,0.88)*foam*(uWaterMode==4?0.60:0.28);
		return mix(sourceTint,sky,0.18+fresnel*skyStrength*0.52)+glint+foamTint;
	}
	`;

	__exports.fragmentWaterLightingFunctions = fragmentWaterLightingFunctions;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-fragment-lighting-functions.js ----
{
	const __exports = __awtsmoosModule_151;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-fragment-lighting-functions.js
	 * @description Joins alpine directional light, contact-like sky/earth fill, water response, and bounded tone mapping.
	 * The Awtsmoos moves through meadow, stone, current, and sky without division; Awtsmoos.com keeps the generic
	 * light compact while water's deeper laws live in their own focused module instead of crowding one hundred-line vessel.
	 */

	const fragmentWaterLightingFunctions = __awtsmoosModule_152.fragmentWaterLightingFunctions;

	const fragmentLightingFunctions = `
	vec3 litSurface(vec3 albedo,vec3 normal){
		vec3 sun=uSunDirection;
		vec3 viewDirection=normalize(uCameraPosition-vWorld);
		vec3 halfDirection=normalize(sun+viewDirection);
		float direct=max(dot(normal,sun),0.0);
		float wrapped=max((dot(normal,sun)+0.28)/1.28,0.0);
		float skyFacing=normal.y*0.5+0.5;
		float horizonFacing=1.0-abs(normal.y);
		float highlightBase=max(dot(normal,halfDirection),0.0);
		float highlight2=highlightBase*highlightBase;
		float highlight4=highlight2*highlight2;
		float highlight8=highlight4*highlight4;
		float highlight=highlight8*highlight8*highlight8*direct;
		vec3 coolSky=vec3(0.27,0.42,0.62)*skyFacing;
		vec3 earthBounce=vec3(0.30,0.19,0.09)*(1.0-skyFacing);
		vec3 horizonFill=vec3(0.20,0.14,0.09)*horizonFacing;
		vec3 sunlight=uSunColor*(direct*0.96+wrapped*0.18);
		vec3 specular=uSunColor*highlight*(0.04+max(max(albedo.r,albedo.g),albedo.b)*0.05);
		return albedo*(uAmbient+coolSky*0.40+earthBounce*0.22+horizonFill*0.15+sunlight)+specular;
	}
	${fragmentWaterLightingFunctions}
	vec3 toneMap(vec3 color){
		vec3 exposed=max(color,vec3(0.0))*uExposure;
		vec3 mapped=(exposed*(2.51*exposed+0.03))/(exposed*(2.43*exposed+0.59)+0.14);
		return sqrt(clamp(mapped,0.0,1.0));
	}
	`;

	__exports.fragmentLightingFunctions = fragmentLightingFunctions;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-fragment-main-function.js ----
{
	const __exports = __awtsmoosModule_153;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-fragment-main-function.js
	 * @description Selects sky, water, layered terrain, emissive, foliage, or ordinary surface law with source-aware color handling.
	 * The Awtsmoos is one before encoded pigment and physical light divide; Awtsmoos.com keeps water chroma alive,
	 * lets ecological terrain retain readable midtones, and still sends every ordinary earthly surface through measured linear light.
	 */

	const fragmentMainFunction = `
	void main(){
		if(uMaterialMode==4){
			vec3 direction=normalize(vWorld-uCameraPosition);
			gl_FragColor=vec4(toneMap(skySurface(direction)),1.0);
			return;
		}
		vec3 normal=normalize(vNormal);
		vec4 texel=uMaterialMode==5?layeredTerrainTexel(normal):baseTexel();
		if(uMaterialMode!=5&&uUseMixMap==1&&uMixStrength>0.001&&uMaterialMode!=1){
			vec4 other=texture2D(uMixMap,mirrorRepeat(vUv*uMixRepeat));
			texel=mix(texel,other,uMixStrength*patchMask(vWorld.xz));
		}
		vec4 mixedColor=uColor*vColor*texel;
		if(uAlphaMode==1&&mixedColor.a<uAlphaCutoff)discard;
		if(mixedColor.a<=0.003)discard;
		vec3 encoded=max(mixedColor.rgb,vec3(0.0));
		vec3 textureLinear=encoded*encoded;
		vec3 terrainLinear=mix(textureLinear,encoded,0.20);
		vec3 rgb=textureLinear;
		if(uMaterialMode==1){
			rgb=waterSurface(encoded,normal);
		}else if(uMaterialMode==3){
			rgb=litSurface(textureLinear,normal)+textureLinear*uEmissiveStrength;
		}else if(uLit==1){
			rgb=litSurface(uMaterialMode==5?terrainLinear:textureLinear,normal);
			if(uMaterialMode==2){
				float back=max(dot(-normal,normalize(uSunDirection)),0.0);
				rgb+=textureLinear*uSunColor*back*0.22;
			}
		}
		vec3 cameraDelta=uCameraPosition-vWorld;
		float distanceSquared=dot(cameraDelta,cameraDelta);
		float fog=smoothstep(uFogNear*uFogNear,uFogFar*uFogFar,distanceSquared);
		rgb=mix(rgb,uFogColor*uFogColor,fog*0.76);
		gl_FragColor=vec4(toneMap(rgb),mixedColor.a);
	}
	`;

	__exports.fragmentMainFunction = fragmentMainFunction;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-fragment-sampling-functions.js ----
{
	const __exports = __awtsmoosModule_154;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-fragment-sampling-functions.js
	 * @description Supplies mirrored tiling, noise, patches, and recipe-driven four-flow water.
	 * The Awtsmoos renews every texel without multiplying debt; Awtsmoos.com lets five water
	 * vessels move through four authored currents while preserving the two-fetch ceiling.
	 */

	const fragmentSamplingFunctions = `
	vec2 mirrorRepeat(vec2 value){
		vec2 fraction=fract(value);
		vec2 odd=mod(floor(value),2.0);
		return mix(fraction,1.0-fraction,odd);
	}
	float hash21(vec2 point){
		point=fract(point*vec2(123.34,456.21));
		point+=dot(point,point+45.32);
		return fract(point.x*point.y);
	}
	float valueNoise(vec2 point){
		vec2 cell=floor(point);
		vec2 local=fract(point);
		local=local*local*(3.0-2.0*local);
		float low=mix(hash21(cell),hash21(cell+vec2(1.0,0.0)),local.x);
		float high=mix(hash21(cell+vec2(0.0,1.0)),hash21(cell+vec2(1.0,1.0)),local.x);
		return mix(low,high,local.y);
	}
	float patchMask(vec2 worldPosition){
		if(uMixPatchScale<=0.00001)return 1.0;
		float broad=valueNoise(worldPosition*uMixPatchScale);
		float detail=valueNoise(worldPosition*uMixPatchScale*2.17+vec2(7.3,3.1));
		return smoothstep(uMixPatchSharpness,1.0,broad*0.78+detail*0.22);
	}
	vec2 waterWarp(vec2 flow,float phase){
		float ripple=sin(dot(vWorld.xz,vec2(0.031,0.027))*7.0+uTime*phase);
		return flow*ripple*(uWaterWaveProfile.x*0.75+uWaterWaveProfile.y*2.4);
	}
	vec2 primaryWaterFlow(){
		vec2 uv=vUv*uMapRepeat;
		if(uWaterMode==2)return uv+uWaterFlowA*uTime*8.0+waterWarp(uWaterFlowC,1.7);
		if(uWaterMode==3)return uv+vec2(uWaterFlowA.x*3.0,-abs(uWaterFlowA.y)*42.0)*uTime+waterWarp(uWaterFlowC,5.4);
		if(uWaterMode==4)return uv+uWaterFlowB*uTime*14.0+waterWarp(uWaterFlowD,4.1);
		if(uWaterMode==5)return uv+uWaterFlowD*uTime*6.0+waterWarp(uWaterFlowC,2.3);
		return uv+uWaterFlowA*uTime*2.0+waterWarp(uWaterFlowC,0.8);
	}
	vec2 detailWaterFlow(){
		vec2 uv=vUv*uMixRepeat;
		if(uWaterMode==2)return uv*1.37+uWaterFlowB*uTime*10.0+waterWarp(uWaterFlowD,2.4);
		if(uWaterMode==3)return uv*1.61+vec2(uWaterFlowB.x*5.0,-abs(uWaterFlowB.y)*46.0)*uTime+waterWarp(uWaterFlowD,6.1);
		if(uWaterMode==4)return uv*1.42+uWaterFlowC*uTime*15.0+waterWarp(uWaterFlowA,4.8);
		if(uWaterMode==5)return uv*1.28+uWaterFlowC*uTime*7.0+waterWarp(uWaterFlowB,2.9);
		return uv*1.53+uWaterFlowB*uTime*2.4+waterWarp(uWaterFlowD,1.1);
	}
	vec4 waterTexel(){
		vec4 primary=uUseMap==1?texture2D(uMap,mirrorRepeat(primaryWaterFlow())):vec4(1.0);
		if(uUseMixMap!=1)return primary;
		vec4 detail=texture2D(uMixMap,mirrorRepeat(detailWaterFlow()));
		float noiseScale=max(0.012,uWaterFoamProfile.y*0.5);
		float current=valueNoise(vWorld.xz*noiseScale+uWaterFlowC*uTime*3.0);
		float strength=clamp(uMixStrength*(0.48+current*(0.24+uWaterWaveProfile.y*2.0)),0.0,0.72);
		return mix(primary,detail,strength);
	}
	vec4 baseTexel(){
		if(uMaterialMode==1)return waterTexel();
		if(uUseMap!=1)return vec4(1.0);
		return texture2D(uMap,mirrorRepeat(vUv*uMapRepeat));
	}
	`;

	__exports.fragmentSamplingFunctions = fragmentSamplingFunctions;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-sky-fragment-functions.js ----
{
	const __exports = __awtsmoosModule_155;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-sky-fragment-functions.js
	 * @description Renders layered atmosphere using the same authored sun and fog uniforms that illuminate the playable world.
	 * This shader fragment owns sky chroma and cloud structure while tone mapping remains in the shared fragment main. The Awtsmoos,
	 * Atzmus beyond body and form, renews horizon, cloud, corona, and distant haze from one light; Awtsmoos.com lets authored uniforms
	 * pass through the finite shader vessel so mountain, water, and heaven rhyme without pretending any rendered pixel stands alone in time.
	 */

	const skyFragmentFunctions = `
	float skyCloudNoise(vec2 point){
		float broad=valueNoise(point);
		float medium=valueNoise(point*2.07+vec2(4.7,8.3));
		float fine=valueNoise(point*4.31+vec2(17.2,3.9));
		float lace=valueNoise(point*8.73+vec2(2.1,13.7));
		return broad*0.46+medium*0.29+fine*0.17+lace*0.08;
	}
	vec3 skySurface(vec3 direction){
		vec3 view=normalize(direction);
		vec3 authoredSun=normalize(uSunDirection);
		vec3 heroSun=normalize(vec3(-0.42,0.52,0.74));
		vec3 sun=normalize(mix(authoredSun,heroSun,0.28));
		float elevation=clamp(view.y*0.5+0.5,0.0,1.0);
		float upper=clamp(view.y,0.0,1.0);
		float horizon=pow(1.0-upper,3.2);
		vec3 zenith=vec3(0.008,0.038,0.21);
		vec3 highSky=vec3(0.018,0.20,0.60);
		vec3 middle=vec3(0.06,0.43,0.82);
		vec3 horizonColor=mix(uFogColor,uSunColor,0.48)*0.92;
		vec3 sky=mix(horizonColor,middle,smoothstep(0.0,0.28,elevation));
		sky=mix(sky,highSky,smoothstep(0.24,0.66,elevation));
		sky=mix(sky,zenith,smoothstep(0.64,1.0,elevation));
		float sunDot=max(dot(view,sun),0.0);
		float disc=smoothstep(0.9972,0.9995,sunDot);
		float core=smoothstep(0.99915,0.99988,sunDot);
		float innerHalo=pow(sunDot,48.0);
		float outerHalo=pow(sunDot,7.0);
		float corona=smoothstep(0.965,0.992,sunDot)*(1.0-smoothstep(0.998,0.9997,sunDot));
		vec3 sunlight=uSunColor;
		sky+=sunlight*(core*11.0+disc*4.8+innerHalo*2.3+outerHalo*0.64+corona*0.38);
		vec2 cloudUv=vec2(atan(view.z,view.x)*1.32,view.y*3.1);
		cloudUv+=vec2(uTime*0.0024,uTime*0.00042);
		float cloudBand=smoothstep(-0.10,0.08,view.y)*(1.0-smoothstep(0.62,0.90,view.y));
		float cloudField=skyCloudNoise(cloudUv*1.16);
		float cloud=smoothstep(0.47,0.67,cloudField)*cloudBand;
		float cloudEdge=smoothstep(0.40,0.56,cloudField)*cloudBand;
		float cloudShadow=smoothstep(0.54,0.72,cloudField)*cloudBand*(1.0-sunDot*0.35);
		vec3 cloudColor=mix(uFogColor*1.06,vec3(1.08,1.04,0.96),0.58+sunDot*0.38);
		sky=mix(sky,cloudColor,cloud*0.88);
		sky*=1.0-cloudShadow*0.12;
		sky+=sunlight*cloudEdge*pow(sunDot,11.0)*0.76;
		float cirrusNoise=skyCloudNoise(cloudUv*3.8+vec2(8.0,2.0));
		float cirrus=smoothstep(0.63,0.78,cirrusNoise)*smoothstep(0.34,0.56,view.y)*(1.0-smoothstep(0.80,0.96,view.y));
		sky=mix(sky,vec3(0.86,0.92,1.0),cirrus*0.30);
		sky+=uSunColor*horizon*0.28;
		float aerial=smoothstep(-0.10,0.12,view.y)*(1.0-smoothstep(0.15,0.43,view.y));
		sky=mix(sky,uFogColor*1.08,aerial*0.24);
		return max(sky,vec3(0.0));
	}
	`;

	__exports.skyFragmentFunctions = skyFragmentFunctions;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-terrain-fragment-declarations.js ----
{
	const __exports = __awtsmoosModule_157;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-terrain-fragment-declarations.js
	 * @description Generates fixed WebGL sampler declarations for the bounded terrain capacity.
	 * The Awtsmoos transcends number while each GPU has a measurable boundary; Awtsmoos.com
	 * declares only six diverse ecological garments and leaves redundant logical sources off-frame.
	 */

	const TERRAIN_LAYER_TARGET = __awtsmoosModule_128.TERRAIN_LAYER_TARGET;

	const terrainFragmentDeclarations = terrainDeclarationsForLayerCount(
		TERRAIN_LAYER_TARGET
	);


	__exports.terrainFragmentDeclarations = terrainFragmentDeclarations;
	function terrainDeclarationsForLayerCount(layerCount) {
		const count = normalizedCount(layerCount);
		const declarations = ['varying vec4 vZone;'];
		for (let index = 0; index < count; index += 1) {
			declarations.push(`uniform sampler2D uTerrainLayer${index};`);
			declarations.push(`uniform int uUseTerrainLayer${index};`);
			declarations.push(`uniform vec2 uTerrainLayerRepeat${index};`);
			declarations.push(`uniform float uTerrainLayerStrength${index};`);
			declarations.push(`uniform float uTerrainLayerAngle${index};`);
			declarations.push(`uniform vec4 uTerrainLayerZones${index};`);
			declarations.push(`uniform vec2 uTerrainLayerSlope${index};`);
			declarations.push(`uniform vec2 uTerrainLayerHeight${index};`);
			declarations.push(`uniform float uTerrainLayerWetness${index};`);
		}
		const lineBreak = String.fromCharCode(10);
		return [lineBreak, declarations.join(lineBreak), lineBreak].join('');
	}


	__exports.terrainDeclarationsForLayerCount = terrainDeclarationsForLayerCount;
	function normalizedCount(value) {
		const count = Math.floor(Number(value) || 0);
		return Math.max(0, Math.min(TERRAIN_LAYER_TARGET, count));
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-fragment-standard-declarations.js ----
{
	const __exports = __awtsmoosModule_156;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-fragment-standard-declarations.js
	 * @description Generates lighting inputs around terrain mixing, water, and atmosphere.
	 * The Awtsmoos gives every influence a named vessel; Awtsmoos.com joins six-layer earth,
	 * domain warp, four-flow water, and measured light without exceeding sampler boundaries.
	 */

	const terrainDeclarationsForLayerCount = __awtsmoosModule_157.terrainDeclarationsForLayerCount;
	const terrainFragmentDeclarations = __awtsmoosModule_157.terrainFragmentDeclarations;

	const standardFragmentDeclarations = standardDeclarations(
		terrainFragmentDeclarations
	);


	__exports.standardFragmentDeclarations = standardFragmentDeclarations;
	function standardDeclarationsForLayerCount(layerCount) {
		return standardDeclarations(terrainDeclarationsForLayerCount(layerCount));
	}


	__exports.standardDeclarationsForLayerCount = standardDeclarationsForLayerCount;
	function standardDeclarations(terrainDeclarations) {
		return `
	precision highp float;
	varying vec3 vNormal;
	varying vec4 vColor;
	varying vec2 vUv;
	varying vec3 vWorld;
	${terrainDeclarations}
	uniform vec4 uColor;
	uniform float uAlphaCutoff;
	uniform int uAlphaMode;
	uniform int uLit;
	uniform int uUseMap;
	uniform sampler2D uMap;
	uniform vec2 uMapRepeat;
	uniform int uUseMixMap;
	uniform sampler2D uMixMap;
	uniform vec2 uMixRepeat;
	uniform float uMixStrength;
	uniform float uMixPatchScale;
	uniform float uMixPatchSharpness;
	uniform vec4 uTerrainMixingA;
	uniform vec4 uTerrainMixingB;
	uniform vec4 uTerrainMixingC;
	uniform int uMaterialMode;
	uniform int uWaterMode;
	uniform vec2 uWaterFlowA;
	uniform vec2 uWaterFlowB;
	uniform vec2 uWaterFlowC;
	uniform vec2 uWaterFlowD;
	uniform vec3 uWaterDeepColor;
	uniform vec3 uWaterShallowColor;
	uniform vec4 uWaterWaveProfile;
	uniform vec4 uWaterFoamProfile;
	uniform vec3 uWaterReflectionProfile;
	uniform float uEmissiveStrength;
	uniform float uTime;
	uniform vec3 uAmbient;
	uniform vec3 uSunDirection;
	uniform vec3 uSunColor;
	uniform vec3 uCameraPosition;
	uniform vec3 uFogColor;
	uniform float uFogNear;
	uniform float uFogFar;
	uniform float uExposure;
	`;
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-terrain-fragment-ecology-functions.js ----
{
	const __exports = __awtsmoosModule_159;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-terrain-fragment-ecology-functions.js
	 * @description Computes three-octave ecological masks for slope, height, moisture, and irregular meadow communities.
	 * The Awtsmoos joins wetness, stone, height, and three scales of meadow variation in one living decree;
	 * Awtsmoos.com keeps all real textures visible while broad communities and small breakup defeat repeated painted patches.
	 */

	const terrainEcologyFunctions = `
	float terrainMacro(float seed) {
		float broad=valueNoise(
			vWorld.xz*uTerrainMixingA.x+vec2(seed,seed*1.731)
		);
		float medium=valueNoise(
			vWorld.xz*uTerrainMixingA.z+vec2(seed*2.17,seed*0.613)
		);
		float fine=valueNoise(
			vWorld.xz*uTerrainMixingA.z*3.73+vec2(seed*0.37,seed*3.11)
		);
		return broad*0.57+medium*0.30+fine*0.13;
	}

	float terrainBand(float value,vec2 rangeValue) {
		float width=max(0.025,(rangeValue.y-rangeValue.x)*0.18);
		float enters=smoothstep(rangeValue.x-width,rangeValue.x+width,value);
		float leaves=1.0-smoothstep(rangeValue.y-width,rangeValue.y+width,value);
		return clamp(enters*leaves,0.0,1.0);
	}

	float terrainLayerMask(
		vec4 zones,
		vec2 slopeRange,
		vec2 heightRange,
		float strength,
		float wetness,
		float seed,
		vec3 normal
	) {
		float slope=1.0-clamp(normal.y,0.0,1.0);
		float zoneWeight=clamp(dot(vZone,zones),0.0,1.0);
		float macro=terrainMacro(seed);
		float community=smoothstep(0.14,0.86,macro);
		float breakup=smoothstep(0.32,0.72,terrainMacro(seed+8.9));
		float slopeBand=terrainBand(slope,slopeRange);
		float heightBand=terrainBand(vWorld.y,heightRange);
		float slopeMask=mix(1.0,slopeBand,clamp(uTerrainMixingC.z,0.0,1.0));
		float heightMask=mix(1.0,heightBand,clamp(uTerrainMixingC.w,0.0,1.0));
		float wetContribution=clamp(vZone.z,0.0,1.0)*wetness*uTerrainMixingB.w;
		float patchStrength=0.18+community*0.62+breakup*0.20;
		return clamp(
			zoneWeight*slopeMask*heightMask*patchStrength*strength+wetContribution,
			0.0,
			1.0
		);
	}
	`;

	__exports.terrainEcologyFunctions = terrainEcologyFunctions;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-terrain-fragment-projection-functions.js ----
{
	const __exports = __awtsmoosModule_160;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-terrain-fragment-projection-functions.js
	 * @description Supplies readable GLSL projection, warp, and dual-scale sampling for real terrain images.
	 * The Awtsmoos renews every coordinate before a pixel finds its place;
	 * Awtsmoos.com lets real grass cross slope and distance without a tiled, repeated face.
	 */

	const terrainProjectionFunctions = `
	vec2 terrainPlane(vec3 normal) {
		vec3 weight = pow(
			abs(normal),
			vec3(max(1.0, uTerrainMixingB.z))
		);
		if (weight.x > weight.y && weight.x > weight.z) {
			return vWorld.zy;
		}
		if (weight.z > weight.y) {
			return vWorld.xy;
		}
		return vWorld.xz;
	}

	vec2 terrainWarp(float seed) {
		vec2 world = vWorld.xz * uTerrainMixingA.z;
		float x = valueNoise(world + vec2(seed, seed * 1.73));
		float y = valueNoise(world.yx + vec2(seed * 2.31, seed * 0.47));
		return (vec2(x, y) - 0.5) * uTerrainMixingA.w;
	}

	vec2 terrainUv(
		vec2 frequency,
		float angle,
		float scale,
		float seed,
		vec3 normal
	) {
		vec2 world = (terrainPlane(normal) + terrainWarp(seed)) * frequency * scale;
		float cosine = cos(angle);
		float sine = sin(angle);
		mat2 rotation = mat2(cosine, -sine, sine, cosine);
		return mirrorRepeat(rotation * world);
	}

	vec4 terrainSample(
		sampler2D source,
		vec2 frequency,
		float angle,
		float seed,
		vec3 normal
	) {
		float cameraDistance = distance(uCameraPosition, vWorld);
		vec2 nativeUv = terrainUv(frequency, angle, 1.0, seed, normal);
		vec2 detailUv = terrainUv(
			frequency,
			angle + 0.41,
			uTerrainMixingA.y,
			seed + 3.7,
			normal
		) + vec2(0.173, 0.419);
		vec4 nativeSample = texture2D(source, nativeUv);
		vec4 detailSample = texture2D(source, detailUv);
		float detailFade = 1.0 - smoothstep(
			uTerrainMixingB.x,
			uTerrainMixingB.y,
			cameraDistance
		);
		float detailStrength = detailFade * clamp(uTerrainMixingC.y, 0.0, 0.48);
		return mix(nativeSample, detailSample, detailStrength);
	}
	`;

	__exports.terrainProjectionFunctions = terrainProjectionFunctions;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-terrain-fragment-functions.js ----
{
	const __exports = __awtsmoosModule_158;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-terrain-fragment-functions.js
	 * @description Assembles normalized terrain blending with road affinity carried by ecological data, never slot position.
	 * The Awtsmoos gathers many grasses without one garment erasing another from sight;
	 * Awtsmoos.com lets soil recognize the road through its own zone weight while every quality tier remains free and right.
	 */

	const terrainEcologyFunctions = __awtsmoosModule_159.terrainEcologyFunctions;
	const TERRAIN_LAYER_TARGET = __awtsmoosModule_128.TERRAIN_LAYER_TARGET;
	const terrainProjectionFunctions = __awtsmoosModule_160.terrainProjectionFunctions;

	const terrainFragmentFunctions = terrainFunctionsForLayerCount(
		TERRAIN_LAYER_TARGET
	);


	__exports.terrainFragmentFunctions = terrainFragmentFunctions;
	function terrainFunctionsForLayerCount(layerCount) {
		const count = normalizedCount(layerCount);
		const layerMixes = Array.from(
			{ length: count },
			(_, index) => layerMix(index)
		).join(String.fromCharCode(10));
		return `${terrainProjectionFunctions}
	${terrainEcologyFunctions}
	${terrainCompositeFunction(layerMixes)}`;
	}


	__exports.terrainFunctionsForLayerCount = terrainFunctionsForLayerCount;
	function terrainCompositeFunction(layerMixes) {
		return `
	vec4 layeredTerrainTexel(vec3 surfaceNormal) {
		vec4 result = uUseMap == 1
			? terrainSample(uMap, uMapRepeat, 0.0, 1.1, surfaceNormal)
			: vec4(1.0);
		float road = clamp(vZone.y, 0.0, 1.0);
		float roadCore = smoothstep(0.42, 0.82, road);
		float roadEdge = smoothstep(0.08, 0.48, road) * (1.0 - roadCore);
		if (uUseMixMap == 1) {
			vec4 path = terrainSample(uMixMap, uMixRepeat, -0.08, 5.3, surfaceNormal);
			result = mix(result, path, roadCore * uMixStrength);
		}
		vec4 ecologySum = vec4(0.0);
		float ecologyWeight = 0.0;
	${layerMixes}
		if (ecologyWeight > 0.0001) {
			vec4 ecology = ecologySum / ecologyWeight;
			float coverage = clamp(
				1.0 - exp(-ecologyWeight * 0.86),
				0.0,
				0.90
			);
			result = mix(result, ecology, coverage);
		}
		float chroma = (terrainMacro(19.7) - 0.5) * uTerrainMixingC.x;
		float valueRelief = (terrainMacro(31.9) - 0.5) * 0.13;
		float slopeRelief = (1.0 - clamp(surfaceNormal.y, 0.0, 1.0)) * 0.07;
		result.rgb *= 1.0 + chroma + valueRelief - slopeRelief;
		return result;
	}
	`;
	}

	function layerMix(index) {
		const seed = ((index + 1) * 3.17).toFixed(2);
		return `
		if (uUseTerrainLayer${index} == 1) {
			vec4 layer = terrainSample(
				uTerrainLayer${index},
				uTerrainLayerRepeat${index},
				uTerrainLayerAngle${index},
				${seed},
				surfaceNormal
			);
			float weight = terrainLayerMask(
				uTerrainLayerZones${index},
				uTerrainLayerSlope${index},
				uTerrainLayerHeight${index},
				uTerrainLayerStrength${index},
				uTerrainLayerWetness${index},
				${seed},
				surfaceNormal
			);
			float roadAffinity = clamp(uTerrainLayerZones${index}.y, 0.0, 1.0);
			float meadowRoadSuppression = 1.0 - roadCore * 0.92;
			float roadSoilReveal = roadEdge * 1.65;
			weight *= mix(meadowRoadSuppression, roadSoilReveal, roadAffinity);
			float boundedWeight = clamp(weight, 0.0, 1.0);
			ecologySum += layer * boundedWeight;
			ecologyWeight += boundedWeight;
		}`;
	}

	function normalizedCount(value) {
		return Math.max(
			0,
			Math.min(TERRAIN_LAYER_TARGET, Math.floor(Number(value) || 0))
		);
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-fragment-shader.js ----
{
	const __exports = __awtsmoosModule_150;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-fragment-shader.js
	 * @description Assembles terrain, physical light, water, and camera-centered atmosphere.
	 * The Awtsmoos is indivisible while each visual law remains a named vessel;
	 * Awtsmoos.com composes bounded samplers with a procedural sky that needs no image.
	 */

	const fragmentLightingFunctions = __awtsmoosModule_151.fragmentLightingFunctions;
	const fragmentMainFunction = __awtsmoosModule_153.fragmentMainFunction;
	const fragmentSamplingFunctions = __awtsmoosModule_154.fragmentSamplingFunctions;
	const skyFragmentFunctions = __awtsmoosModule_155.skyFragmentFunctions;
	const standardDeclarationsForLayerCount = __awtsmoosModule_156.standardDeclarationsForLayerCount;
	const terrainFunctionsForLayerCount = __awtsmoosModule_158.terrainFunctionsForLayerCount;
	const TERRAIN_LAYER_TARGET = __awtsmoosModule_128.TERRAIN_LAYER_TARGET;

	const fragmentShader = fragmentShaderForLayerCount(TERRAIN_LAYER_TARGET);


	__exports.fragmentShader = fragmentShader;
	function fragmentShaderForLayerCount(layerCount) {
		return [
			standardDeclarationsForLayerCount(layerCount),
			fragmentSamplingFunctions,
			terrainFunctionsForLayerCount(layerCount),
			skyFragmentFunctions,
			fragmentLightingFunctions,
			fragmentMainFunction
		].join(String.fromCharCode(10));
	}

	__exports.fragmentShaderForLayerCount = fragmentShaderForLayerCount;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-rigid-shader.js ----
{
	const __exports = __awtsmoosModule_161;
	// B"H
	const rigidVertexShader = `
	attribute vec3 aPosition;
	attribute vec3 aNormal;
	attribute vec4 aColor;
	attribute vec2 aUv;
	uniform mat4 uMvp;
	uniform mat4 uModel;
	uniform float uPointSize;
	uniform int uGrassReactive;
	uniform int uWindMode;
	uniform vec3 uInteractor;
	uniform float uGrassRadius;
	uniform float uGrassWindStrength;
	uniform float uTime;
	varying vec3 vNormal;
	varying vec4 vColor;
	varying vec2 vUv;
	varying vec3 vWorld;
	void main(){
		vec3 localPosition=aPosition;
		vec4 baseWorld=uModel*vec4(aPosition,1.0);
		float heightFactor=clamp(aUv.y,0.0,1.0);
		if(uGrassReactive==1){
			vec2 difference=baseWorld.xz-uInteractor.xz;
			float distanceToPlayer=length(difference);
			vec2 away=distanceToPlayer>0.001?difference/distanceToPlayer:vec2(1.0,0.0);
			float influence=1.0-smoothstep(0.0,uGrassRadius,distanceToPlayer);
			localPosition.xz+=away*influence*heightFactor*0.72;
		}
		if(uGrassReactive==1||uWindMode==1){
			float phase=baseWorld.x*0.31+baseWorld.z*0.23+aPosition.y*0.17;
			float wind=sin(uTime*1.35+phase)+sin(uTime*0.71+phase*1.83)*0.36;
			float strength=uGrassReactive==1?uGrassWindStrength:0.055;
			localPosition.x+=wind*strength*(0.32+heightFactor*heightFactor);
			localPosition.z+=wind*strength*0.34*(0.25+heightFactor);
		}
		vec4 world=uModel*vec4(localPosition,1.0);
		vWorld=world.xyz;
		vNormal=mat3(uModel)*aNormal;
		vColor=aColor;
		vUv=aUv;
		gl_Position=uMvp*vec4(localPosition,1.0);
		gl_PointSize=uPointSize;
	}`;

	__exports.rigidVertexShader = rigidVertexShader;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-skin-shaders.js ----
{
	const __exports = __awtsmoosModule_162;
	// B"H
	const skinTextureVertexShader = `
	precision highp float;
	attribute vec3 aPosition;
	attribute vec3 aNormal;
	attribute vec4 aColor;
	attribute vec2 aUv;
	attribute vec4 aJoints;
	attribute vec4 aWeights;
	uniform mat4 uMvp;
	uniform mat4 uModel;
	uniform sampler2D uJointTexture;
	uniform float uJointTextureHeight;
	uniform float uPointSize;
	varying vec3 vNormal;
	varying vec4 vColor;
	varying vec2 vUv;
	varying vec3 vWorld;
	mat4 jointAt(float joint){
		float y=(joint+0.5)/uJointTextureHeight;
		return mat4(
			texture2D(uJointTexture,vec2(0.125,y)),
			texture2D(uJointTexture,vec2(0.375,y)),
			texture2D(uJointTexture,vec2(0.625,y)),
			texture2D(uJointTexture,vec2(0.875,y))
		);
	}
	void main(){
		vec4 weights=aWeights;
		float sum=weights.x+weights.y+weights.z+weights.w;
		if(sum>0.0)weights/=sum;
		mat4 skin=jointAt(aJoints.x)*weights.x
			+jointAt(aJoints.y)*weights.y
			+jointAt(aJoints.z)*weights.z
			+jointAt(aJoints.w)*weights.w;
		vec4 world=uModel*skin*vec4(aPosition,1.0);
		vWorld=world.xyz;
		vNormal=mat3(uModel*skin)*aNormal;
		vColor=aColor;
		vUv=aUv;
		gl_Position=uMvp*skin*vec4(aPosition,1.0);
		gl_PointSize=uPointSize;
	}`;


	__exports.skinTextureVertexShader = skinTextureVertexShader;
	function uniformSkinVertexShader(maxJoints){
		return `
	attribute vec3 aPosition;
	attribute vec3 aNormal;
	attribute vec4 aColor;
	attribute vec2 aUv;
	attribute vec4 aJoints;
	attribute vec4 aWeights;
	uniform mat4 uMvp;
	uniform mat4 uModel;
	uniform mat4 uJointMatrices[${maxJoints}];
	uniform float uPointSize;
	varying vec3 vNormal;
	varying vec4 vColor;
	varying vec2 vUv;
	varying vec3 vWorld;
	void main(){
		vec4 weights=aWeights;
		float sum=weights.x+weights.y+weights.z+weights.w;
		if(sum>0.0)weights/=sum;
		mat4 skin=uJointMatrices[int(aJoints.x)]*weights.x
			+uJointMatrices[int(aJoints.y)]*weights.y
			+uJointMatrices[int(aJoints.z)]*weights.z
			+uJointMatrices[int(aJoints.w)]*weights.w;
		vec4 world=uModel*skin*vec4(aPosition,1.0);
		vWorld=world.xyz;
		vNormal=mat3(uModel*skin)*aNormal;
		vColor=aColor;
		vUv=aUv;
		gl_Position=uMvp*skin*vec4(aPosition,1.0);
		gl_PointSize=uPointSize;
	}`;
	}

	__exports.uniformSkinVertexShader = uniformSkinVertexShader;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-vegetation-vertex-deformation.js ----
{
	const __exports = __awtsmoosModule_164;
	//B"H
	//Boruch Hashem
	//Blessed is He

	/**
	 * @file tiny-vegetation-vertex-deformation.js
	 * @description Supplies one rooted GPU deformation law for grass and other wind-reactive foliage.
	 * The Awtsmoos fixes every root while gust, moisture, flutter, and the passing traveler reveal living motion above;
	 * Awtsmoos.com keeps that motion in one shader vessel so thousands of blades move without per-blade JavaScript.
	 */

	const vegetationVertexDeclarations = `
	uniform int uGrassReactive;
	uniform int uWindMode;
	uniform vec3 uInteractor;
	uniform float uGrassRadius;
	uniform float uGrassWindStrength;
	uniform vec2 uGrassWindDirection;
	uniform float uGrassGust;
	uniform float uGrassFlutter;
	uniform float uGrassWetness;
	uniform float uGrassReaction;
	uniform float uTime;
	`;


	__exports.vegetationVertexDeclarations = vegetationVertexDeclarations;
	const vegetationVertexFunctions = `
	vec2 safeVegetationDirection(vec2 direction){
		float magnitude=length(direction);
		return magnitude>0.0001?direction/magnitude:vec2(0.72,0.69);
	}

	vec3 applyVegetationMotion(vec3 localPosition,vec4 baseWorld,float heightFactor){
		if(uGrassReactive!=1&&uWindMode!=1)return localPosition;
		float rootFactor=clamp(heightFactor,0.0,1.0);
		rootFactor=rootFactor*rootFactor;
		if(rootFactor<=0.0001)return localPosition;
		vec2 direction=safeVegetationDirection(uGrassWindDirection);
		vec2 crossDirection=vec2(-direction.y,direction.x);
		float gust=clamp(uGrassGust,0.0,1.0);
		float wetness=clamp(uGrassWetness,0.0,1.0);
		float phase=baseWorld.x*0.27+baseWorld.z*0.21+aPosition.y*0.13;
		float macroWave=sin(uTime*(0.72+gust*0.46)+phase);
		float secondaryWave=sin(uTime*1.81+phase*1.73);
		float wetCompliance=mix(1.03,0.68,wetness);
		float flutterCompliance=mix(1.0,0.42,wetness);
		float gustScale=0.58+gust*0.84;
		float ambient=(macroWave*0.78+secondaryWave*0.22)
			*uGrassWindStrength*gustScale*wetCompliance;
		localPosition.xz+=direction*ambient*rootFactor;
		float flutter=(uGrassFlutter*0.14+secondaryWave*0.07)
			*uGrassWindStrength*flutterCompliance;
		localPosition.xz+=crossDirection*flutter*rootFactor;
		if(uGrassReactive==1){
			vec2 difference=baseWorld.xz-uInteractor.xz;
			float distanceToPlayer=length(difference);
			vec2 radial=distanceToPlayer>0.001?difference/distanceToPlayer:direction;
			float proximity=1.0-smoothstep(0.0,uGrassRadius,distanceToPlayer);
			float reaction=proximity*clamp(uGrassReaction,0.0,1.0);
			vec2 wakeDirection=safeVegetationDirection(mix(radial,direction,0.46+gust*0.18));
			localPosition.xz+=wakeDirection*reaction*rootFactor*0.76;
		}
		localPosition.y-=rootFactor*wetness*0.018;
		return localPosition;
	}
	`;

	__exports.vegetationVertexFunctions = vegetationVertexFunctions;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-unified-shaders.js ----
{
	const __exports = __awtsmoosModule_163;
	//B"H
	//Boruch Hashem
	//Blessed is He

	/**
	 * @file tiny-unified-shaders.js
	 * @description Carries rigid, skinned, rooted vegetation, and ecological zone data through one measured GPU program.
	 * The Awtsmoos is not divided by stillness, motion, moisture, or terrain meaning; Awtsmoos.com keeps
	 * Chassidim, cottages, living grass, and many-layer earth inside one linked shader vessel without duplicate programs.
	 */

	const vegetationVertexDeclarations = __awtsmoosModule_164.vegetationVertexDeclarations;
	const vegetationVertexFunctions = __awtsmoosModule_164.vegetationVertexFunctions;

	const declarations = `
	attribute vec3 aPosition;
	attribute vec3 aNormal;
	attribute vec4 aColor;
	attribute vec2 aUv;
	attribute vec4 aZone;
	attribute vec4 aJoints;
	attribute vec4 aWeights;
	uniform mat4 uMvp;
	uniform mat4 uModel;
	uniform float uPointSize;
	uniform int uUseSkin;
	${vegetationVertexDeclarations}
	varying vec3 vNormal;
	varying vec4 vColor;
	varying vec2 vUv;
	varying vec3 vWorld;
	varying vec4 vZone;
	`;

	const mainFunction = `
	${vegetationVertexFunctions}
	void main(){
		mat4 skin=mat4(1.0);
		if(uUseSkin==1){
			vec4 weights=aWeights;
			float sum=weights.x+weights.y+weights.z+weights.w;
			if(sum>0.0)weights/=sum;
			skin=jointAt(aJoints.x)*weights.x
				+jointAt(aJoints.y)*weights.y
				+jointAt(aJoints.z)*weights.z
				+jointAt(aJoints.w)*weights.w;
		}
		vec3 localPosition=aPosition;
		vec4 baseWorld=uModel*vec4(aPosition,1.0);
		float heightFactor=clamp(aUv.y,0.0,1.0);
		if(uUseSkin==0){
			localPosition=applyVegetationMotion(localPosition,baseWorld,heightFactor);
		}
		vec4 local=skin*vec4(localPosition,1.0);
		vec4 world=uModel*local;
		vWorld=world.xyz;
		vNormal=mat3(uModel*skin)*aNormal;
		vColor=aColor;
		vUv=aUv;
		vZone=aZone;
		gl_Position=uMvp*local;
		gl_PointSize=uPointSize;
	}
	`;

	function unifiedUniformVertexShader(maxJoints) {
		return `${declarations}
	uniform mat4 uJointMatrices[${maxJoints}];
	mat4 jointAt(float joint){
		return uJointMatrices[int(joint)];
	}
	${mainFunction}`;
	}


	__exports.unifiedUniformVertexShader = unifiedUniformVertexShader;
	const unifiedTextureVertexShader = `${declarations}
	precision highp float;
	uniform sampler2D uJointTexture;
	uniform float uJointTextureHeight;
	mat4 jointAt(float joint){
		float y=(joint+0.5)/uJointTextureHeight;
		return mat4(
			texture2D(uJointTexture,vec2(0.125,y)),
			texture2D(uJointTexture,vec2(0.375,y)),
			texture2D(uJointTexture,vec2(0.625,y)),
			texture2D(uJointTexture,vec2(0.875,y))
		);
	}
	${mainFunction}`;

	__exports.unifiedTextureVertexShader = unifiedTextureVertexShader;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-render-shaders.js ----
{
	const __exports = __awtsmoosModule_149;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-render-shaders.js
	 * @description Exposes both default and measured-capacity shader garments.
	 * The Awtsmoos shines through still stone and animated Chassid alike; Awtsmoos.com
	 * preserves historic exports while allowing the renderer to compile its lawful layer count.
	 */

	__exports.fragmentShader = __awtsmoosModule_150.fragmentShader;
	__exports.fragmentShaderForLayerCount = __awtsmoosModule_150.fragmentShaderForLayerCount;
	__exports.rigidVertexShader = __awtsmoosModule_161.rigidVertexShader;
	__exports.skinTextureVertexShader = __awtsmoosModule_162.skinTextureVertexShader;
	__exports.uniformSkinVertexShader = __awtsmoosModule_162.uniformSkinVertexShader;
	__exports.unifiedTextureVertexShader = __awtsmoosModule_163.unifiedTextureVertexShader;
	__exports.unifiedUniformVertexShader = __awtsmoosModule_163.unifiedUniformVertexShader;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-render-programs.js ----
{
	const __exports = __awtsmoosModule_147;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-render-programs.js
	 * @description Compiles one unified program sized to the GPU's lawful material-stack capacity.
	 * The Awtsmoos does not become divided when stone rests and a Chossid walks; Awtsmoos.com
	 * measures sampler capacity before shader creation so richer earth never causes link failure.
	 */

	const rendererLocations = __awtsmoosModule_148.rendererLocations;
	const fragmentShaderForLayerCount = __awtsmoosModule_149.fragmentShaderForLayerCount;
	const unifiedTextureVertexShader = __awtsmoosModule_149.unifiedTextureVertexShader;
	const unifiedUniformVertexShader = __awtsmoosModule_149.unifiedUniformVertexShader;
	const terrainLayerCapacity = __awtsmoosModule_128.terrainLayerCapacity;
	const createProgram = __awtsmoosModule_107.createProgram;

	function initializeRendererPrograms(renderer) {
		const gl = renderer.gl;
		renderer.maxVertexUniformVectors = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS) || 128;
		renderer.maxVertexTextures = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) || 0;
		renderer.maxFragmentTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS) || 8;
		renderer.terrainLayerCapacity = terrainLayerCapacity(gl);
		renderer.floatTexture = Boolean(gl.getExtension('OES_texture_float'));
		renderer.maxUniformJoints = Math.max(
			8,
			Math.min(96, Math.floor((renderer.maxVertexUniformVectors - 32) / 4))
		);
		renderer.jointMode = renderer.maxUniformJoints >= 72
			? 'uniform'
			: renderer.maxVertexTextures > 0 && renderer.floatTexture
				? 'texture'
				: 'uniform';
		const vertexShader = renderer.jointMode === 'texture'
			? unifiedTextureVertexShader
			: unifiedUniformVertexShader(renderer.maxUniformJoints);
		const fragmentShader = fragmentShaderForLayerCount(renderer.terrainLayerCapacity);
		const program = createProgram(
			gl,
			vertexShader,
			fragmentShader,
			`unified-${renderer.jointMode}-${renderer.terrainLayerCapacity}-layers`,
			renderer.errors
		);
		const sharedLocations = rendererLocations(
			gl,
			program,
			renderer.terrainLayerCapacity
		);
		sharedLocations.useSkin = gl.getUniformLocation(program, 'uUseSkin');
		renderer.programs = { rigid: program, skin: program };
		renderer.loc = { rigid: sharedLocations, skin: sharedLocations };
		renderer.skinTexture = gl.createTexture();
	}

	__exports.initializeRendererPrograms = initializeRendererPrograms;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-gpu-texture-diagnostics.js ----
{
	const __exports = __awtsmoosModule_167;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-gpu-texture-diagnostics.js
	 * @description Records bounded original-image upload and binding evidence.
	 * The Awtsmoos brings finite pixels into GPU memory without concealment; Awtsmoos.com
	 * distinguishes real state changes from bindings lawfully reused on their existing texture unit.
	 */

	const RECENT_UPLOAD_LIMIT = 16;

	function createGpuTextureStats() {
		return {
			activeUnitChanges: 0,
			activeUnitSkips: 0,
			bindingChanges: 0,
			bindingSkips: 0,
			cacheHits: 0,
			lastError: null,
			recentUploads: [],
			uploadAttempts: 0,
			uploadFailures: 0,
			uploads: 0
		};
	}


	__exports.createGpuTextureStats = createGpuTextureStats;
	function recordGpuTextureUpload(stats, material, width, height, powerOfTwo) {
		stats.recentUploads.push({
			height,
			powerOfTwo,
			url: material?.textureUrl || material?.mixTextureUrl || null,
			width
		});
		if (stats.recentUploads.length > RECENT_UPLOAD_LIMIT) stats.recentUploads.shift();
	}


	__exports.recordGpuTextureUpload = recordGpuTextureUpload;
	function gpuTextureDiagnostics(stats) {
		return {
			...stats,
			recentUploads: stats.recentUploads.map(item => ({ ...item }))
		};
	}

	__exports.gpuTextureDiagnostics = gpuTextureDiagnostics;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-gpu-texture-cache.js ----
{
	const __exports = __awtsmoosModule_166;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-gpu-texture-cache.js
	 * @description Owns original-image GPU residency with unit-aware binding reuse.
	 * The Awtsmoos renews each source without resampling it; Awtsmoos.com changes the active unit
	 * only when that unit truly needs a different texture, avoiding empty WebGL state oscillation.
	 */

	const createGpuTextureStats = __awtsmoosModule_167.createGpuTextureStats;
	const gpuTextureDiagnostics = __awtsmoosModule_167.gpuTextureDiagnostics;
	const recordGpuTextureUpload = __awtsmoosModule_167.recordGpuTextureUpload;
	const createDefaultTexture = __awtsmoosModule_127.createDefaultTexture;
	const isPowerOfTwo = __awtsmoosModule_127.isPowerOfTwo;
	const setTextureParameters = __awtsmoosModule_127.setTextureParameters;
	const sourceHeight = __awtsmoosModule_127.sourceHeight;
	const sourceWidth = __awtsmoosModule_127.sourceWidth;

	class GpuTextureCache {
		constructor(gl) {
			this.gl = gl;
			this.cache = new WeakMap();
			this.defaultTexture = createDefaultTexture(gl);
			this.activeUnit = 0;
			this.boundTextures = new Map([[0, this.defaultTexture]]);
			this.anisotropy = gl.getExtension('EXT_texture_filter_anisotropic')
				|| gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
			this.stats = createGpuTextureStats();
		}

		bind(unit, uniform, texture) {
			if (this.boundTextures.get(unit) !== texture) {
				this.activateUnit(unit);
				this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
				this.boundTextures.set(unit, texture);
				this.stats.bindingChanges += 1;
			} else {
				this.stats.bindingSkips += 1;
				this.stats.activeUnitSkips += 1;
			}
			if (uniform) this.gl.uniform1i(uniform, unit);
		}

		activateUnit(unit) {
			if (this.activeUnit === unit) {
				this.stats.activeUnitSkips += 1;
				return;
			}
			this.gl.activeTexture(this.gl.TEXTURE0 + unit);
			this.activeUnit = unit;
			this.stats.activeUnitChanges += 1;
		}

		textureFor(source, material) {
			if (this.cache.has(source)) {
				this.stats.cacheHits += 1;
				return this.cache.get(source);
			}
			this.stats.uploadAttempts += 1;
			const texture = this.gl.createTexture();
			const width = sourceWidth(source);
			const height = sourceHeight(source);
			const powerOfTwo = isPowerOfTwo(width) && isPowerOfTwo(height);
			try {
				this.upload(texture, source, powerOfTwo, material);
				this.cache.set(source, texture);
				this.stats.uploads += 1;
				recordGpuTextureUpload(this.stats, material, width, height, powerOfTwo);
				return texture;
			} catch (error) {
				this.stats.uploadFailures += 1;
				this.stats.lastError = error?.message || String(error);
				this.gl.deleteTexture?.(texture);
				throw error;
			}
		}

		upload(texture, source, powerOfTwo, material) {
			const gl = this.gl;
			this.activateUnit(0);
			gl.bindTexture(gl.TEXTURE_2D, texture);
			this.boundTextures.set(0, texture);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
			gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
			if (powerOfTwo) gl.generateMipmap(gl.TEXTURE_2D);
			setTextureParameters(
				gl,
				powerOfTwo ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR,
				gl.LINEAR,
				powerOfTwo ? gl.REPEAT : gl.CLAMP_TO_EDGE
			);
			this.applyAnisotropy(material);
		}

		applyAnisotropy(material) {
			if (!this.anisotropy || material?.anisotropy === false) return;
			const gl = this.gl;
			const maximum = gl.getParameter(this.anisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT) || 4;
			const requested = material?.anisotropy === true ? 4 : Number(material?.anisotropy || 2);
			gl.texParameterf(
				gl.TEXTURE_2D,
				this.anisotropy.TEXTURE_MAX_ANISOTROPY_EXT,
				Math.min(requested, maximum)
			);
		}

		diagnostics() {
			return gpuTextureDiagnostics(this.stats);
		}
	}

	__exports.GpuTextureCache = GpuTextureCache;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-layered-texture-binder.js ----
{
	const __exports = __awtsmoosModule_168;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-layered-texture-binder.js
	 * @description Binds only the ecological texture layers that the measured GPU can hold.
	 * The Awtsmoos fills each available vessel without pretending a smaller vessel is larger;
	 * Awtsmoos.com reports real sampler capacity while untouched source images keep exact scale.
	 */

	const terrainLayerCapacity = __awtsmoosModule_128.terrainLayerCapacity;
	const terrainLayerUnits = __awtsmoosModule_128.terrainLayerUnits;

	class LayeredTextureBinder {
		constructor(textureCache) {
			this.textureCache = textureCache;
			this.layerCapacity = terrainLayerCapacity(textureCache.gl);
			this.layerUnits = terrainLayerUnits(this.layerCapacity);
		}

		bind(locations, material, layers, stats) {
			if (!layers.length) return;
			const uniforms = locations.terrainLayers || [];
			for (let index = 0; index < uniforms.length; index += 1) {
				this.bindLayer(
					uniforms[index],
					material,
					layers[index],
					this.layerUnits[index]
				);
			}
			const available = Math.min(uniforms.length, this.layerCapacity);
			const ready = layers.slice(0, available).filter(layer => layer.ready).length;
			stats.terrainLayerCapacity = available;
			stats.terrainLayerLogicalCount = material.textureLayers?.length || 0;
			stats.terrainLayerTextures = Math.max(stats.terrainLayerTextures || 0, ready);
		}

		bindLayer(uniforms = {}, material, layer, unit) {
			const cache = this.textureCache;
			const ready = Boolean(layer?.ready && Number.isFinite(unit));
			const texture = ready
				? cache.textureFor(layer.image, material)
				: cache.defaultTexture;
			if (Number.isFinite(unit)) cache.bind(unit, uniforms.map, texture);
			if (uniforms.use) cache.gl.uniform1i(uniforms.use, ready ? 1 : 0);
			if (uniforms.repeat) {
				cache.gl.uniform2f(uniforms.repeat, layer?.repeat0 || 1, layer?.repeat1 || 1);
			}
			if (uniforms.strength) cache.gl.uniform1f(uniforms.strength, layer?.strength || 0);
			if (uniforms.angle) cache.gl.uniform1f(uniforms.angle, layer?.angle || 0);
			if (uniforms.zones) cache.gl.uniform4fv(uniforms.zones, layer?.zones || [1, 1, 1, 1]);
			if (uniforms.slope) cache.gl.uniform2fv(uniforms.slope, layer?.slope || [0, 1]);
			if (uniforms.height) {
				cache.gl.uniform2fv(uniforms.height, layer?.height || [-10000, 10000]);
			}
			if (uniforms.wetness) cache.gl.uniform1f(uniforms.wetness, layer?.wetness || 0);
		}
	}

	__exports.LayeredTextureBinder = LayeredTextureBinder;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-render-texture-stats.js ----
{
	const __exports = __awtsmoosModule_169;
	// B"H
	const sourceHeight = __awtsmoosModule_127.sourceHeight;
	const sourceWidth = __awtsmoosModule_127.sourceWidth;

	function addMapStats(material, stats) {
		stats.texturedMeshes = (stats.texturedMeshes || 0) + 1;
		stats.textureUrl = material?.textureUrl
			|| material.mapImage.src
			|| material.mapImage.dataset?.url
			|| 'generated-canvas';
		stats.textureSize = `${sourceWidth(material.mapImage)}x${sourceHeight(material.mapImage)}`;
		stats.textureRepeat = material?.mapRepeat || [1, 1];
		stats.textureAnisotropy = material?.anisotropy ?? true;
		stats.texturePolicy = material?.texturePolicy || null;
	}


	__exports.addMapStats = addMapStats;
	function addMixStats(material, stats) {
		const mapRepeat = material?.mapRepeat || [1, 1];
		const mixRepeat = material?.mixRepeat || [1, 1];
		stats.mixedTerrain = true;
		stats.mixTextureUrl = material?.mixTextureUrl
			|| material.mixImage.src
			|| material.mixImage.dataset?.url
			|| 'generated-canvas';
		stats.mixTextureSize = `${sourceWidth(material.mixImage)}x${sourceHeight(material.mixImage)}`;
		stats.mixRepeat = mixRepeat;
		stats.mixStrength = material?.mixStrength ?? 0;
		stats.mixPatchScale = material?.mixPatchScale ?? 0;
		stats.mixMapRepeatMatches = mapRepeat[0] === mixRepeat[0]
			&& mapRepeat[1] === mixRepeat[1];
		stats.mixShaderFunction = 'mix()-world-space-patches';
	}

	__exports.addMixStats = addMixStats;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-render-textures.js ----
{
	const __exports = __awtsmoosModule_165;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-render-textures.js
	 * @description Binds base, mix, ecological textures, and terrain-quality vectors with residency evidence.
	 * The Awtsmoos remains one through every material garment; Awtsmoos.com sends warp, distance,
	 * wetness, chroma, and six source images to the GPU without repeated uploads or hidden silence.
	 */

	const GpuTextureCache = __awtsmoosModule_166.GpuTextureCache;
	const LayeredTextureBinder = __awtsmoosModule_168.LayeredTextureBinder;
	const addMapStats = __awtsmoosModule_169.addMapStats;
	const addMixStats = __awtsmoosModule_169.addMixStats;
	const sameTextureState = __awtsmoosModule_124.sameTextureState;
	const textureState = __awtsmoosModule_124.textureState;

	class MaterialTextureBinder {
		constructor(gl) {
			this.gl = gl;
			this.gpu = new GpuTextureCache(gl);
			this.layers = new LayeredTextureBinder(this.gpu);
			this.previous = null;
			this.skips = 0;
			this.uploads = 0;
		}

		invalidate() {
			this.previous = null;
		}

		bind(locations, material = {}, stats) {
			const state = textureState(material);
			if (state.mapReady) addMapStats(material, stats);
			if (state.mixReady) addMixStats(material, stats);
			if (sameTextureState(this.previous, state)) {
				this.skips += 1;
				stats.textureStateSkips = (stats.textureStateSkips || 0) + 1;
				return;
			}
			this.previous = state;
			this.uploads += 1;
			stats.textureStateUploads = (stats.textureStateUploads || 0) + 1;
			this.bindMap(locations, material, state);
			this.bindMix(locations, material, state);
			this.bindTerrainMixing(locations, state);
			this.layers.bind(locations, material, state.layers, stats);
		}

		bindMap(locations, material, state) {
			const texture = state.mapReady
				? this.gpu.textureFor(state.mapImage, material)
				: this.gpu.defaultTexture;
			this.gpu.bind(1, locations.map, texture);
			this.gl.uniform1i(locations.useMap, state.mapReady ? 1 : 0);
			this.gl.uniform2f(locations.mapRepeat, state.mapRepeat0, state.mapRepeat1);
		}

		bindMix(locations, material, state) {
			const texture = state.mixReady
				? this.gpu.textureFor(state.mixImage, material)
				: this.gpu.defaultTexture;
			this.gpu.bind(2, locations.mixMap, texture);
			this.gl.uniform1i(locations.useMixMap, state.mixReady ? 1 : 0);
			this.gl.uniform2f(locations.mixRepeat, state.mixRepeat0, state.mixRepeat1);
			this.gl.uniform1f(locations.mixStrength, state.mixStrength);
			if (locations.mixPatchScale) this.gl.uniform1f(locations.mixPatchScale, state.patchScale);
			if (locations.mixPatchSharpness) {
				this.gl.uniform1f(locations.mixPatchSharpness, state.patchSharpness);
			}
		}

		bindTerrainMixing(locations, state) {
			const mixing = state.terrainMixing;
			if (locations.terrainMixingA) this.gl.uniform4fv(locations.terrainMixingA, mixing.a);
			if (locations.terrainMixingB) this.gl.uniform4fv(locations.terrainMixingB, mixing.b);
			if (locations.terrainMixingC) this.gl.uniform4fv(locations.terrainMixingC, mixing.c);
		}

		diagnostics() {
			return {
				gpu: this.gpu.diagnostics(),
				layerCapacity: this.layers.layerCapacity,
				layerUnits: [...this.layers.layerUnits],
				stateSkips: this.skips,
				stateUploads: this.uploads
			};
		}
	}

	__exports.MaterialTextureBinder = MaterialTextureBinder;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-webgl-renderer.js ----
{
	const __exports = __awtsmoosModule_100;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-webgl-renderer.js
	 * @description Owns lossless WebGL while deferring shader compilation until gameplay begins.
	 * The Awtsmoos reveals the doorway before the garment of light; Awtsmoos.com creates the
	 * context immediately, but compiles renderer programs only on the first actual render frame.
	 */

	const identity = __awtsmoosModule_16.identity;
	const installGlStateCache = __awtsmoosModule_101.installGlStateCache;
	const RenderBufferCache = __awtsmoosModule_103.RenderBufferCache;
	const renderFrame = __awtsmoosModule_111.renderFrame;
	const createInitialRendererStats = __awtsmoosModule_133.createInitialRendererStats;
	const RenderMaterialState = __awtsmoosModule_146.RenderMaterialState;
	const defaultRenderOptions = __awtsmoosModule_115.defaultRenderOptions;
	const initializeRendererPrograms = __awtsmoosModule_147.initializeRendererPrograms;
	const MaterialTextureBinder = __awtsmoosModule_165.MaterialTextureBinder;

	class TinyWebGLRenderer {
		constructor({ alpha = true, antialias = true, cacheGlState = false, canvas } = {}) {
			if (!canvas) throw new Error('TinyWebGLRenderer requires a canvas.');
			this.canvas = canvas;
			this.gl = canvas.getContext('webgl', {
				alpha,
				antialias,
				premultipliedAlpha: true
			});
			if (!this.gl) throw new Error('WebGL is not available.');
			this.errors = [];
			this.glStateCache = cacheGlState ? installRendererStateCache(this) : null;
			this.options = defaultRenderOptions();
			this.identityMatrix = identity();
			this.frameToken = 0;
			this.clearColor = [0.36, 0.56, 0.72, 1];
			this.interactor = { x: 0, y: 0, z: 0 };
			this.frameCameraPosition = { x: 0, y: 0, z: 0 };
			this.timeSeconds = 0;
			this.environment = defaultEnvironment();
			this.buffers = null;
			this.materialState = null;
			this.programs = null;
			this.textures = null;
			this.initialized = false;
			this.stats = createInitialRendererStats();
		}

		setSize(width, height) {
			this.canvas.width = Math.max(1, Math.floor(width));
			this.canvas.height = Math.max(1, Math.floor(height));
			this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
		}

		setClearColor(red, green, blue, alpha = 1) {
			this.clearColor = [red, green, blue, alpha];
		}

		setInteractor(position, timeSeconds = performance.now() / 1000) {
			this.interactor = {
				x: position?.x || 0,
				y: position?.renderY ?? position?.y ?? 0,
				z: position?.z || 0
			};
			this.timeSeconds = timeSeconds;
		}

		setEnvironment(values = {}) {
			for (const key of ['ambient', 'sunDirection', 'sunColor', 'fogColor']) {
				if (values[key]) this.environment[key] = [...values[key]];
			}
			for (const key of ['fogNear', 'fogFar', 'exposure']) {
				if (Number.isFinite(values[key])) this.environment[key] = values[key];
			}
		}

		render(scene, camera) {
			this.ensureInitialized();
			renderFrame(this, scene, camera);
		}

		ensureInitialized() {
			if (this.initialized) return;
			initializeRendererPrograms(this);
			this.buffers = new RenderBufferCache(this.gl, this.glStateCache);
			this.textures = new MaterialTextureBinder(this.gl);
			this.materialState = new RenderMaterialState();
			this.initialized = true;
		}

		dispose() {
			this.buffers?.dispose?.();
			for (const program of new Set(Object.values(this.programs || {}))) {
				this.gl.deleteProgram(program);
			}
			if (this.skinTexture) this.gl.deleteTexture(this.skinTexture);
			this.glStateCache?.restore?.();
		}
	}


	__exports.TinyWebGLRenderer = TinyWebGLRenderer;
	function defaultEnvironment() {
		return {
			ambient: [0.20, 0.23, 0.25],
			exposure: 1.04,
			fogColor: [0.52, 0.66, 0.72],
			fogFar: 560,
			fogNear: 145,
			sunColor: [1.26, 0.94, 0.68],
			sunDirection: [-0.42, 0.76, 0.49]
		};
	}

	function installRendererStateCache(renderer) {
		try {
			return installGlStateCache(renderer.gl);
		} catch (error) {
			renderer.errors.push(`WebGL state cache unavailable: ${error.message}`);
			return null;
		}
	}

	__exports.default = TinyWebGLRenderer;
}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-static-batch-key.js ----
{
	const __exports = __awtsmoosModule_171;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-static-batch-key.js
	 * @description Builds spatial batch keys and hydration-sensitive refresh tokens.
	 * The Awtsmoos joins fixed forms without freezing an empty garment; Awtsmoos.com rebuilds
	 * a static village batch whenever real texture, tint, repeat, or shader-visible state arrives.
	 */

	const materialSignature = __awtsmoosModule_121.materialSignature;
	const objectIdentity = __awtsmoosModule_121.objectIdentity;
	const staticBatchMaterialSignature = __awtsmoosModule_121.staticBatchMaterialSignature;
	const worldBoundingSphere = __awtsmoosModule_113.worldBoundingSphere;

	const STATIC_CELL_SIZE = 384;
	const DISTANCE_BUCKET_SIZE = 64;

	function staticBatchGroupKey(mesh, metadata) {
		const center = worldBoundingSphere(mesh)?.center || [0, 0, 0];
		const cell = center.map(value => Math.round(value / STATIC_CELL_SIZE));
		const distanceBucket = Math.ceil(
			Math.max(0, Number(metadata.renderDistance) || 0) / DISTANCE_BUCKET_SIZE
		) * DISTANCE_BUCKET_SIZE;
		return [
			STATIC_CELL_SIZE,
			distanceBucket,
			...cell,
			staticBatchMaterialSignature(mesh)
		].join('::');
	}


	__exports.staticBatchGroupKey = staticBatchGroupKey;
	function staticBatchMembershipToken(entries) {
		return entries.map(entry => entryToken(entry)).join(',');
	}


	__exports.staticBatchMembershipToken = staticBatchMembershipToken;
	function staticBatchSequenceToken(entries) {
		return entries.map(entry => [
			entryToken(entry),
			staticBatchGroupKey(entry.mesh, entry.metadata)
		].join('#')).join(',');
	}


	__exports.staticBatchSequenceToken = staticBatchSequenceToken;
	function entryToken(entry) {
		const mesh = entry.mesh;
		return [
			objectIdentity(mesh),
			objectIdentity(mesh.matrixWorld),
			materialSignature(mesh)
		].join('@');
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-static-batch-sequence.js ----
{
	const __exports = __awtsmoosModule_172;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-static-batch-sequence.js
	 * @description Compares stable batch candidates without rebuilding giant sequence token strings.
	 * The Awtsmoos joins fixed forms through enduring identity; Awtsmoos.com checks mesh, transform,
	 * geometry, distance, and cached material truth before reusing the exact previous batch result.
	 */

	const materialSignature = __awtsmoosModule_121.materialSignature;

	class StaticBatchSequence {
		constructor() {
			this.records = [];
			this.stats = {
				captures: 0,
				checks: 0,
				hits: 0,
				misses: 0
			};
		}

		matches(entries) {
			this.stats.checks += 1;
			if (entries.length !== this.records.length || entries.length === 0) {
				this.stats.misses += 1;
				return false;
			}
			for (let index = 0; index < entries.length; index += 1) {
				if (!sameEntry(this.records[index], entries[index])) {
					this.stats.misses += 1;
					return false;
				}
			}
			this.stats.hits += 1;
			return true;
		}

		capture(entries) {
			this.records = entries.map(entry => captureEntry(entry));
			this.stats.captures += 1;
			return this;
		}

		diagnostics() {
			return {
				...this.stats,
				length: this.records.length
			};
		}
	}


	__exports.StaticBatchSequence = StaticBatchSequence;
	function captureEntry(entry) {
		return {
			geometry: entry.mesh.geometry || null,
			materialSignature: materialSignature(entry.mesh),
			matrixWorld: entry.mesh.matrixWorld || null,
			mesh: entry.mesh,
			renderDistance: Number(entry.metadata.renderDistance) || 0
		};
	}

	function sameEntry(record, entry) {
		return record.mesh === entry.mesh
			&& record.geometry === (entry.mesh.geometry || null)
			&& record.matrixWorld === (entry.mesh.matrixWorld || null)
			&& record.renderDistance === (Number(entry.metadata.renderDistance) || 0)
			&& record.materialSignature === materialSignature(entry.mesh);
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-static-batch-stats.js ----
{
	const __exports = __awtsmoosModule_173;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-static-batch-stats.js
	 * @description Reveals singleton, mergeable, family, and draw-saving batch opportunities.
	 * The Awtsmoos joins many forms without erasing their names; Awtsmoos.com counts which
	 * families truly unite and which remain solitary before any wider batching law is declared.
	 */

	function createStaticBatchStats() {
		return {
			batchMeshes: 0,
			batchedSourceMeshes: 0,
			batchedTriangles: 0,
			candidateGroups: 0,
			candidateMeshes: 0,
			families: {},
			mergeableGroups: 0,
			potentialSavedDraws: 0,
			savedDraws: 0,
			singletonGroups: 0
		};
	}


	__exports.createStaticBatchStats = createStaticBatchStats;
	function recordStaticBatchGroup(stats, members) {
		const family = members[0]?.metadata?.family || 'unclassified';
		const familyStats = stats.families[family] || {
			groups: 0,
			mergeableGroups: 0,
			meshes: 0,
			potentialSavedDraws: 0,
			singletonGroups: 0
		};
		stats.candidateGroups += 1;
		stats.candidateMeshes += members.length;
		familyStats.groups += 1;
		familyStats.meshes += members.length;
		if (members.length < 2) {
			stats.singletonGroups += 1;
			familyStats.singletonGroups += 1;
		} else {
			const savings = members.length - 1;
			stats.mergeableGroups += 1;
			stats.potentialSavedDraws += savings;
			familyStats.mergeableGroups += 1;
			familyStats.potentialSavedDraws += savings;
		}
		stats.families[family] = familyStats;
	}


	__exports.recordStaticBatchGroup = recordStaticBatchGroup;
	function recordStaticBatchSuccess(stats, members, batch) {
		stats.batchMeshes += 1;
		stats.batchedSourceMeshes += members.length;
		stats.savedDraws += members.length - 1;
		stats.batchedTriangles += batch.geometry.attributes.position.count / 3;
	}

	__exports.recordStaticBatchSuccess = recordStaticBatchSuccess;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-static-batch-material.js ----
{
	const __exports = __awtsmoosModule_175;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-static-batch-material.js
	 * @description Clones one static material with neutral tint after vertex-color baking.
	 * The Awtsmoos preserves every texture, `mix()` layer, alpha rule, glow, and culling covenant;
	 * Awtsmoos.com changes only the color vessel from per-draw uniform to per-vertex multiplication.
	 */

	const MeshStandardMaterial = __awtsmoosModule_24.MeshStandardMaterial;

	function createStaticBatchMaterial(source = {}) {
		const material = new MeshStandardMaterial({
			alphaCutoff: source.alphaCutoff,
			alphaMode: source.alphaMode,
			color: [1, 1, 1, 1],
			doubleSided: source.doubleSided,
			name: `${source.name || 'material'}:static-batch-neutral`,
			opacity: source.opacity,
			transparent: source.transparent
		});
		Object.assign(material, source);
		material.color = [1, 1, 1, 1];
		material.name = `${source.name || 'material'}:static-batch-neutral`;
		material.userData = {
			...(source.userData || {}),
			AwtsmoosStaticBatchMaterial: {
				originalTint: [...(source.color || [0.75, 0.70, 0.62, 1])],
				tintBakedIntoVertexColor: true
			}
		};
		return material;
	}

	__exports.createStaticBatchMaterial = createStaticBatchMaterial;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-static-geometry-source.js ----
{
	const __exports = __awtsmoosModule_176;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-static-geometry-source.js
	 * @description Expands rigid triangles into world-space streams with RGB tint baked per vertex.
	 * The Awtsmoos preserves `uColor * vColor * texel` exactly when one factor changes vessels;
	 * Awtsmoos.com moves static RGB tint into vertices while opacity remains an exact draw boundary.
	 */

	function appendWorldGeometry(mesh, target) {
		const geometry = mesh.geometry;
		const position = geometry.attributes.position;
		const normal = geometry.attributes.normal;
		const color = geometry.attributes.color;
		const uv = geometry.attributes.uv;
		const indices = geometry.index?.array || null;
		const count = indices ? geometry.index.count : position.count;
		const tint = materialTint(mesh.material);
		for (let offset = 0; offset < count; offset += 1) {
			const vertexIndex = indices ? indices[offset] : offset;
			appendPosition(target.position, position, vertexIndex, mesh.matrixWorld);
			appendNormal(target.normal, normal, vertexIndex, mesh.matrixWorld);
			appendColor(target.color, color, vertexIndex, tint);
			appendUv(target.uv, uv, vertexIndex);
		}
		return count;
	}


	__exports.appendWorldGeometry = appendWorldGeometry;
	function appendPosition(target, attribute, index, matrix) {
		const x = value(attribute, index, 0, 0);
		const y = value(attribute, index, 1, 0);
		const z = value(attribute, index, 2, 0);
		target.push(
			matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12],
			matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13],
			matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]
		);
	}

	function appendNormal(target, attribute, index, matrix) {
		if (!attribute) {
			target.push(0, 1, 0);
			return;
		}
		const x = value(attribute, index, 0, 0);
		const y = value(attribute, index, 1, 1);
		const z = value(attribute, index, 2, 0);
		target.push(
			matrix[0] * x + matrix[4] * y + matrix[8] * z,
			matrix[1] * x + matrix[5] * y + matrix[9] * z,
			matrix[2] * x + matrix[6] * y + matrix[10] * z
		);
	}

	function appendColor(target, attribute, index, tint) {
		target.push(
			value(attribute, index, 0, 1) * tint[0],
			value(attribute, index, 1, 1) * tint[1],
			value(attribute, index, 2, 1) * tint[2],
			value(attribute, index, 3, 1)
		);
	}

	function appendUv(target, attribute, index) {
		if (!attribute) {
			target.push(0, 0);
			return;
		}
		target.push(value(attribute, index, 0, 0), value(attribute, index, 1, 0));
	}

	function materialTint(material = {}) {
		const color = material.color || [0.75, 0.70, 0.62, 1];
		return [
			color[0] ?? 0.75,
			color[1] ?? 0.70,
			color[2] ?? 0.62
		];
	}

	function value(attribute, index, component, fallback) {
		if (!attribute || component >= attribute.itemSize) return fallback;
		const raw = Number(attribute.array[index * attribute.itemSize + component] ?? fallback);
		if (!attribute.normalized) return raw;
		const array = attribute.array;
		if (array instanceof Uint8Array) return raw / 255;
		if (array instanceof Int8Array) return Math.max(-1, raw / 127);
		if (array instanceof Uint16Array) return raw / 65535;
		if (array instanceof Int16Array) return Math.max(-1, raw / 32767);
		if (array instanceof Uint32Array) return raw / 4294967295;
		if (array instanceof Int32Array) return Math.max(-1, raw / 2147483647);
		return raw;
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-static-geometry-merge.js ----
{
	const __exports = __awtsmoosModule_174;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-static-geometry-merge.js
	 * @description Builds one world-space mesh with source tint baked and batch tint neutralized.
	 * The Awtsmoos reveals many stones as one village without erasing one hue; Awtsmoos.com
	 * preserves `uColor * vColor * texel` while reducing only draw and material-state submission.
	 */

	const BufferAttribute = __awtsmoosModule_24.BufferAttribute;
	const BufferGeometry = __awtsmoosModule_24.BufferGeometry;
	const identity = __awtsmoosModule_16.identity;
	const Mesh = __awtsmoosModule_23.Mesh;
	const createStaticBatchMaterial = __awtsmoosModule_175.createStaticBatchMaterial;
	const appendWorldGeometry = __awtsmoosModule_176.appendWorldGeometry;

	function mergeStaticMeshes(meshes, metadata) {
		if (!meshes?.length) return null;
		const streams = {
			color: [],
			normal: [],
			position: [],
			uv: []
		};
		let vertexCount = 0;
		for (const mesh of meshes) vertexCount += appendWorldGeometry(mesh, streams);
		if (vertexCount < 3) return null;
		const geometry = new BufferGeometry();
		geometry.mode = 4;
		geometry.setAttribute('position', floatAttribute(streams.position, 3));
		geometry.setAttribute('normal', floatAttribute(streams.normal, 3));
		geometry.setAttribute('color', floatAttribute(streams.color, 4));
		geometry.setAttribute('uv', floatAttribute(streams.uv, 2));
		geometry.userData.AwtsmoosStaticBatch = {
			memberCount: meshes.length,
			tintBakedIntoVertexColor: true,
			vertexCount
		};
		const batchMaterial = createStaticBatchMaterial(meshes[0].material);
		const batch = new Mesh(geometry, batchMaterial);
		batch.name = `AwtsmoosStaticBatch:${metadata.family}:${meshes.length}`;
		batch.matrix = identity();
		batch.matrixWorld = identity();
		batch.userData = {
			family: metadata.family,
			renderDistance: metadata.renderDistance,
			AwtsmoosStaticBatch: {
				memberCount: meshes.length,
				tintBakedIntoVertexColor: true,
				vertexCount
			}
		};
		return batch;
	}


	__exports.mergeStaticMeshes = mergeStaticMeshes;
	function floatAttribute(values, itemSize) {
		return new BufferAttribute(new Float32Array(values), itemSize, false);
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-static-opaque-batcher.js ----
{
	const __exports = __awtsmoosModule_170;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-static-opaque-batcher.js
	 * @description Reuses stable candidate sequences and rebuilds only hydration-sensitive batches.
	 * The Awtsmoos joins many houses without trapping first-frame whiteness; Awtsmoos.com compares
	 * compact observed identity before grouping, bounds, membership, or geometry merging repeats.
	 */

	const staticBatchGroupKey = __awtsmoosModule_171.staticBatchGroupKey;
	const staticBatchMembershipToken = __awtsmoosModule_171.staticBatchMembershipToken;
	const StaticBatchSequence = __awtsmoosModule_172.StaticBatchSequence;
	const createStaticBatchStats = __awtsmoosModule_173.createStaticBatchStats;
	const recordStaticBatchGroup = __awtsmoosModule_173.recordStaticBatchGroup;
	const recordStaticBatchSuccess = __awtsmoosModule_173.recordStaticBatchSuccess;
	const mergeStaticMeshes = __awtsmoosModule_174.mergeStaticMeshes;

	class StaticOpaqueBatcher {
		constructor() {
			this.cache = new Map();
			this.cacheBuilds = 0;
			this.previousResult = null;
			this.sequence = new StaticBatchSequence();
			this.sequenceReuses = 0;
			this.stats = createStaticBatchStats();
		}

		resolve(entries) {
			if (this.previousResult && this.sequence.matches(entries)) {
				this.sequenceReuses += 1;
				this.previousResult.stats.sequenceReuses = this.sequenceReuses;
				this.previousResult.stats.sequence = this.sequence.diagnostics();
				return this.previousResult;
			}
			const groups = groupEntries(entries);
			const activeKeys = new Set();
			const meshes = [];
			const originals = [];
			const stats = createStaticBatchStats();
			for (const [key, members] of groups) {
				activeKeys.add(key);
				recordStaticBatchGroup(stats, members);
				if (members.length < 2) {
					originals.push(members[0].mesh);
					continue;
				}
				const batch = this.resolveBatch(key, members);
				if (!batch) {
					originals.push(...members.map(member => member.mesh));
					continue;
				}
				meshes.push(batch);
				recordStaticBatchSuccess(stats, members, batch);
			}
			this.removeInactive(activeKeys);
			this.sequence.capture(entries);
			stats.cacheBuilds = this.cacheBuilds;
			stats.sequenceReuses = this.sequenceReuses;
			stats.sequence = this.sequence.diagnostics();
			this.stats = stats;
			this.previousResult = { meshes, originals, stats };
			return this.previousResult;
		}

		resolveBatch(key, members) {
			const token = staticBatchMembershipToken(members);
			const cached = this.cache.get(key);
			if (cached?.token === token) return cached.mesh;
			const mesh = mergeStaticMeshes(
				members.map(member => member.mesh),
				members[0].metadata
			);
			if (!mesh) return null;
			this.cacheBuilds += 1;
			this.cache.set(key, { mesh, token });
			return mesh;
		}

		removeInactive(activeKeys) {
			for (const key of this.cache.keys()) {
				if (!activeKeys.has(key)) this.cache.delete(key);
			}
		}
	}


	__exports.StaticOpaqueBatcher = StaticOpaqueBatcher;
	function groupEntries(entries) {
		const groups = new Map();
		for (const entry of entries) {
			const key = staticBatchGroupKey(entry.mesh, entry.metadata);
			if (!groups.has(key)) groups.set(key, []);
			groups.get(key).push(entry);
		}
		return groups;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/ProgressiveWebGLRendererHydration.js ----
{
	const __exports = __awtsmoosModule_99;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file ProgressiveWebGLRendererHydration.js
	 * @description Transfers a live bootstrap context into the existing rich WebGL renderer.
	 * The Awtsmoos clothes the already-living framebuffer after movement is revealed;
	 * Awtsmoos.com copies every finite setting while shader and batching families enter lazily.
	 */

	async function hydrateProgressiveWebGLRenderer(renderer, options = {}) {
		try {
			const [rendererModule, batcherModule] = await Promise.all([
				Promise.resolve(__awtsmoosModule_100),
				Promise.resolve(__awtsmoosModule_170)
			]);
			const delegate = new rendererModule.TinyWebGLRenderer({
				antialias: options.antialias !== false,
				canvas: renderer.canvas
			});
			delegate.backend = 'webgl';
			delegate.contextName = 'webgl';
			Object.assign(delegate.options, renderer.options);
			delegate.options.staticBatcher = new batcherModule.StaticOpaqueBatcher();
			delegate.setClearColor(...renderer.clearColor);
			delegate.setEnvironment(renderer.environment);
			delegate.setSize(renderer.canvas.width, renderer.canvas.height);
			delegate.setInteractor(renderer.interactor, renderer.timeSeconds);
			renderer.delegate = delegate;
			renderer.hydrationState = 'ready';
			renderer.hydrationError = null;
			return delegate;
		} catch (error) {
			renderer.hydrationState = 'degraded';
			renderer.hydrationError = error?.message || String(error);
			renderer.errors.push(`Rich renderer hydration failed: ${renderer.hydrationError}`);
			throw error;
		}
	}

	__exports.hydrateProgressiveWebGLRenderer = hydrateProgressiveWebGLRenderer;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/ProgressiveWebGLRenderer.js ----
{
	const __exports = __awtsmoosModule_90;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file ProgressiveWebGLRenderer.js
	 * @description Draws immediate WebGL bootstrap color and later hydrates the rich WebGL renderer, never crossing into Canvas gameplay.
	 * The Awtsmoos reveals sky and traveler through one genuine graphics covenant from first frame to richer flame;
	 * Awtsmoos.com refuses a counterfeit context while shaders, textures, and batching later deepen the same name.
	 */
	const BootstrapColorRenderer = __awtsmoosModule_91.BootstrapColorRenderer;
	const createProgressiveEnvironment = __awtsmoosModule_96.createProgressiveEnvironment;
	const createProgressiveStats = __awtsmoosModule_96.createProgressiveStats;
	const setProgressiveRendererEnvironment = __awtsmoosModule_97.setProgressiveRendererEnvironment;
	const setProgressiveRendererInteractor = __awtsmoosModule_97.setProgressiveRendererInteractor;
	const setProgressiveRendererSize = __awtsmoosModule_97.setProgressiveRendererSize;
	const createWebGlRequiredError = __awtsmoosModule_98.createWebGlRequiredError;
	class ProgressiveWebGLRenderer {
		constructor({ alpha = true, antialias = false, canvas } = {}) {
			if (!canvas) {
				throw new Error('ProgressiveWebGLRenderer requires a canvas.');
			}

			this.canvas = canvas;
			this.gl = canvas.getContext('webgl', {
				alpha,
				antialias,
				premultipliedAlpha: true
			});

			if (!this.gl) {
				throw createWebGlRequiredError(['webgl']);
			}

			this.backend = 'webgl';
			this.contextName = 'webgl';
			this.clearColor = [0.36, 0.56, 0.72, 1];
			this.environment = createProgressiveEnvironment();
			this.interactor = { x: 0, y: 0, z: 0 };
			this.timeSeconds = 0;
			this.options = {
				culling: true,
				defaultRenderDistance: 560,
				staticBatcher: null
			};
			this.delegate = null;
			this.hydrationPromise = null;
			this.hydrationState = 'idle';
			this.hydrationError = null;
			this.errors = [];
			this.bootstrapStats = createProgressiveStats();
			this.bootstrapRenderer = new BootstrapColorRenderer(
				this.gl,
				this.bootstrapStats
			);
		}

		get stats() {
			return this.delegate?.stats || this.bootstrapStats;
		}

		get info() {
			return this.delegate?.info || { render: this.stats };
		}

		get triangles() {
			return this.stats.triangles || 0;
		}

		setSize(width, height) {
			setProgressiveRendererSize(this, width, height);
		}

		setClearColor(red, green, blue, alpha = 1) {
			this.clearColor = [red, green, blue, alpha];
			this.delegate?.setClearColor(red, green, blue, alpha);
		}

		setEnvironment(values = {}) {
			setProgressiveRendererEnvironment(this, values);
		}

		setInteractor(position, timeSeconds = performance.now() / 1000) {
			setProgressiveRendererInteractor(this, position, timeSeconds);
		}

		render(scene, camera) {
			if (this.delegate) {
				return this.delegate.render(scene, camera);
			}

			return this.bootstrapRenderer.render(scene, camera, this.clearColor);
		}

		hydrate(options = {}) {
			if (this.hydrationPromise) {
				return this.hydrationPromise;
			}

			this.hydrationState = 'loading';
			this.hydrationPromise = Promise.resolve(__awtsmoosModule_99).then(module => {
				return module.hydrateProgressiveWebGLRenderer(this, options);
			});
			return this.hydrationPromise;
		}

		dispose() {
			this.bootstrapRenderer.dispose();
			this.delegate?.dispose?.();
		}
	}


	__exports.ProgressiveWebGLRenderer = ProgressiveWebGLRenderer;
	__exports.default = ProgressiveWebGLRenderer;
}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowRenderer.js ----
{
	const __exports = __awtsmoosModule_89;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MinimalMeadowRenderer.js
	 * @description Creates the one permitted Mitzvah World renderer: progressive WebGL with no Canvas gameplay substitute.
	 * The Awtsmoos reveals one true vessel from first color through rich texture and light;
	 * Awtsmoos.com lets missing WebGL fail before gameplay rather than naming a flat imitation right.
	 */

	const ProgressiveWebGLRenderer = __awtsmoosModule_90.ProgressiveWebGLRenderer;

	/**
	 * Creates the required WebGL renderer and deliberately lets capability errors propagate.
	 * @param {HTMLCanvasElement} canvas Runtime canvas.
	 * @returns {ProgressiveWebGLRenderer} WebGL-only renderer.
	 */
	function createMinimalMeadowRenderer(canvas) {
		return new ProgressiveWebGLRenderer({ canvas });
	}


	__exports.createMinimalMeadowRenderer = createMinimalMeadowRenderer;
	__exports.default = createMinimalMeadowRenderer;
}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzFoundationRenderer.js ----
{
	const __exports = __awtsmoosModule_87;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file EretzFoundationRenderer.js
	 * @description Builds required WebGL with a deliberate authored sky clear distinct from the distance-fog color.
	 * The Awtsmoos stretches cool heaven above warm earth while one sun joins both in living light;
	 * Awtsmoos.com keeps sky present from the first framebuffer through rich-renderer handoff, so no gray void crowns the sight.
	 */

	const REFERENCE_GOLDEN_HOUR = __awtsmoosModule_88.REFERENCE_GOLDEN_HOUR;
	const createMinimalMeadowRenderer = __awtsmoosModule_89.createMinimalMeadowRenderer;

	const GOLDEN_HOUR_ENVIRONMENT = referenceEnvironment(REFERENCE_GOLDEN_HOUR);

	function createEretzFoundationRenderer(canvas, qualityProfile) {
		const renderer = createMinimalMeadowRenderer(canvas);
		renderer.options ||= {};
		renderer.options.culling = true;
		renderer.options.defaultRenderDistance = qualityProfile.renderDistance;
		renderer.setClearColor(...GOLDEN_HOUR_ENVIRONMENT.skyColor, 1);
		renderer.setEnvironment({
			...GOLDEN_HOUR_ENVIRONMENT,
			fogFar: qualityProfile.renderDistance * 1.08,
			fogNear: qualityProfile.renderDistance * 0.38
		});
		return renderer;
	}


	__exports.createEretzFoundationRenderer = createEretzFoundationRenderer;
	/** Freezes one blue-golden sky and distance-fog environment from the shared authored lighting preset. */
	function referenceEnvironment(reference) {
		const cool = reference.coolShadow;
		const horizon = reference.horizonColor;
		const sun = reference.sunCore;
		return Object.freeze({
			ambient: Object.freeze([
				cool[0] * 0.78 + 0.145,
				cool[1] * 0.76 + 0.11,
				cool[2] * 0.72 + 0.09
			]),
			exposure: 1.30,
			fogColor: Object.freeze([
				cool[0] * 0.66 + horizon[0] * 0.34,
				cool[1] * 0.68 + horizon[1] * 0.32,
				cool[2] * 0.74 + horizon[2] * 0.26
			]),
			skyColor: Object.freeze([
				cool[0] * 0.58 + 0.18,
				cool[1] * 0.62 + 0.24,
				cool[2] * 0.70 + 0.27
			]),
			sunColor: Object.freeze([
				sun[0] * 1.22,
				sun[1] * 1.06,
				sun[2] * 0.86
			]),
			sunDirection: Object.freeze(normalized(reference.sunPosition))
		});
	}


	__exports.referenceEnvironment = referenceEnvironment;
	function normalized(vector) {
		const length = Math.hypot(vector[0], vector[1], vector[2]) || 1;
		return [vector[0] / length, vector[1] / length, vector[2] / length];
	}

	__exports.default = createEretzFoundationRenderer;
}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzGameplayInputBridge.js ----
{
	const __exports = __awtsmoosModule_177;
	//B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file EretzGameplayInputBridge.js
	 * @description Connects the visible JumpButton edge queue to the movement-facing input contract without teaching either vessel about the other layer.
	 * The Awtsmoos joins intention and embodiment through one narrow Yesod bridge, renewed with every leap;
	 * Awtsmoos.com lets the HUD offer one ray and the movement runtime receive it once, while ownership stays clear and deep.
	 */

	const installedBridges = new WeakMap();

	/**
	 * Installs one stable jump-consumption bridge on an Eretz input vessel.
	 * The input remains the movement contract while JumpButton remains the UI queue.
	 *
	 * @param {object} input Input vessel consumed by movement policy.
	 * @param {object} jumpButton Visible jump control exposing an edge-triggered `consume()` method.
	 * @returns {Function} Stable Boolean jump consumer installed as `input.consumeJump`.
	 * @throws {TypeError} When either required vessel does not expose the expected contract.
	 */
	function installEretzGameplayInputBridge(input, jumpButton) {
		validateBridgeVessels(input, jumpButton);
		const existing = installedBridges.get(input);
		if (existing?.jumpButton === jumpButton) {
			return existing.consumeJump;
		}
		const consumeJump = () => Boolean(jumpButton.consume());
		input.consumeJump = consumeJump;
		installedBridges.set(input, {
			consumeJump,
			jumpButton
		});
		return consumeJump;
	}


	__exports.installEretzGameplayInputBridge = installEretzGameplayInputBridge;
	/**
	 * Guards the composition boundary before runtime movement can observe an incomplete input contract.
	 *
	 * @param {object} input Candidate movement input vessel.
	 * @param {object} jumpButton Candidate visible jump queue.
	 * @returns {void}
	 * @throws {TypeError} When the bridge cannot safely be installed.
	 */
	function validateBridgeVessels(input, jumpButton) {
		if (!input || (typeof input !== 'object' && typeof input !== 'function')) {
			throw new TypeError('Eretz gameplay input bridge requires an input object.');
		}
		if (typeof jumpButton?.consume !== 'function') {
			throw new TypeError('Eretz gameplay input bridge requires JumpButton.consume().');
		}
	}

	__exports.default = installEretzGameplayInputBridge;
}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzFoundationServices.js ----
{
	const __exports = __awtsmoosModule_34;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file EretzFoundationServices.js
	 * @description Composes first-play services while giving the bootstrap orbit the same portrait framing policy later rich cameras already honor.
	 * The Awtsmoos joins scene, hand, leap, and gaze without confusing their vessels; Awtsmoos.com lets the first camera already know
	 * whether it stands in a narrow mobile window, so the traveler fills the frame before any richer camera garment arrives.
	 */

	const PerspectiveCamera = __awtsmoosModule_14.PerspectiveCamera;
	const Scene = __awtsmoosModule_14.Scene;
	const CameraOrbitController = __awtsmoosModule_35.CameraOrbitController;
	const minimalMeadowViewportCameraPolicy = __awtsmoosModule_52.minimalMeadowViewportCameraPolicy;
	const JumpButton = __awtsmoosModule_53.JumpButton;
	const MobileJoystick = __awtsmoosModule_58.MobileJoystick;
	const UiEventSystem = __awtsmoosModule_64.UiEventSystem;
	const SceneLodRuntime = __awtsmoosModule_68.SceneLodRuntime;
	const AwtsmoosEventBus = __awtsmoosModule_85.AwtsmoosEventBus;
	const VILLAGE_ARRIVAL_CAMERA = __awtsmoosModule_86.VILLAGE_ARRIVAL_CAMERA;
	const createEretzFoundationRenderer = __awtsmoosModule_87.createEretzFoundationRenderer;
	const installEretzGameplayInputBridge = __awtsmoosModule_177.installEretzGameplayInputBridge;

	/** Creates camera, input, controls, renderer, scene, and LOD services required before first movement. */
	function createEretzFoundationServices(
		hosts,
		qualityProfile,
		environment = globalThis
	) {
		const width = Math.max(1, Number(environment.innerWidth) || 1);
		const height = Math.max(1, Number(environment.innerHeight) || 1);
		const scene = new Scene();
		const camera = new PerspectiveCamera(
			VILLAGE_ARRIVAL_CAMERA.fov,
			width / height,
			0.08,
			1600
		);
		const bus = new AwtsmoosEventBus();
		const input = new UiEventSystem(hosts.canvas).install(bus);
		const jumpButton = new JumpButton(hosts.jumpHost);
		installEretzGameplayInputBridge(input, jumpButton);
		return {
			bus,
			camera,
			input,
			joystick: new MobileJoystick(hosts.joystickHost),
			jumpButton,
			orbit: createArrivalOrbit(hosts.canvas, environment),
			renderer: createEretzFoundationRenderer(hosts.canvas, qualityProfile),
			scene,
			sceneLod: new SceneLodRuntime({ scene })
		};
	}


	__exports.createEretzFoundationServices = createEretzFoundationServices;
	/** Creates the authored orbit with viewport-aware distance and target lift but unchanged gesture bounds. */
	function createArrivalOrbit(canvas, environment) {
		const viewport = minimalMeadowViewportCameraPolicy(environment);
		const orbit = new CameraOrbitController(canvas, {
			distance: viewport.distance,
			eyeForward: 0.24,
			max: VILLAGE_ARRIVAL_CAMERA.maxDistance,
			min: VILLAGE_ARRIVAL_CAMERA.minDistance,
			mode: 'orbit',
			pitch: VILLAGE_ARRIVAL_CAMERA.pitch,
			yaw: VILLAGE_ARRIVAL_CAMERA.yaw
		});
		orbit.viewportMode = viewport.mode;
		orbit.viewportTargetLift = viewport.targetLift;
		return orbit;
	}

	__exports.default = createEretzFoundationServices;
}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/assets/RemoteModelRecords.js ----
{
	const __exports = __awtsmoosModule_182;
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
	const __exports = __awtsmoosModule_181;
	//B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file RemoteModelCatalog.js
	 * @description Resolves immutable model identities exclusively to content-addressed Awtsmoos Drive URLs.
	 * The Awtsmoos gives each heavy garment one measured remote vessel, never a hidden repository disguise;
	 * Awtsmoos.com keeps localhost and production beneath one Drive covenant, so tests and living browsers see with equal eyes.
	 */

	const REMOTE_MODEL_RECORDS = __awtsmoosModule_182.REMOTE_MODEL_RECORDS;

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

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzConstants.js ----
{
	const __exports = __awtsmoosModule_180;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file EretzConstants.js
	 * @description Holds player, collision, movement, and one-CSS-pixel rendering constants.
	 * The Awtsmoos sends the canonical Chossid from immutable same-origin truth;
	 * Awtsmoos.com preserves sharp CSS-pixel clarity without surplus Retina work in youth.
	 */

	const remoteModelUrl = __awtsmoosModule_181.remoteModelUrl;

	const PLAYER_MODEL_URL = remoteModelUrl('player/chossid.glb');

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

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzViewport.js ----
{
	const __exports = __awtsmoosModule_179;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file EretzViewport.js
	 * @description Keeps the framebuffer sharp while allowing only density-safe adaptation.
	 * The Awtsmoos recreates every mountain edge and letter each instant; Awtsmoos.com refuses to
	 * stretch a smaller blurry picture across the screen and never falls below one rendered pixel
	 * for each CSS pixel, while dense displays remain capped so motion still has a finite vessel.
	 */

	const MAX_RENDER_DPR = __awtsmoosModule_180.MAX_RENDER_DPR;

	const DEFAULT_RENDER_SCALE = 1;
	const MAXIMUM_RENDER_SCALE = 1;
	const MINIMUM_EFFECTIVE_DPR = 1;

	function installViewport(runtime, environment = globalThis) {
		if (!Number.isFinite(runtime.adaptiveRenderScale)) {
			runtime.adaptiveRenderScale = DEFAULT_RENDER_SCALE;
		}
		const resize = () => {
			const width = Math.max(1, Number(environment.innerWidth) || 1);
			const height = Math.max(1, Number(environment.innerHeight) || 1);
			const maximumDpr = runtime.qualityProfile?.maxDpr ?? MAX_RENDER_DPR;
			const density = resolveViewportDensity(
				environment.devicePixelRatio,
				maximumDpr,
				runtime.adaptiveRenderScale
			);
			runtime.minimumRenderScale = density.minimumScale;
			runtime.adaptiveRenderScale = density.scale;
			runtime.camera.aspect = width / height;
			runtime.renderer.setSize(
				Math.max(1, Math.round(width * density.effectiveDpr)),
				Math.max(1, Math.round(height * density.effectiveDpr))
			);
			publishViewportStats(runtime, density);
		};
		runtime.resizeViewport = resize;
		environment.addEventListener?.('resize', resize, { passive: true });
		resize();
		return resize;
	}


	__exports.installViewport = installViewport;
	/**
	 * Resolves a density contract whose adaptive floor can reduce expensive Retina work but can
	 * never undersample ordinary CSS pixels.
	 */
	function resolveViewportDensity(deviceDpr, profileMaximumDpr, requestedScale) {
		const availableDpr = Math.max(1, Number(deviceDpr) || 1);
		const maximumDpr = Math.max(1, Number(profileMaximumDpr) || 1);
		const cappedDpr = Math.min(availableDpr, maximumDpr);
		const minimumScale = Math.min(
			MAXIMUM_RENDER_SCALE,
			MINIMUM_EFFECTIVE_DPR / cappedDpr
		);
		const scale = clamp(
			Number(requestedScale) || DEFAULT_RENDER_SCALE,
			minimumScale,
			MAXIMUM_RENDER_SCALE
		);
		return {
			cappedDpr,
			effectiveDpr: cappedDpr * scale,
			minimumScale,
			scale
		};
	}


	__exports.resolveViewportDensity = resolveViewportDensity;
	function publishViewportStats(runtime, density) {
		const stats = runtime.terrain.stats;
		stats.renderDpr = density.effectiveDpr;
		stats.renderScale = density.scale;
		stats.renderScaleFloor = density.minimumScale;
		stats.renderPixels = [
			runtime.renderer.canvas.width,
			runtime.renderer.canvas.height
		];
	}

	function clamp(value, minimum, maximum) {
		return Math.max(minimum, Math.min(maximum, value));
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzWebGlBootFrame.js ----
{
	const __exports = __awtsmoosModule_178;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file EretzWebGlBootFrame.js
	 * @description Paints the first verified renderer frame through WebGL or Canvas2D fallback.
	 * The Awtsmoos first reveals clear light upon whichever finite vessel exists; Awtsmoos.com
	 * sizes the canvas, records backend evidence, and never lets missing GPU erase movement.
	 */

	const resolveViewportDensity = __awtsmoosModule_179.resolveViewportDensity;

	function paintEretzWebGlBootFrame(
		services,
		qualityProfile,
		environment = globalThis
	) {
		const renderer = services?.renderer;
		if (!renderer) throw new Error('Renderer foundation is unavailable.');
		const width = Math.max(
			1,
			Number(environment.innerWidth) || renderer.canvas.clientWidth || 1
		);
		const height = Math.max(
			1,
			Number(environment.innerHeight) || renderer.canvas.clientHeight || 1
		);
		const density = resolveViewportDensity(
			environment.devicePixelRatio,
			qualityProfile.maxDpr,
			1
		);
		const pixelWidth = Math.max(1, Math.round(width * density.effectiveDpr));
		const pixelHeight = Math.max(1, Math.round(height * density.effectiveDpr));
		services.camera.aspect = width / height;
		renderer.setSize(pixelWidth, pixelHeight);
		if (renderer.gl) paintWebGl(renderer);
		else renderer.render(services.scene, services.camera);
		const receipt = Object.freeze({
			backend: renderer.backend || (renderer.gl ? 'webgl' : 'unknown'),
			contextName: renderer.contextName || (renderer.gl ? 'webgl' : null),
			effectiveDpr: density.effectiveDpr,
			fallbackEvidence: renderer.fallbackEvidence || null,
			pixels: Object.freeze([pixelWidth, pixelHeight])
		});
		renderer.bootFrame = receipt;
		return receipt;
	}


	__exports.paintEretzWebGlBootFrame = paintEretzWebGlBootFrame;
	function paintWebGl(renderer) {
		const gl = renderer.gl;
		if (gl.isContextLost?.()) {
			throw new Error('WebGL context was lost before world startup.');
		}
		const color = renderer.clearColor || [0, 0, 0, 1];
		gl.clearColor(color[0], color[1], color[2], color[3]);
		gl.clearDepth?.(1);
		gl.enable?.(gl.DEPTH_TEST);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.flush?.();
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MitzvahWorldStartupMilestones.js ----
{
	const __exports = __awtsmoosModule_183;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldStartupMilestones.js
	 * @description Records one-shot monotonic startup milestones and adopts the compact launcher's scalar first-light seed.
	 * The Awtsmoos renews each instant beyond measure while Awtsmoos.com remembers the first revealed ray;
	 * deferred richness inherits that origin faithfully, so later clocks can deepen truth without rewriting the day.
	 */

	const LEDGERS_BY_ENVIRONMENT = new WeakMap();
	const SCRIPT_START_KEY = 'AwtsmoosMitzvahWorldScriptStart';

	/** Owns immutable first-observation timing for one runtime environment. */
	class MitzvahWorldStartupMilestones {
		constructor({ environment = globalThis, clock = resolveClock(environment) } = {}) {
			this.environment = objectEnvironment(environment);
			this.clock = clock;
			this.originMilliseconds = null;
			this.records = new Map();
			this.adoptCompactSeed();
		}

		/** Records a milestone once and republishes a frozen diagnostic snapshot. */
		mark(name) {
			const key = String(name || '').trim();
			if (!key) return null;
			const existing = this.records.get(key);
			if (existing) return existing;
			const atMilliseconds = finiteNow(this.clock());
			this.originMilliseconds ??= atMilliseconds;
			const record = Object.freeze({
				name: key,
				atMilliseconds,
				elapsedMilliseconds: Math.max(0, atMilliseconds - this.originMilliseconds)
			});
			this.records.set(key, record);
			this.publish();
			return record;
		}

		/** Returns a value snapshot suitable for browser automation and cold-load receipts. */
		snapshot() {
			return Object.freeze({
				originMilliseconds: this.originMilliseconds,
				milestones: Object.freeze(Object.fromEntries(this.records))
			});
		}

		publish() {
			const snapshot = this.snapshot();
			try {
				this.environment.AwtsmoosMitzvahWorldStartup = snapshot;
			} catch {}
			return snapshot;
		}

		/** Converts the first-control scalar into the richer immutable scriptStart record. */
		adoptCompactSeed() {
			const atMilliseconds = finiteOrNull(this.environment?.[SCRIPT_START_KEY]);
			if (atMilliseconds === null) return;
			this.originMilliseconds = atMilliseconds;
			this.records.set('scriptStart', Object.freeze({
				name: 'scriptStart',
				atMilliseconds,
				elapsedMilliseconds: 0
			}));
		}
	}


	__exports.MitzvahWorldStartupMilestones = MitzvahWorldStartupMilestones;
	/** Records one named startup milestone against the environment's shared ledger. */
	function markMitzvahWorldStartupMilestone(environment, name) {
		return startupMilestonesFor(environment).mark(name);
	}


	__exports.markMitzvahWorldStartupMilestone = markMitzvahWorldStartupMilestone;
	/** Returns the latest immutable startup receipt for one environment. */
	function getMitzvahWorldStartupSnapshot(environment = globalThis) {
		return startupMilestonesFor(environment).snapshot();
	}


	__exports.getMitzvahWorldStartupSnapshot = getMitzvahWorldStartupSnapshot;
	/** Resolves the shared ledger without creating parallel clocks for one browser environment. */
	function startupMilestonesFor(environment = globalThis) {
		const vessel = objectEnvironment(environment);
		let ledger = LEDGERS_BY_ENVIRONMENT.get(vessel);
		if (!ledger) {
			ledger = new MitzvahWorldStartupMilestones({ environment: vessel });
			LEDGERS_BY_ENVIRONMENT.set(vessel, ledger);
		}
		return ledger;
	}


	__exports.startupMilestonesFor = startupMilestonesFor;
	function objectEnvironment(environment) {
		return environment && (typeof environment === 'object' || typeof environment === 'function')
			? environment
			: globalThis;
	}

	function resolveClock(environment) {
		const performanceClock = environment?.performance;
		return typeof performanceClock?.now === 'function'
			? () => performanceClock.now()
			: () => Date.now();
	}

	function finiteOrNull(value) {
		return Number.isFinite(Number(value)) ? Number(value) : null;
	}

	function finiteNow(value) {
		return finiteOrNull(value) ?? 0;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/RuntimeLaunchProgress.js ----
{
	const __exports = __awtsmoosModule_184;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file RuntimeLaunchProgress.js
	 * @description Reports bounded world-entry truth, including the exact stage and URL whose vessel is currently being awaited.
	 * The Awtsmoos renews every threshold and every road in time; Awtsmoos.com names the doorway before crossing,
	 * so a stalled promise cannot become nameless darkness and each finite gate may reveal where its waiting began.
	 */

	function reportLaunchProgress(
		options,
		message,
		progress = null,
		evidence = {}
	) {
		options?.onProgress?.({
			message: String(message),
			progress: Number.isFinite(progress)
				? Math.max(0, Math.min(1, progress))
				: null,
			stage: evidence.stage ? String(evidence.stage) : undefined,
			url: evidence.url ? String(evidence.url) : undefined
		});
	}


	__exports.reportLaunchProgress = reportLaunchProgress;
	function throwIfLaunchAborted(signal) {
		if (!signal?.aborted) return;
		throw signal.reason instanceof Error
			? signal.reason
			: Object.assign(new Error('World entry was cancelled.'), {
				name: 'AbortError'
			});
	}


	__exports.throwIfLaunchAborted = throwIfLaunchAborted;
	function nextLaunchFrame(environment = globalThis, timeoutMs = 48) {
		return new Promise(resolve => {
			let settled = false;
			let timer = null;
			const schedule = environment.setTimeout?.bind(environment)
				|| globalThis.setTimeout?.bind(globalThis);
			const cancel = environment.clearTimeout?.bind(environment)
				|| globalThis.clearTimeout?.bind(globalThis);
			const finish = () => {
				if (settled) return;
				settled = true;
				if (timer !== null) cancel?.(timer);
				resolve();
			};
			if (typeof environment.requestAnimationFrame === 'function') {
				if (schedule) {
					timer = schedule(finish, Math.max(16, Number(timeoutMs) || 48));
				}
				environment.requestAnimationFrame(finish);
				return;
			}
			if (schedule) {
				timer = schedule(finish, 0);
				return;
			}
			finish();
		});
	}


	__exports.nextLaunchFrame = nextLaunchFrame;
	function nextLaunchTask(environment = globalThis) {
		if (typeof environment.scheduler?.yield === 'function') {
			return environment.scheduler.yield();
		}
		const schedule = environment.setTimeout?.bind(environment)
			|| globalThis.setTimeout?.bind(globalThis);
		return schedule
			? new Promise(resolve => schedule(resolve, 0))
			: Promise.resolve();
	}


	__exports.nextLaunchTask = nextLaunchTask;
	async function afterVisibleFrames(count = 2, environment = globalThis) {
		for (let index = 0; index < count; index += 1) {
			await nextLaunchFrame(environment);
		}
	}

	__exports.afterVisibleFrames = afterVisibleFrames;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzWorldFoundation.js ----
{
	const __exports = __awtsmoosModule_0;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file EretzWorldFoundation.js
	 * @description Builds first-play from one static CompactJS closure and reports the exact synchronous renderer boundary reached before the next browser turn.
	 * The Awtsmoos gathers renderer, traveler, and meadow into one bounded vessel before distant beauty descends;
	 * Awtsmoos.com names context, clear light, local traveler, and earth separately, so no fifteen-second night can hide which finite doorway held the traveler still.
	 */

	const createBootstrapWorldFoundation = __awtsmoosModule_1.createBootstrapWorldFoundation;
	const loadEretzEssentialAssets = __awtsmoosModule_28.loadEretzEssentialAssets;
	const createEretzFoundationServices = __awtsmoosModule_34.createEretzFoundationServices;
	const paintEretzWebGlBootFrame = __awtsmoosModule_178.paintEretzWebGlBootFrame;
	const markMitzvahWorldStartupMilestone = __awtsmoosModule_183.markMitzvahWorldStartupMilestone;
	const nextLaunchFrame = __awtsmoosModule_184.nextLaunchFrame;
	const reportLaunchProgress = __awtsmoosModule_184.reportLaunchProgress;
	const throwIfLaunchAborted = __awtsmoosModule_184.throwIfLaunchAborted;

	/** Creates the minimum visible world required for movement before optional remote enrichment. */
	async function createEretzWorldFoundation(hosts, options = {}) {
		const qualityProfile = options.qualityProfile;
		if (!qualityProfile) throw new Error('Eretz foundation requires a quality profile.');
		const environment = options.environment || globalThis;
		options.boot?.begin('webgl-context');
		reportFoundationStage(options, 'Opening compressed WebGL controls…', 0.08, 'foundation-renderer-services');
		const services = createEretzFoundationServices(hosts, qualityProfile, environment);
		reportFoundationStage(options, 'WebGL controls are alive…', 0.16, 'foundation-services-ready');
		const webGlBootFrame = paintEretzWebGlBootFrame(services, qualityProfile, environment);
		reportFoundationStage(options, 'First WebGL light is visible…', 0.24, 'foundation-first-clear');
		await nextLaunchFrame(environment);
		markMitzvahWorldStartupMilestone(environment, 'rendererReady');
		throwIfLaunchAborted(options.signal);
		options.boot?.begin('essential-assets');
		reportFoundationStage(options, 'Preparing the local traveler…', 0.42, 'essential-local-assets');
		const loaded = await loadEretzEssentialAssets({
			...options,
			boot: options.boot,
			environment,
			quality: qualityProfile.quality
		});
		throwIfLaunchAborted(options.signal);
		options.boot?.begin('bootstrap-visible-world');
		reportFoundationStage(options, 'Opening the playable meadow…', 0.74, 'bootstrap-visible-world');
		const world = createBootstrapWorldFoundation(services);
		markVisibleWorldReady(options);
		return {
			hosts,
			...hosts,
			...loaded,
			...services,
			...world,
			environment,
			qualityProfile,
			webGlBootFrame
		};
	}


	__exports.createEretzWorldFoundation = createEretzWorldFoundation;
	/** Reports a fine-grained stage while naming the one generated artifact currently executing it. */
	function reportFoundationStage(options, message, progress, stage) {
		reportLaunchProgress(options, message, progress, {
			stage,
			url: (( globalThis.location?.origin && globalThis.location.origin !== "null" ? globalThis.location.origin : "https://awtsmoos.local" ) + "/games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzWorldFoundation.js")
		});
	}

	/** Marks local playability without claiming remote visual enrichment is complete. */
	function markVisibleWorldReady(options) {
		options.boot?.progress?.(
			'bootstrap-visible-world',
			1,
			1,
			'Playable meadow and local traveler shell ready; rich visuals continue after movement.',
			'ready'
		);
	}

}

export const createEretzWorldFoundation = __awtsmoosModule_0.createEretzWorldFoundation;
