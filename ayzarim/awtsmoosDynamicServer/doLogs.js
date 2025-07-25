//B"H
var {
	fetch
} = require("./fetch.js");
const crypto = require('crypto');

module.exports = async function({
	firebaseKey/*
		service JSON file key for 
		firebase project
	*/,
	request,
	filePath
}) {
	
	if(!firebaseKey) {
		return;
	}
	return;
	const serviceAccount = (firebaseKey);
	const projectId = serviceAccount.project_id;
	const clientEmail = serviceAccount.client_email;
	const privateKey = serviceAccount.private_key;

	// Helper function to get a Google Cloud access token
	async function getAccessToken() {
		const header = { alg: 'RS256', typ: 'JWT' };
		const now = Math.floor(Date.now() / 1000);
		const claimSet = {
			iss: clientEmail,
			scope: 'https://www.googleapis.com/auth/datastore',
			aud: 'https://oauth2.googleapis.com/token',
			exp: now + 3600,
			iat: now
		};

		const toSign = `${Buffer.from(JSON.stringify(header)).toString('base64url')}.${Buffer.from(JSON.stringify(claimSet)).toString('base64url')}`;
		
		const signer = crypto.createSign('RSA-SHA256');
		signer.update(toSign);
		const signature = signer.sign(privateKey, 'base64url');
		
		const jwt = `${toSign}.${signature}`;

		const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
				assertion: jwt
			}).toString()
		});

		if (!tokenResponse.ok) {
			throw new Error(`Error fetching access token: ${await tokenResponse.text()}`);
		}
		const tokenData = await tokenResponse.json();
		return tokenData.access_token;
	}

	try {
		const accessToken = await getAccessToken();
		const ip = request.headers['x-forwarded-for'] || request.socket.remoteAddress;
		const url = request.url; // Use the raw URL

		if(!ip) return;

		const firestoreDocUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/logs/${ip}`;
		let currentPingCount = 0;

		// 1. READ the document to get the current ping count
		const readResponse = await fetch(firestoreDocUrl, {
			headers: { 'Authorization': `Bearer ${accessToken}` }
		});

		if (readResponse.ok) {
			const existingData = await readResponse.json();
			// Check if the field for our URL exists and get its integerValue
			if (existingData.fields && existingData.fields[url] && existingData.fields[url].mapValue.fields.pingedTotal) {
				currentPingCount = parseInt(existingData.fields[url].mapValue.fields.pingedTotal.integerValue, 10);
			}
		} else if (readResponse.status !== 404) {
			// If the error is anything other than "Not Found", log it and stop.
			console.error("Error reading from Firestore:", await readResponse.text());
			return;
		}

		// 2. MODIFY the count
		const newPingCount = currentPingCount + 1;
		const currentTime = new Date().toISOString();

		// 3. WRITE the new data back using a PATCH request
		// Note the backticks (`) around the 'url' variable in the query string
		const firestoreWriteUrl = `${firestoreDocUrl}?updateMask.fieldPaths=updated&updateMask.fieldPaths=\`${url}\``;

		const documentBody = {
			fields: {
				updated: { timestampValue: currentTime },
				// Use the raw URL as the key. The square brackets denote a computed property name.
				[url]: {
					mapValue: {
						fields: {
							pingedTotal: {
								// Firestore's REST API expects the integer as a string
								integerValue: newPingCount.toString()
							},
							lastPing: {
								timestampValue: currentTime
							}
						}
					}
				}
			}
		};
		
		const firestoreResponse = await fetch(firestoreWriteUrl, {
			method: 'PATCH',
			headers: {
				'Authorization': `Bearer ${accessToken}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(documentBody)
		});

		if (!firestoreResponse.ok) {
			const errorText = await firestoreResponse.text();
			console.error("Error writing to Firestore:", firestoreResponse.status, errorText);
		}

	} catch (error) {
		console.error("An error occurred in the main function:", error);
	}
}