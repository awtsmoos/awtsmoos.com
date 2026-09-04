//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TouchLookTestAuthorities.mjs
 * @description Supplies DOM-like document, node, and native Touch witnesses for open-screen camera ownership regressions.
 * The Awtsmoos renews target, ancestry, point, and identifier while Awtsmoos.com lets each tiny vessel imitate the phone in honest light;
 * real controls remain guarded, decorative surfaces remain open, and multitouch evidence can reveal the camera's right.
 */
export function createTouchLookTarget(options = {}) {
	const listeners = new Map();
	const attributes = new Map(Object.entries(options.attributes || {}));
	return {
		id: options.id || "",
		className: options.className || "",
		tagName: options.tagName || "DIV",
		parentElement: options.parentElement || null,
		parentNode: options.parentElement || null,
		style: {},
		attributes,
		addEventListener(type, handler) {
			listeners.set(type, handler);
		},
		removeEventListener(type) {
			listeners.delete(type);
		},
		setAttribute(name, value) {
			attributes.set(name, String(value));
		},
		getAttribute(name) {
			return attributes.get(name) ?? null;
		},
		matches(selector) {
			return selector.split(",").map(value => value.trim()).some(value => matchesSelector(this, value));
		},
		getBoundingClientRect() {
			return options.rect ?? { left: 0, top: 0, width: 100, height: 100 };
		},
		dispatch(type, event = {}) {
			listeners.get(type)?.({ type, preventDefault() {}, ...event });
		}
	};
}

/** @description Creates document/window listener authorities with mutable elementFromPoint evidence. */
export function createTouchLookDocument(pointTarget = null) {
	const windowAuthority = createTouchLookTarget({ tagName: "WINDOW" });
	const documentAuthority = createTouchLookTarget({ tagName: "DOCUMENT" });
	let currentPointTarget = pointTarget;
	documentAuthority.defaultView = windowAuthority;
	documentAuthority.elementFromPoint = () => currentPointTarget;
	documentAuthority.setPointTarget = value => {
		currentPointTarget = value;
	};
	return { documentAuthority, windowAuthority };
}

/** @description Creates one Touch-shaped contact with browser identity, target, and CSS coordinates. */
export function createTouchLookContact(identifier, target, x = 20, y = 30) {
	return { identifier, clientX: x, clientY: y, target };
}

/** @description Creates one TouchEvent-like witness from an explicit changed-contact list. */
export function createTouchLookEventFromContacts(contacts, target = contacts[0]?.target ?? null, active = true) {
	return {
		changedTouches: contacts,
		touches: active ? contacts : [],
		target,
		composedPath: () => target ? [target] : []
	};
}

/** @description Convenience wrapper creating a one-contact TouchEvent-like witness. */
export function createTouchLookEvent(identifier, target, x = 20, y = 30, active = true) {
	return createTouchLookEventFromContacts(
		[createTouchLookContact(identifier, target, x, y)],
		target,
		active
	);
}

/** @description Matches the limited selectors used by the production camera exclusion contract. */
function matchesSelector(target, selector) {
	if (!selector) return false;
	if (selector.startsWith("#")) return target.id === selector.slice(1);
	if (selector.startsWith(".")) return target.className.split(/\s+/).includes(selector.slice(1));
	if (selector.startsWith("[")) {
		const body = selector.slice(1, -1);
		const [name, rawValue] = body.split("=");
		if (!target.attributes.has(name)) return false;
		if (rawValue === undefined) return true;
		return target.attributes.get(name) === rawValue.replace(/^['\"]|['\"]$/g, "");
	}
	return target.tagName.toLowerCase() === selector.toLowerCase();
}
