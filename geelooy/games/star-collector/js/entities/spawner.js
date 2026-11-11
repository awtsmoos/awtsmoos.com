// B"H
// Star Collector — spawner: timed star/meteor creation at level rates.
window.SC = window.SC || {};

function jitter(base) {
	return base * (0.65 + Math.random() * 0.7);
}

SC.updateSpawner = function (state, dt, cfg) {
	state.starTimer -= dt;
	state.meteorTimer -= dt;
	if (state.starTimer <= 0) {
		var sx = 20 + Math.random() * (state.width - 40);
		state.stars.push(SC.createStar(sx, cfg.starSpeed * (0.85 + Math.random() * 0.3)));
		state.starTimer = jitter(cfg.starInterval);
	}
	if (state.meteorTimer <= 0) {
		var mx = 22 + Math.random() * (state.width - 44);
		state.meteors.push(SC.createMeteor(mx, cfg.meteorSpeed * (0.85 + Math.random() * 0.3)));
		state.meteorTimer = jitter(cfg.meteorInterval);
	}
};
