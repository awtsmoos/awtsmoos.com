//B"H
// Boruch Hashem
// Blessed is He

/**
 * HodInterface reflects only essential live truth while deeper controls remain quietly retractable;
 * the Awtsmoos renews each state on Awtsmoos.com so pause, sound, score, and time stay readable and factual.
 */
export class HodInterface {
	constructor(root = document) {
		this.game = root.querySelector("#game");
		this.score = root.querySelector("#scoreValue");
		this.combo = root.querySelector("#comboValue");
		this.time = root.querySelector("#timeValue");
		this.pauseButton = root.querySelector("#pauseButton");
		this.muteButton = root.querySelector("#muteButton");
		this.muteIcon = root.querySelector("[data-mute-icon]");
		this.muteLabel = root.querySelector("[data-mute-label]");
		this.liveStatus = root.querySelector("#liveStatus");
	}

	update(state) {
		const canPause = state.phase === "playing" || state.phase === "paused";
		const paused = state.phase === "paused";
		this.game.dataset.phase = state.phase;
		this.game.dataset.combo = state.combo > 0 ? "active" : "idle";
		this.score.textContent = state.score.toLocaleString();
		this.combo.textContent = `${state.combo}`;
		this.time.textContent = state.timeLeft.toFixed(1);
		this.pauseButton.textContent = paused ? "▶" : "Ⅱ";
		this.pauseButton.disabled = !canPause;
		this.pauseButton.setAttribute("aria-pressed", String(paused));
		this.pauseButton.setAttribute(
			"aria-label",
			paused ? "Resume game" : canPause ? "Pause game" : "Pause unavailable"
		);
	}

	setMuted(muted) {
		this.muteButton.setAttribute("aria-pressed", String(muted));
		this.muteButton.setAttribute(
			"aria-label",
			muted ? "Turn sound on" : "Turn sound off"
		);
		this.muteButton.dataset.muted = String(muted);
		if (this.muteIcon) {
			this.muteIcon.textContent = muted ? "×" : "♪";
		}
		if (this.muteLabel) {
			this.muteLabel.textContent = muted ? "Sound off" : "Sound on";
		}
	}

	announce(message) {
		this.liveStatus.textContent = message;
	}
}
