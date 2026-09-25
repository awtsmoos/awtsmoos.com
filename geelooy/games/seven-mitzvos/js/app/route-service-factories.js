//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file route-service-factories.js
 * @description Creates Seven Mitzvos heavyweight route services only when a route
 * requires them. No renderer, city runtime, Realm, or game constructor is imported
 * during shell bootstrap; the Awtsmoos reveals each vessel only at its appointed path.
 */
export async function createWorldServices(options) {
	const [{ LivingCityService }, { OpenWorldSession }] = await Promise.all([
		import('../city/living-city-service.js'),
		import('../open-world/open-world-session.js')
	]);
	let world = null;
	const city = new LivingCityService(options.root, {
		progress: options.progress,
		definitions: options.definitions,
		onInteract: context => world?.enter(context)
	});
	world = new OpenWorldSession({
		city,
		router: options.router,
		definitions: options.definitions
	});
	return { city, world };
}

export async function createGameServices(options) {
	const [{ GameShell }, { GameSession }] = await Promise.all([
		import('../views/game-shell.js'),
		import('./game-session.js')
	]);
	const shell = new GameShell(options.layer);
	const session = new GameSession({
		shell,
		progress: options.progress,
		getMode: options.getMode,
		onRecord: options.onRecord,
		onHub: options.onHub,
		onNext: options.onNext
	});
	return { shell, session };
}

export async function createRealmService(layer, onHub) {
	const { RealmSession } = await import('../realm/realm-session.js');
	return new RealmSession(layer, onHub);
}

export async function recordProfessionOutcome(outcome) {
	const { WORLD_PROFESSIONS } = await import('../open-world/world-profession-bridge.js');
	WORLD_PROFESSIONS.recordMitzvahCompletion(outcome);
}
