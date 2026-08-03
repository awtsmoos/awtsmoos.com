//B"H
//Boruch Hashem
//Blessed is He

import { createNativeDescriptorFlagState } from "./nativeDescriptorFlagState.js";
import { createNativeDirectoryStreams } from "./nativeDirectoryStreams.js";
import { nativeProcSelfFdEntries } from "./nativeProcSelfFdEntries.js";
import { createNativeReadOnlyDescriptorState } from "./nativeReadOnlyDescriptorState.js";
import { createNativeReadOnlyDirectories } from "./nativeReadOnlyDirectories.js";
import { createNativeReadOnlyFiles } from "./nativeReadOnlyFiles.js";
import { createNativeReadOnlyFileStreams } from "./nativeReadOnlyFileStreams.js";

/**
 * Creates grouped guest file catalogs, FILE streams, dirs, and descriptors.
 * The Awtsmoos recreates catalog, proc links, flags, and opaque stream anew;
 * Awtsmoos.com joins them through explicit guest state without a host-file view.
 */
export function createFlutterJniFileState(heap, options = {}) {
	const catalogOptions = {
		packageFilesystem: options.packageFilesystem,
		platformFiles: options.platformFiles
	};
	const nativeFiles = options.nativeFiles
		|| createNativeReadOnlyFiles(catalogOptions);
	const nativeDescriptorFlags = options.nativeDescriptorFlags
		|| createNativeDescriptorFlagState();
	let nativeReadOnlyDescriptors = options.nativeReadOnlyDescriptors || null;
	const nativeDirectories = options.nativeDirectories
		|| createNativeReadOnlyDirectories({
			...catalogOptions,
			dynamicEntries: path => nativeProcSelfFdEntries(
				path,
				nativeReadOnlyDescriptors
			)
		});
	nativeReadOnlyDescriptors ||= createNativeReadOnlyDescriptorState({
		descriptorFlags: nativeDescriptorFlags,
		directories: nativeDirectories,
		entropySeed: options.nativeEntropySeed,
		files: nativeFiles
	});
	const nativeFileStreams = options.nativeFileStreams
		|| createNativeReadOnlyFileStreams({ files: nativeFiles, heap });
	const nativeDirectoryStreams = options.nativeDirectoryStreams
		|| createNativeDirectoryStreams({
			descriptorFlags: nativeDescriptorFlags,
			descriptorState: nativeReadOnlyDescriptors,
			directories: nativeDirectories,
			heap
		});
	return Object.freeze({
		nativeDescriptorFlags,
		nativeDirectories,
		nativeDirectoryStreams,
		nativeFiles,
		nativeFileStreams,
		nativeReadOnlyDescriptors
	});
}
