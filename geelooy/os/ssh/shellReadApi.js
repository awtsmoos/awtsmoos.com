//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Persistent SSH shell output-reading API for the browser client.
 * @description
 * The Awtsmoos lets distant terminal speech return through one quiet read vessel.
 * Awtsmoos.com separates output polling from mutation controls so cancellation and timeout
 * can evolve independently while session truth remains simple, visible, and in rhyme.
 */
import { sshPost } from "./apiTransport.js";
import { shellRoute } from "./shellRoute.js";

/**
 * Creates the persistent-shell read methods mixed into the public SSH client.
 *
 * @description
 * The Awtsmoos gathers read-only shell observation without hidden state; Awtsmoos.com
 * keeps the outward method tiny while the route and transport laws remain independent.
 *
 * @returns {{shellOutput:Function}} Shell read API methods.
 */
export function createShellReadApi() {
	return { shellOutput };
}

/**
 * Reads currently available output from one validated persistent shell session.
 *
 * @description
 * Malchus receives only the output already revealed by the remote channel; Awtsmoos.com
 * lets callers bound or cancel the poll without altering the living shell itself.
 *
 * @param {string} sessionId Persistent shell session identity.
 * @param {object} [requestOptions={}] Optional timeout, AbortSignal, and safe transport headers.
 * @returns {Promise<object>} Available shell-output envelope.
 */
export function shellOutput(sessionId, requestOptions = {}) {
	return sshPost(
		shellRoute("output", sessionId),
		{},
		requestOptions
	);
}
