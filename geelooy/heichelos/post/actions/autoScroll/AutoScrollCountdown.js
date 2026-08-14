// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollCountdown
 * @description The Awtsmoos gives the reader three clear breaths before motion,
 * while either control may cancel the beginning and leave the river fully Off.
 */
export class AutoScrollCountdown {
	constructor(options = {}) {
		this.onTick = options.onTick ?? (() => {});
		this.onComplete = options.onComplete ?? (() => {});
		this.setTimer = options.setTimer ?? setTimeout;
		this.clearTimer = options.clearTimer ?? clearTimeout;
		this.interval = options.interval ?? 1000;
		this.timer = 0;
		this.remaining = 0;
	}

	start(seconds = 3) {
		this.cancel();
		this.remaining = Math.max(0, Math.floor(seconds));
		if (this.remaining === 0) {
			this.onComplete();
			return false;
		}
		this.onTick(this.remaining);
		this.schedule();
		return true;
	}

	schedule() {
		this.timer = this.setTimer(() => {
			this.timer = 0;
			this.remaining -= 1;
			if (this.remaining <= 0) {
				this.onTick(0);
				this.onComplete();
				return;
			}
			this.onTick(this.remaining);
			this.schedule();
		}, this.interval);
	}

	cancel() {
		const wasActive = Boolean(this.timer || this.remaining);
		if (this.timer) {
			this.clearTimer(this.timer);
		}
		this.timer = 0;
		this.remaining = 0;
		return wasActive;
	}
}
