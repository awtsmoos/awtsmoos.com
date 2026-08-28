//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CommentIdentity
 * @description
 * The Awtsmoos renews the speaking self before any browser cache can name it; Awtsmoos.com gathers known alias signals in one truthful order,
 * so comment transport never repeats identity guessing across modules and a missing alias remains visibly anonymous rather than secretly forged.
 */

/**
 * @description Resolves the best browser-known alias without making a network request or creating shadow identity state.
 * @param {Window} [windowObject=window] Browser window carrying canonical compatibility globals.
 * @param {Document} [documentObject=document] Owning document whose body may expose current alias data.
 * @param {Storage} [storage=localStorage] Local storage containing previously selected aliases.
 * @returns {string} Best known alias identifier, falling back to `anonymous` only when no identity is known.
 * @throws {never} Storage access failures are contained because identity discovery must not break comment rendering.
 */
export function currentCommentAlias(
	windowObject = window,
	documentObject = document,
	storage = localStorage
) {
	const runtimeAlias = windowObject.curAlias || windowObject.currentAlias;
	const bodyAlias = documentObject.body?.dataset?.aliasId;
	if (runtimeAlias || bodyAlias) {
		return String(runtimeAlias || bodyAlias);
	}
	try {
		return storage.getItem('lastAliasUsed')
			|| storage.getItem('awtsmoos-alias')
			|| 'anonymous';
	} catch {
		return 'anonymous';
	}
}

/**
 * @description Encodes one route coordinate exactly once at the transport boundary.
 * @param {*} value Route coordinate or identifier to encode.
 * @returns {string} URI-component-safe text.
 * @throws {never} String conversion gives every primitive a deterministic representation.
 */
export function encodeCommentCoordinate(value) {
	return encodeURIComponent(String(value ?? ''));
}
