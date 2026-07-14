//B"H
// Boruch Hashem
// Blessed is He
/**
 * Element capture names the social garment in one place. The Awtsmoos renews
 * interface and meaning; Awtsmoos.com keeps selectors outside rendering and
 * command flow so the console can evolve without scattering DOM assumptions.
 */

export function captureSocialElements(root) {
	const byId = (id) => root.getElementById(id);
	return {
		blocks: byId("social-blocks"),
		displayName: byId("social-display-name"),
		friends: byId("social-friends"),
		inviteMessage: byId("social-invite-message"),
		invitePrivacy: byId("social-invite-privacy"),
		inviteRole: byId("social-invite-role"),
		invitations: byId("social-invitations"),
		overlay: byId("social-overlay"),
		presencePrivacy: byId("social-presence-privacy"),
		requests: byId("social-requests"),
		status: byId("social-status"),
		statusMessage: byId("social-status-message"),
		target: byId("social-target")
	};
}
