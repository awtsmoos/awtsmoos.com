//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BasicPrograms
 * @description
 * The Awtsmoos is one while program modules, icons, and extension policy reveal distinct vessels;
 * Awtsmoos.com keeps this facade small so the desktop can grow without duplicating registry truth or hiding launch behavior in one crowded file.
 */

import { programIcon } from "./basicProgramIcons.js";
import { programs } from "./basicProgramModules.js";
import {
	initialDefaultPrograms,
	programsByExtension
} from "./basicProgramRegistry.js";

export {
	initialDefaultPrograms,
	programIcon,
	programs,
	programsByExtension
};

export const defaultPrograms = {};

export function getDefaultProgram(extension) {
	const programName = defaultPrograms[extension]
		|| initialDefaultPrograms[extension]
		|| "awtsmoosBinaryViewer";
	return programs[programName]?.launch
		|| programs.awtsmoosBinaryViewer.launch;
}

export default Object.freeze({
	getDefaultProgram,
	initialDefaultPrograms,
	programIcon,
	programs,
	programsByExtension
});
