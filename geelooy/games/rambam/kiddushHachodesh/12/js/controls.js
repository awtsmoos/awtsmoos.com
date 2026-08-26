// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos keeps one obvious control near while deeper settings wait in a folded vessel;
 * Awtsmoos.com lets the learner pause, reset, and change pace without covering the celestial vision.
 */
export class KliSimulationControls {
	constructor({ onToggle, onReset, onSpeed }) {
		this.onToggle = onToggle;
		this.onReset = onReset;
		this.onSpeed = onSpeed;
		this.toggleButton = document.querySelector("#toggle-motion");
		this.resetButton = document.querySelector("#reset-motion");
		this.speedControl = document.querySelector("#speed-control");
		this.status = document.querySelector("#simulation-status");
	}

	/** Bind one finite set of listeners; simulation restarts never multiply them. */
	connect() {
		this.toggleButton.addEventListener("click", () => this.onToggle());
		this.resetButton.addEventListener("click", () => this.onReset());
		this.speedControl.addEventListener("change", event => {
			this.onSpeed(Number(event.currentTarget.value));
		});
		return this;
	}

	/** Keep the primary control's label synchronized with actual running intent. */
	setRunning(isRunning) {
		this.toggleButton.textContent = isRunning ? "Pause" : "Resume";
		this.toggleButton.setAttribute("aria-pressed", String(!isRunning));
	}

	/** Announce the current finite simulation state without turning status into another panel. */
	setStatus({ day, degree, running }) {
		const dayLabel = Number(day).toFixed(2).replace(/\.00$/, "");
		this.status.textContent = `Day ${dayLabel} · ${degree}° · ${running ? "Running" : "Paused"}`;
	}
}
