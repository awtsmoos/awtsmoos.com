//B"H
//Boruch Hashem
//Blessed is He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory(require("./CssComputedSerializer.js"));
	} else {
		root.Merkava = root.Merkava || {};
		Object.assign(root.Merkava, factory(root.Merkava));
	}
})(typeof self !== "undefined" ? self : this, function(serializerMod) {
	/**
	 * Collects the deterministic roads beside one virtual window. Navigation,
	 * computed style, and timer testimony remain isolated so the central window
	 * object stays small while CSSOM serialization remains standards-facing.
	 */
	function makeVirtualHistory(windowObject) {
		return {
			stack: [windowObject.location.href],
			pushState(_state, _title, next) {
				navigate(windowObject, next, true);
			},
			replaceState(_state, _title, next) {
				navigate(windowObject, next, false);
			}
		};
	}

	/** Returns an immutable snapshot-like CSSOM declaration surface. */
	function virtualComputedStyle(documentObject, element) {
		const computed = documentObject.cssEngine.compute(element);
		const value = serializerMod.serializeComputedStyle(computed);
		return {
			...value,
			getPropertyValue(name) {
				const normalized = String(name).replace(
					/[A-Z]/g,
					letter => `-${letter.toLowerCase()}`
				);
				return value[normalized] || "";
			}
		};
	}

	/** Executes one timer callback under the virtual browser's bounded budget. */
	function callWithTimerBudget(callback, argumentsToPass, windowObject) {
		if (windowObject.__timerBudget.frozen) {
			return;
		}
		windowObject.__timerBudget.callbacks += 1;
		if (windowObject.__timerBudget.callbacks > windowObject.__timerBudget.maximumCallbacks) {
			windowObject.freezeTimers();
			return;
		}
		try {
			callback?.(...argumentsToPass);
		} catch (error) {
			windowObject.__AWTSMOOS_CAPTURED_ERRORS__ ||= [];
			windowObject.__AWTSMOOS_CAPTURED_ERRORS__.push({
				message: error.message,
				phase: "timer",
				stack: error.stack
			});
		}
	}

	/** Applies one history mutation against the virtual URL state. */
	function navigate(windowObject, next, push) {
		windowObject.location = new URL(next, windowObject.location.href);
		if (push) {
			windowObject.history.stack.push(windowObject.location.href);
			return;
		}
		const index = windowObject.history.stack.length - 1;
		windowObject.history.stack[index] = windowObject.location.href;
	}

	return {
		callWithTimerBudget,
		makeVirtualHistory,
		virtualComputedStyle
	};
});
