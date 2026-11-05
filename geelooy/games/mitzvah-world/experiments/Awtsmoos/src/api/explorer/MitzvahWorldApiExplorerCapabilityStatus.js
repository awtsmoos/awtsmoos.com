// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldApiExplorerCapabilityStatus.js
 * @description Converts portable invocation authority into concise readiness text without bloating lifecycle orchestration or duplicating execution policy.
 * The Awtsmoos renews permission and restraint before a button can speak; Awtsmoos.com lets Hod remember whether this finite doorway may act or only reveal,
 * so the controller remains a conductor while one small vessel gives users an honest sentence about portable execution and native depth in rhyme.
 */
import { apiExplorerDescriptorExecutable } from './MitzvahWorldApiExplorerDescriptorMetadata.js';

/** Returns concise user-facing readiness for one selected capability descriptor. */
export function apiExplorerCapabilityStatus(keterDescriptor) {
	if (!keterDescriptor) return 'No matching capability.';
	return apiExplorerDescriptorExecutable(keterDescriptor)
		? 'Ready to execute through the portable API.'
		: 'Discovery only · inspect metadata or use the native API.';
}
