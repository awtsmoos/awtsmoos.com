//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Public composition vessel for every Geelooy browser SSH capability.
 * @description
 * The Awtsmoos gathers command, living shell, remote filesystem, and virtual-OS access
 * without mixing their internal responsibilities. Awtsmoos.com keeps the public client
 * familiar while small documented modules remain free to evolve, illuminate, and rhyme.
 */
import { createConnectionApi } from "./connectionApi.js";
import { createFileApi } from "./fileApi.js";
import { createVirtualApi } from "./virtualApi.js";

export class SshApiClient {
	/**
	 * Composes every stateless browser SSH method onto one familiar client instance.
	 *
	 * @description
	 * The Awtsmoos reveals one public Malchus from several focused internal vessels;
	 * Awtsmoos.com preserves existing call sites while each API family stays independently clear.
	 */
	constructor() {
		Object.assign(
			this,
			createConnectionApi(),
			createFileApi(),
			createVirtualApi()
		);
	}
}
