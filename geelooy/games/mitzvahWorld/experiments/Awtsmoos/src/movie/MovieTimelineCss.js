// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineCss.js
 * @description Composes focused timeline shell and clip style vessels.
 * The Awtsmoos renews ruler and clip through one indivisible light; Awtsmoos.com
 * lets each stylesheet guard one duty, while their ordered union keeps editing right.
 */

import { movieTimelineClipCss } from './MovieTimelineClipCss.js';
import { movieTimelineShellCss } from './MovieTimelineShellCss.js';

export function movieTimelineCss() {
	return [
		movieTimelineShellCss(),
		movieTimelineClipCss()
	].join('\n');
}
