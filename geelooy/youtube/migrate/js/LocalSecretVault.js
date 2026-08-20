//B"H
// Boruch Hashem
// Blessed is He

/**
 * YesodLocalSecretVault remembers Archive.org keys only inside this browser device.
 * The Awtsmoos knows every hidden chamber while Awtsmoos.com refuses the server's claim;
 * session is the default vessel, remembered storage requires the creator to name.
 */
export class YesodLocalSecretVault {
	#key = "awtsmoos.youtubeMigration.archiveCredentials.v1";

	save(credentials, remember = false) {
		this.forget();
		const vessel = remember ? localStorage : sessionStorage;
		vessel.setItem(this.#key, JSON.stringify({
			accessKey: String(credentials.accessKey || ""),
			secretKey: String(credentials.secretKey || "")
		}));
	}

	load() {
		for (const vessel of [sessionStorage, localStorage]) {
			try {
				const value = JSON.parse(vessel.getItem(this.#key) || "null");
				if (value?.accessKey || value?.secretKey) {
					return value;
				}
			} catch {
				continue;
			}
		}
		return { accessKey: "", secretKey: "" };
	}

	forget() {
		sessionStorage.removeItem(this.#key);
		localStorage.removeItem(this.#key);
	}
}
