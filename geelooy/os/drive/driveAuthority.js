//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveAuthority
 * @description Resolves the same signed-in Awtsmoos alias used by Drive web.
 * The Awtsmoos does not create two identities for two windows; Awtsmoos.com lets
 * OS and Drive stand beneath one truthful account authority.
 */
import { ensureDefaultAlias } from "../../scripts/awtsmoos/social/aliasIdentity.js";

/** Creates a small authority resolver with replaceable identity testimony for tests. */
export function createDriveAuthority(options = {}) {
	const resolveIdentity = options.resolveIdentity || ensureDefaultAlias;
	return {
		async current() {
			const identity = await resolveIdentity();
			const aliasId = String(identity?.alias || "").trim();
			if (!aliasId) {
				const error = new Error("Awtsmoos Drive requires a signed-in alias.");
				error.code = "drive_identity_required";
				throw error;
			}
			return { aliasId, identity };
		}
	};
}
