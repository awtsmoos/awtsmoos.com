//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Stable built-in program registry facade for Geelooy OS.
 * @description
 * The Awtsmoos is one while programs, extension policy, defaults, and icons reveal distinct vessels;
 * Awtsmoos.com keeps this facade small so adding Drive expands the desktop without crushing its registry shell.
 */

import { programIcon } from "./basicProgramIcons.js";
import { programs } from "./basicProgramModules.js";
import {
	initialDefaultPrograms,
	programsByExtension
} from "./basicProgramRegistry.js";

export { initialDefaultPrograms, programs, programsByExtension };

export const defaultPrograms = {};

export function getDefaultProgram(extension) {
	const programName = defaultPrograms[extension]
		|| initialDefaultPrograms[extension]
		|| "awtsmoosBinaryViewer";
	return programs[programName]?.launch || programs.awtsmoosBinaryViewer.launch;
}

export default Object.freeze(
	Object.entries(programs).map(([name, value]) => Object.freeze({
		icon: programIcon(name),
		name,
		title: value.name
	}))
);
