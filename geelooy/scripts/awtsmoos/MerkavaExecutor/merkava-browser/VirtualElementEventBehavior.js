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

	function addEventListener(type, handler, options = false) {
		if (!handler) return;
		this.listeners[type] = this.listeners[type] || [];
		this.listeners[type].push({
			capture: captureOption(options),
			handler,
			once: Boolean(options?.once)
		});
	}

	function removeEventListener(type, handler, options = false) {
		const capture = captureOption(options);
		this.listeners[type] = (this.listeners[type] || []).filter(item => {
			return item.handler !== handler || item.capture !== capture;
		});
	}

	/** Dispatches capture, target, and bubble phases over the composed parent path. */
	function dispatchEvent(rawEvent) {
		const event = typeof rawEvent === "string" ? new VirtualEvent(rawEvent) : rawEvent;
		if (!event.type) throw new Error("Event missing type");
		event.target ||= this;
		const path = [];
		for (let node = this; node; node = node.parentNode || node.host) path.push(node);
		event.__path = path.slice();
		for (let index = path.length - 1; index > 0 && !event.cancelBubble; index -= 1) {
			event.eventPhase = 1;
			path[index].__invoke?.(event, true);
		}
		if (!event.cancelBubble) {
			event.eventPhase = 2;
			this.__invoke(event, true);
			if (!event.__immediateStopped) this.__invoke(event, false);
		}
		if (event.bubbles) {
			for (let index = 1; index < path.length && !event.cancelBubble; index += 1) {
				event.eventPhase = 3;
				path[index].__invoke?.(event, false);
			}
		}
		event.eventPhase = 0;
		event.currentTarget = null;
		return !event.defaultPrevented;
	}

	function captureOption(options) {
		return options === true || Boolean(options?.capture);
	}

	return { installVirtualElementEventBehavior };
});
