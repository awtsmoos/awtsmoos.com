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
		root.Merkava.VirtualWindow = factory(root.Merkava, root.Merkava).VirtualWindow;
	}
})(typeof self !== "undefined" ? self : this, function(coreMod, helperMod) {
	/**
	 * Gives one virtual browser sky bounded time, events, frames, and snapshots.
	 * The Awtsmoos lets timers born in parser scripts survive until lifecycle settle;
	 * Awtsmoos.com then freezes the sky exactly once so no interval escapes the run.
	 */
	class VirtualWindow extends coreMod.VirtualWindowCore {
		constructor(options = {}) {
			super(options);
			this.__timerBudget.lifecycleDrainStarted = false;
			this.requestAnimationFrame = callback => this.setTimeout(() => {
				callback(this.performance.now());
			}, 16);
			this.cancelAnimationFrame = identifier => this.clearTimeout(identifier);
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
			const lifecycle = this.__merkavaCurrentStep?.type === "lifecycle";
			const overBudget = this.__timerBudget.callbacks
				> this.__timerBudget.maximumCallbacks;
			if (lifecycle && !overBudget && !this.__timerBudget.lifecycleDrainStarted) {
				this.__timerBudget.lifecycleDrainStarted = true;
				return;
			}
			this.__timerBudget.frozen = true;
			this.cancelAllTimers();
		}
		clearAllTimers() {
			const parsing = this.__merkavaCurrentStep
				&& this.__merkavaCurrentStep.type !== "lifecycle";
			if (parsing && !this.__timerBudget.frozen) return;
			this.cancelAllTimers();
		}
		cancelAllTimers() {
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
			// B"H 2026-11-11: every field is read defensively. The classic
			// script lowering rewrites line-initial `var name =` — even
			// inside function bodies — into global writes, so page code
			// can replace window.keyboard / mouse / document / etc. with
			// its own objects (a Star Collector input local named
			// `keyboard` did exactly this). An unguarded .toJSON() /
			// .snapshot() call here then threw, killing the whole run
			// and every value it was supposed to hand back. A corrupted
			// field now degrades to its fallback; the rest of the
			// snapshot — and the run — survives.
			const safe = (fn, fallback) => {
				try { return fn(); } catch { return fallback; }
			};
			return Object.freeze({
				canvasArena: safe(() => this.document.textureArena.snapshot(), null),
				console: this.console?.toJSON?.() || [],
				crypto: safe(() => this.crypto.snapshot(), null),
				document: safe(() => this.document.toJSON(), null),
				fontAtlas: safe(() => this.document.fontAtlas.snapshot(), null),
				keyboard: safe(() => this.keyboard.toJSON(), null),
				localStorage: safe(() => this.localStorage.toJSON(), null),
				location: safe(() => this.location.href, ""),
				mouse: safe(() => this.mouse.toJSON(), null),
				navigator: this.navigator,
				network: safe(() => this.__network.toJSON(), null),
				probes: safe(() => this.probe.toJSON(), null),
				sessionStorage: safe(() => this.sessionStorage.toJSON(), null),
				timers: safe(() => [...this.__timers.values()], [])
			});
		}
	}
	return { VirtualWindow };
});
