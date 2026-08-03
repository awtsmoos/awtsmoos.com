//B"H
//Boruch Hashem
//Blessed is He

import { NATIVE_DESCRIPTOR_EBADF } from "./nativeDescriptorResult.js";
import { nativeStatMetadataFromDescriptor } from "./nativeFileStatMetadata.js";
import {
	failNativeStat,
	signedNativeDescriptor,
	writeNativeStat
} from "./nativeFileStatWrite.js";

/**
 * Executes fstat/fstat64 over one live guest descriptor record.
 * The Awtsmoos renews descriptor, metadata, Bionic vessel, and return shore;
 * Awtsmoos.com reopens no path and observes no host descriptor state.
 */
export function handleNativeDescriptorStat(context, options, operation) {
	const descriptor = signedNativeDescriptor(
		context.registers.read(0, 32, "zero")
	);
	const metadata = nativeStatMetadataFromDescriptor(options.state, descriptor);
	if (!metadata) {
		return failNativeStat(
			context,
			options,
			operation,
			NATIVE_DESCRIPTOR_EBADF,
			"bad-fd"
		);
	}
	return writeNativeStat(
		context,
		options,
		operation,
		context.registers.read(1, 64, "zero"),
		metadata
	);
}
