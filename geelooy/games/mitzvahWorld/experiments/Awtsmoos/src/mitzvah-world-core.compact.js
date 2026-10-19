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

const __awtsmoosModule_4 = Object.create(null);

const __awtsmoosModule_3 = Object.create(null);

const __awtsmoosModule_5 = Object.create(null);

const __awtsmoosModule_7 = Object.create(null);

const __awtsmoosModule_8 = Object.create(null);

const __awtsmoosModule_9 = Object.create(null);

const __awtsmoosModule_11 = Object.create(null);

const __awtsmoosModule_12 = Object.create(null);

const __awtsmoosModule_10 = Object.create(null);

const __awtsmoosModule_14 = Object.create(null);

const __awtsmoosModule_13 = Object.create(null);

const __awtsmoosModule_16 = Object.create(null);

const __awtsmoosModule_17 = Object.create(null);

const __awtsmoosModule_19 = Object.create(null);

const __awtsmoosModule_18 = Object.create(null);

const __awtsmoosModule_23 = Object.create(null);

const __awtsmoosModule_22 = Object.create(null);

const __awtsmoosModule_21 = Object.create(null);

const __awtsmoosModule_20 = Object.create(null);

const __awtsmoosModule_15 = Object.create(null);

const __awtsmoosModule_6 = Object.create(null);

const __awtsmoosModule_2 = Object.create(null);

const __awtsmoosModule_29 = Object.create(null);

const __awtsmoosModule_30 = Object.create(null);

const __awtsmoosModule_31 = Object.create(null);

const __awtsmoosModule_32 = Object.create(null);

const __awtsmoosModule_28 = Object.create(null);

const __awtsmoosModule_33 = Object.create(null);

const __awtsmoosModule_34 = Object.create(null);

const __awtsmoosModule_27 = Object.create(null);

const __awtsmoosModule_35 = Object.create(null);

const __awtsmoosModule_36 = Object.create(null);

const __awtsmoosModule_37 = Object.create(null);

const __awtsmoosModule_26 = Object.create(null);

const __awtsmoosModule_40 = Object.create(null);

const __awtsmoosModule_42 = Object.create(null);

const __awtsmoosModule_41 = Object.create(null);

const __awtsmoosModule_39 = Object.create(null);

const __awtsmoosModule_43 = Object.create(null);

const __awtsmoosModule_38 = Object.create(null);

const __awtsmoosModule_44 = Object.create(null);

const __awtsmoosModule_45 = Object.create(null);

const __awtsmoosModule_48 = Object.create(null);

const __awtsmoosModule_47 = Object.create(null);

const __awtsmoosModule_46 = Object.create(null);

const __awtsmoosModule_50 = Object.create(null);

const __awtsmoosModule_49 = Object.create(null);

const __awtsmoosModule_25 = Object.create(null);

const __awtsmoosModule_24 = Object.create(null);

const __awtsmoosModule_51 = Object.create(null);

const __awtsmoosModule_55 = Object.create(null);

const __awtsmoosModule_54 = Object.create(null);

const __awtsmoosModule_58 = Object.create(null);

const __awtsmoosModule_57 = Object.create(null);

const __awtsmoosModule_56 = Object.create(null);

const __awtsmoosModule_59 = Object.create(null);

const __awtsmoosModule_60 = Object.create(null);

const __awtsmoosModule_61 = Object.create(null);

const __awtsmoosModule_53 = Object.create(null);

const __awtsmoosModule_62 = Object.create(null);

const __awtsmoosModule_63 = Object.create(null);

const __awtsmoosModule_52 = Object.create(null);

const __awtsmoosModule_64 = Object.create(null);

const __awtsmoosModule_0 = Object.create(null);

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapEssentialMovementLoop.js ----
{
	const __exports = __awtsmoosModule_1;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapEssentialMovementLoop.js
	 * @description Keeps real collision-aware control and rendering alive between first-control certification and rich-loop hydration.
	 * The Awtsmoos gives each brief frame a truthful vessel before later rhythm learns its fuller song;
	 * Awtsmoos.com keeps the Chossid steerable and visible with one tiny clock, then yields that clock when richer cadence comes along.
	 */

	const MAX_DELTA_SECONDS = 0.05;

	/** Starts a tiny cancellable movement/render heartbeat around the already-proven controller. */
	function startBootstrapEssentialMovementLoop(runtime, movement, environment = globalThis) {
		let active = true;
		let pending = null;
		let lastTime = now(environment);
		const requestFrame = environment.requestAnimationFrame?.bind(environment);
		const cancelFrame = environment.cancelAnimationFrame?.bind(environment);
		const scheduleTimer = environment.setTimeout?.bind(environment) || setTimeout;
		const cancelTimer = environment.clearTimeout?.bind(environment) || clearTimeout;

		const frame = currentTime => {
			if (!active) return;
			const delta = Math.min(MAX_DELTA_SECONDS, Math.max(0.001, (currentTime - lastTime) / 1000));
			lastTime = currentTime;
			try {
				movement.update(delta);
				runtime.renderer.setInteractor(runtime.state, currentTime / 1000);
				runtime.renderer.render(runtime.scene, runtime.camera);
				runtime.bootstrapFrames += 1;
				runtime.lastFrameAt = currentTime;
				runtime.runtimeFrameSource = 'essential-control';
				runtime.lastFrameError = null;
			} catch (error) {
				runtime.lastFrameError = error?.stack || String(error);
			}
			schedule();
		};

		const schedule = () => {
			if (!active) return;
			pending = requestFrame ? requestFrame(frame) : scheduleTimer(() => frame(now(environment)), 16);
		};

		schedule();
		return Object.freeze({
			stop() {
				active = false;
				if (pending === null) return;
				if (requestFrame) cancelFrame?.(pending);
				else cancelTimer(pending);
				pending = null;
			},
			status: () => Object.freeze({ active, source: runtime.runtimeFrameSource })
		});
	}


	__exports.startBootstrapEssentialMovementLoop = startBootstrapEssentialMovementLoop;
	function now(environment) {
		return environment?.performance?.now?.() ?? Date.now();
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/movement/MovementVelocityMath.js ----
{
	const __exports = __awtsmoosModule_4;
	//B"H
	//Boruch Hashem
	//Blessed is He

	/**
	 * @file MovementVelocityMath.js
	 * @description Keeps reusable horizontal velocity arithmetic finite, bounded, and independent of heading.
	 * Gevurah gives the finite rate while Tiferes keeps every compass direction sharing one measured fate;
	 * the Awtsmoos renews each vector without diagonal excess, and Awtsmoos.com carries that honest motion law from world to world in grace.
	 */

	/**
	 * @description Converts arbitrary numeric movement input into a finite number.
	 * @param {*} value Candidate numeric value.
	 * @param {number} fallback Finite fallback used when conversion fails.
	 * @returns {number} Finite numeric value.
	 */
	function finiteMovementNumber(value, fallback = 0) {
		const numericValue = Number(value);

		return Number.isFinite(numericValue)
			? numericValue
			: fallback;
	}


	__exports.finiteMovementNumber = finiteMovementNumber;
	/**
	 * @description Resolves a strictly positive movement option or its positive fallback.
	 * @param {*} value Candidate positive numeric value.
	 * @param {number} fallback Positive fallback value.
	 * @returns {number} Strictly positive movement number.
	 */
	function positiveMovementNumber(value, fallback) {
		const resolved = finiteMovementNumber(value);

		return resolved > 0
			? resolved
			: fallback;
	}


	__exports.positiveMovementNumber = positiveMovementNumber;
	/**
	 * @description Clamps a movement control factor into the inclusive zero-to-one interval.
	 * @param {*} value Candidate control factor.
	 * @param {number} fallback Fallback control factor.
	 * @returns {number} Bounded control factor.
	 */
	function boundedMovementUnit(value, fallback) {
		const resolved = finiteMovementNumber(value, fallback);
		return Math.max(0, Math.min(1, resolved));
	}


	__exports.boundedMovementUnit = boundedMovementUnit;
	/**
	 * @description Moves a two-dimensional velocity toward its target using one Euclidean change budget.
	 * @param {{x?:number,z?:number}} current Current horizontal velocity.
	 * @param {{x?:number,z?:number}} target Desired horizontal velocity.
	 * @param {number} maximumChange Maximum allowed Euclidean velocity change.
	 * @returns {{x:number,z:number}} New velocity no farther than the requested change budget.
	 */
	function moveMovementVectorToward(current, target, maximumChange) {
		const currentX = finiteMovementNumber(current?.x);
		const currentZ = finiteMovementNumber(current?.z);
		const targetX = finiteMovementNumber(target?.x);
		const targetZ = finiteMovementNumber(target?.z);
		const differenceX = targetX - currentX;
		const differenceZ = targetZ - currentZ;
		const differenceLength = Math.hypot(differenceX, differenceZ);
		const boundedChange = Math.max(0, finiteMovementNumber(maximumChange));

		if (differenceLength === 0 || differenceLength <= boundedChange) {
			return {
				x: targetX,
				z: targetZ
			};
		}

		if (boundedChange === 0) {
			return {
				x: currentX,
				z: currentZ
			};
		}

		const changeRatio = boundedChange / differenceLength;
		return {
			x: currentX + differenceX * changeRatio,
			z: currentZ + differenceZ * changeRatio
		};
	}

	__exports.moveMovementVectorToward = moveMovementVectorToward;

}

// ---- libs/awtsmoos-procedural-core/src/core/movement/MovementVelocity.js ----
{
	const __exports = __awtsmoosModule_3;
	//B"H
	//Boruch Hashem
	//Blessed is He

	/**
	 * @file MovementVelocity.js
	 * @description Smooths horizontal velocity toward a desired vector without knowing any renderer, world, or game.
	 * Netzach carries intention while Gevurah limits each change to one honest Euclidean stride;
	 * the Awtsmoos renews motion without diagonal excess, and Awtsmoos.com lets many worlds share the same measured ride.
	 */

	const boundedMovementUnit = __awtsmoosModule_4.boundedMovementUnit;
	const finiteMovementNumber = __awtsmoosModule_4.finiteMovementNumber;
	const moveMovementVectorToward = __awtsmoosModule_4.moveMovementVectorToward;
	const positiveMovementNumber = __awtsmoosModule_4.positiveMovementNumber;

	/**
	 * @description Creates a fresh horizontal velocity record.
	 * @param {object} initial Optional initial vector.
	 * @returns {{x:number,z:number}} Finite horizontal velocity.
	 */
	function createMovementVelocity(initial = {}) {
		return {
			x: finiteMovementNumber(initial.x),
			z: finiteMovementNumber(initial.z)
		};
	}


	__exports.createMovementVelocity = createMovementVelocity;
	/**
	 * @description Advances horizontal velocity toward its target with one frame-rate-stable Euclidean change budget.
	 * @param {object} current Current velocity.
	 * @param {object} target Desired velocity.
	 * @param {number} deltaSeconds Frame duration in seconds.
	 * @param {object} options Acceleration, deceleration, grounded, airControl, and maxDeltaSeconds.
	 * @returns {{x:number,z:number}} New velocity record.
	 */
	function advanceMovementVelocity(current, target, deltaSeconds, options = {}) {
		const delta = Math.min(
			Math.max(0, finiteMovementNumber(deltaSeconds)),
			positiveMovementNumber(options.maxDeltaSeconds, 0.05)
		);
		const currentVector = createMovementVelocity(current);
		const targetVector = createMovementVelocity(target);
		const targetLength = Math.hypot(targetVector.x, targetVector.z);
		const currentLength = Math.hypot(currentVector.x, currentVector.z);
		const gainingSpeed = targetLength > currentLength + 0.0001;
		const baseRate = gainingSpeed
			? positiveMovementNumber(options.acceleration, 18)
			: positiveMovementNumber(options.deceleration, 24);
		const control = options.grounded === false
			? boundedMovementUnit(options.airControl, 0.48)
			: 1;
		const maximumChange = baseRate * control * delta;

		return moveMovementVectorToward(
			currentVector,
			targetVector,
			maximumChange
		);
	}


	__exports.advanceMovementVelocity = advanceMovementVelocity;
	/**
	 * @description Returns whether a velocity has meaningful horizontal magnitude.
	 * @param {object} velocity Horizontal velocity record.
	 * @param {number} epsilon Minimum meaningful magnitude.
	 * @returns {boolean} Whether the velocity is moving.
	 */
	function hasMovementVelocity(velocity, epsilon = 0.00001) {
		return Math.hypot(
			finiteMovementNumber(velocity?.x),
			finiteMovementNumber(velocity?.z)
		) > Math.max(0, finiteMovementNumber(epsilon));
	}

	__exports.hasMovementVelocity = hasMovementVelocity;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapMovementControllerSupport.js ----
{
	const __exports = __awtsmoosModule_5;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapMovementControllerSupport.js
	 * @description Owns movement action, yaw, and finite diagnostics outside frame orchestration.
	 * The Awtsmoos lets one journey produce many measured receipts; Awtsmoos.com keeps
	 * animation identity and snapshot formatting separate from collision and camera progression.
	 */

	function bootstrapMovementAction(state) {
		if (!state.grounded) return state.airPhase;
		if (!state.moving) return 'idle';
		return state.runMode ? 'run' : 'walk';
	}


	__exports.bootstrapMovementAction = bootstrapMovementAction;
	function setBootstrapMovementYaw(quaternion, yaw) {
		quaternion.set(
			0,
			Math.sin(yaw / 2),
			0,
			Math.cos(yaw / 2)
		);
	}


	__exports.setBootstrapMovementYaw = setBootstrapMovementYaw;
	function bootstrapMovementSnapshot(owner) {
		const mode = owner.lastIntent.movementMode || {};
		const state = owner.runtime.state;
		return {
			cameraMode: owner.lastIntent.cameraMode || 'bootstrap-rig',
			distance: owner.distance,
			effectiveMode: mode.effectiveMode || 'walk',
			frames: owner.frames,
			intent: owner.lastIntent,
			jumpsUsed: state.jumpsUsed,
			position: { x: state.x, y: state.y, z: state.z },
			runMode: state.runMode,
			selectedMode: mode.selectedMode || 'walk',
			travelFacing: state.travelFacing
		};
	}

	__exports.bootstrapMovementSnapshot = bootstrapMovementSnapshot;

}

// ---- libs/awtsmoos-procedural-core/src/core/movement/MovementIntent.js ----
{
	const __exports = __awtsmoosModule_7;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MovementIntent.js
	 * @description Normalizes renderer-free movement intentions into one bounded semantic record.
	 * The Awtsmoos renews every direction before the traveler chooses where to go;
	 * Awtsmoos.com keeps forward, strafe, and turn inside one clear vessel so every world may share the flow.
	 */

	/**
	 * Normalizes one movement axis record while preventing diagonal speed inflation.
	 * @param {object} axis Raw movement axes.
	 * @returns {{forward:number, strafe:number, turn:number}} Bounded semantic intent.
	 */
	function normalizeMovementIntent(axis = {}) {
		const forward = boundedAxis(axis.forward);
		const strafe = boundedAxis(axis.strafe);
		const length = Math.hypot(forward, strafe);
		const scale = length > 1 ? 1 / length : 1;

		return {
			forward: forward * scale,
			strafe: strafe * scale,
			turn: boundedAxis(axis.turn)
		};
	}


	__exports.normalizeMovementIntent = normalizeMovementIntent;
	/**
	 * Returns whether translational movement is materially requested.
	 * @param {object} intent Normalized or raw semantic intent.
	 * @param {number} epsilon Minimum meaningful magnitude.
	 * @returns {boolean} True when forward or strafe exceeds the threshold.
	 */
	function hasMovementIntent(intent = {}, epsilon = 0.00001) {
		return Math.hypot(finite(intent.forward), finite(intent.strafe)) > Math.max(0, epsilon);
	}


	__exports.hasMovementIntent = hasMovementIntent;
	/**
	 * Converts any finite numeric value into a -1..1 axis.
	 * @param {*} value Candidate numeric value.
	 * @returns {number} Bounded axis value.
	 */
	function boundedAxis(value) {
		return Math.max(-1, Math.min(1, finite(value)));
	}


	__exports.boundedAxis = boundedAxis;
	function finite(value) {
		return Number.isFinite(Number(value)) ? Number(value) : 0;
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/movement/MovementStep.js ----
{
	const __exports = __awtsmoosModule_8;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MovementStep.js
	 * @description Converts semantic movement intent into renderer-neutral world vectors and bounded steps.
	 * The Awtsmoos recreates every basis before distance is measured in space;
	 * Awtsmoos.com keeps actor-facing and camera-facing motion under one lawful interface of grace.
	 */

	/**
	 * Creates a horizontal basis from an actor-facing yaw.
	 * @param {number} facing Facing angle in radians.
	 * @returns {{forward:{x:number,z:number}, right:{x:number,z:number}}} Horizontal basis.
	 */
	function actorMovementBasis(facing = 0) {
		const forward = {
			x: Math.sin(finite(facing)),
			z: Math.cos(finite(facing))
		};

		return {
			forward,
			right: { x: forward.z, z: -forward.x }
		};
	}


	__exports.actorMovementBasis = actorMovementBasis;
	/**
	 * Creates a horizontal basis from a camera target and position, falling back to actor yaw.
	 * @param {object} camera Camera-like record.
	 * @param {number} fallbackFacing Fallback actor yaw.
	 * @returns {{forward:{x:number,z:number}, right:{x:number,z:number}}} Camera-relative basis.
	 */
	function cameraMovementBasis(camera, fallbackFacing = 0) {
		const target = camera?.target;
		const targetX = Array.isArray(target) ? target[0] : target?.x;
		const targetZ = Array.isArray(target) ? target[2] : target?.z;
		const dx = finite(targetX) - finite(camera?.position?.x);
		const dz = finite(targetZ) - finite(camera?.position?.z);
		const length = Math.hypot(dx, dz);
		const forward = length > 0.0001
			? { x: dx / length, z: dz / length }
			: actorMovementBasis(fallbackFacing).forward;

		return {
			forward,
			right: { x: -forward.z, z: forward.x }
		};
	}


	__exports.cameraMovementBasis = cameraMovementBasis;
	/**
	 * Converts intent plus a horizontal basis into a velocity-like vector of the requested magnitude.
	 * @param {object} basis Horizontal forward/right basis.
	 * @param {object} intent Normalized movement intent.
	 * @param {number} magnitude Desired units per second or units per step.
	 * @returns {{x:number,z:number}} Horizontal vector.
	 */
	function movementVectorFromBasis(basis, intent = {}, magnitude = 0) {
		const amount = Math.max(0, finite(magnitude));
		return {
			x: (finite(basis?.forward?.x) * finite(intent.forward)
				+ finite(basis?.right?.x) * finite(intent.strafe)) * amount,
			z: (finite(basis?.forward?.z) * finite(intent.forward)
				+ finite(basis?.right?.z) * finite(intent.strafe)) * amount
		};
	}


	__exports.movementVectorFromBasis = movementVectorFromBasis;
	/** Combines movement vectors without letting stacked input sources exceed the strongest source. */
	function combineMovementVectors(...vectors) {
		const total = vectors.reduce((sum, vector) => ({
			x: sum.x + finite(vector?.x),
			z: sum.z + finite(vector?.z)
		}), { x: 0, z: 0 });
		const limit = Math.max(0, ...vectors.map(vector => Math.hypot(finite(vector?.x), finite(vector?.z))));
		const length = Math.hypot(total.x, total.z);

		if (limit > 0 && length > limit) {
			const scale = limit / length;
			return { x: total.x * scale, z: total.z * scale };
		}

		return total;
	}


	__exports.combineMovementVectors = combineMovementVectors;
	/** Converts a horizontal velocity into a collision-ready displacement step. */
	function movementStepFromVelocity(velocity, deltaSeconds) {
		const delta = Math.max(0, finite(deltaSeconds));
		return { x: finite(velocity?.x) * delta, y: 0, z: finite(velocity?.z) * delta };
	}


	__exports.movementStepFromVelocity = movementStepFromVelocity;
	/** Returns travel-facing yaw from a horizontal vector. */
	function movementVectorFacing(vector, fallbackFacing = 0) {
		return Math.hypot(finite(vector?.x), finite(vector?.z)) > 0.00001
			? Math.atan2(finite(vector?.x), finite(vector?.z))
			: finite(fallbackFacing);
	}


	__exports.movementVectorFacing = movementVectorFacing;
	function finite(value) {
		return Number.isFinite(Number(value)) ? Number(value) : 0;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapInputAxis.js ----
{
	const __exports = __awtsmoosModule_9;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapInputAxis.js
	 * @description Joins every bootstrap joystick source into one bounded canonical movement axis without erasing intent.
	 * The Awtsmoos gathers many streams without making one vessel deny another's flow;
	 * Awtsmoos.com lets keyboard, tests, gamepads, and the floating thumb all point where the traveler should go.
	 */

	/**
	 * Creates the canonical bootstrap movement axis without mutating any input source.
	 * @param {object} runtime Immediate Mitzvah World runtime.
	 * @returns {object} Keyboard, pointer, and merged joystick movement values.
	 */
	function bootstrapInputAxis(runtime) {
		const baseAxis = runtime.input?.axis?.() || {};
		const baseVector = baseJoystickVector(baseAxis);
		const touchVector = touchJoystickVector(runtime.joystick?.vector);
		const joystick = normalizedSum(baseVector, touchVector);
		return {
			...baseAxis,
			joystickForward: canonicalZero(-joystick.y),
			joystickMagnitude: canonicalZero(Math.min(1, Math.hypot(joystick.x, joystick.y))),
			joystickStrafe: canonicalZero(joystick.x),
			joystickX: canonicalZero(joystick.x),
			joystickY: canonicalZero(joystick.y)
		};
	}


	__exports.bootstrapInputAxis = bootstrapInputAxis;
	/** Preserves joystick values already published by the canonical input axis. */
	function baseJoystickVector(axis) {
		return {
			x: finiteAxis(axis.joystickX ?? axis.joystickStrafe),
			y: finiteAxis(axis.joystickY ?? -finiteAxis(axis.joystickForward))
		};
	}

	/** Reads the floating touch joystick when the immediate runtime owns one. */
	function touchJoystickVector(vector = {}) {
		return {
			x: finiteAxis(vector.x),
			y: finiteAxis(vector.y)
		};
	}

	/** Adds compatible joystick vessels and keeps diagonals inside the unit circle. */
	function normalizedSum(first, second) {
		const x = first.x + second.x;
		const y = first.y + second.y;
		const magnitude = Math.hypot(x, y);
		if (magnitude <= 1 || magnitude === 0) {
			return { x, y };
		}
		return {
			x: x / magnitude,
			y: y / magnitude
		};
	}

	/** Keeps malformed input from leaking NaN or infinity into movement. */
	function finiteAxis(value) {
		const numeric = Number(value);
		if (!Number.isFinite(numeric)) {
			return 0;
		}
		return Math.max(-1, Math.min(1, numeric));
	}

	/** Removes signed zero so public movement state has one stable representation of rest. */
	function canonicalZero(value) {
		return Object.is(value, -0) ? 0 : value;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapMovementPace.js ----
{
	const __exports = __awtsmoosModule_11;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapMovementPace.js
	 * @description Resolves walk, run, Kavanah preparation pace, and retained travel-facing policy.
	 * The Awtsmoos lets intention carry weight without turning deliberate prayer into immobility;
	 * Awtsmoos.com composes mode, reward tradeoff, strafing, camera lock, and facing law explicitly.
	 */

	const RUN_SPEED = 7.2;
	const WALK_SPEED = 4.2;

	function bootstrapMovementSpeed(runtime, movementMode) {
		const base = movementMode.effectiveMode === 'run'
			? RUN_SPEED
			: WALK_SPEED;
		if (!runtime.combat?.kavanah?.active) return base;
		const multiplier = Math.max(
			0.45,
			Math.min(
				1,
				Number(runtime.playerStats?.kavanahMovementMultiplier || 1)
			)
		);
		return base * multiplier;
	}


	__exports.bootstrapMovementSpeed = bootstrapMovementSpeed;
	function bootstrapTravelFacingLocked(runtime, keyboard) {
		if (runtime.cameraRig?.locksPlayerFacing?.()) return true;
		return Math.abs(keyboard.strafe) > 0.001
			&& Math.abs(keyboard.forward) < 0.001;
	}

	__exports.bootstrapTravelFacingLocked = bootstrapTravelFacingLocked;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowTravelFacingPolicy.js ----
{
	const __exports = __awtsmoosModule_12;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MinimalMeadowTravelFacingPolicy.js
	 * @description Retains the last meaningful travel orientation across zero-input release frames.
	 * The Awtsmoos gives each journey a remembered direction; Awtsmoos.com refuses to turn
	 * the visible traveler merely because a finite thumb has lifted from the joystick.
	 */

	const MOVEMENT_EPSILON = 0.0001;

	function retainedMinimalMeadowTravelFacing(
		step,
		currentTravelFacing,
		fallbackFacing
	) {
		const distance = Math.hypot(Number(step?.x) || 0, Number(step?.z) || 0);
		if (distance > MOVEMENT_EPSILON) {
			return Math.atan2(step.x, step.z);
		}
		if (Number.isFinite(currentTravelFacing)) {
			return currentTravelFacing;
		}
		return Number.isFinite(fallbackFacing) ? fallbackFacing : 0;
	}


	__exports.retainedMinimalMeadowTravelFacing = retainedMinimalMeadowTravelFacing;
	function isMinimalMeadowMovementStep(step) {
		return Math.hypot(Number(step?.x) || 0, Number(step?.z) || 0) > MOVEMENT_EPSILON;
	}

	__exports.isMinimalMeadowMovementStep = isMinimalMeadowMovementStep;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapMovementFacing.js ----
{
	const __exports = __awtsmoosModule_10;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapMovementFacing.js
	 * @description Makes visible player facing authoritative across bootstrap movement and canonical animation presentation.
	 * The Awtsmoos joins the path beneath the feet with the face of the traveler in one light;
	 * Awtsmoos.com keeps travel memory and rendered heading united so a later presentation cannot undo what movement made right.
	 */

	const bootstrapMovementAction = __awtsmoosModule_5.bootstrapMovementAction;
	const bootstrapTravelFacingLocked = __awtsmoosModule_11.bootstrapTravelFacingLocked;
	const isMinimalMeadowMovementStep = __awtsmoosModule_12.isMinimalMeadowMovementStep;
	const retainedMinimalMeadowTravelFacing = __awtsmoosModule_12.retainedMinimalMeadowTravelFacing;

	/**
	 * Settles movement state and promotes unlocked travel direction into the canonical visible facing.
	 * @param {object} runtime Active bootstrap runtime.
	 * @param {object} state Canonical player state shared with animation presentation.
	 * @param {object} keyboard Normalized keyboard intent used by the existing facing-lock law.
	 * @param {{x:number,z:number}} step Settled world-space movement step.
	 * @returns {{locked:boolean,moving:boolean,travelFacing:number}} Facing receipt for diagnostics and tests.
	 */
	function settleBootstrapMovementFacing(runtime, state, keyboard, step) {
		const locked = bootstrapTravelFacingLocked(runtime, keyboard);
		state.moving = isMinimalMeadowMovementStep(step);
		state.travelFacing = locked
			? state.facing
			: retainedMinimalMeadowTravelFacing(
				step,
				state.travelFacing,
				state.facing
			);
		if (!locked && state.moving) {
			state.facing = state.travelFacing;
		}
		state.action = bootstrapMovementAction(state);
		return {
			locked,
			moving: state.moving,
			travelFacing: state.travelFacing
		};
	}

	__exports.settleBootstrapMovementFacing = settleBootstrapMovementFacing;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MitzvahMovementProfile.js ----
{
	const __exports = __awtsmoosModule_14;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahMovementProfile.js
	 * @description Keeps Mitzvah World's authored control feel as data while Procedural Core owns reusable movement law.
	 * Chesed grants a generous edge-jump window while Gevurah sharpens stopping and turning into a responsive stride;
	 * the Awtsmoos recreates each footfall before momentum can arise, and Awtsmoos.com keeps this story's taste outside shared physics.
	 */

	const MITZVAH_MOVEMENT_PROFILE = Object.freeze({
		airControl: 0.6,
		coyoteSeconds: 0.12,
		deceleration: 48,
		gravity: 21,
		jumpBufferSeconds: 0.14,
		jumpSpeeds: Object.freeze([9.2, 8.1]),
		landingClearance: 0.035,
		maxDeltaSeconds: 0.05,
		runAcceleration: 46,
		turnSpeed: 2.8,
		walkAcceleration: 38
	});

	__exports.MITZVAH_MOVEMENT_PROFILE = MITZVAH_MOVEMENT_PROFILE;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapMovementVelocity.js ----
{
	const __exports = __awtsmoosModule_13;
	//B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapMovementVelocity.js
	 * @description Builds one movement velocity target from focused shared basis law while keeping game-specific acceleration feel local.
	 * Chochmah gathers intent, Binah resolves actor and camera direction once, and Gevurah shapes acceleration into a responsive stride;
	 * the Awtsmoos recreates direction before any vector is born, and Awtsmoos.com keeps first play narrow while universal motion is carried on.
	 */

	const actorMovementBasis = __awtsmoosModule_8.actorMovementBasis;
	const cameraMovementBasis = __awtsmoosModule_8.cameraMovementBasis;
	const combineMovementVectors = __awtsmoosModule_8.combineMovementVectors;
	const movementVectorFromBasis = __awtsmoosModule_8.movementVectorFromBasis;
	const MITZVAH_MOVEMENT_PROFILE = __awtsmoosModule_14.MITZVAH_MOVEMENT_PROFILE;

	/**
	 * Builds the desired horizontal velocity while calculating the camera basis only once.
	 * @param {object} runtime Active game runtime.
	 * @param {object} state Canonical player state.
	 * @param {object} keyboard Normalized actor-relative input.
	 * @param {object} joystick Normalized camera-relative joystick input.
	 * @param {object} mouse Normalized camera-relative mouse input.
	 * @param {number} speed Authored movement speed.
	 * @returns {{x:number,z:number}} Desired horizontal velocity.
	 */
	function bootstrapDesiredVelocity(
		runtime,
		state,
		keyboard,
		joystick,
		mouse,
		speed
	) {
		const actorBasis = actorMovementBasis(state.facing);
		const cameraBasis = cameraMovementBasis(
			runtime.camera,
			state.facing
		);
		return combineMovementVectors(
			movementVectorFromBasis(actorBasis, keyboard, speed),
			movementVectorFromBasis(cameraBasis, joystick, speed),
			movementVectorFromBasis(cameraBasis, mouse, speed)
		);
	}


	__exports.bootstrapDesiredVelocity = bootstrapDesiredVelocity;
	/** @returns {object} Game-authored acceleration options consumed by shared Core velocity law. */
	function bootstrapVelocityOptions(state) {
		// Obstacle courses (Stream 3): the course engine publishes per-surface
		// friction on the player (ice slides, grass grips). Absent, grip is 1.
		const friction = state.courseFriction;
		const accelScale = Number.isFinite(friction?.accelScale) ? friction.accelScale : 1;
		const decelScale = Number.isFinite(friction?.decelScale) ? friction.decelScale : 1;
		return {
			acceleration: (state.runMode
				? MITZVAH_MOVEMENT_PROFILE.runAcceleration
				: MITZVAH_MOVEMENT_PROFILE.walkAcceleration) * accelScale,
			airControl: MITZVAH_MOVEMENT_PROFILE.airControl,
			deceleration: MITZVAH_MOVEMENT_PROFILE.deceleration * decelScale,
			grounded: state.grounded !== false,
			maxDeltaSeconds: MITZVAH_MOVEMENT_PROFILE.maxDeltaSeconds
		};
	}

	__exports.bootstrapVelocityOptions = bootstrapVelocityOptions;

}

// ---- libs/awtsmoos-procedural-core/src/core/movement/VerticalKinematics.js ----
{
	const __exports = __awtsmoosModule_16;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file VerticalKinematics.js
	 * @description Supplies game-neutral vertical launch, gravity, airborne integration, and landing transitions.
	 * The Awtsmoos renews ascent and descent from the same source beyond above and below;
	 * Awtsmoos.com keeps the arithmetic pure so each game may choose its own jump story while sharing one physical flow.
	 */

	/**
	 * Captures the current finite vertical position before a frame advances.
	 * @param {object} state Mutable body state.
	 * @returns {number} Captured previous height.
	 */
	function captureVerticalPosition(state) {
		const previous = finite(state.renderY, state.y);
		state.previousRenderY = previous;
		return previous;
	}


	__exports.captureVerticalPosition = captureVerticalPosition;
	/**
	 * Launches a body upward without deciding whether the game permits the jump.
	 * @param {object} state Mutable body state.
	 * @param {number} speed Positive launch speed.
	 * @param {string} phase Game-facing airborne phase label.
	 * @returns {object} Mutated body state.
	 */
	function launchVerticalMotion(state, speed, phase = 'rising') {
		state.grounded = false;
		state.velY = Math.max(0, finite(speed));
		state.airPhase = phase;
		return state;
	}


	__exports.launchVerticalMotion = launchVerticalMotion;
	/**
	 * Integrates gravity and vertical position for one bounded frame.
	 * @param {object} state Mutable body state.
	 * @param {number} deltaSeconds Frame duration in seconds.
	 * @param {number} gravity Positive downward acceleration.
	 * @returns {object} Mutated body state.
	 */
	function integrateVerticalMotion(state, deltaSeconds, gravity = 21) {
		if (state.grounded) {
			return state;
		}
		const delta = Math.min(Math.max(0, finite(deltaSeconds)), 0.1);
		state.velY = finite(state.velY) - Math.max(0, finite(gravity)) * delta;
		state.renderY = finite(state.renderY, state.y) + state.velY * delta;
		state.y = state.renderY;
		if (state.velY < 0) {
			state.airPhase = 'falling';
		}
		return state;
	}


	__exports.integrateVerticalMotion = integrateVerticalMotion;
	/**
	 * Lands a body on an authoritative finite ground height.
	 * @param {object} state Mutable body state.
	 * @param {number} groundY Authoritative ground height.
	 * @returns {object} Mutated grounded state.
	 */
	function landVerticalMotion(state, groundY) {
		const ground = finite(groundY);
		state.renderY = ground;
		state.y = ground;
		state.groundY = ground;
		state.velY = 0;
		state.grounded = true;
		state.airPhase = 'ground';
		return state;
	}


	__exports.landVerticalMotion = landVerticalMotion;
	/** Returns whether the body remains clearly above its authoritative ground. */
	function isBodyAboveGround(state, groundY, clearance = 0.035) {
		return !state.grounded
			&& finite(state.renderY, state.y) > finite(groundY) + Math.max(0, finite(clearance));
	}


	__exports.isBodyAboveGround = isBodyAboveGround;
	function finite(primary, fallback = 0) {
		if (Number.isFinite(Number(primary))) {
			return Number(primary);
		}
		return Number.isFinite(Number(fallback)) ? Number(fallback) : 0;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowGroundSupport.js ----
{
	const __exports = __awtsmoosModule_17;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MinimalMeadowGroundSupport.js
	 * @description Resolves terrain and all exact house supports through one vertical authority.
	 * The Awtsmoos sustains meadow, threshold, room, tread, and landing without confusion;
	 * Awtsmoos.com always prefers a valid interior floor above terrain and records its source.
	 */

	function minimalMeadowGroundHeight(
		runtime, x, z, currentY, previousY = currentY
	) {
		return minimalMeadowGroundReceipt(runtime, x, z, currentY, previousY).height;
	}


	__exports.minimalMeadowGroundHeight = minimalMeadowGroundHeight;
	function minimalMeadowGroundReceipt(
		runtime, x, z, currentY, previousY = currentY
	) {
		const terrain = Number(runtime.terrain?.heightAt?.(x, z)) || 0;
		const support = runtime.houses?.supportReceiptAt?.(
			x, z, currentY, previousY
		) || legacySupport(runtime, x, z, currentY);
		const supported = Number.isFinite(support?.height) && support.height >= terrain;
		const baseHeight = supported ? support.height : terrain;
		// Obstacle courses (Stream 3): a mounted course engine may contribute a
		// platform or moving platform as the authoritative ground. It only speaks
		// inside its own region and never snaps a player up through a platform.
		const course = runtime.courseEngine?.groundReceipt?.(x, z, currentY, previousY);
		if (course && Number.isFinite(course.height) && course.height >= baseHeight - 0.001) {
			return {
				height: course.height,
				profileId: course.profileId || null,
				source: course.kind || 'course',
				support: course.height,
				terrain
			};
		}
		return {
			height: baseHeight,
			profileId: supported ? support.profileId : null,
			source: supported ? support.kind : 'terrain',
			support: supported ? support.height : null,
			terrain
		};
	}


	__exports.minimalMeadowGroundReceipt = minimalMeadowGroundReceipt;
	function legacySupport(runtime, x, z, currentY) {
		const height = runtime.houses?.stairHeightAt?.(x, z, currentY);
		return Number.isFinite(height)
			? { height, kind: 'discrete-stair-tread', profileId: null }
			: null;
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/movement/JumpWindowState.js ----
{
	const __exports = __awtsmoosModule_19;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file JumpWindowState.js
	 * @description Tracks renderer-free jump buffering and coyote grace without owning any game's jump count or event policy.
	 * The Awtsmoos renews the instant before and after the foot leaves ground;
	 * Awtsmoos.com preserves a merciful window so human intention is heard even when frames do not perfectly align around.
	 */

	/**
	 * Creates a fresh jump-window state.
	 * @returns {{bufferRemaining:number,coyoteRemaining:number}} Empty jump windows.
	 */
	function createJumpWindowState() {
		return {
			bufferRemaining: 0,
			coyoteRemaining: 0
		};
	}


	__exports.createJumpWindowState = createJumpWindowState;
	/**
	 * Advances buffered-jump and coyote timers for one frame.
	 * @param {object} current Existing window state.
	 * @param {object} options Frame and contact options.
	 * @returns {{bufferRemaining:number,coyoteRemaining:number}} New window state.
	 */
	function advanceJumpWindowState(current = {}, options = {}) {
		const delta = Math.min(Math.max(0, finite(options.deltaSeconds)), 0.1);
		const bufferSeconds = positive(options.bufferSeconds, 0.12);
		const coyoteSeconds = positive(options.coyoteSeconds, 0.1);
		const bufferRemaining = options.jumpPressed
			? bufferSeconds
			: countdown(current.bufferRemaining, delta);
		const coyoteRemaining = options.grounded
			? coyoteSeconds
			: countdown(current.coyoteRemaining, delta);

		return {
			bufferRemaining,
			coyoteRemaining
		};
	}


	__exports.advanceJumpWindowState = advanceJumpWindowState;
	/** Returns whether a buffered jump request is currently waiting. */
	function hasBufferedJump(windowState = {}) {
		return finite(windowState.bufferRemaining) > 0;
	}


	__exports.hasBufferedJump = hasBufferedJump;
	/** Returns whether ground grace still allows a first jump. */
	function hasCoyoteGrace(windowState = {}) {
		return finite(windowState.coyoteRemaining) > 0;
	}


	__exports.hasCoyoteGrace = hasCoyoteGrace;
	/** Clears only the buffered request after a game accepts a launch. */
	function consumeBufferedJump(windowState = {}) {
		return {
			bufferRemaining: 0,
			coyoteRemaining: Math.max(0, finite(windowState.coyoteRemaining))
		};
	}


	__exports.consumeBufferedJump = consumeBufferedJump;
	function countdown(value, delta) {
		return Math.max(0, finite(value) - delta);
	}

	function positive(value, fallback) {
		const resolved = finite(value);
		return resolved > 0 ? resolved : fallback;
	}

	function finite(value) {
		return Number.isFinite(Number(value)) ? Number(value) : 0;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MitzvahJumpPolicy.js ----
{
	const __exports = __awtsmoosModule_18;
	//B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahJumpPolicy.js
	 * @description Applies Mitzvah World's two-jump policy over focused shared buffering, coyote grace, gravity, and landing laws.
	 * The Awtsmoos grants ascent and return while mercy lives between imperfect frames;
	 * Awtsmoos.com keeps double-jump meaning in the game while narrow canonical kinematics carry universal names.
	 */

	const advanceJumpWindowState = __awtsmoosModule_19.advanceJumpWindowState;
	const consumeBufferedJump = __awtsmoosModule_19.consumeBufferedJump;
	const hasBufferedJump = __awtsmoosModule_19.hasBufferedJump;
	const hasCoyoteGrace = __awtsmoosModule_19.hasCoyoteGrace;
	const captureVerticalPosition = __awtsmoosModule_16.captureVerticalPosition;
	const integrateVerticalMotion = __awtsmoosModule_16.integrateVerticalMotion;
	const isBodyAboveGround = __awtsmoosModule_16.isBodyAboveGround;
	const landVerticalMotion = __awtsmoosModule_16.landVerticalMotion;
	const launchVerticalMotion = __awtsmoosModule_16.launchVerticalMotion;
	const minimalMeadowGroundHeight = __awtsmoosModule_17.minimalMeadowGroundHeight;
	const MITZVAH_MOVEMENT_PROFILE = __awtsmoosModule_14.MITZVAH_MOVEMENT_PROFILE;

	function prepareMitzvahVertical(runtime, state, deltaSeconds) {
		captureVerticalPosition(state);
		const ground = groundHeight(runtime, state);
		state.jumpWindow = advanceJumpWindowState(state.jumpWindow, {
			bufferSeconds: MITZVAH_MOVEMENT_PROFILE.jumpBufferSeconds,
			coyoteSeconds: MITZVAH_MOVEMENT_PROFILE.coyoteSeconds,
			deltaSeconds,
			grounded: state.grounded,
			jumpPressed: Boolean(runtime.input.consumeJump())
		});
		if (hasBufferedJump(state.jumpWindow) && canLaunch(state)) {
			beginJump(runtime, state);
		}
		if (state.grounded) {
			landVerticalMotion(state, ground);
			return;
		}
		integrateVerticalMotion(state, deltaSeconds, MITZVAH_MOVEMENT_PROFILE.gravity);
	}


	__exports.prepareMitzvahVertical = prepareMitzvahVertical;
	function finishMitzvahVertical(runtime, state) {
		const ground = groundHeight(runtime, state);
		state.groundY = ground;
		if (isBodyAboveGround(state, ground, MITZVAH_MOVEMENT_PROFILE.landingClearance)) {
			state.y = state.renderY;
			return;
		}
		landVerticalMotion(state, ground);
		state.jumpsUsed = 0;
	}


	__exports.finishMitzvahVertical = finishMitzvahVertical;
	function canLaunch(state) {
		const used = Number(state.jumpsUsed) || 0;
		if (state.grounded) {
			return true;
		}
		if (used === 0) {
			return hasCoyoteGrace(state.jumpWindow);
		}
		return used === 1;
	}

	function beginJump(runtime, state) {
		if (state.grounded) {
			state.jumpsUsed = 0;
		}
		state.jumpsUsed = Math.min(2, (Number(state.jumpsUsed) || 0) + 1);
		const speed = MITZVAH_MOVEMENT_PROFILE.jumpSpeeds[state.jumpsUsed - 1];
		const phase = state.jumpsUsed === 1 ? 'jump-one' : 'jump-two';
		launchVerticalMotion(state, speed, phase);
		state.jumpWindow = consumeBufferedJump(state.jumpWindow);
		runtime.bus?.emit('player:jump', { jump: state.jumpsUsed, speed });
	}

	function groundHeight(runtime, state) {
		return minimalMeadowGroundHeight(runtime, state.x, state.z, state.renderY, state.previousRenderY);
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/math/Vec3.js ----
{
	const __exports = __awtsmoosModule_23;
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
	const __exports = __awtsmoosModule_22;
	// B"H // Boruch Hashem // Blessed is He

	/**
	 * @file Ray.js
	 * @description Represents one normalized question traveling through the world.
	 * The Awtsmoos sends a line from origin toward revelation; Awtsmoos.com lets
	 * distance become a clear point without borrowing an outside geometry engine.
	 */
	const Vec3 = __awtsmoosModule_23.Vec3;

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
	const __exports = __awtsmoosModule_21;
	// B"H
	const Ray = __awtsmoosModule_22.Ray;

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

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MitzvahMovementSupport.js ----
{
	const __exports = __awtsmoosModule_20;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahMovementSupport.js
	 * @description Owns Mitzvah-specific input mapping, run policy, and bootstrap camera composition using the same orbit mathematics the gesture controller already mutates.
	 * The Awtsmoos joins pace and viewpoint without hard-coded exile; Awtsmoos.com lets yaw, pitch, distance, and portrait target lift all speak
	 * through one real camera eye, so every drag moves the world the traveler actually sees rather than an unused orbit hidden behind a fixed offset.
	 */

	const desiredCameraEye = __awtsmoosModule_21.desiredCameraEye;

	function movementAxes(axis = {}) {
		return {
			joystick: {
				forward: numberFrom(axis.joystickForward, negate(axis.joystickY)),
				strafe: numberFrom(axis.joystickStrafe, axis.joystickX)
			},
			keyboard: {
				forward: numberFrom(axis.forward, negate(axis.y)),
				strafe: numberFrom(axis.strafe, axis.x),
				turn: numberFrom(axis.turn, 0)
			}
		};
	}


	__exports.movementAxes = movementAxes;
	function movementModeFor(runtime) {
		const selectedMode = runtime.runToggle ? 'run' : 'walk';
		const shiftOverride = Boolean(
			runtime.input?.runRequested?.()
			|| runtime.input?.keys?.has?.('ShiftLeft')
			|| runtime.input?.keys?.has?.('ShiftRight')
		);
		return {
			effectiveMode: selectedMode === 'run' || shiftOverride ? 'run' : 'walk',
			selectedMode,
			shiftOverride
		};
	}


	__exports.movementModeFor = movementModeFor;
	/** Updates the active rich camera rig or projects the bootstrap orbit around the visible traveler. */
	function updateMovementCamera(runtime, state, deltaSeconds) {
		if (runtime.cameraRig?.update) {
			runtime.cameraRig.update(runtime.camera, state, runtime.mainOctree, deltaSeconds);
			return 'rich-rig';
		}
		const playerY = Number(state.renderY) || 0;
		const orbit = runtime.orbit || {};
		const target = {
			x: state.x,
			y: playerY + finite(orbit.viewportTargetLift, 1.2),
			z: state.z
		};
		const eye = desiredCameraEye(
			target,
			finite(orbit.yaw, Math.PI),
			finite(orbit.pitch, 0.34),
			finite(orbit.distance, 7)
		);
		runtime.camera?.position?.set?.(eye.x, eye.y, eye.z);
		if (runtime.camera) runtime.camera.target = [target.x, target.y, target.z];
		return 'bootstrap-rig';
	}


	__exports.updateMovementCamera = updateMovementCamera;
	function finite(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}

	function numberFrom(primary, fallback) {
		return Number.isFinite(Number(primary)) ? Number(primary) : Number(fallback) || 0;
	}

	function negate(value) {
		return -numberFrom(value, 0);
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MitzvahMovementRuntime.js ----
{
	const __exports = __awtsmoosModule_15;
	//B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahMovementRuntime.js
	 * @description Bridges shared movement law to Mitzvah terrain, collision, checkpoints, camera, and recovery through focused kinematic authority.
	 * The Awtsmoos recreates every floor beneath the traveler while shared law and world policy remain distinct;
	 * Awtsmoos.com keeps this adapter small so collision truth stays local and first play awakens only the motion law it has picked.
	 */

	const landVerticalMotion = __awtsmoosModule_16.landVerticalMotion;
	const minimalMeadowGroundHeight = __awtsmoosModule_17.minimalMeadowGroundHeight;
	const finishMitzvahVertical = __awtsmoosModule_18.finishMitzvahVertical;
	const prepareMitzvahVertical = __awtsmoosModule_18.prepareMitzvahVertical;

	__exports.movementAxes = __awtsmoosModule_20.movementAxes;
	__exports.movementModeFor = __awtsmoosModule_20.movementModeFor;
	__exports.updateMovementCamera = __awtsmoosModule_20.updateMovementCamera;

	function prepareMovementVertical(runtime, state, deltaSeconds) {
		runtime.movementRecovery?.beforeStep(state);
		if (supportsRichVertical(runtime)) {
			prepareMitzvahVertical(runtime, state, deltaSeconds);
			return true;
		}
		const ground = groundHeight(runtime, state.x, state.z, state.renderY);
		state.renderY = Number.isFinite(state.renderY) ? state.renderY : ground;
		state.y = Number.isFinite(state.y) ? state.y : ground;
		state.grounded = state.grounded !== false;
		return false;
	}


	__exports.prepareMovementVertical = prepareMovementVertical;
	function finishMovementVertical(runtime, state, richVertical) {
		if (richVertical) {
			finishMitzvahVertical(runtime, state);
		} else if (state.grounded) {
			landVerticalMotion(state, groundHeight(runtime, state.x, state.z, state.renderY));
		}
		runtime.movementRecovery?.afterStep(state);
	}


	__exports.finishMovementVertical = finishMovementVertical;
	function applyMovementCollision(runtime, state, step) {
		const proposedX = state.x + step.x;
		const proposedZ = state.z + step.z;
		const floorY = groundHeight(runtime, proposedX, proposedZ, state.renderY);
		if (!runtime.collisionMover?.move) {
			state.x = proposedX;
			state.z = proposedZ;
			if (state.grounded) landVerticalMotion(state, floorY);
			return;
		}
		const result = runtime.collisionMover.move(state, step, {
			blockSteepFloors: false,
			floorY,
			grounded: state.grounded,
			maxSlopeNormal: 0.58,
			maxStepHeight: 0.5
		});
		state.contacts = result.normals || [];
		const finalGround = groundHeight(runtime, state.x, state.z, state.renderY);
		if (state.grounded && (finalGround >= state.renderY || Math.abs(finalGround - state.renderY) <= 0.55)) {
			landVerticalMotion(state, finalGround);
		}
	}


	__exports.applyMovementCollision = applyMovementCollision;
	function supportsRichVertical(runtime) {
		return Boolean(runtime.terrain?.heightAt && runtime.input?.consumeJump);
	}

	function groundHeight(runtime, x, z, currentY) {
		return minimalMeadowGroundHeight(runtime, x, z, currentY, currentY);
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapMovementFrame.js ----
{
	const __exports = __awtsmoosModule_6;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapMovementFrame.js
	 * @description Coordinates one responsive player frame while preserving one canonical visible facing across movement and animation presentation.
	 * Netzach carries intention into motion while Tiferes joins collision, facing, and camera in one measured light;
	 * the Awtsmoos renews traveler and direction each instant, and Awtsmoos.com keeps later presentation from undoing the path made right.
	 */

	const normalizeMovementIntent = __awtsmoosModule_7.normalizeMovementIntent;
	const movementStepFromVelocity = __awtsmoosModule_8.movementStepFromVelocity;
	const advanceMovementVelocity = __awtsmoosModule_3.advanceMovementVelocity;
	const bootstrapInputAxis = __awtsmoosModule_9.bootstrapInputAxis;
	const settleBootstrapMovementFacing = __awtsmoosModule_10.settleBootstrapMovementFacing;
	const bootstrapMovementSpeed = __awtsmoosModule_11.bootstrapMovementSpeed;
	const setBootstrapMovementYaw = __awtsmoosModule_5.setBootstrapMovementYaw;
	const bootstrapDesiredVelocity = __awtsmoosModule_13.bootstrapDesiredVelocity;
	const bootstrapVelocityOptions = __awtsmoosModule_13.bootstrapVelocityOptions;
	const MITZVAH_MOVEMENT_PROFILE = __awtsmoosModule_14.MITZVAH_MOVEMENT_PROFILE;
	const applyMovementCollision = __awtsmoosModule_15.applyMovementCollision;
	const finishMovementVertical = __awtsmoosModule_15.finishMovementVertical;
	const movementAxes = __awtsmoosModule_15.movementAxes;
	const movementModeFor = __awtsmoosModule_15.movementModeFor;
	const prepareMovementVertical = __awtsmoosModule_15.prepareMovementVertical;
	const updateMovementCamera = __awtsmoosModule_15.updateMovementCamera;

	/**
	 * Advances one complete player-control frame from fresh input through settled camera presentation.
	 * @param {BootstrapMovementController} controller Active movement controller.
	 * @param {number} deltaSeconds Frame delta in seconds.
	 * @returns {object} Canonical player state.
	 */
	function advanceBootstrapMovement(controller, deltaSeconds) {
		const runtime = controller.runtime;
		const state = runtime.state;
		// Obstacle courses (Stream 3): advance movers and carry the rider before
		// the movement frame reads the ground. No-op without a mounted course.
		runtime.courseEngine?.beforePlayerFrame?.(state, deltaSeconds);
		runtime.cameraRig?.synchronizeFacing?.(state);
		const axis = bootstrapInputAxis(runtime);
		const axes = movementAxes(axis);
		const keyboard = normalizeMovementIntent(axes.keyboard);
		const joystick = normalizeMovementIntent(axes.joystick);
		const mouse = normalizeMovementIntent(runtime.cameraRig?.mouseMovementAxis?.());
		const movementMode = movementModeFor(runtime);
		const turnDelta = keyboard.turn
			* MITZVAH_MOVEMENT_PROFILE.turnSpeed
			* deltaSeconds;
		state.facing += turnDelta;
		runtime.cameraRig?.followTurn?.(turnDelta);
		state.runMode = movementMode.effectiveMode === 'run';
		const richVertical = prepareMovementVertical(runtime, state, deltaSeconds);
		const speed = bootstrapMovementSpeed(runtime, movementMode);
		const targetVelocity = bootstrapDesiredVelocity(
			runtime,
			state,
			keyboard,
			joystick,
			mouse,
			speed
		);
		controller.horizontalVelocity = advanceMovementVelocity(
			controller.horizontalVelocity,
			targetVelocity,
			deltaSeconds,
			bootstrapVelocityOptions(state)
		);
		const step = movementStepFromVelocity(
			controller.horizontalVelocity,
			deltaSeconds
		);
		applyMovementCollision(runtime, state, step);
		finishMovementVertical(runtime, state, richVertical);
		settleBootstrapMovementFacing(runtime, state, keyboard, step);
		settlePresentation(runtime, state);
		const cameraMode = updateMovementCamera(runtime, state, deltaSeconds);
		// Obstacle courses (Stream 3): checkpoints, timer, hazards, coins, and
		// respawns settle here — before the bridge replicates, so a respawned
		// position is what other players see. No-op without a mounted course.
		runtime.courseEngine?.afterPlayerFrame?.(state, deltaSeconds);
		runtime.multiplayerBridge?.update?.(deltaSeconds, state);
		controller.distance += Math.hypot(step.x, step.z);
		controller.frames += 1;
		controller.lastIntent = {
			axis,
			cameraMode,
			joystick,
			keyboard,
			mouse,
			movementMode
		};
		return state;
	}


	__exports.advanceBootstrapMovement = advanceBootstrapMovement;
	/** Applies the same canonical facing that animation presentation will use moments later. */
	function settlePresentation(runtime, state) {
		runtime.model.position.set(state.x, state.renderY, state.z);
		setBootstrapMovementYaw(
			runtime.model.quaternion,
			state.facing
		);
		runtime.equipment?.update?.();
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapMovementController.js ----
{
	const __exports = __awtsmoosModule_2;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapMovementController.js
	 * @description Owns only Mitzvah runtime movement state while importing the focused velocity law directly, never awakening the entire Procedural Core public universe just to move one traveler.
	 * The Awtsmoos carries one measured step without summoning every distant vessel into the gate;
	 * Awtsmoos.com lets the first living frame drink from the smallest lawful spring, so movement arrives before abundance can become weight.
	 */

	const createMovementVelocity = __awtsmoosModule_3.createMovementVelocity;
	const bootstrapMovementSnapshot = __awtsmoosModule_5.bootstrapMovementSnapshot;
	const advanceBootstrapMovement = __awtsmoosModule_6.advanceBootstrapMovement;

	class BootstrapMovementController {
		/** @param {object} runtime Immediate Mitzvah World runtime. */
		constructor(runtime) {
			this.runtime = runtime;
			this.distance = 0;
			this.frames = 0;
			this.lastIntent = {};
			this.horizontalVelocity = createMovementVelocity();
		}

		/** Advances one movement frame. */
		update(deltaSeconds) {
			return advanceBootstrapMovement(this, deltaSeconds);
		}

		/** Returns the existing diagnostics contract consumed by runtime tooling. */
		snapshot() {
			return bootstrapMovementSnapshot(this);
		}
	}

	__exports.BootstrapMovementController = BootstrapMovementController;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-matrix-core.js ----
{
	const __exports = __awtsmoosModule_29;
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
	const __exports = __awtsmoosModule_30;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-transform-math.js
	 * @description Direct quaternion and TRS composition for animated village forms.
	 * The Awtsmoos turns stillness into movement each instant; Awtsmoos.com composes the
	 * complete local vessel in one pass so no temporary translation or scale matrix is born.
	 */

	const identity = __awtsmoosModule_29.identity;

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
	const __exports = __awtsmoosModule_31;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-camera-math.js
	 * @description Camera projection and world-point revelation for the mountain village.
	 * The Awtsmoos creates the seer and the seen together; Awtsmoos.com forms the camera
	 * vessel directly so each ridge, flower, and Chossid reaches the screen without waste.
	 */

	const identity = __awtsmoosModule_29.identity;

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
	const __exports = __awtsmoosModule_32;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-interpolation-math.js
	 * @description Smooth array and quaternion transitions for living motion.
	 * The Awtsmoos joins every before and after in one present; Awtsmoos.com gives the
	 * visible traveler a measured path between samples without changing either endpoint.
	 */

	const quatNormalize = __awtsmoosModule_30.quatNormalize;

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
	const __exports = __awtsmoosModule_28;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-math.js
	 * @description Stable public gateway to focused mathematical vessels.
	 * The Awtsmoos contains every coordinate without confusion; Awtsmoos.com reveals
	 * matrix, transform, camera, and interpolation responsibilities in their proper rooms.
	 */

	__exports.copyMat4 = __awtsmoosModule_29.copyMat4;
	__exports.EPSILON = __awtsmoosModule_29.EPSILON;
	__exports.identity = __awtsmoosModule_29.identity;
	__exports.inverse = __awtsmoosModule_29.inverse;
	__exports.mat4FromArray = __awtsmoosModule_29.mat4FromArray;
	__exports.multiply = __awtsmoosModule_29.multiply;
	__exports.scale = __awtsmoosModule_29.scale;
	__exports.translate = __awtsmoosModule_29.translate;
	__exports.composeTRS = __awtsmoosModule_30.composeTRS;
	__exports.quatMatrix = __awtsmoosModule_30.quatMatrix;
	__exports.quatNormalize = __awtsmoosModule_30.quatNormalize;
	__exports.lookAt = __awtsmoosModule_31.lookAt;
	__exports.perspective = __awtsmoosModule_31.perspective;
	__exports.transformPoint = __awtsmoosModule_31.transformPoint;
	__exports.lerpArray = __awtsmoosModule_32.lerpArray;
	__exports.quatSlerp = __awtsmoosModule_32.quatSlerp;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-transform-cache.js ----
{
	const __exports = __awtsmoosModule_33;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-transform-cache.js
	 * @description Reuses transform snapshots and matrix storage until source values change.
	 * The Awtsmoos renews every form each instant; Awtsmoos.com mutates stable numerical
	 * vessels for moving hierarchy nodes while mesh matrix identity still invalidates batches.
	 */

	const identity = __awtsmoosModule_28.identity;

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
	const __exports = __awtsmoosModule_34;
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
	const __exports = __awtsmoosModule_27;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-object3d.js
	 * @description Cached scene hierarchy with structural and visibility revision evidence.
	 * The Awtsmoos recreates every parent and child together; Awtsmoos.com marks real hierarchy
	 * changes so settled material and renderer systems stop rediscovering an unchanged village tree.
	 */

	const copyMat4 = __awtsmoosModule_28.copyMat4;
	const identity = __awtsmoosModule_28.identity;
	const cachedLocalMatrix = __awtsmoosModule_33.cachedLocalMatrix;
	const invalidateTransformCache = __awtsmoosModule_33.invalidateTransformCache;
	const ROOT_WORLD_MATRIX = __awtsmoosModule_33.ROOT_WORLD_MATRIX;
	const updateCachedWorldMatrix = __awtsmoosModule_33.updateCachedWorldMatrix;
	const Quaternion = __awtsmoosModule_34.Quaternion;
	const Vector3 = __awtsmoosModule_34.Vector3;

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
	const __exports = __awtsmoosModule_35;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-mesh-object.js
	 * @description Renderable scene-graph vessel joining geometry and material.
	 * The Awtsmoos clothes abstract points in visible form; Awtsmoos.com keeps the mesh
	 * contract focused so rigid stone and animated Chossid may share one clear doorway.
	 */

	const Object3D = __awtsmoosModule_27.Object3D;

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
	const __exports = __awtsmoosModule_36;
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
			const color = normalizeMaterialColor(parameters.color);
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
	/**
	 * B"H: normalizes a material color to an [r,g,b,a] array with 0-1 components.
	 * Accepts arrays (used as-is), hex numbers (0xRRGGBB), and CSS hex strings ('#RRGGBB').
	 * Falls back to the warm default when the input is missing or unrecognized.
	 */
	function normalizeMaterialColor(input) {
		const fallback = [0.74, 0.68, 0.58, 1];
		if (input == null) return fallback.slice();
		if (Array.isArray(input)) {
			return [
				Number(input[0]) ?? fallback[0],
				Number(input[1]) ?? fallback[1],
				Number(input[2]) ?? fallback[2],
				Number(input[3] ?? 1)
			];
		}
		if (typeof input === 'number' && Number.isFinite(input)) {
			const v = Math.floor(input);
			return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255, 1];
		}
		if (typeof input === 'string') {
			const m = input.trim().match(/^#?([0-9a-fA-F]{6})$/);
			if (m) {
				const v = parseInt(m[1], 16);
				return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255, 1];
			}
		}
		return fallback.slice();
	}

	__exports.normalizeMaterialColor = normalizeMaterialColor;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-camera.js ----
{
	const __exports = __awtsmoosModule_37;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-camera.js
	 * @description Perspective camera vessel for the mountain-village revelation.
	 * The Awtsmoos creates sight and distance together; Awtsmoos.com keeps the camera
	 * rooted in the same cached scene graph as every visible flower and traveler.
	 */

	const Object3D = __awtsmoosModule_27.Object3D;

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
	const __exports = __awtsmoosModule_26;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-runtime.js
	 * @description Stable public gateway to the focused tiny scene-graph runtime.
	 * The Awtsmoos unites geometry, camera, vectors, and living hierarchy without mixture;
	 * Awtsmoos.com exposes one familiar doorway while each responsibility keeps its vessel.
	 */

	const Bone = __awtsmoosModule_27.Bone;
	const Group = __awtsmoosModule_27.Group;
	const Object3D = __awtsmoosModule_27.Object3D;
	const Scene = __awtsmoosModule_27.Scene;
	const Mesh = __awtsmoosModule_35.Mesh;
	const BufferAttribute = __awtsmoosModule_36.BufferAttribute;
	const BufferGeometry = __awtsmoosModule_36.BufferGeometry;
	const MeshStandardMaterial = __awtsmoosModule_36.MeshStandardMaterial;
	const PerspectiveCamera = __awtsmoosModule_37.PerspectiveCamera;
	const Quaternion = __awtsmoosModule_34.Quaternion;
	const Vector3 = __awtsmoosModule_34.Vector3;

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
	const __awtsmoosDefault_2ph2rt = {
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
	__exports.default = __awtsmoosDefault_2ph2rt;
}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/math/Aabb.js ----
{
	const __exports = __awtsmoosModule_40;
	// B"H // Boruch Hashem // Blessed is He

	/**
	 * @file Aabb.js
	 * @description Holds one axis-aligned spatial vessel with inclusive boundaries.
	 * The Awtsmoos surrounds every finite form without being bounded by it;
	 * Awtsmoos.com reveals exact containment and contact through readable planes.
	 */
	const Vec3 = __awtsmoosModule_23.Vec3;

	class Aabb {
		constructor(min = new Vec3(), max = new Vec3()) {
			this.min = Vec3.from(min);
			this.max = Vec3.from(max);
		}

		/** Creates a box from one center and complete size. */
		static centerSize(center, size) {
			const halfSize = Vec3.from(size).scale(0.5);
			return new Aabb(
				Vec3.from(center).sub(halfSize),
				Vec3.from(center).add(halfSize)
			);
		}

		/** Returns an independent box with cloned endpoints. */
		clone() {
			return new Aabb(this.min, this.max);
		}

		/** Returns a new box expanded equally along every axis. */
		expanded(amount) {
			return new Aabb(
				this.min.clone().sub(new Vec3(amount, amount, amount)),
				this.max.clone().add(new Vec3(amount, amount, amount))
			);
		}

		/** Returns whether two closed boxes touch or overlap. */
		intersects(other) {
			return !(
				this.max.x < other.min.x
				|| this.min.x > other.max.x
				|| this.max.y < other.min.y
				|| this.min.y > other.max.y
				|| this.max.z < other.min.z
				|| this.min.z > other.max.z
			);
		}

		/** Returns whether this closed box completely contains another. */
		containsAabb(other) {
			return (
				other.min.x >= this.min.x
				&& other.max.x <= this.max.x
				&& other.min.y >= this.min.y
				&& other.max.y <= this.max.y
				&& other.min.z >= this.min.z
				&& other.max.z <= this.max.z
			);
		}

		/** Returns the midpoint of the box. */
		center() {
			return this.min.clone().add(this.max).scale(0.5);
		}

		/** Returns a plain serializable bounds object. */
		toJSON() {
			return {
				min: this.min.toJSON(),
				max: this.max.toJSON()
			};
		}
	}

	__exports.Aabb = Aabb;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/math/Geometry3D.js ----
{
	const __exports = __awtsmoosModule_42;
	// B"H
	/** Geometry helpers: normals, barycentric tests, and raw capsule math vessels. */
	function v(x = 0, y = 0, z = 0) { return { x, y, z }; }

	__exports.v = v;
	function add(a, b) { return v(a.x + b.x, a.y + b.y, a.z + b.z); }

	__exports.add = add;
	function sub(a, b) { return v(a.x - b.x, a.y - b.y, a.z - b.z); }

	__exports.sub = sub;
	function scale(a, s) { return v(a.x * s, a.y * s, a.z * s); }

	__exports.scale = scale;
	function dot(a, b) { return a.x * b.x + a.y * b.y + a.z * b.z; }

	__exports.dot = dot;
	function cross(a, b) { return v(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x); }

	__exports.cross = cross;
	function length(a) { return Math.hypot(a.x, a.y, a.z); }

	__exports.length = length;
	function normalize(a) { const n = length(a) || 1; return scale(a, 1 / n); }

	__exports.normalize = normalize;
	function negate(a) { return v(-a.x, -a.y, -a.z); }

	__exports.negate = negate;
	function clamp01(n) { return Math.max(0, Math.min(1, n)); }

	__exports.clamp01 = clamp01;
	function rotateY(p, yaw) { const c = Math.cos(yaw || 0), s = Math.sin(yaw || 0); return v(p.x * c - p.z * s, p.y, p.x * s + p.z * c); }

	__exports.rotateY = rotateY;
	function transformPoint(p, position, yaw = 0) { return add(rotateY(p, yaw), position); }

	__exports.transformPoint = transformPoint;
	function triangleNormal(a, b, c) { return normalize(cross(sub(b, a), sub(c, a))); }

	__exports.triangleNormal = triangleNormal;
	function planeDistance(point, tri) { return dot(sub(point, tri.a), tri.normal); }

	__exports.planeDistance = planeDistance;
	function projectToPlane(point, tri) { return sub(point, scale(tri.normal, planeDistance(point, tri))); }

	__exports.projectToPlane = projectToPlane;
	function triangleContainsPoint(p, tri) {
	  const v0 = sub(tri.c, tri.a), v1 = sub(tri.b, tri.a), v2 = sub(p, tri.a);
	  const d00 = dot(v0, v0), d01 = dot(v0, v1), d02 = dot(v0, v2), d11 = dot(v1, v1), d12 = dot(v1, v2);
	  const inv = 1 / ((d00 * d11 - d01 * d01) || 1);
	  const u = (d11 * d02 - d01 * d12) * inv, w = (d00 * d12 - d01 * d02) * inv;
	  return u >= -0.0001 && w >= -0.0001 && u + w <= 1.0001;
	}

	__exports.triangleContainsPoint = triangleContainsPoint;
	function closestPointOnSegment(p, a, b) { const ab = sub(b, a); return add(a, scale(ab, clamp01(dot(sub(p, a), ab) / (dot(ab, ab) || 1)))); }

	__exports.closestPointOnSegment = closestPointOnSegment;function closestPointsSegmentSegment(a0, a1, b0, b1) {
	  const d1 = sub(a1, a0), d2 = sub(b1, b0), r = sub(a0, b0);
	  const a = dot(d1, d1), e = dot(d2, d2), f = dot(d2, r);
	  let s = 0, t = 0;
	  if (a <= 1e-8 && e <= 1e-8) return [a0, b0];
	  if (a <= 1e-8) t = clamp01(f / e);
	  else {
	    const c = dot(d1, r);
	    if (e <= 1e-8) s = clamp01(-c / a);
	    else { const b = dot(d1, d2), denom = a * e - b * b; s = denom ? clamp01((b * f - c * e) / denom) : 0; t = (b * s + f) / e; if (t < 0) { t = 0; s = clamp01(-c / a); } else if (t > 1) { t = 1; s = clamp01((b - c) / a); } }
	  }
	  return [add(a0, scale(d1, s)), add(b0, scale(d2, t))];
	}
	function rayTriangle(origin, direction, tri, maxDistance = Infinity) {
	  const edge1 = sub(tri.b, tri.a), edge2 = sub(tri.c, tri.a), h = cross(direction, edge2);
	  const det = dot(edge1, h);
	  if (Math.abs(det) < 0.000001) return null;
	  const inv = 1 / det, s = sub(origin, tri.a), u = inv * dot(s, h);
	  if (u < 0 || u > 1) return null;
	  const q = cross(s, edge1), vv = inv * dot(direction, q);
	  if (vv < 0 || u + vv > 1) return null;
	  const t = inv * dot(edge2, q);
	  if (t < 0.001 || t > maxDistance) return null;
	  return { distance: t, point: add(origin, scale(direction, t)), normal: tri.normal, item: tri };
	}
	function minMax(points) {
	  const min = v(Infinity, Infinity, Infinity), max = v(-Infinity, -Infinity, -Infinity);
	  for (const p of points) { min.x = Math.min(min.x, p.x); min.y = Math.min(min.y, p.y); min.z = Math.min(min.z, p.z); max.x = Math.max(max.x, p.x); max.y = Math.max(max.y, p.y); max.z = Math.max(max.z, p.z); }
	  return { min, max };
	}

	__exports.closestPointsSegmentSegment = closestPointsSegmentSegment;
	__exports.rayTriangle = rayTriangle;
	__exports.minMax = minMax;
}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/collision/CapsuleTriangle.js ----
{
	const __exports = __awtsmoosModule_41;
	// B"H
	const add = __awtsmoosModule_42.add;
	const closestPointsSegmentSegment = __awtsmoosModule_42.closestPointsSegmentSegment;
	const dot = __awtsmoosModule_42.dot;
	const length = __awtsmoosModule_42.length;
	const negate = __awtsmoosModule_42.negate;
	const normalize = __awtsmoosModule_42.normalize;
	const planeDistance = __awtsmoosModule_42.planeDistance;
	const projectToPlane = __awtsmoosModule_42.projectToPlane;
	const scale = __awtsmoosModule_42.scale;
	const sub = __awtsmoosModule_42.sub;
	const triangleContainsPoint = __awtsmoosModule_42.triangleContainsPoint;

	/** Capsule-triangle contact: copied as an idea from Octree.js, reborn raw. */
	function capsuleTriangleContact(capsule, tri) {
	  const center = scale(add(capsule.start, capsule.end), 0.5);
	  const facingNormal = dot(sub(center, tri.a), tri.normal) < 0 ? negate(tri.normal) : tri.normal;
	  const planeHit = planeContact(capsule, tri, facingNormal);
	  let best = planeHit;
	  for (const [a, b] of [[tri.a, tri.b], [tri.b, tri.c], [tri.c, tri.a]]) best = deeper(best, edgeContact(capsule, tri, a, b, facingNormal));
	  return best;
	}


	__exports.capsuleTriangleContact = capsuleTriangleContact;
	function planeContact(capsule, tri, normal) {
	  const d1 = dot(sub(capsule.start, tri.a), normal);
	  const d2 = dot(sub(capsule.end, tri.a), normal);
	  const nearest = Math.abs(d1) < Math.abs(d2) ? capsule.start : capsule.end;
	  const dist = Math.abs(Math.abs(d1) < Math.abs(d2) ? d1 : d2);
	  if (dist >= capsule.radius) return null;
	  const projected = projectToPlane(nearest, { ...tri, normal });
	  if (!triangleContainsPoint(projected, tri)) return null;
	  return { normal, depth: capsule.radius - dist + 0.002, kind: tri.kind, point: projected };
	}

	function edgeContact(capsule, tri, a, b, fallbackNormal) {
	  const [p1, p2] = closestPointsSegmentSegment(capsule.start, capsule.end, a, b);
	  const delta = sub(p1, p2), dist = length(delta);
	  if (dist >= capsule.radius) return null;
	  const normal = dist > 0.00001 ? normalize(delta) : fallbackNormal;
	  return { normal, depth: capsule.radius - dist + 0.002, kind: tri.kind, point: p2 };
	}

	function deeper(a, b) { if (!b) return a; if (!a || b.depth > a.depth) return b; return a; }

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/collision/CapsuleCollisionQuery.js ----
{
	const __exports = __awtsmoosModule_39;
	// B"H
	const Aabb = __awtsmoosModule_40.Aabb;
	const capsuleTriangleContact = __awtsmoosModule_41.capsuleTriangleContact;

	function capsuleFor(position, radius, height, footOffset) {
		const base = position.y - footOffset;
		return {
			radius,
			start: { x: position.x, y: base + 0.25, z: position.z },
			end: { x: position.x, y: base + height, z: position.z }
		};
	}


	__exports.capsuleFor = capsuleFor;
	function deepestContact({ octree, capsule, radius, options, accept }) {
		let best = null;
		for (const triangle of candidates(octree, capsule, radius, options)) {
			const hit = capsuleTriangleContact(capsule, triangle);
			if (!hit || !accept(triangle, hit)) continue;
			if (!best || hit.depth > best.depth) best = hit;
		}
		return best;
	}


	__exports.deepestContact = deepestContact;
	function candidates(octree, capsule, radius, options) {
		const bounds = capsuleBounds(capsule, radius);
		const dynamic = (options.dynamicColliders || []).filter((triangle) => (
			triangle.aabb?.intersects?.(bounds)
		));
		return [...octree.query(bounds), ...dynamic];
	}

	function capsuleBounds(capsule, radius) {
		const margin = radius + 0.04;
		return new Aabb(
			{
				x: capsule.start.x - margin,
				y: Math.min(capsule.start.y, capsule.end.y) - margin,
				z: capsule.start.z - margin
			},
			{
				x: capsule.start.x + margin,
				y: Math.max(capsule.start.y, capsule.end.y) + margin,
				z: capsule.start.z + margin
			}
		);
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/collision/CollisionMovePlan.js ----
{
	const __exports = __awtsmoosModule_43;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file CollisionMovePlan.js
	 * @description Converts uncertain input into bounded horizontal substeps and measured receipts.
	 * The Awtsmoos gives motion its possibility while Awtsmoos.com gives each finite stride a limit;
	 * invalid numbers become stillness instead of tearing the Chossid beyond the created world.
	 */

	const DEFAULT_MAXIMUM_STEP = 0.055;

	/** Returns a finite horizontal movement plan suitable for repeated capsule resolution. */
	function createCollisionMovePlan(delta = {}, maximumStep = DEFAULT_MAXIMUM_STEP) {
		const rawX = Number(delta.x);
		const rawZ = Number(delta.z);
		const requested = {
			x: Number.isFinite(rawX) ? rawX : 0,
			z: Number.isFinite(rawZ) ? rawZ : 0
		};
		const stepLimit = finitePositive(maximumStep, DEFAULT_MAXIMUM_STEP);
		const distance = Math.hypot(requested.x, requested.z);
		const substeps = Math.max(1, Math.ceil(distance / stepLimit));
		return {
			distance,
			invalidInput: !Number.isFinite(rawX) || !Number.isFinite(rawZ),
			requested,
			step: { x: requested.x / substeps, z: requested.z / substeps },
			substeps
		};
	}


	__exports.createCollisionMovePlan = createCollisionMovePlan;
	/** Returns immutable evidence of requested and actually applied horizontal motion. */
	function collisionMoveReceipt(plan, start, position) {
		return Object.freeze({
			applied: Object.freeze({
				x: position.x - start.x,
				z: position.z - start.z
			}),
			invalidInput: plan.invalidInput,
			requested: Object.freeze({ ...plan.requested }),
			substeps: plan.substeps
		});
	}


	__exports.collisionMoveReceipt = collisionMoveReceipt;
	function finitePositive(value, fallback) {
		const number = Number(value);
		return Number.isFinite(number) && number > 0 ? number : fallback;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/collision/AwtsmoosCollisionMover.js ----
{
	const __exports = __awtsmoosModule_38;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file AwtsmoosCollisionMover.js
	 * @description Resolves a player capsule against real octree triangles with bounded finite steps.
	 * The Awtsmoos renews traveler and wall without confusion; Awtsmoos.com measures each stride,
	 * rejects impossible numbers, honors visible risers, and records the contact truth that remains.
	 */

	const capsuleFor = __awtsmoosModule_39.capsuleFor;
	const deepestContact = __awtsmoosModule_39.deepestContact;
	const collisionMoveReceipt = __awtsmoosModule_43.collisionMoveReceipt;
	const createCollisionMovePlan = __awtsmoosModule_43.createCollisionMovePlan;

	class AwtsmoosCollisionMover {
		constructor({ octree, radius = 0.38, height = 1.72, footOffset = 0 }) {
			Object.assign(this, { octree, radius, height, footOffset });
			this.lastCeiling = null;
			this.lastMove = null;
			this.resetContacts();
		}
		move(position, delta, options = {}) {
			const plan = createCollisionMovePlan(delta, options.maximumSubstep);
			const start = { x: position.x, z: position.z };
			this.resetContacts();
			for (let index = 0; index < plan.substeps; index += 1) {
				position.x += plan.step.x;
				position.z += plan.step.z;
				this.solve(position, options);
			}
			this.lastMove = collisionMoveReceipt(plan, start, position);
			return {
				contacts: this.lastContacts.length,
				movement: this.lastMove,
				normals: this.lastNormals,
				steppedFaces: this.lastStepFaces
			};
		}
		solve(position, options) {
			for (let pass = 0; pass < 7; pass += 1) {
				const hit = this.deepestWall(this.capsule(position), options);
				if (!hit) return;
				position.x += hit.normal.x * hit.depth;
				position.z += hit.normal.z * hit.depth;
				this.remember(hit);
			}
		}
		resolveCeiling(position, options = {}) {
			let pushed = 0;
			this.lastCeiling = null;
			for (let pass = 0; pass < 4; pass += 1) {
				const hit = this.deepestCeiling(this.capsule(position), options);
				if (!hit) break;
				position.y += Math.min(-0.002, hit.normal.y * hit.depth);
				pushed += hit.depth;
				this.lastCeiling = hit;
			}
			return { depth: pushed, hit: !!this.lastCeiling, kind: this.lastCeiling?.kind || null };
		}
		ceilingHit(position, options = {}) {
			return this.deepestCeiling(this.capsule(position), options);
		}
		deepestWall(capsule, options) {
			return deepestContact({
				accept: (triangle, hit) => this.isBlockingWall(triangle, hit, capsule, options),
				capsule,
				octree: this.octree,
				options,
				radius: this.radius
			});
		}
		deepestCeiling(capsule, options) {
			return deepestContact({
				accept: (triangle, hit) => this.isBlockingCeiling(triangle, hit, capsule),
				capsule,
				octree: this.octree,
				options,
				radius: this.radius
			});
		}
		isBlockingCeiling(triangle, hit, capsule) {
			if (!triangle.solid || triangle.floor || triangle.normal.y > -0.18) return false;
			if (triangle.aabb.max.y < capsule.end.y - 0.46) return false;
			hit.normal = triangle.normal;
			return true;
		}
		isBlockingWall(triangle, hit, capsule, options) {
			const maxSlope = options.maxSlopeNormal ?? 0.72;
			if (!triangle.solid) return false;
			if (triangle.floor && triangle.normal.y >= maxSlope) return false;
			if (triangle.floor && options.blockSteepFloors === false) return false;
			if (Math.abs(hit.normal.y) > 0.76) return false;
			const floorY = options.floorY ?? capsule.start.y - 0.25;
			const stepTop = floorY + (options.maxStepHeight ?? 0);
			if (!triangle.floor && options.grounded && triangle.aabb.max.y <= stepTop + 0.045) {
				this.lastStepFaces.push(triangle.kind);
				return false;
			}
			return true;
		}
		resetContacts() {
			this.lastContacts = [];
			this.lastNormals = [];
			this.lastStepFaces = [];
		}
		remember(hit) {
			this.lastContacts.push(hit.kind);
			this.lastNormals.push({ ...hit.normal, depth: hit.depth });
		}
		capsule(position) {
			return capsuleFor(position, this.radius, this.height, this.footOffset);
		}
	}

	__exports.AwtsmoosCollisionMover = AwtsmoosCollisionMover;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/motion/JumpPhysics.js ----
{
	const __exports = __awtsmoosModule_44;
	// B"H
	/** Jump physics samples only floors reachable from the current feet height. */
	class JumpPhysics{
	  constructor({ground,footOffset,impulse=7.35,gravity=13.25,maxSlopeNormal=.72}){Object.assign(this,{ground,footOffset,impulse,gravity,maxSlopeNormal});}
	  update(state,dt,jumpQueued){
	    const feetY=state.y-this.footOffset;
	    const sample=this.ground.sample(state.x,state.z,{maxY:feetY+.12});
	    const floorY=sample.height+this.footOffset;
	    state.groundKind=sample.kind;state.groundNormal=sample.normal;
	    state.grounded=state.y<=floorY+.06&&state.velY<=.03;
	    if(state.grounded){state.y=floorY;state.velY=0;state.airPhase='ground';}
	    if(jumpQueued&&state.grounded){state.velY=this.impulse;state.grounded=false;state.airPhase='jump';state.jumpClock=0;state.slopeState='jump';}
	    if(!state.grounded)return this.air(state,dt);
	    return this.slide(state,sample,dt);
	  }
	  air(state,dt){
	    state.jumpClock+=dt;state.velY-=this.gravity*dt;state.y+=state.velY*dt;
	    const feetY=state.y-this.footOffset;
	    const floorY=this.ground.heightAt(state.x,state.z,{maxY:feetY+.18})+this.footOffset;
	    state.airPhase=state.velY>=-.25&&state.jumpClock<.46?'jump':'fall';
	    if(state.velY<=0&&state.y<=floorY){state.y=floorY;state.velY=0;state.grounded=true;state.airPhase='ground';}
	    return{slide:null};
	  }
	  slide(state,sample,dt){
	    const n=sample.normal||{x:0,y:1,z:0},steep=n.y<this.maxSlopeNormal&&n.y>.18,mag=Math.hypot(n.x,n.z);
	    state.slopeState=steep?'slide':'walk';
	    if(!steep||mag<.001)return{slide:null};
	    const speed=(this.maxSlopeNormal-n.y)*10+1.1;
	    return{slide:{x:n.x/mag*speed*dt,z:n.z/mag*speed*dt}};
	  }
	}

	__exports.JumpPhysics = JumpPhysics;
}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/world/GroundRay.js ----
{
	const __exports = __awtsmoosModule_45;
	// B"H
	/** GroundRay: one beginning ray, so the soles kiss Eretz and do not float. */
	function alignModelFeetToGround(model, groundY = 0) {
	  model.updateWorldMatrix?.();
	  const minY = findMinWorldY(model);
	  if (!Number.isFinite(minY)) return { minY: null, offset: 0 };
	  const offset = groundY - minY;
	  model.position.y += offset;
	  model.setBaseTransform?.();
	  return { minY, offset };
	}


	__exports.alignModelFeetToGround = alignModelFeetToGround;
	function findMinWorldY(root) {
	  let minY = Infinity;
	  root.traverse((object) => {
	    const position = object.geometry?.attributes?.position;
	    const matrix = object.matrixWorld;
	    if (!position || !matrix) return;
	    const array = position.array;
	    for (let i = 0; i < array.length; i += 3) {
	      const y = matrix[1] * array[i] + matrix[5] * array[i + 1] + matrix[9] * array[i + 2] + matrix[13];
	      if (y < minY) minY = y;
	    }
	  });
	  return minY;
	}

	__exports.findMinWorldY = findMinWorldY;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/assets/RemoteModelRecords.js ----
{
	const __exports = __awtsmoosModule_48;
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

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/assets/ReleaseModelCatalog.js ----
{
	const __exports = __awtsmoosModule_47;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file ReleaseModelCatalog.js
	 * @description Defines exact content-addressed same-release model URLs without weakening the remote Drive authority catalog.
	 * The Awtsmoos gives one authored form two guarded roads whose identity is one immutable hash;
	 * Awtsmoos.com lets the release-owned road run locally only when semantic model, SHA-256 folder, and filename all perfectly match.
	 */

	const REMOTE_MODEL_RECORDS = __awtsmoosModule_48.REMOTE_MODEL_RECORDS;

	const PLAYER_IDENTITY = 'player/chossid.glb';

	/**
	 * Release-local model root resolved against this module's real URL (not a hardcoded
	 * absolute path), so source, compact bundles, https:, and file: all agree.
	 * This module lives at <game>/experiments/Awtsmoos/src/assets/; models live at <game>/build/generated/assets/.
	 */
	function releaseModelRoot() {
		return new URL('../../../../build/generated/assets/', (( globalThis.location?.protocol === "file:" ? (import.meta.url.lastIndexOf("/games/mitzvahWorld/") > 8 ? import.meta.url.slice(0, import.meta.url.lastIndexOf("/games/mitzvahWorld/")) : "https://awtsmoos.local") : (/^(https?):\/\//.test(globalThis.location?.origin || "") ? globalThis.location.origin : "https://awtsmoos.local") ) + "/games/mitzvahWorld/experiments/Awtsmoos/src/assets/ReleaseModelCatalog.js")).href;
	}

	/** Returns the exact hash-addressed packaged URL for the canonical Chossid. */
	function canonicalChossidReleaseUrl() {
		const record = REMOTE_MODEL_RECORDS[PLAYER_IDENTITY];
		return `${releaseModelRoot()}${record.sha256}/chossid.glb`;
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

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzConstants.js ----
{
	const __exports = __awtsmoosModule_46;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file EretzConstants.js
	 * @description Holds player, collision, movement, and one-CSS-pixel rendering constants while deriving the player URL from release trust law.
	 * The Awtsmoos gives the canonical Chossid one exact hash-addressed local vessel whose authored bytes remain unchanged;
	 * Awtsmoos.com keeps fast first play beneath the same immutable identity rather than copying a mutable path into another range.
	 */

	const canonicalChossidReleaseUrl = __awtsmoosModule_47.canonicalChossidReleaseUrl;

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

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageArrivalSpatialContract.js ----
{
	const __exports = __awtsmoosModule_50;
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

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzPlayerStateFactory.js ----
{
	const __exports = __awtsmoosModule_49;
	//B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file EretzPlayerStateFactory.js
	 * @description Creates bootstrap and canonical gameplay identity from pure arrival geometry so local player state never wakes nature scheduling as a hidden module-load side effect.
	 * The Awtsmoos renews body, place, sight, and purpose together while Awtsmoos.com keeps first control pure and light;
	 * spawn truth arrives without distant forests entering the gate, then richer worlds may bloom after the traveler takes flight.
	 */

	const VILLAGE_ARRIVAL_PLAYER = __awtsmoosModule_50.VILLAGE_ARRIVAL_PLAYER;
	const FACE_HEIGHT = __awtsmoosModule_46.FACE_HEIGHT;

	const PLAYER_SPAWN = VILLAGE_ARRIVAL_PLAYER;


	__exports.PLAYER_SPAWN = PLAYER_SPAWN;
	function createBootstrapPlayerStats() {
		return {
			armor: 3,
			face: '🎩',
			health: 100,
			level: 1,
			maxHealth: 100,
			name: 'Chossid',
			xp: 0,
			xpMax: 100
		};
	}


	__exports.createBootstrapPlayerStats = createBootstrapPlayerStats;
	function createBootstrapPlayerState() {
		return {
			action: 'idle',
			airPhase: 'ground',
			clip: '',
			collisionEnabled: true,
			contacts: [],
			defeated: false,
			faceHeight: FACE_HEIGHT,
			facing: 0,
			grounded: true,
			inputLocked: false,
			jumpsUsed: 0,
			level: 'meadow',
			lifecycle: 'active',
			moving: false,
			multiplayer: null,
			renderY: 0,
			runMode: false,
			targetingEnabled: true,
			velY: 0,
			x: 0,
			y: 0,
			z: 0
		};
	}


	__exports.createBootstrapPlayerState = createBootstrapPlayerState;
	function createEretzPlayerStats() {
		return {
			face: '🎩',
			health: 100,
			level: 1,
			name: 'Chossid',
			xp: 0,
			xpMax: 100
		};
	}


	__exports.createEretzPlayerStats = createEretzPlayerStats;
	function createEretzPlayerState(initialY, feet, player, spawn = PLAYER_SPAWN) {
		return {
			airPhase: 'ground',
			ceilingHit: null,
			clip: '',
			contacts: [],
			faceHeight: FACE_HEIGHT,
			facing: spawn.facing,
			feet,
			grounded: true,
			jumpClock: 0,
			level: 'eretz',
			moving: false,
			normals: [],
			player,
			renderY: initialY,
			runMode: false,
			slopeState: 'walk',
			stepState: 'flat',
			velY: 0,
			x: spawn.x,
			y: initialY,
			z: spawn.z
		};
	}

	__exports.createEretzPlayerState = createEretzPlayerState;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzPlayerRuntimeFactories.js ----
{
	const __exports = __awtsmoosModule_25;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file EretzPlayerRuntimeFactories.js
	 * @description Creates grounded player roots and movement vessels that honor their soles.
	 * The Awtsmoos joins measured form to lawful earth while every instant becomes new;
	 * Awtsmoos.com keeps pivot, shadow, collision, and ascent within one truthful view.
	 */

	const Group = __awtsmoosModule_26.Group;
	const AwtsmoosCollisionMover = __awtsmoosModule_38.AwtsmoosCollisionMover;
	const JumpPhysics = __awtsmoosModule_44.JumpPhysics;
	const findMinWorldY = __awtsmoosModule_45.findMinWorldY;
	const MAX_SLOPE_NORMAL = __awtsmoosModule_46.MAX_SLOPE_NORMAL;
	const PLAYER_HEIGHT = __awtsmoosModule_46.PLAYER_HEIGHT;
	const PLAYER_RADIUS = __awtsmoosModule_46.PLAYER_RADIUS;
	const createEretzPlayerState = __awtsmoosModule_49.createEretzPlayerState;
	const createEretzPlayerStats = __awtsmoosModule_49.createEretzPlayerStats;

	__exports.createEretzPlayerState = createEretzPlayerState;
	__exports.createEretzPlayerStats = createEretzPlayerStats;

	const CANONICAL_PLAYER_SCALE = 1.52;


	__exports.CANONICAL_PLAYER_SCALE = CANONICAL_PLAYER_SCALE;
	function createGroundedCanonicalPlayer(scene, state) {
		scene.name = 'Awtsmoos_canonical_chossid_glb_scene';
		scene.visible = true;
		scene.position.set(0, 0, 0);
		scene.scale.set(
			CANONICAL_PLAYER_SCALE,
			CANONICAL_PLAYER_SCALE,
			CANONICAL_PLAYER_SCALE
		);
		scene.updateWorldMatrix?.();
		const measuredMinY = findMinWorldY(scene);
		const feetOffset = Number.isFinite(measuredMinY) ? -measuredMinY : 0;
		scene.position.y = feetOffset;
		scene.setBaseTransform?.();
		const model = new Group();
		model.name = 'Awtsmoos_grounded_canonical_chossid';
		model.userData = { canonicalPlayerRoot: true, feetOffset };
		model.position.set(
			state.x || 0,
			state.renderY ?? state.y ?? 0,
			state.z || 0
		);
		model.quaternion.set(
			0,
			Math.sin((state.facing || 0) / 2),
			0,
			Math.cos((state.facing || 0) / 2)
		);
		model.add(scene);
		model.setBaseTransform?.();
		return {
			feet: { measuredMinY, offset: feetOffset },
			model,
			visiblePlayer: scene
		};
	}


	__exports.createGroundedCanonicalPlayer = createGroundedCanonicalPlayer;
	function prepareCanonicalPlayerMeshes(model) {
		let count = 0;
		model.traverse?.(object => {
			if (!object.isMesh && !object.isSkinnedMesh) return;
			object.castShadow = true;
			object.receiveShadow = true;
			object.visible = true;
			object.userData ||= {};
			object.userData.realChossid = true;
			count += 1;
		});
		return count;
	}


	__exports.prepareCanonicalPlayerMeshes = prepareCanonicalPlayerMeshes;
	function createBootstrapPlayerVessels(foundation) {
		const playerModel = { footOffset: 0 };
		const collisionMover = foundation.collisionQuery
			? createEretzMover(foundation, playerModel)
			: null;
		const jumpPhysics = foundation.ground
			? createEretzJumpPhysics(foundation, playerModel)
			: null;
		return {
			collisionMover,
			jumpPhysics,
			mover: collisionMover
		};
	}


	__exports.createBootstrapPlayerVessels = createBootstrapPlayerVessels;
	function createEretzMover(foundation, playerModel) {
		return new AwtsmoosCollisionMover({
			footOffset: playerModel.footOffset,
			height: PLAYER_HEIGHT,
			octree: foundation.collisionQuery,
			radius: PLAYER_RADIUS
		});
	}


	__exports.createEretzMover = createEretzMover;
	function createEretzJumpPhysics(foundation, playerModel) {
		return new JumpPhysics({
			footOffset: playerModel.footOffset,
			ground: foundation.ground,
			maxSlopeNormal: MAX_SLOPE_NORMAL
		});
	}

	__exports.createEretzJumpPhysics = createEretzJumpPhysics;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapEssentialPlayerRuntime.js ----
{
	const __exports = __awtsmoosModule_24;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapEssentialPlayerRuntime.js
	 * @description Mounts the decoded canonical Chossid and movement vessels without constructing animation, actors, HUD, combat, or post-control systems.
	 * The Awtsmoos lets the true traveler stand upon the true meadow before every later garment learns to dance;
	 * Awtsmoos.com gives first control only authored mesh, collision vessels, state, and visible form so no optional abundance delays the first chance.
	 */

	const createBootstrapPlayerVessels = __awtsmoosModule_25.createBootstrapPlayerVessels;
	const createGroundedCanonicalPlayer = __awtsmoosModule_25.createGroundedCanonicalPlayer;
	const prepareCanonicalPlayerMeshes = __awtsmoosModule_25.prepareCanonicalPlayerMeshes;
	const createBootstrapPlayerState = __awtsmoosModule_49.createBootstrapPlayerState;
	const createBootstrapPlayerStats = __awtsmoosModule_49.createBootstrapPlayerStats;

	/** Creates one visible canonical player runtime with real movement vessels but deferred animation authority. */
	function createBootstrapEssentialPlayerRuntime(foundation) {
		const gltf = foundation.playerGltf;
		if (!gltf?.scene) throw new Error('Canonical chossid.glb must be decoded before essential player creation.');
		const state = createBootstrapPlayerState();
		const runtime = {
			...foundation,
			...createBootstrapPlayerVessels(foundation),
			canonicalPlayer: null,
			canonicalPlayerHydrationStage: 'visible-unanimated',
			feet: 0,
			footOffset: 0,
			model: null,
			player: null,
			playerGltf: gltf,
			playerStats: createBootstrapPlayerStats(),
			state,
			visiblePlayer: null,
			worldActorsReady: false
		};
		const prepared = createGroundedCanonicalPlayer(gltf.scene, state);
		const meshes = prepareCanonicalPlayerMeshes(prepared.visiblePlayer);
		const animations = gltf.animations?.length || 0;
		if (meshes < 1) throw new Error('Canonical chossid.glb has no renderable meshes.');
		if (animations < 1) throw new Error('Canonical chossid.glb has no authored animations.');
		installVisibleCanonicalPlayer(runtime, prepared);
		runtime.canonicalPlayer = Object.freeze({
			animations,
			fallback: false,
			meshes,
			source: foundation.playerGlbEvidence?.source || 'player/chossid.glb',
			status: 'visible-unanimated',
			visualGuard: 'none-glb-only'
		});
		return runtime;
	}


	__exports.createBootstrapEssentialPlayerRuntime = createBootstrapEssentialPlayerRuntime;
	/** Installs only the authored visible form; animation hydration deliberately remains post-control. */
	function installVisibleCanonicalPlayer(runtime, prepared) {
		runtime.scene.add(prepared.model);
		runtime.model = prepared.model;
		runtime.visiblePlayer = prepared.visiblePlayer;
		runtime.canonicalPlayerScene = prepared.visiblePlayer;
		runtime.feet = prepared.feet;
		runtime.state.feet = prepared.feet;
		for (const vessel of [runtime.collisionMover, runtime.mover, runtime.jumpPhysics]) {
			if (vessel) vessel.footOffset = 0;
		}
		markCanonical(prepared.model);
		markCanonical(prepared.visiblePlayer);
	}

	function markCanonical(model) {
		model.userData ||= {};
		model.userData.AwtsmoosCanonicalPlayer = Object.freeze({
			modelSource: 'chossid.glb',
			visualGuard: 'none-glb-only'
		});
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzWorldFeaturePolicy.js ----
{
	const __exports = __awtsmoosModule_51;
	//B"H
	//Boruch Hashem
	//Blessed be He

	/**
	 * @file EretzWorldFeaturePolicy.js
	 * @description Gives runtime code one doorway for immutable selected-world feature decisions.
	 * Legacy callers remain rich by default, while official manifests can explicitly disable any optional system.
	 */

	/**
	 * Resolves whether a named feature is enabled for the selected world.
	 * @param {object} options Runtime options carrying worldExperience.
	 * @param {string} feature Boolean feature key.
	 * @param {boolean} legacyDefault Behavior for callers without an official manifest.
	 * @returns {boolean} The authoritative feature decision.
	 */
	function eretzWorldFeatureEnabled(options, feature, legacyDefault = true) {
		const experience = options?.worldExperience;
		if (experience && typeof experience[feature] === 'boolean') {
			return experience[feature];
		}
		return legacyDefault;
	}


	__exports.eretzWorldFeatureEnabled = eretzWorldFeatureEnabled;
	/** Publishes the immutable selected experience on the live runtime for diagnostics and consumers. */
	function attachEretzWorldExperience(runtime, options) {
		runtime.worldExperience = options?.worldExperience || null;
		return runtime.worldExperience;
	}

	__exports.attachEretzWorldExperience = attachEretzWorldExperience;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MitzvahWorldEssentialMilestoneCatalog.js ----
{
	const __exports = __awtsmoosModule_55;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldEssentialMilestoneCatalog.js
	 * @description Declares the five facts that alone may open first play and the finite silence/hard horizons that guard them.
	 * The Awtsmoos renews each fact from nothing; Awtsmoos.com measures silence rather than punishing a slower vessel
	 * that is still revealing truthful progress, while one outer horizon keeps first play bounded.
	 * Each milestone carries its own stage-specific deadline instead of one fixed wait: local work (entry,
	 * renderer context, terrain, movement) must land in seconds, while the authored Chossid GLB keeps a longer
	 * network-honest horizon.
	 */

	const ESSENTIAL_BOOT_TIMEOUT_MS = 30000;

	__exports.ESSENTIAL_BOOT_TIMEOUT_MS = ESSENTIAL_BOOT_TIMEOUT_MS;
	const ESSENTIAL_HARD_TIMEOUT_MS = 90000;


	__exports.ESSENTIAL_HARD_TIMEOUT_MS = ESSENTIAL_HARD_TIMEOUT_MS;
	const ENTRY_DEADLINE_MS = 10000;

	__exports.ENTRY_DEADLINE_MS = ENTRY_DEADLINE_MS;
	const RENDERER_FIRST_FRAME_DEADLINE_MS = 15000;

	__exports.RENDERER_FIRST_FRAME_DEADLINE_MS = RENDERER_FIRST_FRAME_DEADLINE_MS;
	const SPAWN_TERRAIN_DEADLINE_MS = 15000;

	__exports.SPAWN_TERRAIN_DEADLINE_MS = SPAWN_TERRAIN_DEADLINE_MS;
	const CANONICAL_CHOSSID_DEADLINE_MS = 30000;

	__exports.CANONICAL_CHOSSID_DEADLINE_MS = CANONICAL_CHOSSID_DEADLINE_MS;
	const PLAYER_MOVEMENT_DEADLINE_MS = 10000;


	__exports.PLAYER_MOVEMENT_DEADLINE_MS = PLAYER_MOVEMENT_DEADLINE_MS;
	const ESSENTIAL_MILESTONES = Object.freeze({
		ENTRY_MODULE_EXECUTED: 'entryModuleExecuted',
		RENDERER_FIRST_FRAME: 'rendererFirstFrame',
		SPAWN_TERRAIN_EXISTS: 'spawnTerrainExists',
		CANONICAL_CHOSSID_DECODED: 'canonicalChossidDecoded',
		PLAYER_MOVEMENT_ENABLED: 'playerMovementEnabled'
	});


	__exports.ESSENTIAL_MILESTONES = ESSENTIAL_MILESTONES;
	const ESSENTIAL_MILESTONE_CATALOG = Object.freeze([
		definition(ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED, 'Entry module executed', [], ENTRY_DEADLINE_MS),
		definition(ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME, 'Renderer produced first frame', [ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED], RENDERER_FIRST_FRAME_DEADLINE_MS),
		definition(ESSENTIAL_MILESTONES.SPAWN_TERRAIN_EXISTS, 'Spawn terrain exists', [ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED], SPAWN_TERRAIN_DEADLINE_MS),
		definition(ESSENTIAL_MILESTONES.CANONICAL_CHOSSID_DECODED, 'Canonical chossid.glb decoded', [ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED], CANONICAL_CHOSSID_DEADLINE_MS),
		definition(
			ESSENTIAL_MILESTONES.PLAYER_MOVEMENT_ENABLED,
			'Player movement enabled',
			[
				ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME,
				ESSENTIAL_MILESTONES.SPAWN_TERRAIN_EXISTS,
				ESSENTIAL_MILESTONES.CANONICAL_CHOSSID_DECODED
			],
			PLAYER_MOVEMENT_DEADLINE_MS
		)
	]);


	__exports.ESSENTIAL_MILESTONE_CATALOG = ESSENTIAL_MILESTONE_CATALOG;
	/** Creates one immutable milestone covenant. */
	function definition(name, label, dependencies, timeoutMilliseconds = ESSENTIAL_BOOT_TIMEOUT_MS) {
		return Object.freeze({
			dependencies: Object.freeze([...dependencies]),
			label,
			name,
			timeoutFailureCode: `ESSENTIAL_${toFailureToken(name)}_TIMEOUT`,
			timeoutMilliseconds
		});
	}

	function toFailureToken(name) {
		return name.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MitzvahWorldEssentialClock.js ----
{
	const __exports = __awtsmoosModule_54;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldEssentialClock.js
	 * @description Keeps essential-boot time and finite watchdog scheduling outside the fact ledger.
	 * The Awtsmoos renews each measured instant; Awtsmoos.com schedules only the next truthful deadline,
	 * never confusing one fixed wall-clock guess with the living progress of a slower browser.
	 */

	const ESSENTIAL_BOOT_TIMEOUT_MS = __awtsmoosModule_55.ESSENTIAL_BOOT_TIMEOUT_MS;

	function scheduleMitzvahWorldEssentialTimeout(environment, callback, delayMilliseconds = ESSENTIAL_BOOT_TIMEOUT_MS) {
		const schedule = environment?.setTimeout?.bind(environment) || setTimeout;
		const timer = schedule(callback, Math.max(0, Number(delayMilliseconds) || 0));
		timer?.unref?.();
		return timer;
	}


	__exports.scheduleMitzvahWorldEssentialTimeout = scheduleMitzvahWorldEssentialTimeout;
	function cancelMitzvahWorldEssentialTimeout(environment, timer) {
		if (timer === undefined || timer === null) return;
		(environment?.clearTimeout?.bind(environment) || clearTimeout)(timer);
	}


	__exports.cancelMitzvahWorldEssentialTimeout = cancelMitzvahWorldEssentialTimeout;
	function readMitzvahWorldEssentialTime(environment) {
		return environment?.performance?.now?.() ?? Date.now();
	}

	__exports.readMitzvahWorldEssentialTime = readMitzvahWorldEssentialTime;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MitzvahWorldEssentialRecord.js ----
{
	const __exports = __awtsmoosModule_58;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldEssentialRecord.js
	 * @description Builds and reads one essential boot fact while keeping activation time distinct from most recent truthful progress.
	 * The Awtsmoos renews each fact whenever its vessel reveals another threshold; Awtsmoos.com therefore measures silence
	 * from the latest witnessed progress instead of condemning an active mobile load for total wall-clock age.
	 */

	function createEssentialRecord(definition) {
		return {
			...definition,
			completedAtMilliseconds: null,
			elapsedMilliseconds: 0,
			failedAtMilliseconds: null,
			failureCode: null,
			failureMessage: null,
			importerStage: null,
			lastProgressAtMilliseconds: null,
			resourceStatus: null,
			resourceUrl: null,
			startedAtMilliseconds: null,
			status: 'pending'
		};
	}


	__exports.createEssentialRecord = createEssentialRecord;
	function applyEssentialDetails(record, details = {}) {
		if ('importerStage' in details) record.importerStage = details.importerStage ?? null;
		if ('resourceStatus' in details) record.resourceStatus = details.resourceStatus ?? null;
		if ('resourceUrl' in details) record.resourceUrl = details.resourceUrl ?? null;
	}


	__exports.applyEssentialDetails = applyEssentialDetails;
	function isEssentialTerminal(status) {
		return status === 'complete' || status === 'failed' || status === 'timed-out';
	}


	__exports.isEssentialTerminal = isEssentialTerminal;
	function essentialDependenciesComplete(records, record) {
		return record.dependencies.every(name => records.get(name)?.status === 'complete');
	}

	__exports.essentialDependenciesComplete = essentialDependenciesComplete;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MitzvahWorldEssentialTiming.js ----
{
	const __exports = __awtsmoosModule_57;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldEssentialTiming.js
	 * @description Owns activation and silence-deadline arithmetic for essential first-play facts.
	 * The Awtsmoos renews every dependency only when its vessel can truly receive the next light;
	 * Awtsmoos.com therefore measures each active fact from its latest witnessed progress, never from stale wall-clock memory.
	 */

	const essentialDependenciesComplete = __awtsmoosModule_58.essentialDependenciesComplete;

	function activateReadyEssentialRecords(records, currentTime) {
		const activated = [];
		for (const record of records.values()) {
			if (record.status !== 'pending' || record.startedAtMilliseconds !== null) continue;
			if (!essentialDependenciesComplete(records, record)) continue;
			record.startedAtMilliseconds = currentTime;
			record.lastProgressAtMilliseconds = currentTime;
			activated.push(record.name);
		}
		return activated;
	}


	__exports.activateReadyEssentialRecords = activateReadyEssentialRecords;
	function touchEssentialRecord(record, currentTime) {
		if (record.status !== 'pending' || record.startedAtMilliseconds === null) return false;
		record.lastProgressAtMilliseconds = currentTime;
		return true;
	}


	__exports.touchEssentialRecord = touchEssentialRecord;
	function essentialRecordTimedOut(record, currentTime) {
		if (record.startedAtMilliseconds === null) return false;
		const latest = record.lastProgressAtMilliseconds ?? record.startedAtMilliseconds;
		return currentTime - latest >= record.timeoutMilliseconds;
	}


	__exports.essentialRecordTimedOut = essentialRecordTimedOut;
	function firstTimedOutEssentialRecord(records, currentTime) {
		return [...records.values()].find(record => {
			return record.status === 'pending' && essentialRecordTimedOut(record, currentTime);
		}) || null;
	}


	__exports.firstTimedOutEssentialRecord = firstTimedOutEssentialRecord;
	function firstActiveEssentialRecord(records) {
		return [...records.values()].find(record => {
			return record.status === 'pending' && record.startedAtMilliseconds !== null;
		}) || null;
	}


	__exports.firstActiveEssentialRecord = firstActiveEssentialRecord;
	function essentialElapsedMilliseconds(record, currentTime) {
		if (record.status !== 'pending') return record.elapsedMilliseconds;
		if (record.startedAtMilliseconds === null) return 0;
		return Math.max(0, currentTime - record.startedAtMilliseconds);
	}

	__exports.essentialElapsedMilliseconds = essentialElapsedMilliseconds;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MitzvahWorldEssentialDeadlinePolicy.js ----
{
	const __exports = __awtsmoosModule_56;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldEssentialDeadlinePolicy.js
	 * @description Names dependency, silence, and whole-first-play timeout failures without owning mutation or timers.
	 * The Awtsmoos gives every bounded delay its truthful name; Awtsmoos.com distinguishes a silent milestone
	 * from the outer hard horizon so diagnostics never confuse local stillness with total first-play exhaustion.
	 */

	const ESSENTIAL_HARD_TIMEOUT_MS = __awtsmoosModule_55.ESSENTIAL_HARD_TIMEOUT_MS;
	const essentialRecordTimedOut = __awtsmoosModule_57.essentialRecordTimedOut;

	function essentialDependencyFailure(details, missing) {
		return {
			...details,
			failureCode: 'ESSENTIAL_DEPENDENCY_INCOMPLETE',
			failureMessage: `Dependency ${missing} was not complete.`
		};
	}


	__exports.essentialDependencyFailure = essentialDependencyFailure;
	function essentialDeadlineFailure(record, currentTime, bootStartedAt, details = {}) {
		if (essentialRecordTimedOut(record, currentTime)) {
			return timeoutDetails(record, details, record.timeoutFailureCode, currentTime);
		}
		if (currentTime - bootStartedAt >= ESSENTIAL_HARD_TIMEOUT_MS) {
			return timeoutDetails(record, details, 'ESSENTIAL_FIRST_PLAY_HARD_TIMEOUT', currentTime);
		}
		return null;
	}


	__exports.essentialDeadlineFailure = essentialDeadlineFailure;
	function timeoutDetails(record, details, failureCode, nowMilliseconds = Date.now()) {
		const startedAt = record.startedAtMilliseconds ?? nowMilliseconds;
		const elapsedMilliseconds = Math.max(0, nowMilliseconds - startedAt);
		return {
			...details,
			elapsedMilliseconds,
			failureCode,
			failureMessage: `${record.label} missed the bounded first-play deadline after ${Math.round(elapsedMilliseconds)} ms ` +
				`(stage: ${details.importerStage || record.importerStage || 'essential-boot'}; ` +
				`deadline: ${record.timeoutMilliseconds} ms).`,
			status: 'timed-out'
		};
	}

	__exports.timeoutDetails = timeoutDetails;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MitzvahWorldEssentialFailurePresenter.js ----
{
	const __exports = __awtsmoosModule_59;
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
	const __exports = __awtsmoosModule_60;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldEssentialSnapshot.js
	 * @description Freezes essential boot truth while preserving the difference between queued time and active measured time.
	 * The Awtsmoos renews each hidden dependency before its clock may honestly begin;
	 * Awtsmoos.com shows queued facts at zero, active facts aging, and terminal facts sealed where their evidence has been.
	 */

	const essentialElapsedMilliseconds = __awtsmoosModule_57.essentialElapsedMilliseconds;
	const firstActiveEssentialRecord = __awtsmoosModule_57.firstActiveEssentialRecord;

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

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MitzvahWorldEssentialWatchdog.js ----
{
	const __exports = __awtsmoosModule_61;
	// B"H
	// Boruch Hashem
	// Blessed is He

	const ESSENTIAL_HARD_TIMEOUT_MS = __awtsmoosModule_55.ESSENTIAL_HARD_TIMEOUT_MS;
	const cancelMitzvahWorldEssentialTimeout = __awtsmoosModule_54.cancelMitzvahWorldEssentialTimeout;
	const readMitzvahWorldEssentialTime = __awtsmoosModule_54.readMitzvahWorldEssentialTime;
	const scheduleMitzvahWorldEssentialTimeout = __awtsmoosModule_54.scheduleMitzvahWorldEssentialTimeout;

	/**
	 * @file MitzvahWorldEssentialWatchdog.js
	 * @description Schedules one timer for the earliest milestone-silence or whole-first-play deadline.
	 * The Awtsmoos gives each active fact its own measured silence while one horizon surrounds them all;
	 * Awtsmoos.com watches whichever truthful boundary arrives first instead of resetting stuck siblings together.
	 */
	class MitzvahWorldEssentialWatchdog {
		constructor(environment, startedAtMilliseconds, onTimeout) {
			this.environment = environment;
			this.startedAtMilliseconds = startedAtMilliseconds;
			this.onTimeout = onTimeout;
			this.timer = null;
		}

		rearm(records, currentTime = readMitzvahWorldEssentialTime(this.environment)) {
			this.cancel();
			const delay = nextEssentialWatchdogDelay(records, currentTime, this.startedAtMilliseconds);
			if (!Number.isFinite(delay)) return null;
			this.timer = scheduleMitzvahWorldEssentialTimeout(this.environment, this.onTimeout, delay);
			return this.timer;
		}

		cancel() {
			cancelMitzvahWorldEssentialTimeout(this.environment, this.timer);
			this.timer = null;
		}
	}


	__exports.MitzvahWorldEssentialWatchdog = MitzvahWorldEssentialWatchdog;
	function nextEssentialWatchdogDelay(records, currentTime, startedAtMilliseconds) {
		const remaining = [];
		for (const record of records.values()) {
			if (record.status !== 'pending' || record.startedAtMilliseconds === null) continue;
			const latest = record.lastProgressAtMilliseconds ?? record.startedAtMilliseconds;
			remaining.push(record.timeoutMilliseconds - (currentTime - latest));
		}
		remaining.push(ESSENTIAL_HARD_TIMEOUT_MS - (currentTime - startedAtMilliseconds));
		return Math.max(0, Math.min(...remaining));
	}


	__exports.nextEssentialWatchdogDelay = nextEssentialWatchdogDelay;
	function essentialHardTimeoutReached(currentTime, startedAtMilliseconds) {
		return currentTime - startedAtMilliseconds >= ESSENTIAL_HARD_TIMEOUT_MS;
	}

	__exports.essentialHardTimeoutReached = essentialHardTimeoutReached;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MitzvahWorldEssentialLedger.js ----
{
	const __exports = __awtsmoosModule_53;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldEssentialLedger.js
	 * @description Owns five essential facts while one watchdog observes each fact's silence and the whole first-play horizon.
	 * The Awtsmoos joins dependency to dependency without mistaking active revelation for delay;
	 * Awtsmoos.com refreshes only the fact that truly progressed while every silent sibling keeps its own finite night.
	 */

	const readMitzvahWorldEssentialTime = __awtsmoosModule_54.readMitzvahWorldEssentialTime;
	const essentialDeadlineFailure = __awtsmoosModule_56.essentialDeadlineFailure;
	const essentialDependencyFailure = __awtsmoosModule_56.essentialDependencyFailure;
	const timeoutDetails = __awtsmoosModule_56.timeoutDetails;
	const ESSENTIAL_MILESTONE_CATALOG = __awtsmoosModule_55.ESSENTIAL_MILESTONE_CATALOG;
	const presentMitzvahWorldEssentialFailure = __awtsmoosModule_59.presentMitzvahWorldEssentialFailure;
	const applyEssentialDetails = __awtsmoosModule_58.applyEssentialDetails;
	const createEssentialRecord = __awtsmoosModule_58.createEssentialRecord;
	const isEssentialTerminal = __awtsmoosModule_58.isEssentialTerminal;
	const createMitzvahWorldEssentialSnapshot = __awtsmoosModule_60.createMitzvahWorldEssentialSnapshot;
	const activateReadyEssentialRecords = __awtsmoosModule_57.activateReadyEssentialRecords;
	const firstActiveEssentialRecord = __awtsmoosModule_57.firstActiveEssentialRecord;
	const firstTimedOutEssentialRecord = __awtsmoosModule_57.firstTimedOutEssentialRecord;
	const touchEssentialRecord = __awtsmoosModule_57.touchEssentialRecord;
	const MitzvahWorldEssentialWatchdog = __awtsmoosModule_61.MitzvahWorldEssentialWatchdog;
	const essentialHardTimeoutReached = __awtsmoosModule_61.essentialHardTimeoutReached;

	class MitzvahWorldEssentialLedger {
		constructor(environment) {
			this.environment = environment;
			this.startedAtMilliseconds = readMitzvahWorldEssentialTime(environment);
			this.records = new Map(ESSENTIAL_MILESTONE_CATALOG.map(item => [item.name, createEssentialRecord(item)]));
			activateReadyEssentialRecords(this.records, this.startedAtMilliseconds);
			this.watchdog = new MitzvahWorldEssentialWatchdog(environment, this.startedAtMilliseconds, () => this.timeout());
			this.rearmWatchdog(this.startedAtMilliseconds);
			this.publish();
		}

		update(name, details = {}) {
			const record = this.requireRecord(name);
			if (!isEssentialTerminal(record.status)) {
				const now = readMitzvahWorldEssentialTime(this.environment);
				applyEssentialDetails(record, details);
				touchEssentialRecord(record, now);
				this.rearmWatchdog(now);
			}
			return this.publish();
		}

		complete(name, details = {}) {
			const record = this.requireRecord(name);
			if (isEssentialTerminal(record.status)) return this.snapshot();
			const missing = record.dependencies.find(dependency => this.records.get(dependency)?.status !== 'complete');
			if (missing) return this.fail(name, essentialDependencyFailure(details, missing));
			const now = readMitzvahWorldEssentialTime(this.environment);
			const failure = essentialDeadlineFailure(record, now, this.startedAtMilliseconds, details);
			if (failure) return this.fail(name, failure);
			applyEssentialDetails(record, details);
			record.lastProgressAtMilliseconds = now;
			record.status = 'complete';
			record.completedAtMilliseconds = now;
			record.elapsedMilliseconds = now - record.startedAtMilliseconds;
			activateReadyEssentialRecords(this.records, now);
			this.rearmWatchdog(now);
			return this.publish();
		}

		fail(name, details = {}) {
			const record = this.requireRecord(name);
			if (isEssentialTerminal(record.status)) return this.snapshot();
			const now = readMitzvahWorldEssentialTime(this.environment);
			applyEssentialDetails(record, details);
			record.status = details.status || 'failed';
			record.failureCode = details.failureCode || 'ESSENTIAL_BOOT_FAILURE';
			record.failureMessage = details.failureMessage || null;
			record.failedAtMilliseconds = now;
			record.elapsedMilliseconds = now - (record.startedAtMilliseconds ?? this.startedAtMilliseconds);
			this.cancelWatchdog();
			const snapshot = this.publish();
			presentMitzvahWorldEssentialFailure(this.environment, snapshot.stalledMilestone);
			return snapshot;
		}

		timeout() {
			const now = readMitzvahWorldEssentialTime(this.environment);
			const overdue = firstTimedOutEssentialRecord(this.records, now);
			if (overdue) return this.fail(overdue.name, timeoutDetails(overdue, {}, overdue.timeoutFailureCode, now));
			if (essentialHardTimeoutReached(now, this.startedAtMilliseconds)) {
				const record = firstActiveEssentialRecord(this.records);
				if (record) return this.fail(record.name, timeoutDetails(record, {}, 'ESSENTIAL_FIRST_PLAY_HARD_TIMEOUT', now));
			}
			this.rearmWatchdog(now);
			return this.publish();
		}

		cancelWatchdog() {
			this.watchdog?.cancel();
			this.timer = null;
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

		rearmWatchdog(now) {
			if ([...this.records.values()].every(record => isEssentialTerminal(record.status))) return this.cancelWatchdog();
			this.timer = this.watchdog.rearm(this.records, now);
		}
	}

	__exports.MitzvahWorldEssentialLedger = MitzvahWorldEssentialLedger;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MitzvahWorldWebGlCapabilityGate.js ----
{
	const __exports = __awtsmoosModule_62;
	//B"H
	//Boruch Hashem
	//Blessed is He

	/**
	 * @file MitzvahWorldWebGlCapabilityGate.js
	 * @description Probes genuine WebGL capability before the first-frame silence clock may begin.
	 * The Awtsmoos tests the vessel before measuring its silence; Awtsmoos.com therefore learns whether
	 * any three-dimensional doorway exists at all before any milestone timer starts counting, so a missing
	 * GPU fails fast with its own name instead of masquerading as a slow first frame.
	 */

	const WEBGL_UNAVAILABLE_CODE = 'WEBGL_UNAVAILABLE';

	__exports.WEBGL_UNAVAILABLE_CODE = WEBGL_UNAVAILABLE_CODE;
	const CONTEXT_ATTEMPTS = Object.freeze(['webgl', 'experimental-webgl']);
	const CAPABILITY_KEY = 'AwtsmoosMitzvahWorldWebGlCapability';

	/**
	 * Synchronously probes WebGL on a scratch canvas and releases the probe context.
	 * Safe to run before the essential ledger exists; never throws.
	 * Returns a tri-state: supported true (context obtained), false (DOM present but no
	 * context — fail closed), or null (no DOM to probe, e.g. tests — do not gate).
	 * @param {object} [environment=globalThis] Browser-like environment.
	 * @returns {object} Frozen capability evidence with a stable failure code.
	 */
	function probeMitzvahWorldWebGlCapability(environment = globalThis) {
		const detectedAtMs = readTime(environment);
		const document = environment?.document;
		if (!document || typeof document.createElement !== 'function') {
			return unknown('no-document', detectedAtMs, environment);
		}
		let canvas = null;
		try {
			canvas = document.createElement('canvas');
		} catch (error) {
			return unknown('canvas-unavailable', detectedAtMs, environment);
		}
		if (!canvas || typeof canvas.getContext !== 'function') {
			return unknown('canvas-unavailable', detectedAtMs, environment);
		}
		let context = null;
		let contextName = null;
		let lastError = null;
		for (const attempt of CONTEXT_ATTEMPTS) {
			try {
				context = canvas.getContext(attempt, {
					alpha: true,
					antialias: false,
					premultipliedAlpha: true
				});
			} catch (error) {
				lastError = error;
				context = null;
			}
			if (context) {
				contextName = attempt;
				break;
			}
		}
		const elapsedMs = readTime(environment) - detectedAtMs;
		if (!context) {
			return unsupported('context-unavailable', detectedAtMs, environment, lastError, elapsedMs);
		}
		releaseProbeContext(context);
		return Object.freeze({
			code: 'WEBGL_AVAILABLE',
			contextAttempts: [...CONTEXT_ATTEMPTS],
			contextName,
			detectedAtMs,
			devicePixelRatio: Number(environment?.devicePixelRatio) || 1,
			elapsedMs,
			message: `WebGL capability confirmed (${contextName}).`,
			supported: true
		});
	}


	__exports.probeMitzvahWorldWebGlCapability = probeMitzvahWorldWebGlCapability;
	/** Remembers probe evidence so later stages never pay for a second probe context. */
	function rememberMitzvahWorldWebGlCapability(environment = globalThis, evidence) {
		if (!environment || !evidence) return evidence;
		try {
			Object.defineProperty(environment, CAPABILITY_KEY, {
				configurable: true,
				enumerable: false,
				value: Object.freeze({ ...evidence }),
				writable: false
			});
		} catch {
			environment[CAPABILITY_KEY] = Object.freeze({ ...evidence });
		}
		return environment[CAPABILITY_KEY];
	}


	__exports.rememberMitzvahWorldWebGlCapability = rememberMitzvahWorldWebGlCapability;
	/** Returns remembered probe evidence or null when no probe has run yet. */
	function readMitzvahWorldWebGlCapability(environment = globalThis) {
		const evidence = environment?.[CAPABILITY_KEY];
		return evidence && typeof evidence === 'object' ? evidence : null;
	}


	__exports.readMitzvahWorldWebGlCapability = readMitzvahWorldWebGlCapability;
	/** Releases the scratch probe context so it never consumes a browser context slot. */
	function releaseProbeContext(context) {
		try {
			context.getExtension?.('WEBGL_lose_context')?.loseContext();
		} catch {}
	}

	function unsupported(reason, detectedAtMs, environment, error, elapsedMs = 0) {
		return Object.freeze({
			code: WEBGL_UNAVAILABLE_CODE,
			contextAttempts: [...CONTEXT_ATTEMPTS],
			contextName: null,
			detectedAtMs,
			devicePixelRatio: Number(environment?.devicePixelRatio) || 1,
			elapsedMs,
			errorName: error?.name || 'ContextUnavailable',
			message: 'Mitzvah World requires WebGL to play.',
			reason,
			supported: false
		});
	}

	/** No DOM exists to probe (tests, workers): capability is unknown, never a failure. */
	function unknown(reason, detectedAtMs, environment) {
		return Object.freeze({
			code: 'WEBGL_UNKNOWN',
			contextAttempts: [...CONTEXT_ATTEMPTS],
			contextName: null,
			detectedAtMs,
			devicePixelRatio: Number(environment?.devicePixelRatio) || 1,
			elapsedMs: 0,
			errorName: null,
			message: 'WebGL capability could not be probed in this environment.',
			reason,
			supported: null
		});
	}

	function readTime(environment) {
		return environment?.performance?.now?.() ?? Date.now();
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MitzvahWorldBootStateMachine.js ----
{
	const __exports = __awtsmoosModule_63;
	//B"H
	//Boruch Hashem
	//Blessed is He

	/**
	 * @file MitzvahWorldBootStateMachine.js
	 * @description Owns the one boot truth behind bootStage, runtimeState, and the visible veil.
	 * The Awtsmoos speaks one word while many ears receive it; Awtsmoos.com therefore lets every surface —
	 * the boot stage attribute, the runtime state attributes, and the blocking loader veil — derive from a
	 * single transition table, so ready can never be reported while starting or failed, and failed is terminal.
	 */

	const MACHINE_KEY = 'AwtsmoosMitzvahWorldBootStateInternal';
	const ROOT_ID = 'mitzvah-world-root';
	const VEIL_ID = 'menuBoot';

	const TRANSITIONS = Object.freeze({
		'starting': Object.freeze(['detecting-webgl', 'painting', 'failed']),
		'detecting-webgl': Object.freeze(['starting', 'painting', 'renderer-creating', 'failed']),
		'painting': Object.freeze(['renderer-creating', 'launcher-loading', 'failed', 'starting']),
		'renderer-creating': Object.freeze(['first-frame-painting', 'failed', 'starting']),
		'first-frame-painting': Object.freeze(['launcher-loading', 'world-loading', 'failed', 'starting']),
		'launcher-loading': Object.freeze(['launching', 'failed', 'starting']),
		'launching': Object.freeze(['world-loading', 'failed', 'starting']),
		'world-loading': Object.freeze(['ready', 'failed', 'starting']),
		'ready': Object.freeze([]),
		'failed': Object.freeze([])
	});

	/** Returns the current machine state without mutating anything. */
	function readMitzvahWorldBootState(environment = globalThis) {
		const record = environment?.[MACHINE_KEY];
		if (record && typeof record === 'object' && typeof record.state === 'string') {
			return Object.freeze({ ...record, evidence: record.evidence ? { ...record.evidence } : null });
		}
		return Object.freeze({ state: 'starting', evidence: null, updatedAtMs: 0 });
	}


	__exports.readMitzvahWorldBootState = readMitzvahWorldBootState;
	/**
	 * Moves the machine to the next state and publishes bootStage, runtimeState, and veil from it.
	 * Illegal transitions are refused (never throwing): ready can never be reached while starting or failed.
	 * @param {object} [environment=globalThis] Environment owning the machine.
	 * @param {Document} [documentValue] Document carrying the game root and veil.
	 * @param {string} next Requested state.
	 * @param {object} [evidence] Failure or readiness evidence for the failed/ready states.
	 * @returns {string} The resulting state.
	 */
	function transitionMitzvahWorldBootState(environment = globalThis, documentValue = null, next, evidence = null) {
		const record = ensureRecord(environment);
		const current = record.state;
		const requested = String(next || 'starting');
		if (requested === current) {
			publish(record, documentValue || environment?.document);
			return current;
		}
		const allowed = TRANSITIONS[current] || [];
		if (!allowed.includes(requested)) {
			refusedTransition(current, requested, evidence);
			if (!record.published) publish(record, documentValue || environment?.document);
			return current;
		}
		record.state = requested;
		record.evidence = evidence ? Object.freeze({ ...evidence }) : null;
		record.updatedAtMs = readTime(environment);
		publish(record, documentValue || environment?.document);
		return requested;
	}


	__exports.transitionMitzvahWorldBootState = transitionMitzvahWorldBootState;
	/** Restarts the machine to starting from any state except ready (explicit world relaunch/retry). */
	function restartMitzvahWorldBootState(environment = globalThis, documentValue = null) {
		const record = ensureRecord(environment);
		if (record.state === 'ready') return record.state;
		if (record.state === 'failed') {
			record.state = 'starting';
			record.evidence = null;
			record.updatedAtMs = readTime(environment);
			publish(record, documentValue || environment?.document);
			return 'starting';
		}
		return transitionMitzvahWorldBootState(environment, documentValue, 'starting', null);
	}


	__exports.restartMitzvahWorldBootState = restartMitzvahWorldBootState;
	/** Re-publishes the current state's veil without transitioning (loading screen re-block). */
	function ensureMitzvahWorldBootVeil(environment = globalThis, documentValue = null) {
		const record = ensureRecord(environment);
		publish(record, documentValue || environment?.document);
		return record.state;
	}


	__exports.ensureMitzvahWorldBootVeil = ensureMitzvahWorldBootVeil;
	/** Derives the public runtime state from the single machine state. */
	function deriveMitzvahWorldRuntimeState(state) {
		if (state === 'ready') return 'playable';
		if (state === 'failed') return 'failed';
		return 'starting';
	}


	__exports.deriveMitzvahWorldRuntimeState = deriveMitzvahWorldRuntimeState;
	function ensureRecord(environment) {
		if (!environment) return { state: 'starting', evidence: null, updatedAtMs: 0 };
		let record = environment[MACHINE_KEY];
		if (!record || typeof record !== 'object') {
			record = { state: 'starting', evidence: null, updatedAtMs: readTime(environment) };
			try {
				Object.defineProperty(environment, MACHINE_KEY, {
					configurable: true,
					enumerable: false,
					value: record,
					writable: false
				});
			} catch {
				environment[MACHINE_KEY] = record;
			}
		}
		return record;
	}

	/** Publishes the machine state onto every historical surface at once. */
	function publish(record, documentValue) {
		record.published = true;
		const state = record.state;
		const runtimeState = deriveMitzvahWorldRuntimeState(state);
		const root = documentValue?.getElementById?.(ROOT_ID) || null;
		const documentRoot = documentValue?.documentElement || null;
		for (const target of [documentRoot, root]) {
			if (!target?.dataset) continue;
			target.dataset.awtsmoosRuntime = runtimeState;
			target.dataset.awtsmoosRuntimeState = runtimeState;
			target.dataset.awtsmoosGameplay = state === 'ready' ? 'true' : 'false';
			if (state === 'failed') {
				target.dataset.awtsmoosRuntimeError = record.evidence?.message || String(record.evidence?.code || 'failed');
			} else {
				target.dataset.awtsmoosRuntimeError = '';
			}
			try {
				target.setAttribute('aria-busy', runtimeState === 'starting' ? 'true' : 'false');
			} catch {}
		}
		if (root?.dataset) {
			root.dataset.awtsmoosBootStage = state;
			if (state === 'ready') {
				root.dataset.awtsmoosMenuReady = 'true';
			} else {
				delete root.dataset.awtsmoosMenuReady;
			}
		}
		publishVeil(record, documentValue);
		try {
			if (typeof globalThis !== 'undefined') {
				globalThis.AwtsmoosMitzvahWorldBootState = Object.freeze({
					evidence: record.evidence,
					runtimeState,
					state,
					updatedAtMs: record.updatedAtMs
				});
			}
		} catch {}
	}

	/** Keeps the blocking veil visible in every state except ready. */
	function publishVeil(record, documentValue) {
		const veil = documentValue?.getElementById?.(VEIL_ID) || null;
		if (!veil) return;
		const ready = record.state === 'ready';
		try {
			veil.hidden = ready;
			veil.setAttribute('aria-hidden', ready ? 'true' : 'false');
			veil.setAttribute('aria-busy', ready ? 'false' : 'true');
			if (ready) veil.dataset.loadingComplete = 'true';
			else delete veil.dataset.loadingComplete;
		} catch {}
	}

	function refusedTransition(current, requested, evidence) {
		try {
			globalThis.console?.warn?.(
				`B"H MitzvahWorld boot state refused: ${current} -> ${requested}.`,
				evidence?.code || ''
			);
		} catch {}
	}

	function readTime(environment) {
		return environment?.performance?.now?.() ?? Date.now();
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MitzvahWorldEssentialBoot.js ----
{
	const __exports = __awtsmoosModule_52;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldEssentialBoot.js
	 * @description Publishes one environment-owned essential ledger across source modules and independently compiled runtime chunks.
	 * The Awtsmoos is one while many vessels reveal His light; Awtsmoos.com lets entry, renderer, terrain, Chossid, and movement
	 * testify into one shared Malchus whose silence clocks renew with real progress and whose outer first-play horizon stays finite.
	 */

	const MitzvahWorldEssentialLedger = __awtsmoosModule_53.MitzvahWorldEssentialLedger;
	const dismissMitzvahWorldEssentialFailure = __awtsmoosModule_59.dismissMitzvahWorldEssentialFailure;
	const CATALOG_MILESTONES = __awtsmoosModule_55.ESSENTIAL_MILESTONES;
	const probeMitzvahWorldWebGlCapability = __awtsmoosModule_62.probeMitzvahWorldWebGlCapability;
	const readMitzvahWorldWebGlCapability = __awtsmoosModule_62.readMitzvahWorldWebGlCapability;
	const rememberMitzvahWorldWebGlCapability = __awtsmoosModule_62.rememberMitzvahWorldWebGlCapability;
	const WEBGL_UNAVAILABLE_CODE = __awtsmoosModule_62.WEBGL_UNAVAILABLE_CODE;
	const transitionMitzvahWorldBootState = __awtsmoosModule_63.transitionMitzvahWorldBootState;
	__exports.ESSENTIAL_MILESTONES = __awtsmoosModule_55.ESSENTIAL_MILESTONES;

	const LEDGER_KEY = 'AwtsmoosMitzvahWorldEssentialLedgerInternal';
	const RESTART_ENTRY_STAGE = 'world-launch-restart';

	function initializeMitzvahWorldEssentialBoot(environment = globalThis) {
		if (!environment[LEDGER_KEY]) {
			gateWebGlCapabilityBeforeLedger(environment);
			installLedger(environment, new MitzvahWorldEssentialLedger(environment));
		}
		return environment[LEDGER_KEY];
	}


	__exports.initializeMitzvahWorldEssentialBoot = initializeMitzvahWorldEssentialBoot;
	/** Restarts first-play custody so menu-idle evidence can never poison a later world click. */
	function restartMitzvahWorldEssentialBoot(environment = globalThis) {
		gateWebGlCapabilityBeforeLedger(environment);
		const previous = environment[LEDGER_KEY] || null;
		const entryEvidence = readEntryEvidence(previous) || { importerStage: RESTART_ENTRY_STAGE };
		previous?.cancelWatchdog?.();
		dismissMitzvahWorldEssentialFailure(environment);
		installLedger(environment, new MitzvahWorldEssentialLedger(environment));
		return completeMitzvahWorldEssentialMilestone(
			environment,
			CATALOG_MILESTONES.ENTRY_MODULE_EXECUTED,
			entryEvidence
		);
	}


	__exports.restartMitzvahWorldEssentialBoot = restartMitzvahWorldEssentialBoot;
	/**
	 * Detects WebGL capability BEFORE the essential ledger exists, so the first-frame
	 * silence clock can never start on a device with no three-dimensional doorway.
	 * Fails the first-frame milestone closed with WEBGL_UNAVAILABLE and throws.
	 */
	function gateWebGlCapabilityBeforeLedger(environment) {
		let capability = readMitzvahWorldWebGlCapability(environment);
		if (!capability) {
			capability = probeMitzvahWorldWebGlCapability(environment);
			rememberMitzvahWorldWebGlCapability(environment, capability);
		}
		if (capability.supported !== false) return;
		const ledger = new MitzvahWorldEssentialLedger(environment);
		installLedger(environment, ledger);
		ledger.fail(CATALOG_MILESTONES.RENDERER_FIRST_FRAME, {
			failureCode: WEBGL_UNAVAILABLE_CODE,
			failureMessage: capability.message,
			importerStage: 'webgl-capability-probe',
			resourceStatus: capability.reason || 'context-unavailable',
			resourceUrl: environment.location?.href || 'unknown'
		});
		transitionMitzvahWorldBootState(environment, environment?.document, 'failed', {
			code: WEBGL_UNAVAILABLE_CODE,
			message: capability.message,
			stage: 'webgl-capability-probe'
		});
		const error = new Error(capability.message);
		error.name = 'WebGlCapabilityError';
		error.code = WEBGL_UNAVAILABLE_CODE;
		throw error;
	}

	function installLedger(environment, ledger) {
		Object.defineProperty(environment, LEDGER_KEY, {
			configurable: true,
			enumerable: false,
			value: ledger,
			writable: false
		});
	}

	function readEntryEvidence(previous) {
		const record = previous?.records?.get?.(CATALOG_MILESTONES.ENTRY_MODULE_EXECUTED);
		if (!record || record.status !== 'complete') return null;
		const evidence = {};
		if (record.importerStage != null) evidence.importerStage = record.importerStage;
		if (record.resourceUrl != null) evidence.resourceUrl = record.resourceUrl;
		if (record.resourceStatus != null) evidence.resourceStatus = record.resourceStatus;
		if (Object.keys(evidence).length === 0) evidence.importerStage = RESTART_ENTRY_STAGE;
		return evidence;
	}

	function updateMitzvahWorldEssentialMilestone(environment, name, details = {}) {
		return initializeMitzvahWorldEssentialBoot(environment).update(name, details);
	}


	__exports.updateMitzvahWorldEssentialMilestone = updateMitzvahWorldEssentialMilestone;
	function completeMitzvahWorldEssentialMilestone(environment, name, details = {}) {
		return initializeMitzvahWorldEssentialBoot(environment).complete(name, details);
	}


	__exports.completeMitzvahWorldEssentialMilestone = completeMitzvahWorldEssentialMilestone;
	function failMitzvahWorldEssentialMilestone(environment, name, details = {}) {
		return initializeMitzvahWorldEssentialBoot(environment).fail(name, details);
	}


	__exports.failMitzvahWorldEssentialMilestone = failMitzvahWorldEssentialMilestone;
	function getMitzvahWorldEssentialBootSnapshot(environment = globalThis) {
		return initializeMitzvahWorldEssentialBoot(environment).snapshot();
	}

	__exports.getMitzvahWorldEssentialBootSnapshot = getMitzvahWorldEssentialBootSnapshot;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MitzvahWorldStartupMilestones.js ----
{
	const __exports = __awtsmoosModule_64;
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

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapEssentialPrimeAssembly.js ----
{
	const __exports = __awtsmoosModule_0;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapEssentialPrimeAssembly.js
	 * @description Creates the canonical Chossid, real collision movement, one rendered prime, and authoritative first-control evidence.
	 * The Awtsmoos gives the traveler a real step before naming the step complete;
	 * Awtsmoos.com records movement only after body, collision, movement update, and visible render have all become fact.
	 */

	const startBootstrapEssentialMovementLoop = __awtsmoosModule_1.startBootstrapEssentialMovementLoop;
	const BootstrapMovementController = __awtsmoosModule_2.BootstrapMovementController;
	const createBootstrapEssentialPlayerRuntime = __awtsmoosModule_24.createBootstrapEssentialPlayerRuntime;
	const attachEretzWorldExperience = __awtsmoosModule_51.attachEretzWorldExperience;
	const ESSENTIAL_MILESTONES = __awtsmoosModule_52.ESSENTIAL_MILESTONES;
	const completeMitzvahWorldEssentialMilestone = __awtsmoosModule_52.completeMitzvahWorldEssentialMilestone;
	const markMitzvahWorldStartupMilestone = __awtsmoosModule_64.markMitzvahWorldStartupMilestone;

	/** Builds, visibly primes, and certifies the real player movement runtime before post-control systems. */
	function assembleBootstrapEssentialPrime(
		foundation,
		options,
		qualityProfile,
		boot,
		dependencies = {}
	) {
		const environment = options.environment || globalThis;
		const createPlayer = dependencies.createPlayerRuntime || createBootstrapEssentialPlayerRuntime;
		const MovementController = dependencies.MovementController || BootstrapMovementController;
		const startLoop = dependencies.startEssentialLoop || startBootstrapEssentialMovementLoop;
		boot.begin('bootstrap-essential-player');
		const runtime = createPlayer(foundation);
		attachEretzWorldExperience(runtime, options);
		runtime.combat = null;
		runtime.bootstrapHud = null;
		runtime.bootstrapMinimap = null;
		runtime.bootstrapFrames = 0;
		runtime.enrichedFrames = 0;

		boot.begin('bootstrap-essential-movement-prime');
		const movement = new MovementController(runtime);
		movement.update(0.001);
		renderPrime(runtime, now(environment));
		runtime.bootstrapFrames = 1;
		runtime.lastFrameError = null;
		runtime.runtimeFrameSource = 'essential-prime';
		publishMovementReady(environment);
		runtime.essentialMovementLoop = startLoop(runtime, movement, environment);
		return {
			diagnostics: essentialDiagnostics(runtime, movement, qualityProfile, boot),
			movement,
			runtime
		};
	}


	__exports.assembleBootstrapEssentialPrime = assembleBootstrapEssentialPrime;
	/** Publishes the existing movement fact only after the real prime movement transaction succeeds. */
	function publishMovementReady(environment) {
		completeMitzvahWorldEssentialMilestone(
			environment,
			ESSENTIAL_MILESTONES.PLAYER_MOVEMENT_ENABLED,
			{ importerStage: 'bootstrap-runtime-prime' }
		);
		markMitzvahWorldStartupMilestone(environment, 'playerControllable');
	}

	/** Renders the moved canonical player through the already-live foundation renderer. */
	function renderPrime(runtime, currentTime) {
		runtime.renderer.setInteractor(runtime.state, currentTime / 1000);
		runtime.renderer.render(runtime.scene, runtime.camera);
		runtime.lastFrameAt = currentTime;
	}

	/** Exposes only the facts needed before richer diagnostics hydrate after control. */
	function essentialDiagnostics(runtime, movement, qualityProfile, boot) {
		return {
			assets: runtime.assets,
			bootPhases: () => boot.snapshot(),
			bootstrap: true,
			ground: runtime.ground,
			mainOctree: runtime.mainOctree,
			movement,
			movementState: () => movement.snapshot(),
			player: runtime.player,
			qualityProfile: { ...qualityProfile },
			runtime,
			state: runtime.state,
			terrain: runtime.terrain,
			worldExperience: runtime.worldExperience
		};
	}

	function now(environment) {
		return environment?.performance?.now?.() ?? Date.now();
	}

}

export const assembleBootstrapEssentialPrime = __awtsmoosModule_0.assembleBootstrapEssentialPrime;
