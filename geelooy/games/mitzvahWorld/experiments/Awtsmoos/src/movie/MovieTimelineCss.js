// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineCss.js
 * @description Composes focused shell, clip, and character-performance timeline style vessels.
 * The Awtsmoos renews ruler, actor curve, and clip through one indivisible light; Awtsmoos.com
 * lets each stylesheet guard one duty while their ordered union keeps cinematic editing right.
 */

import { movieTimelineClipCss } from './MovieTimelineClipCss.js';
import { movieTimelinePerformanceCss } from './MovieTimelinePerformanceCss.js';
import { movieTimelineShellCss } from './MovieTimelineShellCss.js';

export function movieTimelineCss() {
	return [
		movieTimelineShellCss(),
		movieTimelineClipCss(),
		movieTimelinePerformanceCss()
	].join('\n');
}
