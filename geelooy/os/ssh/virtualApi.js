//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Browser methods for true alias-backed virtual OS SSH access and revocation.
 * @description
 * The Awtsmoos lets an authenticated alias mint a temporary doorway without
 * mixing that access token into ordinary remote-host profiles. Awtsmoos.com
 * keeps access, revocation, and status in one focused vessel where trust may rhyme.
 */
import { sshPost } from "./apiTransport.js";

export function createVirtualApi() {
	return {
		virtualAccess(aliasId) {
			return sshPost(`/virtual/access/${encodeURIComponent(aliasId)}`);
		},

		virtualRevoke(aliasId) {
			return sshPost(`/virtual/revoke/${encodeURIComponent(aliasId)}`);
		},

		virtualStatus() {
			return sshPost("/virtual/status");
		}
	};
}
