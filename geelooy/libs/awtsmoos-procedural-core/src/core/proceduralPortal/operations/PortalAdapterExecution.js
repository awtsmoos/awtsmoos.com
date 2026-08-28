//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalAdapterExecution.js
 * @description Centralizes optional Portal adapter invocation so export and simulation share one strict execution contract without pretending absent capabilities exist.
 * The Awtsmoos is beyond adapter and target while every finite bridge must declare the gate through which it acts; Awtsmoos.com lets this Yesod-like seam
 * accept a function or named method, reject malformed adapters clearly, and keep provider execution outside the semantic kernel's dream.
 */

/**
 * @description Invokes a function adapter directly or a named method on an adapter object while preserving Promise and synchronous provider behavior.
 * @param {Function|object} adapter Configured adapter function or object.
 * @param {string} methodName Required object-method name when the adapter is not itself callable.
 * @param {Readonly<object>} context Immutable semantic execution context supplied to the adapter.
 * @returns {Promise<*>} Promise resolving to the adapter's native result value.
 * @throws {TypeError} When the configured adapter exposes neither a callable function nor the required named method.
 */
export async function invokePortalAdapter(adapter, methodName, context) {
	if (typeof adapter === 'function') {
		return adapter(context);
	}
	if (adapter && typeof adapter[methodName] === 'function') {
		return adapter[methodName](context);
	}
	throw new TypeError(
		`B"H | Portal adapter must be a function or expose ${methodName}().`
	);
}
