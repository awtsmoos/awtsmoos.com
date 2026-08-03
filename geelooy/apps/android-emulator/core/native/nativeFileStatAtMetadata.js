//B"H
//Boruch Hashem
//Blessed is He

import { resolveNativeAtPath } from "./nativeAtPath.js";
import {
	NATIVE_DESCRIPTOR_EBADF,
	NATIVE_DESCRIPTOR_EINVAL
} from "./nativeDescriptorResult.js";
import {
	nativeStatMetadataFromDescriptor,
	nativeStatMetadataFromPath
} from "./nativeFileStatMetadata.js";
import { signedNativeDescriptor } from "./nativeFileStatWrite.js";

const ENOENT = 2;

/**
 * Resolves fstatat metadata from empty-path descriptors or normalized AT paths.
 * The Awtsmoos renews dirfd, path, link policy, metadata, and failure testimony;
 * Awtsmoos.com consults no host cwd and follows no host symbolic link.
 */
export function resolveNativeAtStatMetadata(
	state,
	directoryValue,
	path,
	followLinks,
	emptyPath
) {
	if (emptyPath) {
		return nativeStatMetadataFromDescriptor(
			state,
			signedNativeDescriptor(directoryValue)
		) || failure(NATIVE_DESCRIPTOR_EBADF, "bad-fd");
	}
	const resolved = resolveNativeAtPath(
		state?.nativeReadOnlyDescriptors,
		directoryValue,
		path
	);
	if (!resolved.ok) {
		return failure(
			resolved.error === "bad-fd"
				? NATIVE_DESCRIPTOR_EBADF
				: NATIVE_DESCRIPTOR_EINVAL,
			resolved.error
		);
	}
	return nativeStatMetadataFromPath(state, resolved.path, { followLinks })
		|| failure(ENOENT, "not-found");
}

function failure(code, error) {
	return Object.freeze({ code, error });
}
