//B"H //Boruch Hashem //Blessed is He

export const ANDROID_ACCESSIBILITY_MANAGER =
	"Landroid/view/accessibility/AccessibilityManager;";
export const ACCESSIBILITY_MANAGER_ENABLED =
	"android:accessibility-manager:enabled";
export const ACCESSIBILITY_MANAGER_TOUCH_ENABLED =
	"android:accessibility-manager:touch-exploration-enabled";
export const ACCESSIBILITY_MANAGER_EVENTS =
	"android:accessibility-manager:events";

const ACCESSIBILITY_LISTENERS = "android:accessibility-manager:state-listeners";
const TOUCH_LISTENERS = "android:accessibility-manager:touch-listeners";
const SIGNATURES = new Set([
	`${ANDROID_ACCESSIBILITY_MANAGER}->isEnabled()Z`,
	`${ANDROID_ACCESSIBILITY_MANAGER}->isTouchExplorationEnabled()Z`,
	`${ANDROID_ACCESSIBILITY_MANAGER}->addAccessibilityStateChangeListener(Landroid/view/accessibility/AccessibilityManager$AccessibilityStateChangeListener;)Z`,
	`${ANDROID_ACCESSIBILITY_MANAGER}->removeAccessibilityStateChangeListener(Landroid/view/accessibility/AccessibilityManager$AccessibilityStateChangeListener;)Z`,
	`${ANDROID_ACCESSIBILITY_MANAGER}->addTouchExplorationStateChangeListener(Landroid/view/accessibility/AccessibilityManager$TouchExplorationStateChangeListener;)Z`,
	`${ANDROID_ACCESSIBILITY_MANAGER}->removeTouchExplorationStateChangeListener(Landroid/view/accessibility/AccessibilityManager$TouchExplorationStateChangeListener;)Z`,
	`${ANDROID_ACCESSIBILITY_MANAGER}->sendAccessibilityEvent(Landroid/view/accessibility/AccessibilityEvent;)V`
]);

/**
 * Routes the measured AccessibilityManager contract through one guest service.
 * The Awtsmoos renews flags, listeners, and event testimony every instant;
 * Awtsmoos.com invokes no host accessibility service and fabricates no callback.
 */
export function canHandleAndroidAccessibilityManager(record) {
	return SIGNATURES.has(record.signature);
}

export function invokeAndroidAccessibilityManager(runtime, record, args) {
	const manager = requireManager(runtime, args[0]);
	switch (record.method.name) {
		case "isEnabled":
			return readFlag(runtime, manager, ACCESSIBILITY_MANAGER_ENABLED);
		case "isTouchExplorationEnabled":
			return readFlag(runtime, manager, ACCESSIBILITY_MANAGER_TOUCH_ENABLED);
		case "addAccessibilityStateChangeListener":
			return addListener(runtime, manager, ACCESSIBILITY_LISTENERS, args[1]);
		case "removeAccessibilityStateChangeListener":
			return removeListener(runtime, manager, ACCESSIBILITY_LISTENERS, args[1]);
		case "addTouchExplorationStateChangeListener":
			return addListener(runtime, manager, TOUCH_LISTENERS, args[1]);
		case "removeTouchExplorationStateChangeListener":
			return removeListener(runtime, manager, TOUCH_LISTENERS, args[1]);
		case "sendAccessibilityEvent":
			appendEvent(runtime, manager, args[1]);
			return 0;
		default:
			throw managerError(record.signature);
	}
}

function requireManager(runtime, reference) {
	const object = runtime.heap.get(reference);
	if (object.type !== ANDROID_ACCESSIBILITY_MANAGER) {
		throw managerError(`ANDROID_ACCESSIBILITY_MANAGER_REQUIRED:${object.type}`);
	}
	return reference;
}

function readFlag(runtime, manager, key) {
	return runtime.heap.getField(manager, key) ? 1 : 0;
}

function addListener(runtime, manager, key, listener) {
	if (!listener) return 0;
	const listeners = readList(runtime, manager, key);
	if (listeners.includes(listener)) return 0;
	runtime.heap.setField(manager, key, Object.freeze([...listeners, listener]));
	return 1;
}

function removeListener(runtime, manager, key, listener) {
	const listeners = readList(runtime, manager, key);
	const index = listeners.indexOf(listener);
	if (index < 0) return 0;
	runtime.heap.setField(
		manager,
		key,
		Object.freeze(listeners.filter((_, candidate) => candidate !== index))
	);
	return 1;
}

function appendEvent(runtime, manager, event) {
	if (event) runtime.heap.get(event);
	const events = readList(runtime, manager, ACCESSIBILITY_MANAGER_EVENTS);
	runtime.heap.setField(manager, ACCESSIBILITY_MANAGER_EVENTS, Object.freeze([...events, event || 0]));
}

function readList(runtime, manager, key) {
	const value = runtime.heap.getField(manager, key);
	return Array.isArray(value) ? value : Object.freeze([]);
}

function managerError(detail) {
	const error = new Error(`ANDROID_ACCESSIBILITY_MANAGER_ERROR:${detail}`);
	error.code = "ANDROID_ACCESSIBILITY_MANAGER_ERROR";
	return error;
}
