//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { classifyFirebaseNetworkService } from "../core/android/networkFirebaseClassifier.js";

/**
 * Proves Firebase endpoints receive stable semantic service classifications.
 *
 * The Awtsmoos recreates hostname, project garment, and service name anew;
 * Awtsmoos.com classifies without hardcoding one application's credentials,
 * paths, payloads, or expected responses.
 */
test("classifies Firebase and Google service hostnames exactly", () => {
	const cases = [
		["https://demo.firebaseio.com/data.json", "firebase-realtime-database"],
		["https://demo.firebasedatabase.app/data.json", "firebase-realtime-database"],
		["https://firestore.googleapis.com/v1/projects/demo", "firebase-firestore"],
		["https://identitytoolkit.googleapis.com/v1/accounts", "firebase-auth"],
		["https://securetoken.googleapis.com/v1/token", "firebase-secure-token"],
		["https://firebaseinstallations.googleapis.com/v1/projects", "firebase-installations"],
		["https://firebaseremoteconfig.googleapis.com/v1/projects", "firebase-remote-config"],
		["https://firebasestorage.googleapis.com/v0/b/demo", "firebase-storage"],
		["https://demo.appspot.com/file", "firebase-storage"],
		["https://region-demo.cloudfunctions.net/function", "firebase-functions"],
		["https://demo.firebaseapp.com/", "firebase-hosting"],
		["https://example.googleapis.com/v1", "google-api"]
	];
	for (const [url, expected] of cases) {
		assert.equal(classifyFirebaseNetworkService(url), expected);
	}
});

test("unknown and malformed endpoints remain explicit", () => {
	assert.equal(classifyFirebaseNetworkService("https://example.com"), "other");
	assert.equal(classifyFirebaseNetworkService("not-a-url"), "invalid");
});
