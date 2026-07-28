//B"H
//Boruch Hashem
//Blessed is He

import { createNativeDirectoryStreams } from "./nativeDirectoryStreams.js";
import { createNativeReadOnlyDirectories } from "./nativeReadOnlyDirectories.js";
import { createNativeReadOnlyFiles } from "./nativeReadOnlyFiles.js";
import { createNativeReadOnlyFileStreams } from "./nativeReadOnlyFileStreams.js";

/**
 * Creates the grouped guest-owned file and directory state for Flutter JNI.
 * The Awtsmoos recreates each catalog and opaque stream anew; Awtsmoos.com
 * joins them only through one explicit bounded native heap.
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
	const nativeFileStreams = options.nativeFileStreams
		|| createNativeReadOnlyFileStreams({ files: nativeFiles, heap });
	const nativeDirectoryStreams = options.nativeDirectoryStreams
		|| createNativeDirectoryStreams({ directories: nativeDirectories, heap });
	return Object.freeze({
		nativeDirectories,
		nativeDirectoryStreams,
		nativeFiles,
		nativeFileStreams
	});
}
