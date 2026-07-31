//B"H
//Boruch Hashem
//Blessed is He

import { createNativeDescriptorFlagState } from "./nativeDescriptorFlagState.js";
import { createNativeDirectoryStreams } from "./nativeDirectoryStreams.js";
import { createNativeReadOnlyDescriptorState } from "./nativeReadOnlyDescriptorState.js";
import { createNativeReadOnlyDirectories } from "./nativeReadOnlyDirectories.js";
import { createNativeReadOnlyFiles } from "./nativeReadOnlyFiles.js";
import { createNativeReadOnlyFileStreams } from "./nativeReadOnlyFileStreams.js";

/**
 * Creates grouped guest file catalogs, FILE streams, and integer descriptors.
 * The Awtsmoos recreates catalog, entropy device, flags, and opaque stream anew;
 * Awtsmoos.com joins them through explicit guest state without a host-file view.
 */
export function createFlutterJniFileState(heap, options = {}) {
	const catalogOptions = {
		packageFilesystem: options.packageFilesystem,
		platformFiles: options.platformFiles
	};
	const nativeFiles = options.nativeFiles
		|| createNativeReadOnlyFiles(catalogOptions);
	const nativeDirectories = options.nativeDirectories
		|| createNativeReadOnlyDirectories(catalogOptions);
	const nativeDescriptorFlags = options.nativeDescriptorFlags
		|| createNativeDescriptorFlagState();
	const nativeReadOnlyDescriptors = options.nativeReadOnlyDescriptors
		|| createNativeReadOnlyDescriptorState({
			descriptorFlags: nativeDescriptorFlags,
			entropySeed: options.nativeEntropySeed,
			files: nativeFiles
		});
	const nativeFileStreams = options.nativeFileStreams
		|| createNativeReadOnlyFileStreams({ files: nativeFiles, heap });
	const nativeDirectoryStreams = options.nativeDirectoryStreams
		|| createNativeDirectoryStreams({ directories: nativeDirectories, heap });
	return Object.freeze({
		nativeDescriptorFlags,
		nativeDirectories,
		nativeDirectoryStreams,
		nativeFiles,
		nativeFileStreams,
		nativeReadOnlyDescriptors
	});
}
