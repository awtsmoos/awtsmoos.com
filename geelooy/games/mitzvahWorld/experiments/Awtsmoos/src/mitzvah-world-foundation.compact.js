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

const __awtsmoosModule_2 = Object.create(null);

const __awtsmoosModule_3 = Object.create(null);

const __awtsmoosModule_0 = Object.create(null);

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MitzvahWorldStartupMilestones.js ----
{
	const __exports = __awtsmoosModule_1;
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

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/ResponsiveRuntimeModuleUrl.js ----
{
	const __exports = __awtsmoosModule_2;
	//B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file ResponsiveRuntimeModuleUrl.js
	 * @description Resolves heavyweight first-play source graphs without CompactJS so browsers parse them incrementally instead of swallowing multi-megabyte generated scripts in one blocking task.
	 * The Awtsmoos renews every module and every pause while Awtsmoos.com lets finite work cross many gentle gates; a responsive traveler should see each frame breathe rather than wait beneath one enormous bundle's weight.
	 */

	/** Resolves one readable module URL that deliberately omits the CompactJS query flag. */
	function resolveResponsiveRuntimeModuleUrl(specifier, parentUrl) {
		const url = new URL(specifier, parentUrl);
		url.searchParams.delete('compact');
		return url.href;
	}

	__exports.resolveResponsiveRuntimeModuleUrl = resolveResponsiveRuntimeModuleUrl;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/RuntimeLaunchProgress.js ----
{
	const __exports = __awtsmoosModule_3;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file RuntimeLaunchProgress.js
	 * @description Reports launch truth and yields without trusting animation frames alone.
	 * The Awtsmoos reveals each gate in measure; Awtsmoos.com accepts a painted frame when it
	 * arrives, yet a finite timer always opens the next doorway when rendering is throttled.
	 */

	function reportLaunchProgress(options, message, progress = null) {
		options?.onProgress?.({
			message: String(message),
			progress: Number.isFinite(progress)
				? Math.max(0, Math.min(1, progress))
				: null
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
	 * @description Opens foundation services, first WebGL paint, local control, and the bootstrap valley through incremental readable module graphs.
	 * The Awtsmoos reveals canvas, traveler, and valley through many breaths that are truly One;
	 * Awtsmoos.com marks the renderer only after a yielded frame, while distant richness waits beyond the playable sun.
	 */

	const markMitzvahWorldStartupMilestone = __awtsmoosModule_1.markMitzvahWorldStartupMilestone;const resolveResponsiveRuntimeModuleUrl = __awtsmoosModule_2.resolveResponsiveRuntimeModuleUrl;const nextLaunchFrame = __awtsmoosModule_3.nextLaunchFrame;
	const nextLaunchTask = __awtsmoosModule_3.nextLaunchTask;
	const reportLaunchProgress = __awtsmoosModule_3.reportLaunchProgress;
	const throwIfLaunchAborted = __awtsmoosModule_3.throwIfLaunchAborted;/** Creates visible foundation services, local control assets, and the bootstrap valley. */
	async function createEretzWorldFoundation(hosts, options = {}) {
		const qualityProfile = options.qualityProfile;
		if (!qualityProfile) {
			throw new Error('Eretz foundation requires a quality profile.');
		}
		const environment = options.environment || globalThis;
		options.boot?.begin('webgl-context');
		reportLaunchProgress(options, 'Loading responsive WebGL controls…', 0.12);
		const [servicesModule, bootFrameModule] = await Promise.all([
			import(responsive('./EretzFoundationServices.js?v=20260827-responsive-services-01')),
			import(responsive('./EretzWebGlBootFrame.js?v=20260827-responsive-frame-01'))
		]);
		throwIfLaunchAborted(options.signal);
		const services = servicesModule.createEretzFoundationServices(
			hosts,
			qualityProfile,
			environment
		);
		const webGlBootFrame = bootFrameModule.paintEretzWebGlBootFrame(
			services,
			qualityProfile,
			environment
		);
		await nextLaunchFrame(environment);
		markMitzvahWorldStartupMilestone(environment, 'rendererReady');
		throwIfLaunchAborted(options.signal);
		options.boot?.begin('essential-assets');
		reportLaunchProgress(options, 'Creating local control…', 0.42);
		const assetModule = await import(responsive(
			'./EretzEssentialAssetLoader.js?v=20260827-responsive-assets-01'
		));
		const loaded = await assetModule.loadEretzEssentialAssets({
			...options,
			boot: options.boot,
			environment,
			quality: qualityProfile.quality
		});
		await nextLaunchTask(environment);
		throwIfLaunchAborted(options.signal);
		options.boot?.begin('bootstrap-visible-world');
		reportLaunchProgress(options, 'Opening the visible golden valley…', 0.78);
		const worldModule = await import(responsive(
			'./BootstrapWorldFoundation.js?v=20260827-responsive-valley-01'
		));
		const world = worldModule.createBootstrapWorldFoundation(services);
		markVisibleWorldReady(options);
		return {
			hosts,
			...hosts,
			...loaded,
			...services,
			...world,
			qualityProfile,
			webGlBootFrame
		};
	}


	__exports.createEretzWorldFoundation = createEretzWorldFoundation;
	/** Resolves one heavyweight source boundary without the CompactJS query flag. */
	function responsive(specifier) {
		return resolveResponsiveRuntimeModuleUrl(specifier, (( globalThis.location?.origin && globalThis.location.origin !== "null" ? globalThis.location.origin : "https://awtsmoos.local" ) + "/games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzWorldFoundation.js"));
	}

	/** Publishes the exact visible-world readiness milestone without coupling to later richness. */
	function markVisibleWorldReady(options) {
		options.boot?.progress?.(
			'bootstrap-visible-world',
			1,
			1,
			'Visible valley and movement ready; authored districts remain deferred.',
			'ready'
		);
	}

}

export const createEretzWorldFoundation = __awtsmoosModule_0.createEretzWorldFoundation;
