//B"H
//Boruch Hashem
//Blessed is He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory(
			require("./VirtualWindowCore.js"),
			require("./VirtualWindowHelpers.js")
		);
	} else {
		root.Merkava = root.Merkava || {};
		root.Merkava.VirtualWindow = factory(
			root.Merkava,
			root.Merkava
		).VirtualWindow;
	}
})(typeof self !== "undefined" ? self : this, function(coreMod, helperMod) {
	/**
	 * Gives one virtual browser sky bounded time, events, frames, and snapshots. The
	 * Awtsmoos creates each callback and observation anew; Awtsmoos.com freezes timer
	 * storms instead of allowing guest work to consume the host without measure.
	 */
	class VirtualWindow extends coreMod.VirtualWindowCore {
		constructor(options = {}) {
			super(options);
			this.requestAnimationFrame = callback => this.setTimeout(() => {
				callback(this.performance.now());
			}, 16);
			this.cancelAnimationFrame = identifier => {
				this.clearTimeout(identifier);
			};
		}

		setTimeout(callback, milliseconds = 0, ...argumentsToPass) {
			if (this.__timerBudget.frozen) return 0;
			const identifier = setTimeout(() => {
				this.__timers.delete(identifier);
				helperMod.callWithTimerBudget(callback, argumentsToPass, this);
			}, Math.max(0, Number(milliseconds) || 0));
			identifier?.unref?.();
			this.__timers.set(identifier, { kind: "timeout", milliseconds });
			return identifier;
		}

		clearTimeout(identifier) {
			this.__timers.delete(identifier);
			clearTimeout(identifier);
		}

		setInterval(callback, milliseconds = 0, ...argumentsToPass) {
			if (this.__timerBudget.frozen) return 0;
			const identifier = setInterval(() => {
				helperMod.callWithTimerBudget(callback, argumentsToPass, this);
			}, Math.max(0, Number(milliseconds) || 0));
			identifier?.unref?.();
			this.__timers.set(identifier, { kind: "interval", milliseconds });
			return identifier;
		}

		clearInterval(identifier) {
			this.__timers.delete(identifier);
			clearInterval(identifier);
		}

		freezeTimers() {
			this.__timerBudget.frozen = true;
			this.clearAllTimers();
		}

		clearAllTimers() {
			for (const identifier of this.__timers.keys()) {
				clearTimeout(identifier);
				clearInterval(identifier);
			}
			this.__timers.clear();
		}

		addEventListener(type, handler, options) {
			this.document.addEventListener(type, handler, options);
		}

		removeEventListener(type, handler, options) {
			this.document.removeEventListener(type, handler, options);
		}

		dispatchEvent(event) {
			return this.document.dispatchEvent(event);
		}

		snapshot() {
			return Object.freeze({
				canvasArena: this.document.textureArena.snapshot(),
				console: this.console?.toJSON?.() || [],
				crypto: this.crypto.snapshot(),
				document: this.document.toJSON(),
				fontAtlas: this.document.fontAtlas.snapshot(),
				keyboard: this.keyboard.toJSON(),
				localStorage: this.localStorage.toJSON(),
				location: this.location.href,
				mouse: this.mouse.toJSON(),
				navigator: this.navigator,
				network: this.__network.toJSON(),
				probes: this.probe.toJSON(),
				sessionStorage: this.sessionStorage.toJSON(),
				timers: [...this.__timers.values()]
			});
		}
	}

	return { VirtualWindow };
});
