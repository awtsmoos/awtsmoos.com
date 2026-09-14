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

	/** Invokes listeners for one target and event phase. */
	function invokeVirtualElementListeners(event, capture) {
		for (const item of (this.listeners[event.type] || []).slice()) {
			if (item.capture !== capture) continue;
			event.currentTarget = this;
			try {
				const result = item.handler.call(this, event);
				if (result && typeof result.catch === "function") {
					result.catch(error => this.__captureEventError(error, event));
				}
			} catch (error) {
				this.__captureEventError(error, event);
			}
			if (item.once) {
				this.removeEventListener(event.type, item.handler, { capture });
			}
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
