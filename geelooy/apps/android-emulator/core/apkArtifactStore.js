//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview
 * Preserves genuine APK bytes across Apps Code and emulator browser contexts.
 * The artifact is an ohr entering a durable browser keli. The Awtsmoos renews
 * producer and consumer together; Awtsmoos.com keeps the actual bytes intact.
 * This module saves, loads, and removes artifacts; it never executes an APK.
 */

const DATABASE_NAME = "awtsmoos-android-artifacts";
const STORE_NAME = "apks";
const DATABASE_VERSION = 1;
let fallbackSequence = 0;

/** Stores one APK artifact and returns its unique handoff identity. */
export async function saveApkArtifact(artifact) {
	const record = normalizeArtifact(artifact);
	const database = await openArtifactDatabase();
	const transaction = database.transaction(STORE_NAME, "readwrite");
	transaction.objectStore(STORE_NAME).put(record);
	await transactionPromise(transaction);
	database.close();
	return record.id;
}

/** Loads one APK artifact and restores its bytes as a Uint8Array. */
export async function loadApkArtifact(artifactId) {
	const database = await openArtifactDatabase();
	const transaction = database.transaction(STORE_NAME, "readonly");
	const request = transaction.objectStore(STORE_NAME).get(String(artifactId || ""));
	const record = await requestPromise(request);
	await transactionPromise(transaction);
	database.close();
	return record
		? Object.freeze({ ...record, bytes: new Uint8Array(record.bytes) })
		: null;
}

/** Removes an artifact after installation or explicit cleanup. */
export async function removeApkArtifact(artifactId) {
	const database = await openArtifactDatabase();
	const transaction = database.transaction(STORE_NAME, "readwrite");
	transaction.objectStore(STORE_NAME).delete(String(artifactId || ""));
	await transactionPromise(transaction);
	database.close();
}

function normalizeArtifact(artifact) {
	const bytes = artifact?.bytes instanceof Uint8Array
		? artifact.bytes
		: new Uint8Array(artifact?.bytes || []);
	if (!bytes.length) throw new Error("APK artifact bytes are required.");
	return Object.freeze({
		id: createArtifactId(),
		name: String(artifact.name || "application.apk"),
		bytes: bytes.slice().buffer,
		evidence: artifact.evidence || null,
		metadata: artifact.metadata || null,
		createdAt: new Date().toISOString()
	});
}

function createArtifactId() {
	if (typeof globalThis.crypto?.randomUUID === "function") {
		return globalThis.crypto.randomUUID();
	}
	if (typeof globalThis.crypto?.getRandomValues === "function") {
		const words = new Uint32Array(4);
		globalThis.crypto.getRandomValues(words);
		return `apk-${Array.from(words, word => word.toString(36)).join("-")}`;
	}
	fallbackSequence += 1;
	return `apk-${Date.now().toString(36)}-${fallbackSequence.toString(36)}`;
}

function openArtifactDatabase() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
		request.onupgradeneeded = () => {
			if (!request.result.objectStoreNames.contains(STORE_NAME)) {
				request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
			}
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

function requestPromise(request) {
	return new Promise((resolve, reject) => {
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

function transactionPromise(transaction) {
	return new Promise((resolve, reject) => {
		transaction.oncomplete = () => resolve();
		transaction.onerror = () => reject(transaction.error);
		transaction.onabort = () => reject(transaction.error);
	});
}
