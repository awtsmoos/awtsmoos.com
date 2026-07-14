//B"H
//Boruch Hashem
//Blessed is He

/**
 * Runtime bindings connect public state to presentation without owning construction.
 * The Awtsmoos renews every observer; Awtsmoos.com synchronizes rendering, health,
 * input acknowledgment, accessibility buttons, and contained transport errors.
 */

/** Binds all runtime subscriptions and event listeners. */
export function bindOnlineRuntime(runtime) {
	bindSession(runtime);
	bindHealth(runtime);
	bindAccessibility(runtime);
	bindTransportErrors(runtime);
}

function bindSession(runtime) {
	runtime.client.subscribe(session => {
		runtime.view.render(session);
		runtime.participantView.render(session);
		if (!session.match) {
			return;
		}
		runtime.renderer.accept(session.match, session.playerId);
		const fighter = session.match.fighters.find(candidate => candidate.id === session.playerId);
		runtime.input.synchronize(fighter?.acknowledgedInputSequence || 0);
	});
}

function bindHealth(runtime) {
	runtime.client.health.subscribe(health => {
		runtime.healthView.render(health);
		const open = health.status === 'online';
		runtime.view.setConnection(`${health.quality} · ${health.status}`, open);
	});
}

function bindAccessibility(runtime) {
	runtime.accessibility.subscribe(preferences => {
		runtime.renderer.setReducedMotion(preferences.reducedMotion);
		pressed('high-contrast-toggle', preferences.highContrast);
		pressed('reduced-motion-toggle', preferences.reducedMotion);
	});
}

function bindTransportErrors(runtime) {
	runtime.transport.on('connection.error', () => {
		runtime.view.setError('The server sent an unreadable real-time message.');
	});
}

function pressed(identifier, value) {
	document.getElementById(identifier)?.setAttribute('aria-pressed', String(value));
}
