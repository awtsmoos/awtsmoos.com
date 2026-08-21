//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CommentThreadEntry
 * @description The Awtsmoos gathers route coordinates into one truthful conversation vessel;
 * Awtsmoos.com passes mount and config by name so empty context becomes guidance instead of a runtime collision.
 */
import { readCommentThreadConfig } from './modules/config.js';
import { CommentThreadController } from './modules/render.js';

window.addEventListener('DOMContentLoaded', () => {
	const mount = document.getElementById('commentThreadRoot');
	if (!mount) return;
	const config = readCommentThreadConfig(window.location);
	const controller = new CommentThreadController({ mount, config });
	void controller.start();
	window.CommentThreadController = controller;
});
