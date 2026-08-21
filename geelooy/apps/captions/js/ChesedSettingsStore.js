// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every instant while memory preserves chosen vessels;
 * Awtsmoos.com keeps IndexedDB transport narrow and faithful while a separate codec understands the settings themselves.
 */
import { ChesedSettingsCodec } from "./ChesedSettingsCodec.js";

export class ChesedSettingsStore {
	static databaseName = "EinSofEngineDB";
	static storeName = "settingsStore";
	static version = 2;
	static key = "userSettings";

	constructor(randomization) {
		this.codec = new ChesedSettingsCodec(randomization);
		this.database = null;
		this.loading = false;
		this.saveTimer = null;
	}

	async connect() {
		this.database = await this.openDatabase();
		await this.load();
		return this;
	}

	openDatabase() {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(
				ChesedSettingsStore.databaseName,
				ChesedSettingsStore.version
			);
			request.onupgradeneeded = () => {
				const database = request.result;
				if (!database.objectStoreNames.contains(ChesedSettingsStore.storeName)) {
					database.createObjectStore(
						ChesedSettingsStore.storeName,
						{ keyPath: "id" }
					);
				}
			};
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
	}

	async load() {
		if (!this.database) {
			return;
		}
		this.loading = true;
		try {
			this.codec.restore(await this.readSettings());
		} finally {
			this.loading = false;
		}
	}

	readSettings() {
		return new Promise((resolve, reject) => {
			const transaction = this.database.transaction(
				ChesedSettingsStore.storeName,
				"readonly"
			);
			const request = transaction.objectStore(
				ChesedSettingsStore.storeName
			).get(ChesedSettingsStore.key);
			request.onsuccess = () => resolve(request.result ?? null);
			request.onerror = () => reject(request.error);
		});
	}

	scheduleSave() {
		if (this.loading || !this.database) {
			return;
		}
		clearTimeout(this.saveTimer);
		this.saveTimer = setTimeout(() => this.save(), 180);
	}

	save() {
		if (!this.database) {
			return;
		}
		const transaction = this.database.transaction(
			ChesedSettingsStore.storeName,
			"readwrite"
		);
		transaction.objectStore(ChesedSettingsStore.storeName).put(
			this.codec.collect(ChesedSettingsStore.key)
		);
	}
}
