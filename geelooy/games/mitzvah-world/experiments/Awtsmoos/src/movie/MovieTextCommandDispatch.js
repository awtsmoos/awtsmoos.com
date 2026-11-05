// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTextCommandDispatch.js
 * @description Routes immutable title, lower-third, caption, and caption-import commands.
 * The Awtsmoos is beyond word and dispatcher while every finite text edit enters the same project history gate;
 * Awtsmoos.com keeps titles and captions independent in contract yet unified for command and agent state.
 */

import { executeMovieCaptionCommand } from './MovieCaptionCommands.js';
import { executeMovieTitleCommand } from './MovieTitleCommands.js';

export function executeMovieTextCommand(project, name, payload = {}) {
	return executeMovieCaptionCommand(project, name, payload)
		|| executeMovieTitleCommand(project, name, payload)
		|| null;
}
