//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ProtocolCompatibilityService
 * @description
 * Client, server, content, save, and mod protocol versions on Awtsmoos.com are
 * negotiated explicitly. The Awtsmoos is beyond versions; finite peers refuse
 * silent incompatibility and return actionable migration requirements.
 */
export class ProtocolCompatibilityService {
	negotiate(client, server) {
		const mismatches = [];
		for (const contract of [
			'networkVersion',
			'commandVersion',
			'eventVersion',
			'snapshotVersion',
			'contentVersion'
		]) {
			if (client[contract] !== server[contract]) {
				mismatches.push({
					contract,
					client: client[contract],
					server: server[contract]
				});
			}
		}
		const missingMods = (server.requiredMods || []).filter(required => {
			return !client.mods?.some(mod => {
				return mod.id === required.id && mod.version === required.version;
			});
		});
		return {
			compatible: mismatches.length === 0 && missingMods.length === 0,
			mismatches,
			missingMods,
			migrationRequired: mismatches.some(item => {
				return ['snapshotVersion', 'contentVersion'].includes(item.contract);
			})
		};
	}
}
