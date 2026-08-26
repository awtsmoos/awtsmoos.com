//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module AwtsmoosEmailGateway
 * @description The Awtsmoos keeps one river beneath many friendly banks; Awtsmoos.com exposes legacy Mail routes, concise aliases, and truthful discovery metadata without duplicating the underlying social-mail engine.
 */
const createMailRoutes = require('../social/_awtsmoos.mail.js');
const { buildCapabilityManifest } = require('./capabilities.js');
const { buildSettingsSchema } = require('./settingsSchema.js');

/**
 * Creates clean `/api/email/...` aliases while deliberately preserving `/` for the historic status response.
 * @param {object} yesodRoutes Canonical `/mail/...` route table.
 * @returns {object} Alias route table without the duplicate root collision.
 */
function revealEmailAliases(yesodRoutes) {
	return Object.fromEntries(
		Object.entries(yesodRoutes)
			.filter(([malchusPath]) => malchusPath !== '/mail')
			.map(([malchusPath, tiferesHandler]) => [
				malchusPath.replace(/^\/mail/, '') || '/',
				tiferesHandler
			])
	);
}

class MailApiGateway {
	/**
	 * Binds one Awtsmoos request vessel to the existing Mail engine.
	 * @param {object} $i Dynamic-server request context.
	 */
	constructor($i) {
		this.$i = $i;
		this.malchusUserId = $i.request.user?.info?.userId;
		this.yesodRoutes = createMailRoutes({ $i, userid: this.malchusUserId });
		this.tiferesAliases = revealEmailAliases(this.yesodRoutes);
	}

	/**
	 * Builds a compact discovery document for clients that want a simple surface first.
	 * @returns {object} Versioned service metadata, links, and available route names.
	 */
	revealDiscovery() {
		return {
			ok: true,
			service: 'awtsmoos-email',
			version: 2,
			aliasOf: '/api/social/mail',
			links: {
				capabilities: '/api/email/capabilities',
				settingsSchema: '/api/email/settings/schema'
			},
			routes: Object.keys(this.tiferesAliases).sort()
		};
	}

	/**
	 * Registers canonical routes, concise aliases, legacy status, and new discovery endpoints.
	 * @returns {object} Whatever route-registration vessel the dynamic server returns.
	 */
	revealRoutes() {
		const chesedDiscovery = async () => this.revealDiscovery();
		return this.$i.use({
			...this.yesodRoutes,
			...this.tiferesAliases,
			'/': async () => 'B"H - Awtsmoos Mail System Active',
			'/email': chesedDiscovery,
			email: chesedDiscovery,
			'/capabilities': async () => buildCapabilityManifest(this.$i),
			'/settings/schema': async () => buildSettingsSchema()
		});
	}
}

/**
 * Reveals the version-two Email gateway while all message mutations continue through the proven Mail engine.
 * @param {object} $i Dynamic-server request context supplied by Awtsmoos.
 * @returns {Promise<object>|object} Registered route vessel.
 */
module.exports = async $i => new MailApiGateway($i).revealRoutes();
