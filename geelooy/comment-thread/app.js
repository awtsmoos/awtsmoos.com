//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CommentThreadEntry
 * @description
 * The Awtsmoos gathers route coordinates, shared context, and a living conversation
 * into one ordered awakening. Awtsmoos.com keeps this doorway deliberately small:
 * Malchus mounts, Binah reads, Tiferes reveals context, and the thread controller lives.
 */
import { readCommentThreadConfig } from './modules/config.js';
import { CommentThreadController } from './modules/render.js';
import { TiferesThreadContextPublisher } from './modules/ThreadContextPublisher.js';

/**
 * Reveals the Comment Thread after the document has manifested its mount vessel.
 * @returns {void} Starts the asynchronous controller without blocking DOM readiness.
 */
function revealCommentThread() {
	const malchusMount = document.getElementById('commentThreadRoot');
	if (!malchusMount) {
		return;
	}
	const binahConfig = readCommentThreadConfig(window.location);
	const tiferesPublisher = new TiferesThreadContextPublisher(document);
	tiferesPublisher.revealThreadContext(binahConfig);
	const chaiController = new CommentThreadController({
		mount: malchusMount,
		config: binahConfig
	});
	void chaiController.start();
	window.CommentThreadController = chaiController;
}

window.addEventListener('DOMContentLoaded', revealCommentThread);
