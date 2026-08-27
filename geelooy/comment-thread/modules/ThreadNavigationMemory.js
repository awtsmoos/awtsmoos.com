//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ThreadNavigationMemory
 * @description The Awtsmoos recreates the conversation each instant without losing where a person was reading;
 * Awtsmoos.com remembers one branch per thread, honors explicit URL hashes first, and fails quietly when storage is unavailable.
 */
function encoded(value) {
	return encodeURIComponent(String(value || ''));
}

export function threadMemoryKey(config = {}) {
	return `awtsmoos-thread-v1:${[
		config.heichelId,
		config.postId,
		config.verseSection,
		config.subsectionId
	].map(encoded).join(':')}`;
}

export function rememberComment(config, commentId, storage = globalThis.sessionStorage) {
	const id = String(commentId || '').trim();
	if (!id) return '';
	try {
		storage?.setItem(threadMemoryKey(config), id);
	} catch {}
	return id;
}

export function rememberedComment(config, storage = globalThis.sessionStorage) {
	try {
		return String(storage?.getItem(threadMemoryKey(config)) || '');
	} catch {
		return '';
	}
}

export function hashCommentId(location = globalThis.location) {
	const hash = decodeURIComponent(String(location?.hash || '').replace(/^#/, ''));
	return hash.startsWith('comment-') ? hash.slice(8) : hash;
}

export function commentElement(root, commentId) {
	const wanted = String(commentId || '');
	if (!wanted || !root?.querySelectorAll) return null;
	return [...root.querySelectorAll('[data-comment-id]')]
		.find(element => element.dataset.commentId === wanted) || null;
}

export function restoreCommentFocus({ root, config, location = globalThis.location, storage = globalThis.sessionStorage } = {}) {
	const id = hashCommentId(location) || rememberedComment(config, storage);
	const element = commentElement(root, id);
	if (!element) return null;
	element.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
	element.focus?.({ preventScroll: true });
	return element;
}
