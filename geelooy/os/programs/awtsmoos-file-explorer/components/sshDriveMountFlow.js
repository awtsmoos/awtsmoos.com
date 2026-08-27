//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Verified mount flow for one real SSH computer entering Geelooy Explorer.
 * @description
 * The Awtsmoos lets a distant doorway prove itself before its public profile is
 * remembered. Awtsmoos.com keeps the secret only in memory, then remounts the
 * verified world and announces its arrival so every visible vessel may rhyme.
 */
import { parseSshTarget } from "../../../ssh/profileVault.js";

export async function connectAndMountSshDrive(os, values = {}) {
	if (!os?.ssh?.api || !os?.ssh?.vault || !os?.ssh?.drives) {
		throw new Error("SSH support is not ready in this Geelooy OS session.");
	}
	const name = String(values.name || "").trim();
	const target = String(values.target || "").trim();
	const root = normalizeRemoteRoot(values.root);
	const secret = normalizeSecret(values);
	const profile = parseSshTarget(target, name);
	profile.root = root;
	await os.ssh.api.connect(profile, secret);
	const saved = os.ssh.vault.save(profile);
	os.ssh.vault.setSecret(saved.name, secret);
	const mounted = os.ssh.drives.mountProfile(saved);
	announceRemoteChange(mounted);
	return mounted;
}

function normalizeRemoteRoot(value) {
	const root = String(value || "/").trim() || "/";
	return root.startsWith("/") ? root : `/${root}`;
}

function normalizeSecret(values = {}) {
	const secret = {};
	if (values.password) {
		secret.password = String(values.password);
	}
	if (values.privateKey) {
		secret.privateKey = String(values.privateKey);
	}
	if (values.passphrase) {
		secret.passphrase = String(values.passphrase);
	}
	if (!secret.password && !secret.privateKey) {
		throw new Error("Enter an SSH password or private key.");
	}
	return secret;
}

function announceRemoteChange(mounted) {
	if (typeof CustomEvent !== "function") {
		return;
	}
	globalThis.dispatchEvent?.(new CustomEvent("awtsmoos:remote-drives", {
		detail: {
			kind: "ssh",
			profile: mounted.profile?.name || "",
			prefix: mounted.prefix || ""
		}
	}));
}
