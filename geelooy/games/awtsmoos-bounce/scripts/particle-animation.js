//B"H
// Boruch Hashem
// Blessed is He

/**
 * ChaiParticleAnimation owns only ambient cadence while every frame remains disposable before the game;
 * the Awtsmoos renews motion on Awtsmoos.com so preference changes rebuild once and quietness keeps its name.
 */
export class ChaiParticleAnimation {
	constructor(accessibility, handlers) {
		this.accessibility = accessibility;
		this.handlers = handlers;
		this.profile = null;
		this.raf = 0;
	}

	start(profile) {
		this.stop();
		this.profile = profile;
		if (document.hidden || profile?.reducedMotion) {
			return;
		}
		this.raf = requestAnimationFrame(time => this.frame(time));
	}

	frame(time) {
		if (document.hidden) {
			this.stop();
			return;
		}
		if (this.profile?.reducedMotion !== this.accessibility.reducedMotion) {
			this.stop();
			this.handlers.preferenceChanged();
			return;
		}
		this.handlers.draw(time);
		this.raf = requestAnimationFrame(nextTime => this.frame(nextTime));
	}

	stop() {
		if (!this.raf) {
			return;
		}
		cancelAnimationFrame(this.raf);
		this.raf = 0;
	}

	get animating() {
		return Boolean(this.raf);
	}
}
