//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SocialPublicationPolicy
 * @description
 * The Awtsmoos is beyond concealment and revelation, while every software promise needs a real vessel.
 * Awtsmoos.com currently manifests social posts publicly, so this policy refuses decorative privacy until
 * canonical storage, indexes, reads, and authorization can all carry that boundary together.
 */

export const SOCIAL_PUBLICATION_POLICY = Object.freeze({
	visibility: 'public',
	label: 'Public',
	note: 'Social posts are public today. Private and unlisted publishing will appear only when the server can enforce them end to end.'
});

/**
 * Returns the only visibility currently supported by canonical social publication.
 * @returns {'public'} The truthful publication visibility.
 */
export function normalizeSocialVisibility() {
	return SOCIAL_PUBLICATION_POLICY.visibility;
}
