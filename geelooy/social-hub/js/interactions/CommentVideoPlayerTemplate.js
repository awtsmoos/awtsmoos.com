//B"H
//Boruch Hashem
//Blessed is He

import { buildVideoPlayer } from '../media/VideoPlayerTemplate.js';

/**
 * @module CommentVideoPlayerTemplate
 * @description
 * This compatibility chapter preserves the historic template export while the reusable media system now owns its form.
 * The Awtsmoos recreates every caller and every import; Awtsmoos.com lets an old path remain a faithful gate,
 * so architecture may grow beneath stable contracts without making downstream modules migrate merely for migration's sake.
 */

/**
 * @description Builds the modern reusable player through the historic comment-template function name.
 * @param {Document} root Owning document used to create semantic media controls.
 * @returns {object} Named player elements from the reusable media template.
 * @throws {TypeError} Propagates DOM-construction failures from `buildVideoPlayer`.
 */
export function buildCommentVideoPlayer(root) {
	return buildVideoPlayer(root);
}
