// B"H
// Star Collector — the loop: update, collisions, level-ups, game over.
window.SC = window.SC || {};

function hits(a, b) {
	var dx = a.x - b.x, dy = a.y - b.y;
	var rr = a.radius + b.radius - 3;
	return dx * dx + dy * dy < rr * rr;
}

SC.createGame = function (state, input, backdrop) {
	var cfg = SC.levelConfig(state.level);

	function loseLife() {
		state.lives -= 1;
		state.invincible = 1.6;
		if (state.lives <= 0) {
			state.lives = 0;
			state.over = true;
			state.running = false;
		}
	}

	function update(dt) {
		if (!state.running || state.paused) return;
		state.elapsed += dt;
		state.level = SC.levelForTime(state.elapsed);
		cfg = SC.levelConfig(state.level);
		if (state.invincible > 0) state.invincible -= dt;
		state.ship.update(dt, input, cfg);
		SC.updateSpawner(state, dt, cfg);
		SC.scrollBackdrop(backdrop, state, dt);
		var i;
		for (i = state.stars.length - 1; i >= 0; i--) {
			var star = state.stars[i];
			star.update(dt);
			if (hits(state.ship, star)) {
				state.score += SC.STAR_POINTS;
				state.stars.splice(i, 1);
			} else if (star.y > state.height + 20) {
				state.stars.splice(i, 1);
			}
		}
		for (i = state.meteors.length - 1; i >= 0; i--) {
			var meteor = state.meteors[i];
			meteor.update(dt, state.elapsed);
			if (state.invincible <= 0 && hits(state.ship, meteor)) {
				state.meteors.splice(i, 1);
				loseLife();
			} else if (meteor.y > state.height + 24) {
				state.meteors.splice(i, 1);
			}
		}
	}

	return { update: update };
};
