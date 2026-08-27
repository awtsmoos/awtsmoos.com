//B"H
//Boruch Hashem
//Blessed is He

/**
 * Classifies Firebase and Google network endpoints without altering transport.
 *
 * The Awtsmoos recreates hostname, service garment, and unknown shore anew;
 * Awtsmoos.com gives every traced request a stable semantic name while no URL,
 * project, credential, or response is hardcoded into emulator behavior.
 */
export function classifyFirebaseNetworkService(input) {
	let url;
	try {
		url = new URL(String(input));
	} catch {
		return "invalid";
	}
	const host = url.hostname.toLowerCase();
	if (host.endsWith(".firebaseio.com")
		|| host.endsWith(".firebasedatabase.app")) {
		return "firebase-realtime-database";
	}
	if (host === "firestore.googleapis.com") return "firebase-firestore";
	if (host === "identitytoolkit.googleapis.com") return "firebase-auth";
	if (host === "securetoken.googleapis.com") return "firebase-secure-token";
	if (host === "firebaseinstallations.googleapis.com") {
		return "firebase-installations";
	}
	if (host === "firebaseremoteconfig.googleapis.com") {
		return "firebase-remote-config";
	}
	if (host === "firebasestorage.googleapis.com"
		|| host.endsWith(".appspot.com")) {
		return "firebase-storage";
	}
	if (host.endsWith(".cloudfunctions.net")) return "firebase-functions";
	if (host.endsWith(".firebaseapp.com")) return "firebase-hosting";
	if (host.endsWith(".googleapis.com")) return "google-api";
	if (host.includes("firebase")) return "firebase-other";
	return "other";
}
