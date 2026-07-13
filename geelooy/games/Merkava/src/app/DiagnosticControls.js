//B"H
// Boruch Hashem
// Blessed is He
/**
 * Narrow controls let tests invoke supported seams without inventing a second game.
 * The Awtsmoos is beyond proof while Awtsmoos.com reveals measured runtime evidence.
 */
export function createDiagnosticControls(app) {
	return Object.freeze({
		snapshot: () => app.systems.state.snapshot(),
		details: () => app.diagnostics(),
		start: () => app.start('campaign'),
		startMode: modeId => app.start(modeId),
		continueRun: () => app.continue(),
		checkpoint: () => checkpoint(app),
		setLane: lane => setLane(app, lane),
		chargeAbility: () => chargeAbility(app),
		activateAbility: () => app.useAbility(),
		advanceLevel: distance => advanceLevel(app, distance),
		setWorld: worldIndex => setWorld(app, worldIndex),
		setLevel: levelIndex => setLevel(app, levelIndex),
		grantPrutahs: value => grantPrutahs(app, value),
		defeatBoss: () => defeatBoss(app),
		completeWorldRotation: () => completeWorldRotation(app),
		runtimeErrors: () => [...window.__MERKAVA_RUNTIME_ERRORS__]
	});
}

function checkpoint(app) {
	app.systems.save = app.systems.saves.storeCheckpoint(
		app.systems.save,
		app.systems.state
	);
	return app.systems.save.activeRun;
}

function setLane(app, lane) {
	app.systems.state.targetLane = clampIndex(lane, 2);
	return app.systems.state.snapshot();
}

function chargeAbility(app) {
	app.systems.state.abilityCharge = 100;
	return app.systems.state.snapshot();
}

function advanceLevel(app, distance) {
	app.systems.state.levelProgress += Number(distance) || 200;
	return app.systems.state.snapshot();
}

function setWorld(app, worldIndex) {
	app.systems.state.worldIndex = clampIndex(worldIndex, 4);
	return app.systems.state.snapshot();
}

function setLevel(app, levelIndex) {
	app.systems.state.levelIndex = clampIndex(levelIndex, 4);
	app.systems.state.levelProgress = 0;
	return app.systems.state.snapshot();
}

function grantPrutahs(app, value) {
	app.systems.state.prutahs += Math.max(0, Number(value) || 0);
	return app.systems.state.snapshot();
}

function defeatBoss(app) {
	const state = app.systems.state;
	if (state.boss) {
		app.systems.boss.releaseReward(state, state.boss);
		state.boss = null;
		app.systems.campaign.markBossDefeated(state);
	}
	return state.snapshot();
}

function completeWorldRotation(app) {
	const state = app.systems.state;
	state.worldIndex = 4;
	state.levelIndex = 4;
	state.pendingAdvance = true;
	app.systems.campaign.advance(state);
	return state.snapshot();
}

function clampIndex(value, maximum) {
	return Math.max(0, Math.min(maximum, Number(value) || 0));
}
