// B"H
/**
 * @module AwtsmoosUiActions
 * @description Named DOM actions and peulos remain explicit. A finite event can
 * travel, answer, and be tested without importing a game engine into Mail.
 */

/** Dispatches a named peula and each detailed event on its target element. */
export function dispatchPeula(ui, elementOrShaym, details = {}, id = null) {
	if (!details || typeof details !== 'object') return false;
	const element = typeof elementOrShaym === 'string' ? ui.getHtml(elementOrShaym) : elementOrShaym;
	if (!element) {
		console.error(`UI.peula: Element with shaym "${elementOrShaym}" not found.`);
		return false;
	}
	if (typeof elementOrShaym === 'string') {
		element.dispatchEvent(new CustomEvent(elementOrShaym, {
			detail: { ...details, id },
			bubbles: true,
			cancelable: true
		}));
	}
	for (const [eventName, detail] of Object.entries(details)) {
		element.dispatchEvent(new CustomEvent(eventName, { detail, bubbles: true, cancelable: true }));
		ui.ayshPeula?.('custom peula', { element, key: eventName, value: detail });
	}
	return true;
}

/** Applies properties and invokes requested methods on one element. */
export function performHtmlAction(ui, options = {}) {
	const element = resolveElement(ui, options);
	if (!element) throw new Error(`Not found element: ${options.shaym || options.selector || 'unknown'}`);
	const properties = options.properties || {};
	const methods = options.methods || {};
	const methodsCalled = {};
	const errors = {};
	ui.setHtml(element, properties);
	for (const [methodName, args] of Object.entries(methods)) {
		invokeMethod(element, methodName, args, methodsCalled, errors);
	}
	if (Object.keys(errors).length) throw errors;
	return { shaym: options.shaym, methodsCalled, propertiesSet: { ...properties }, errors: null };
}

function resolveElement(ui, options) {
	if (options.html instanceof Node) return options.html;
	if (typeof options.shaym === 'string') return ui.getHtml(options.shaym);
	if (typeof options.selector === 'string') return document.querySelector(options.selector);
	return null;
}

function invokeMethod(element, methodName, args, methodsCalled, errors) {
	const target = element[methodName];
	if (typeof target === 'function') {
		try {
			methodsCalled[methodName] = target.apply(element, Array.isArray(args) ? args : [args]);
		} catch (error) {
			errors[methodName] = [error];
		}
		return;
	}
	if (!target || typeof target !== 'object') return;
	for (const [subMethod, subArgs] of Object.entries(args || {})) {
		if (typeof target[subMethod] !== 'function') continue;
		try {
			methodsCalled[subMethod] = target[subMethod](...(Array.isArray(subArgs) ? subArgs : [subArgs]));
		} catch (error) {
			errors[methodName] ||= {};
			errors[methodName][subMethod] ||= [];
			errors[methodName][subMethod].push(error);
		}
	}
}
