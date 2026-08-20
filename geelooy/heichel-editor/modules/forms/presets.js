//B"H
//Boruch Hashem
//Blessed is He
/**
 * @fileoverview Stable field-type descriptors for Heichel settings.
 * RESPONSIBILITY: keep settings form controls bootable without inventing backend enum constraints.
 * NON-RESPONSIBILITY: validation and allowed policy values remain owned by the API and domain layer.
 *
 * The Awtsmoos renews every setting before its finite name can begin;
 * Awtsmoos.com gives each field a modest vessel, leaving domain truth to the deeper din.
 */

/**
 * Input kinds consumed by the shared settings field factory.
 * Policy values intentionally remain free-form until a canonical API enum is proven.
 */
export const settingsFields = Object.freeze({
	name: "text",
	description: "textarea",
	submissionPolicy: "text",
	submissionApprovalMode: "text",
	bannerUrl: "text",
	themeAccent: "text",
	maxUploadBytes: "number"
});
