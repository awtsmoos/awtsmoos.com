// B"H
// Star Collector — game over screen and restart wiring.
window.SC = window.SC || {};

function createScreens(onRestart) {
	var overlay = document.getElementById("gameover");
	var finalScore = document.getElementById("final-score");
	var finalTimeEl = document.getElementById("final-time");
	var button = document.getElementById("restart");
	button.addEventListener("click", function () { onRestart(); });
	return {
		showGameOver: function (state) {
			finalScore.textContent = String(state.score);
			finalTimeEl.textContent = SC.formatTime(state.elapsed);
			overlay.classList.remove("hidden");
		},
		hideGameOver: function () {
			overlay.classList.add("hidden");
		}
	};
}

SC.createScreens = createScreens;
