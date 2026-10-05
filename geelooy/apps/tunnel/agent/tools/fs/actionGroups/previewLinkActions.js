// B"H
// Boruch Hashem
// Blessed is He

const PreviewLinks = require("../../preview/previewLinks.js");

/**
 * @file Tunnel actions for token-scoped preview links (private Mac localhost in the
 * assistant's internal browser).
 * @description
 * Three actions, one custody family with the file-transfer actions beside them:
 * `previewLinkCreate` mints a short-lived bearer-token link for `localhost:<port>`;
 * `previewLinkRevoke` kills it immediately; `previewLinkList` reports metadata only.
 *
 * The secret token is returned ONLY by `previewLinkCreate` (the one transmission the
 * design allows). `previewLinkList` never includes token values or token hashes, so
 * its result is safe to log and display. See `agent/tools/preview/previewLinks.js`
 * for the full security design, threat model, and relay contract.
 */
function buildPreviewLinkActions({ config, payload }) {
	const stateRoot = payload?.stateRoot || config?.previewLinksStateRoot || undefined;
	return {
		previewLinkCreate: async () =>
			PreviewLinks.previewLinkCreate({
				port: payload?.port,
				label: payload?.label,
				ttlMinutes: payload?.ttlMinutes,
				stateRoot
			}),
		previewLinkRevoke: async () =>
			PreviewLinks.previewLinkRevoke({
				tokenId: payload?.tokenId,
				stateRoot
			}),
		previewLinkList: async () => PreviewLinks.previewLinkList({ stateRoot })
	};
}

module.exports = { buildPreviewLinkActions };
