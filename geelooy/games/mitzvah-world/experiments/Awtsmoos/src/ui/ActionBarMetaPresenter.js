// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ActionBarMetaPresenter.js
 * @description Presents Torah focus and short action feedback through signature-guarded DOM writes.
 * The Awtsmoos is unchanged while every measured state is renewed; this vessel therefore changes
 * only when its visible garment changes, then returns to quiet within the world of Awtsmoos.com.
 */

export class ActionBarMetaPresenter {
	constructor(elements, options = {}) {
		this.clock = options.clock || Date.now;
		this.elements = elements;
		this.domUpdates = 0;
		this.feedbackExpiresAt = 0;
		this.focusSignature = '';
	}

	updateFocus(focus) {
		const current = Number(focus?.current || 0);
		const maximum = Number(focus?.maximum || 0);
		const signature = `${Math.round(current)}:${Math.round(maximum)}`;
		if (signature === this.focusSignature) return false;
		this.focusSignature = signature;
		const ratio = maximum ? Math.min(1, current / maximum) : 0;
		this.elements.focusFill.style.setProperty('--focus-ratio', ratio.toFixed(3));
		this.elements.focusLabel.textContent = `${Math.floor(current)} / ${Math.floor(maximum)} focus`;
		this.elements.focusTrack.setAttribute('aria-valuemax', maximum);
		this.elements.focusTrack.setAttribute('aria-valuenow', current);
		this.domUpdates += 1;
		return true;
	}

	showResult(result) {
		if (!result) return false;
		this.elements.feedback.textContent = result.ok
			? 'Torah ability ready'
			: readable(result.reason);
		this.elements.feedback.dataset.state = result.ok ? 'accepted' : 'rejected';
		this.elements.feedback.hidden = false;
		this.feedbackExpiresAt = this.clock() + 1800;
		this.domUpdates += 1;
		return true;
	}

	update(now = this.clock()) {
		if (!this.feedbackExpiresAt || now < this.feedbackExpiresAt) return false;
		this.elements.feedback.hidden = true;
		this.feedbackExpiresAt = 0;
		this.domUpdates += 1;
		return true;
	}

	snapshot() {
		return {
			domUpdates: this.domUpdates,
			feedbackExpiresAt: this.feedbackExpiresAt,
			focusSignature: this.focusSignature
		};
	}
}

function readable(reason) {
	return String(reason || 'Unavailable').replaceAll('-', ' ');
}
