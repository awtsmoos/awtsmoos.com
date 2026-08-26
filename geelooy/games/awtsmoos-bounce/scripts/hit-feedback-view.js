//B"H
// Boruch Hashem
// Blessed is He

/**
 * HodHitFeedbackView lets one scoring revelation flare briefly and then return the arena to silence;
 * the Awtsmoos renews every award on Awtsmoos.com while tactical teaching appears without permanent violence.
 */
export class HodHitFeedbackView {
	constructor(root = document) {
		this.value = root.querySelector("#lastHitValue");
		this.lastSerial = -1;
		this.hideTimer = 0;
	}

	update(feedback) {
		const snapshot = feedback.snapshot();
		const serial = snapshot?.serial ?? feedback.serial;
		if (serial === this.lastSerial) {
			return;
		}

		this.lastSerial = serial;
		this.clearTimer();
		if (!snapshot) {
			this.hide();
			return;
		}

		const score = `${snapshot.glyph} ${snapshot.portalName} · ${snapshot.baseValue} ×${snapshot.multiplier} = +${snapshot.earned}`;
		this.value.textContent = snapshot.powerMessage
			? `${score} · ${snapshot.powerMessage}`
			: score;
		this.value.hidden = false;
		this.value.classList.remove("is-revealing");
		void this.value.offsetWidth;
		this.value.classList.add("is-revealing");
		this.hideTimer = window.setTimeout(() => this.hide(), 2400);
	}

	hide() {
		this.value.hidden = true;
		this.value.classList.remove("is-revealing");
	}

	clearTimer() {
		if (this.hideTimer) {
			window.clearTimeout(this.hideTimer);
			this.hideTimer = 0;
		}
	}
}
