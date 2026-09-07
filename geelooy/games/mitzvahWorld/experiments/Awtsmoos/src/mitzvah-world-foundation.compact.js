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
	 * @description Opens WebGL, local bootstrap assets, and a visible meadow while reporting the exact module gate currently awaited.
	 * The Awtsmoos gives earth beneath the foot before distant beauty descends; Awtsmoos.com reveals a playable valley first,
	 * and names each finite doorway so renderer, traveler, or meadow failure can never hide behind an eternal zero-percent night.
	 */

	const markMitzvahWorldStartupMilestone = __awtsmoosModule_1.markMitzvahWorldStartupMilestone;
	const resolveResponsiveRuntimeModuleUrl = __awtsmoosModule_2.resolveResponsiveRuntimeModuleUrl;
	const nextLaunchFrame = __awtsmoosModule_3.nextLaunchFrame;
	const reportLaunchProgress = __awtsmoosModule_3.reportLaunchProgress;
	const throwIfLaunchAborted = __awtsmoosModule_3.throwIfLaunchAborted;

	/** Creates the minimum visible world required for movement before optional remote enrichment. */
	async function createEretzWorldFoundation(hosts, options = {}) {
		const qualityProfile = options.qualityProfile;
		if (!qualityProfile) throw new Error('Eretz foundation requires a quality profile.');
		const environment = options.environment || globalThis;
		options.boot?.begin('webgl-context');
		reportLaunchProgress(options, 'Opening responsive WebGL controls…', 0.12, {
			stage: 'foundation-renderer-modules',
			url: rendererModuleEvidenceUrl()
		});
		const [servicesModule, bootFrameModule] = await Promise.all([
			import(responsive('./EretzFoundationServices.js?v=20260827-responsive-services-01')),
			import(responsive('./EretzWebGlBootFrame.js?v=20260827-responsive-frame-01'))
		]);
		throwIfLaunchAborted(options.signal);
		const services = servicesModule.createEretzFoundationServices(hosts, qualityProfile, environment);
		const webGlBootFrame = bootFrameModule.paintEretzWebGlBootFrame(services, qualityProfile, environment);
		await nextLaunchFrame(environment);
		markMitzvahWorldStartupMilestone(environment, 'rendererReady');
		throwIfLaunchAborted(options.signal);
		options.boot?.begin('essential-assets');
		reportLaunchProgress(options, 'Preparing the local traveler…', 0.38, {
			stage: 'essential-local-assets',
			url: responsive('./EretzEssentialAssetLoader.js?v=20260907-play-first-assets-01')
		});
		const assetModule = await import(responsive(
			'./EretzEssentialAssetLoader.js?v=20260907-play-first-assets-01'
		));
		const loaded = await assetModule.loadEretzEssentialAssets({
			...options,
			boot: options.boot,
			environment,
			quality: qualityProfile.quality
		});
		throwIfLaunchAborted(options.signal);
		options.boot?.begin('bootstrap-visible-world');
		reportLaunchProgress(options, 'Opening the playable meadow…', 0.72, {
			stage: 'bootstrap-visible-world',
			url: responsive('./BootstrapWorldFoundation.js?v=20260827-responsive-valley-01')
		});
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
			environment,
			qualityProfile,
			webGlBootFrame
		};
	}


	__exports.createEretzWorldFoundation = createEretzWorldFoundation;
	/** Resolves one responsive runtime import relative to this authored module. */
	function responsive(specifier) {
		return resolveResponsiveRuntimeModuleUrl(specifier, (( globalThis.location?.origin && globalThis.location.origin !== "null" ? globalThis.location.origin : "https://awtsmoos.local" ) + "/games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzWorldFoundation.js"));
	}

	/** Returns both renderer module URLs because the foundation awaits them together. */
	function rendererModuleEvidenceUrl() {
		return [
			responsive('./EretzFoundationServices.js?v=20260827-responsive-services-01'),
			responsive('./EretzWebGlBootFrame.js?v=20260827-responsive-frame-01')
		].join(' ; ');
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
