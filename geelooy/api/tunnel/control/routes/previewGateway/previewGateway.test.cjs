// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

/**
* @file Proves preview mutations publish redacted account events in an isolated store.
* @description
* The Awtsmoos renews preview, owner, mutation, and witness without revealing
* source content. Awtsmoos.com creates a disposable persistence vessel and verifies
* that lifecycle events contain IDs and outcomes but never the submitted HTML.
*/

test("publishes redacted preview lifecycle mutations", async () => {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), "awts-preview-"));
	process.env.AWTSMOOS_TUNNEL_CONTROL_STORE = path.join(directory, "store.json");
	const Gateway = require("../previewGateway.js");
	const published = [];
	const context = createContext(published, {
		title: "Proof",
		kind: "html",
		visibility: "private",
		content64: Buffer.from(JSON.stringify({
			html: "<h1>secret-source-marker</h1>"
		})).toString("base64")
	});
	try {
		const created = JSON.parse(await Gateway.previewCreate(context));
		assert.equal(created.ok, true);
		context.paramKinds.POST = {
			previewId: created.id,
			patch64: Buffer.from(JSON.stringify({
				title: "Updated proof"
			})).toString("base64")
		};
		const updated = JSON.parse(await Gateway.previewUpdate(context));
		assert.equal(updated.ok, true);
		context.paramKinds.POST = { previewId: created.id };
		const revoked = JSON.parse(await Gateway.previewRevoke(context));
		assert.equal(revoked.ok, true);
		assert.deepEqual(
			published.map((entry) => entry.eventType),
			["preview.created", "preview.updated", "preview.revoked"]
		);
		assert.equal(
			JSON.stringify(published).includes("secret-source-marker"),
			false
		);
		assert.ok(published.every((entry) => entry.accountId === "account-a"));
	} finally {
		fs.rmSync(directory, { recursive: true, force: true });
		delete process.env.AWTSMOOS_TUNNEL_CONTROL_STORE;
	}
});

function createContext(published, post) {
	return {
		request: {
			user: {
				authorized: true,
				info: {
					userId: "user-a",
					accountId: "account-a",
					sessionId: "session-a"
				}
			}
		},
		paramKinds: { GET: {}, POST: post },
		ws: {
			publishActivity(event) {
				published.push(event);
				return event;
			}
		}
	};
}
