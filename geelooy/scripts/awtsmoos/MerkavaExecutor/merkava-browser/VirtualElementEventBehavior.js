//B"H
//Boruch Hashem
//Blessed be He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory(require("./VirtualEvents.js"));
	} else {
		root.Merkava = root.Merkava || {};
		Object.assign(root.Merkava, factory(root.Merkava));
	}
})(typeof self !== "undefined" ? self : this, function(events) {
	const VirtualEvent = events.VirtualEvent;

	/** Installs focus, click, listener, and dispatch behavior on VirtualElement. */
	function installVirtualElementEventBehavior(prototype) {
		prototype.focus = focus;
		prototype.blur = blur;
		prototype.click = click;
		prototype.addEventListener = addEventListener;
		prototype.removeEventListener = removeEventListener;
		prototype.dispatchEvent = dispatchEvent;
	}

	function focus() {
		const document = this.ownerDocument;
		if (!document || document.activeElement === this) return;
		const old = document.activeElement;
		if (old) old.dispatchEvent(new VirtualEvent("blur"));
		document.activeElement = this;
		this.dispatchEvent(new VirtualEvent("focus"));
		this.dispatchEvent(new VirtualEvent("focusin", { bubbles: true }));
	}

	function blur() {
		if (this.ownerDocument?.activeElement !== this) return;
		this.dispatchEvent(new VirtualEvent("blur"));
		this.dispatchEvent(new VirtualEvent("focusout", { bubbles: true }));
		this.ownerDocument.activeElement = null;
	}

	function click() {
		if (this.disabled) return;
		if (this.type === "checkbox") this.checked = !this.checked;
		this.dispatchEvent(new VirtualEvent("click", {
			bubbles: true,
			cancelable: true
		}));
	}

	/**
	 * B"H (2026-10-09): EXTREME OPTIMIZATION.
	 * Listener storage: listeners[type] = { c: [capture {h,o}], b: [bubble {h,o}] }.
	 * Split by phase so dispatch skips phases with one length check and
	 * __invoke needs no per-item capture branch. Document-wide phase counters
	 * ({__captureTypes, __bubbleTypes} on ownerDocument) let dispatchEvent take
	 * a target-only fast path with zero path-building when no ancestor can
	 * have listeners. Counter maintenance is on the cold add/remove path.
	 */
	function addEventListener(type, handler, options = false) {
		if (!handler) return;
		const capture = captureOption(options);
		let entry = this.listeners[type];
		if (entry === undefined) {
			entry = this.listeners[type] = { c: [], b: [] };
		}
		(capture ? entry.c : entry.b).push({
			h: handler,
			o: Boolean(options && options.once)
		});
		const doc = this.ownerDocument;
		if (doc) {
			const counters = capture ? doc.__captureTypes : doc.__bubbleTypes;
			if (counters) counters[type] = (counters[type] || 0) + 1;
		}
	}

	function removeEventListener(type, handler, options = false) {
		const entry = this.listeners[type];
		if (entry === undefined) return;
		const capture = captureOption(options);
		const key = capture ? "c" : "b";
		const list = entry[key];
		const before = list.length;
		entry[key] = list.filter(item => item.h !== handler);
		const removed = before - entry[key].length;
		if (removed > 0) {
			const doc = this.ownerDocument;
			if (doc) {
				const counters = capture ? doc.__captureTypes : doc.__bubbleTypes;
				if (counters && counters[type] !== undefined) {
					counters[type] -= removed;
					if (counters[type] <= 0) delete counters[type];
				}
			}
		}
	}

	/**
	 * B"H (2026-10-09): EXTREME OPTIMIZATION.
	 * Dispatches capture, target, and bubble phases over the composed parent path.
	 * - Target-only fast path: when document counters prove no ancestor can have
	 *   capture listeners (and no bubble listeners if bubbling), skip path-building
	 *   entirely: no array allocation, no ancestor walk. The common case.
	 * - Slow path: each phase loop checks entry existence + length before invoking:
	 *   listener-less nodes cost one property lookup, zero allocations, zero calls.
	 * - event.__path shares the path array (never mutated after build): no copy.
	 *   Fast path sets __path = null; composedPath() rebuilds lazily from target.
	 * - eventPhase is only assigned when listeners actually run (unobservable otherwise).
	 * Semantics preserved exactly: capture top-down, target capture-then-bubble,
	 * bubble bottom-up, cancelBubble/immediateStopped/defaultPrevented handling.
	 */
	function dispatchEvent(rawEvent) {
		const event = typeof rawEvent === "string" ? new VirtualEvent(rawEvent) : rawEvent;
		if (!event.type) throw new Error("Event missing type");
		const type = event.type;
		event.target ||= this;

		const doc = this.ownerDocument;
		const countersLive = doc && doc.__captureTypes && doc.__bubbleTypes;
		if (countersLive) {
			const capTotal = doc.__captureTypes[type] || 0;
			const bubTotal = doc.__bubbleTypes[type] || 0;
			const ownEntry = this.listeners[type];
			const ownC = ownEntry !== undefined ? ownEntry.c.length : 0;
			const ownB = ownEntry !== undefined ? ownEntry.b.length : 0;
			if (capTotal <= ownC && (!event.bubbles || bubTotal <= ownB)) {
				event.__path = null;
				if (ownC !== 0 || ownB !== 0) {
					event.eventPhase = 2;
					this.__invoke(event, true);
					if (!event.__immediateStopped) this.__invoke(event, false);
				}
				event.eventPhase = 0;
				event.currentTarget = null;
				return !event.defaultPrevented;
			}
		}

		const path = [];
		for (let node = this; node; node = node.parentNode || node.host) path.push(node);
		event.__path = path;
		const last = path.length - 1;
		for (let index = last; index > 0; index -= 1) {
			if (event.cancelBubble) break;
			const node = path[index];
			const entry = node.listeners[type];
			if (entry !== undefined && entry.c.length !== 0) {
				event.eventPhase = 1;
				node.__invoke(event, true);
			}
		}
		if (!event.cancelBubble) {
			const entry = this.listeners[type];
			if (entry !== undefined && (entry.c.length !== 0 || entry.b.length !== 0)) {
				event.eventPhase = 2;
				this.__invoke(event, true);
				if (!event.__immediateStopped) this.__invoke(event, false);
			}
		}
		if (event.bubbles) {
			for (let index = 1; index <= last; index += 1) {
				if (event.cancelBubble) break;
				const node = path[index];
				const entry = node.listeners[type];
				if (entry !== undefined && entry.b.length !== 0) {
					event.eventPhase = 3;
					node.__invoke(event, false);
				}
			}
		}
		event.eventPhase = 0;
		event.currentTarget = null;
		return !event.defaultPrevented;
	}

	function captureOption(options) {
		return options === true || Boolean(options && options.capture);
	}

	return { installVirtualElementEventBehavior };
});
