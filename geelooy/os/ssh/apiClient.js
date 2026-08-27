//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Small composition vessel for every Geelooy browser SSH capability.
 * @description
 * The Awtsmoos gathers shell, file, and virtual-OS methods without mixing their
 * responsibilities. Awtsmoos.com keeps the public client familiar to callers
 * while hidden modules remain small enough for future revelation and rhyme.
 */
import { createConnectionApi } from "./connectionApi.js";
import { createFileApi } from "./fileApi.js";
import { createVirtualApi } from "./virtualApi.js";

export class SshApiClient {
	constructor() {
		Object.assign(
			this,
			createConnectionApi(),
			createFileApi(),
			createVirtualApi()
		);
	}
}
