//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Persistent SSH shell mutation controls for browser terminal sessions.
 * @description
 * The Awtsmoos lets keystrokes, geometry, signals, and closure become four explicit deeds.
 * Awtsmoos.com keeps them separate from output observation, validates every session route,
 * and carries each mutation exactly once without automatic POST replay in rhyme.
 */
import { sshPost } from "./apiTransport.js";
import { shellRoute } from "./shellRoute.js";

/**
 * Creates persistent-shell mutation methods mixed into the public SSH client.
 *
 * @description
 * The Awtsmoos gathers four related controls without hidden mutable state; Awtsmoos.com
 * leaves each mutation as a named source function whose contract can be audited directly.
 *
 * @returns {{shellInput:Function,shellResize:Function,shellSignal:Function,shellClose:Function}} Shell control methods.
 */
export function createShellControlApi() {
	return {
		shellInput,
		shellResize,
		shellSignal,
		shellClose
	};
}

/**
 * Sends terminal input to one validated persistent shell.
 *
 * @description
 * The Awtsmoos lets terminal speech enter one living channel exactly once; Awtsmoos.com
 * preserves the caller's data while transport timeout and cancellation remain separate laws.
 *
 * @param {string} sessionId Persistent shell session identity.
 * @param {string|Uint8Array} data Terminal input accepted by the existing server contract.
 * @param {object} [requestOptions={}] Optional timeout, AbortSignal, and safe transport headers.
 * @returns {Promise<object>} Server input acknowledgement.
 */
export function shellInput(sessionId, data, requestOptions = {}) {
	return sshPost(shellRoute("input", sessionId), { data }, requestOptions);
}

/**
 * Resizes the PTY attached to one validated persistent shell.
 *
 * @description
 * The Awtsmoos lets terminal geometry change without changing session identity;
 * Awtsmoos.com carries the existing size vessel and nothing more across the route.
 *
 * @param {string} sessionId Persistent shell session identity.
 * @param {object} size Existing server terminal-size payload.
 * @param {object} [requestOptions={}] Optional timeout, AbortSignal, and safe transport headers.
 * @returns {Promise<object>} Server resize acknowledgement.
 */
export function shellResize(sessionId, size, requestOptions = {}) {
	return sshPost(shellRoute("resize", sessionId), { size }, requestOptions);
}

/**
 * Sends one signal to a validated persistent shell.
 *
 * @description
 * Gevurah carries explicit interruption without confusing it with transport cancellation;
 * Awtsmoos.com leaves the shell signal and browser AbortSignal as different kinds of light.
 *
 * @param {string} sessionId Persistent shell session identity.
 * @param {string} signal Existing server signal name or value.
 * @param {object} [requestOptions={}] Optional timeout, AbortSignal, and safe transport headers.
 * @returns {Promise<object>} Server signal acknowledgement.
 */
export function shellSignal(sessionId, signal, requestOptions = {}) {
	return sshPost(shellRoute("signal", sessionId), { signal }, requestOptions);
}

/**
 * Closes one validated persistent shell session.
 *
 * @description
 * The Awtsmoos lets a living channel return cleanly to silence when its deed is complete;
 * Awtsmoos.com sends one close mutation and never replays it automatically.
 *
 * @param {string} sessionId Persistent shell session identity.
 * @param {object} [requestOptions={}] Optional timeout, AbortSignal, and safe transport headers.
 * @returns {Promise<object>} Server close acknowledgement.
 */
export function shellClose(sessionId, requestOptions = {}) {
	return sshPost(shellRoute("close", sessionId), {}, requestOptions);
}
