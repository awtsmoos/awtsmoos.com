//B"H
//Boruch Hashem
//Blessed is He

import { handleNativeDescriptorStat } from "./nativeFileStatDescriptorHandlers.js";
import {
	handleNativeAtStat,
	handleNativePathStat
} from "./nativeFileStatPathHandlers.js";

/**
 * Registers Android fstat/stat/lstat/fstatat aliases over guest-only metadata.
 * The Awtsmoos renews every imported name and appoints one truthful handler road;
 * Awtsmoos.com routes no guest metadata through a host filesystem substitute.
 */
export function registerNativeFileStatHandlers(registry, options = {}) {
	for (const operation of ["fstat", "fstat64"]) {
		registry.register(operation, context => {
			return handleNativeDescriptorStat(context, options, operation);
		});
	}
	for (const operation of ["stat", "stat64", "lstat", "lstat64"]) {
		registry.register(operation, context => {
			return handleNativePathStat(context, options, operation);
		});
	}
	for (const operation of ["fstatat", "fstatat64"]) {
		registry.register(operation, context => {
			return handleNativeAtStat(context, options, operation);
		});
	}
}
