//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file progressiveEnhancements.js
 * @description
 * The Awtsmoos keeps Torah on the critical path and releases optional social,
 * navigation, and cosmic garments only after the Heichel has become usable.
 * Every enhancement is isolated so one broken ornament cannot block learning.
 */

const ENHANCEMENT_KEY = '__awtsmoosHeichelEnhancements';

/** Waits for the canonical Heichel boot and reports whether core Torah is ready. */
async function waitForCore() {
	const bridge = window.__awtsmoosHeichelModuleBridge;
	if (bridge?.promise) await bridge.promise;
	const core = window.__awtsmoosHeichelBoot;
	if (core?.promise) await core.promise;
	return document.body?.dataset?.heichelReady === 'true';
}

/** Runs one optional enhancement without letting its failure escape. */
async function reveal(name, task, state) {
	try {
		await task();
		state.ready.push(name);
	} catch (error) {
		state.errors.push({ name, message: String(error?.message || error) });
		console.warn(`B"H — Optional Heichel ${name} enhancement stayed hidden.`, error);
	}
}
/** Loads identity, ambient social state, and hybrid navigation after core readiness. */
async function revealInteractionLayer(state) {
	await Promise.all([
		reveal('shell', async () => {
			await import('/scripts/awtsmoos/social/shell/boot.js?v=heichel-mobile-010&compact=true');
		}, state),
		reveal('social', async () => {
			const social = await import('/shared/social/SocialExperienceInstaller.js?compact=true');
			social.installSocialExperience(document, { ambient: false });
		}, state),
		reveal('navigation', async () => {
			const navigation = await import('/scripts/awtsmoos/social/navigation/appNavigation.js?v=heichel-mobile-010&compact=true');
			navigation.startAppNavigation(document);
		}, state)
	]);
}

/** Returns true when expensive atmosphere should stay dormant. */
function prefersQuietAtmosphere() {
	return Boolean(
		navigator.connection?.saveData
		|| window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
	);
}

/** Defers WebGL atmosphere until an idle frame after meaningful content exists. */
function scheduleAtmosphere(state) {
	if (prefersQuietAtmosphere()) return;
	const revealCosmos = () => void reveal('cosmos', async () => {
		await import('/heichelos/heichel/modules/cosmic/boot.js?v=heichel-mobile-010&compact=true');
	}, state);
	if ('requestIdleCallback' in window) {
		window.requestIdleCallback(revealCosmos, { timeout: 2200 });
		return;
	}
	window.setTimeout(revealCosmos, 900);
}
/** Starts exactly one progressive enhancement lifecycle for this document. */
async function revealProgressively() {
	if (window[ENHANCEMENT_KEY]?.started) return window[ENHANCEMENT_KEY].promise;
	const state = { started: true, ready: [], errors: [], promise: null };
	window[ENHANCEMENT_KEY] = state;
	state.promise = (async () => {
		if (!await waitForCore()) return state;
		await revealInteractionLayer(state);
		scheduleAtmosphere(state);
		return state;
	})();
	return state.promise;
}

void revealProgressively();
