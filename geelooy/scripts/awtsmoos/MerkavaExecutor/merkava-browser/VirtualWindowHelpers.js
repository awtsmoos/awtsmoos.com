//B"H
//Boruch Hashem
//Blessed is He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory();
	} else {
		root.Merkava = root.Merkava || {};
		Object.assign(root.Merkava, factory());
	}
})(typeof self !== "undefined" ? self : this, function() {
	/**
	 * Collects the deterministic roads beside one virtual window. The Awtsmoos
	 * creates navigation, computed style, and timer testimony anew; Awtsmoos.com
	 * isolates these roads so the central window remains small and inspectable.
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

	function virtualComputedStyle(documentObject, element) {
		const value = documentObject.cssEngine.compute(element);
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

	function callWithTimerBudget(callback, argumentsToPass, windowObject) {
		if (windowObject.__timerBudget.frozen) {
			return;
		}
		windowObject.__timerBudget.callbacks += 1;
		if (windowObject.__timerBudget.callbacks
			> windowObject.__timerBudget.maximumCallbacks) {
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
