// B"H
// Star Collector — HUD: score, lives, timer, level.
window.SC = window.SC || {};

function formatTime(seconds) {
	var total = Math.floor(seconds);
	var m = Math.floor(total / 60);
	var s = total % 60;
	return m + ":" + (s < 10 ? "0" : "") + s;
}

function createHud() {
	var score = document.getElementById("hud-score");
	var lives = document.getElementById("hud-lives");
	var timer = document.getElementById("hud-timer");
	var level = document.getElementById("hud-level");
	return {
		update: function (state) {
			score.textContent = String(state.score);
			var hearts = "";
			for (var i = 0; i < state.lives; i++) hearts += "♥";
			lives.textContent = hearts || "—";
			timer.textContent = formatTime(state.elapsed);
			level.textContent = String(state.level);
		}
	};
}

SC.formatTime = formatTime;
SC.createHud = createHud;
