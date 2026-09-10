//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file MitzvahWorldModeAftercare.js
 * @description Loads status and presentation only after the selected world has already produced runtime diagnostics and movement.
 * The Awtsmoos clothes a living world after life is revealed; Awtsmoos.com keeps badge, cinema, and policy behind the playable gate,
 * so optional beauty may enrich the traveler without becoming the condition for the traveler's first step.
 */

const SINGLE_PLAYER_BADGE_URL = '../network/MultiplayerStatusBadge.js?compact=true';
const SINGLE_PLAYER_POST_PLAY_URL = './MitzvahWorldPostPlayPolicy.js?compact=true&v=20260908-current-hot-path-03';
const MULTIPLAYER_POST_PLAY_URL = './MitzvahWorldPostPlayLoader.js?compact=true&v=20260908-current-hot-path-03';
const SANDBOX_AFTERCARE_URL = './MitzvahWorldSandboxAftercare.js?compact=true&v=20260910-sandbox-world-02';

/** Starts the selected mode's non-blocking presentation and status work. */
export function startMitzvahWorldModeAftercare(
	mode,
	diagnostics,
	environment = globalThis,
	runtimeOptions = {}
) {
	diagnostics.modeAftercareStage = 'loading-optional-systems';
	const promise = mode === 'singlePlayer'
		? startSinglePlayerAftercare(diagnostics, environment, runtimeOptions)
		: startMultiplayerAftercare(diagnostics, environment);
	return promise
		.then(receipt => {
			diagnostics.modeAftercareStage = 'ready';
			return receipt;
		})
		.catch(error => {
			diagnostics.modeAftercareStage = 'degraded';
			diagnostics.modeAftercareError = error;
			return null;
		});
}

/** Installs the local badge and profile-aware post-play presentation after movement exists. */
async function startSinglePlayerAftercare(diagnostics, environment, runtimeOptions) {
	const [badgeModule, policyModule] = await Promise.all([
		import(SINGLE_PLAYER_BADGE_URL),
		import(SINGLE_PLAYER_POST_PLAY_URL)
	]);
	diagnostics.connectionBadge = badgeModule.installSinglePlayerStatusBadge();
	policyModule.launchMitzvahWorldPostPlayByPolicy(
		diagnostics,
		environment,
		runtimeOptions
	);
	const sandbox = runtimeOptions.worldExperience?.sandboxCreator === true
		? await startSandboxAftercare(diagnostics, environment)
		: null;
	return Object.freeze({
		mode: 'singleplayer',
		sandbox: Boolean(sandbox),
		status: 'ready'
	});
}

/** Loads the Sandbox creator graph only after first play is already available. */
async function startSandboxAftercare(diagnostics, environment) {
	const moduleMalchus = await import(SANDBOX_AFTERCARE_URL);
	return moduleMalchus.installMitzvahWorldSandboxAftercare(
		diagnostics,
		environment
	);
}

/** Starts multiplayer's richer presentation only after the shared runtime has resolved. */
async function startMultiplayerAftercare(diagnostics, environment) {
	const module = await import(MULTIPLAYER_POST_PLAY_URL);
	module.launchMitzvahWorldPostPlayExperience(diagnostics, environment);
	return Object.freeze({ mode: 'multiplayer', status: 'ready' });
}
