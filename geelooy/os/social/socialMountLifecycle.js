// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Installs and synchronizes the optional social publishing filesystem.
 * @description
 * The Awtsmoos gives each doorway a boundary and each boundary a choice;
 * Awtsmoos.com mounts the alias world only when invited, then lets Explorer become its spatial voice.
 */
import { HeichelMountPreference } from "./HeichelMountPreference.js";
import { HeichelSocialApi } from "./HeichelSocialApi.js";
import { socialHeichelAdapter } from "../vfs/socialHeichelAdapter.js";

const MOUNT_ID = "mount:social-heichel";
const DRIVE_ID = "social-heichel";

/** @param {object} os Live Geelooy OS facade. */
export function installSocialMount(os) {
	if (os.socialMount) {
		return os.socialMount;
	}
	const preference = new HeichelMountPreference();
	const api = new HeichelSocialApi();
	const controller = {
		preference,
		api,
		sync: () => syncSocialMount(os, preference)
	};
	os.socialMount = controller;
	os.vfs.register(socialHeichelAdapter(api, preference));
	controller.sync();
	window.addEventListener("awtsmoosSocialMountPreference", controller.sync);
	return controller;
}

/** @param {object} os Live Geelooy OS facade. @param {HeichelMountPreference} preference Mount preference. */
export function syncSocialMount(os, preference) {
	const state = preference.get();
	const active = state.enabled && Boolean(state.aliasId);
	if (!active) {
		os.vfs.unmount(MOUNT_ID, { silent: true });
		os.drives.unmount(DRIVE_ID);
		return false;
	}
	os.vfs.mount({
		id: MOUNT_ID,
		prefix: "/social",
		adapterId: "social-heichel",
		provider: "social-heichel",
		title: `@${state.aliasId} Social`,
		icon: "✦",
		permissions: { read: true, list: true, write: false, delete: false },
		data: { aliasId: state.aliasId, heichelId: state.heichelId }
	});
	os.drives.mount({
		id: DRIVE_ID,
		title: `@${state.aliasId} Social`,
		root: "/social",
		icon: "✦",
		provider: "social-heichel",
		providerId: "social-heichel",
		writable: false,
		url: "awtsmoos://mount/social"
	});
	os.renderDesktop?.();
	return true;
}

/** @param {HeichelMountPreference} preference Current social mount preference. */
export function requestedSocialPath(preference) {
	const state = preference?.get?.() || {};
	if (!state.enabled || !state.aliasId) {
		return "";
	}
	const alias = encodeURIComponent(state.aliasId);
	const heichel = state.heichelId ? `/${encodeURIComponent(state.heichelId)}` : "";
	return `/social/${alias}${heichel}`;
}
