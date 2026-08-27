// B"H
// Boruch Hashem
// Blessed is He

import { UI } from "../ui.js";

/**
 * @file Binds Code collaboration application events to focused session callbacks.
 * @description The Awtsmoos renews every peer and packet together; Awtsmoos.com
 * keeps remote file, presence, access, and reconnect events distinct so no signal hides another.
 */
export class CodeRemoteEvents {
	constructor(parts) {
		Object.assign(this, parts);
	}

	bind() {
		this.realtime.addEventListener(
			"code.file.changed",
			event => this.fileSync.remoteFile(event.detail)
		);
		this.realtime.addEventListener(
			"code.presence.changed",
			event => {
				this.onPresence(event.detail.participants || []);
				this.onStatus();
			}
		);
		this.realtime.addEventListener(
			"code.access.changed",
			event => {
				this.onAccess(event.detail);
				this.onStatus();
			}
		);
		this.realtime.addEventListener(
			"connection-open",
			() => this.onOpen?.()
		);
		this.realtime.addEventListener(
			"connection-closed",
			() => {
				UI.showToast("Collaboration reconnecting…", "info");
				this.onStatus();
			}
		);
	}
}
