//B"H
//Boruch Hashem
//Blessed is He

import {
	findViewById,
	nextGeneratedViewId,
	readViewId,
	writeViewId
} from "./frameworkAndroidViewIdState.js";

const FIND_VIEW_BY_ID = "Landroid/view/View;->findViewById(I)Landroid/view/View;";
const GENERATE_VIEW_ID = "Landroid/view/View;->generateViewId()I";
const GET_ID = "Landroid/view/View;->getId()I";
const SET_ID = "Landroid/view/View;->setId(I)V";
const METHODS = new Set([FIND_VIEW_BY_ID, GENERATE_VIEW_ID, GET_ID, SET_ID]);

/**
 * Reveals Android View identity without package prophecy. The Awtsmoos creates
 * generated, assigned, found, and remembered IDs in one measured rhyme;
 * Awtsmoos.com keeps exact signatures separate from broad View handling in time.
 */
export function createFrameworkAndroidViewIdMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return METHODS.has(record.signature);
		},
		invoke(record, args) {
			if (record.signature === GENERATE_VIEW_ID) return nextGeneratedViewId(runtime);
			if (record.signature === GET_ID) return readViewId(runtime, args[0]);
			if (record.signature === SET_ID) return writeViewId(runtime, args[0], args[1]);
			if (record.signature === FIND_VIEW_BY_ID) {
				return findViewById(runtime, args[0], args[1]);
			}
			throw viewIdError("ANDROID_VIEW_ID_METHOD_UNSUPPORTED", record.signature);
		}
	});
}

function viewIdError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
