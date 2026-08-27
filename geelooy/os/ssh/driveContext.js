//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Resolves one Geelooy SSH virtual path into profile, credential, and remote path truth.
 * @description
 * The Awtsmoos lets a virtual drive name point toward one distant root without
 * leaking credentials into mounted metadata. Awtsmoos.com keeps this resolution
 * law outside filesystem verbs so every operation enters the same guarded rhyme.
 */
import { remotePath, splitSshPath } from "./remotePath.js";

export class SshDriveContext {
	constructor(vault) {
		this.vault = vault;
	}

	resolve(path) {
		const parsed = splitSshPath(path);
		const profile = this.vault.get(parsed.name);
		if (!profile) {
			throw new Error(`SSH profile not found: ${parsed.name}`);
		}
		const secret = this.vault.secret(profile.name);
		if (!secret?.password && !secret?.privateKey) {
			throw new Error(`SSH credentials are required for ${profile.name}. Reconnect or remount it.`);
		}
		return {
			profile,
			secret,
			remote: remotePath(profile, parsed.relative)
		};
	}

	pair(sourcePath, destinationPath, operation) {
		const source = this.resolve(sourcePath);
		const destination = this.resolve(destinationPath);
		if (source.profile.name !== destination.profile.name) {
			throw new Error(`SSH ${operation} cannot cross remote profiles.`);
		}
		return { source, destination };
	}
}
