
/**
 * B"H
 * @module ManifestProvider
 * @chapter Calling Reality into Being
 * @description
 * Every inline manifestation also awakens the event coordinator. Thus the
 * first revealed spark opens the listening gate for future submitted,
 * approved, and coordinate-shifted comments.
 */

import { manifestAliasInline as _one, manifestAllActiveInlines as _all } from "../../logic/inlineManifest.js";
import { activateInlineEventCoordinator } from "../coordination/InlineEventCoordinator.js";
import { activateAnchorMutationHealer } from "../coordination/AnchorMutationHealer.js";

/**
 * @function manifestAliasInline
 * @param {string} alias Alias to manifest inline.
 * @returns {Promise<void>} Completion of manifestation.
 */
export async function manifestAliasInline(alias) {
    activateInlineEventCoordinator();
    activateAnchorMutationHealer();
    return _one(alias);
}

/**
 * @function manifestAllActiveInlines
 * @returns {Promise<void>} Completion of all active inline manifestations.
 */
export async function manifestAllActiveInlines() {
    activateInlineEventCoordinator();
    activateAnchorMutationHealer();
    return _all();
}
