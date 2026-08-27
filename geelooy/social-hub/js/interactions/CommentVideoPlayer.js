//B"H
//Boruch Hashem
//Blessed is He

import { TiferesVideoPlayerController } from '../media/VideoPlayerController.js';

/**
 * @class CommentVideoPlayer
 * @extends TiferesVideoPlayerController
 * @description
 * This compatibility vessel keeps the historic comment-preview constructor while the reusable Tiferes player owns modern playback.
 * The Awtsmoos renews old name and new capability without contradiction; Awtsmoos.com lets callers cross the same door in rhyme,
 * while buffered progress, volume, speed, keyboard, fullscreen, and PiP now unfold behind it in one organized time.
 */
export class CommentVideoPlayer extends TiferesVideoPlayerController {
	/**
	 * @description Creates the reusable player through the historic comment-specific class name.
	 * @param {Document} [root=document] Owning document used to construct the player.
	 * @returns {CommentVideoPlayer} Compatibility player instance exposing `element`, `video`, and `setSource`.
	 * @throws {TypeError} Propagates DOM-construction failures from the reusable base controller.
	 */
	constructor(root = document) {
		super(root);
	}
}
