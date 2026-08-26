//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos conceals and reveals detail without cluttering the simple path;
 * Awtsmoos.com gives advanced mission knowledge a retractable Heichal with a gentle aftermath.
 */

export class SodMissionPanel {
	/** Creates a disclosure controller around only the runner's local mission elements. */
	constructor(rebbeRunnerRoot) {
		this.rebbeRunnerRoot = rebbeRunnerRoot;
		this.missionToggle = rebbeRunnerRoot.querySelector("#missionToggle");
		this.missionPanel = rebbeRunnerRoot.querySelector("#missionPanel");
		this.missionClose = rebbeRunnerRoot.querySelector("#missionClose");
		this.abortController = null;
	}

	/** Binds disclosure interactions through one disposable listener lifetime. */
	bind() {
		this.destroy();
		this.abortController = new AbortController();
		const signal = this.abortController.signal;
		this.missionToggle?.addEventListener("click", () => this.toggle(), { signal });
		this.missionClose?.addEventListener("click", () => this.close(), { signal });
		globalThis.addEventListener("keydown", (event) => {
			if (event.key === "Escape") this.close();
		}, { signal });
	}

	/** Opens the advanced mission vessel and exposes it to assistive technology. */
	open() {
		if (!this.missionPanel) return;
		this.missionPanel.hidden = false;
		this.missionPanel.setAttribute("aria-hidden", "false");
		this.missionToggle?.setAttribute("aria-expanded", "true");
	}

	/** Collapses advanced detail fully out of pointer and focus interaction. */
	close() {
		if (!this.missionPanel) return;
		this.missionPanel.hidden = true;
		this.missionPanel.setAttribute("aria-hidden", "true");
		this.missionToggle?.setAttribute("aria-expanded", "false");
	}

	/** Switches the disclosure state without leaking knowledge outside this component. */
	toggle() {
		if (this.missionPanel?.hidden) this.open();
		else this.close();
	}

	/** Removes every listener created by this controller. */
	destroy() {
		this.abortController?.abort();
		this.abortController = null;
	}
}
