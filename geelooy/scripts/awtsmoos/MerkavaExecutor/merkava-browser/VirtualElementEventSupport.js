//B"H
//Boruch Hashem
//Blessed be He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory();
	} else {
		root.Merkava = root.Merkava || {};
		Object.assign(root.Merkava, factory());
	}
})(typeof self !== "undefined" ? self : this, function() {
	/** Installs internal listener invocation and captured-error helpers. */
	function installVirtualElementEventSupport(prototype) {
		prototype.__invoke = invokeVirtualElementListeners;
		prototype.__captureEventError = captureVirtualElementEventError;
	}

	/**
	 * B"H (2026-10-09): EXTREME OPTIMIZATION.
	 * Listener storage is split by phase: entry = { c: [...capture], b: [...bubble] },
	 * each item { h: handler, o: once }. This kills the per-item capture branch
	 * and lets dispatch skip whole phases with a single length check.
	 * - Zero listeners: single property lookup + return. No array allocation.
	 * - One listener: direct call, no snapshot copy.
	 * - Many: snapshot copy only (spec-correct for add/remove during dispatch).
	 * Handler invocation is inlined (no helper call per listener).
	 */
	function invokeVirtualElementListeners(event, capture) {
		const entry = this.listeners[event.type];
		if (entry === undefined) return;
		const list = capture ? entry.c : entry.b;
		const n = list.length;
		if (n === 0) return;
		const target = this;
		const type = event.type;
		if (n === 1) {
			const item = list[0];
			event.currentTarget = target;
			try {
				const r = item.h.call(target, event);
				if (r && typeof r.catch === "function") r.catch(e => target.__captureEventError(e, event));
			} catch (e) { target.__captureEventError(e, event); }
			if (item.o) target.removeEventListener(type, item.h, capture);
			return;
		}
		for (const item of list.slice()) {
			event.currentTarget = target;
			try {
				const r = item.h.call(target, event);
				if (r && typeof r.catch === "function") r.catch(e => target.__captureEventError(e, event));
			} catch (e) { target.__captureEventError(e, event); }
			if (item.o) target.removeEventListener(type, item.h, capture);
			if (event.__immediateStopped) break;
		}
	}

	/** Stores callback failures without destroying the browser scheduler. */
	function captureVirtualElementEventError(error, event) {
		const windowObject = this.ownerDocument?.defaultView;
		if (!windowObject) return;
		windowObject.__AWTSMOOS_CAPTURED_ERRORS__ = windowObject.__AWTSMOOS_CAPTURED_ERRORS__ || [];
		windowObject.__AWTSMOOS_CAPTURED_ERRORS__.push({
			message: error?.message || String(error),
			phase: "event",
			stack: error?.stack || "",
			target: this.__handle(),
			type: event?.type || ""
		});
	}

	return { installVirtualElementEventSupport };
});
