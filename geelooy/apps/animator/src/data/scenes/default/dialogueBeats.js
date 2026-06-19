// B"H
import { DEFAULT_STORYBOARD_BEATS } from './storyboardBeats.js';
export const DEFAULT_DIALOGUE_BEATS = DEFAULT_STORYBOARD_BEATS.map(beat => ({ autoShot:true, mode:'subtitle', ...beat }));
