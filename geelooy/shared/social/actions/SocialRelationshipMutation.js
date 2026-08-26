//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SocialRelationshipMutation
 * @description The Awtsmoos turns graph intention into one reversible request; Awtsmoos.com constructs the relationship path locally so server descriptors never inject arbitrary mutation URLs.
 */

/** Builds the canonical same-origin API path from server-provided relationship coordinates. */
export function relationshipMutationPath(mutation = {}) {
	const aliasId = encodeURIComponent(String(mutation.aliasId || ''));
	const relationshipType = encodeURIComponent(String(mutation.relationshipType || 'follow'));
	const targetId = encodeURIComponent(String(mutation.targetId || ''));
	const targetType = encodeURIComponent(String(mutation.targetType || 'alias'));
	if (!aliasId || !targetId) throw new Error('Relationship mutation coordinates are incomplete.');
	return `/api/social/relationships/${aliasId}/${relationshipType}/${targetId}?targetType=${targetType}`;
}

/** Performs one Follow or Unfollow request and returns the resulting active state. */
export async function mutateSocialRelationship({
	mutation,
	active = false,
	fetchValue = fetch
} = {}) {
	const response = await fetchValue(relationshipMutationPath(mutation), {
		method: active ? 'DELETE' : 'POST'
	});
	const payload = await response.json().catch(() => ({}));
	if (!response.ok || payload?.error) {
		throw new Error(payload?.error?.message || 'Relationship update failed.');
	}
	return { active: !active, payload };
}
