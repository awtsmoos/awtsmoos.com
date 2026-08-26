//B"H
//Boruch Hashem
//Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const {
	TestFormsStore,
	sampleForm
} = require("./testSupport.js");

/**
 * @file Proves an escaped Forms mail-adapter failure becomes one durable terminal failure and never kindles a duplicate retry.
 * @description The Awtsmoos lets even failure receive a bounded remembered vessel, so uncertainty does not ignite repeated inbox fire;
 * Awtsmoos.com seals the first delivery claim with sanitized failure truth and later callers become observers of that state entire.
 */
test("adapter failure is terminal, bounded, sanitized, and never resent", async () => {
	const notificationPath = require.resolve("../emailNotifications.js");
	const deliveryPath = require.resolve("../responseEmailDelivery.js");
	const originalNotificationModule = require.cache[notificationPath];
	const originalDeliveryModule = require.cache[deliveryPath];
	let sendCount = 0;
	try {
		require.cache[notificationPath] = failingNotificationModule(
			notificationPath,
			() => {
				sendCount += 1;
			}
		);
		delete require.cache[deliveryPath];
		const { deliverResponseEmail } = require(deliveryPath);
		const form = sampleForm({
			notificationEmails: ["owner@example.com"]
		});
		const store = new TestFormsStore(form);
		const created = await store.createResponse(
			form.id,
			{ name: "Ada" },
			Date.now(),
			"mail-failure-1",
			{
				fields: form.fields,
				recipients: form.notificationEmails,
				title: form.title
			}
		);
		await deliverResponseEmail(store, created.record);
		const afterFirst = await store.getResponse(form.id, "mail-failure-1");
		await deliverResponseEmail(store, afterFirst);
		const persisted = await store.getResponse(form.id, "mail-failure-1");
		assert.equal(sendCount, 1);
		assert.equal(persisted.emailDelivery.state, "failed");
		assert.equal(persisted.emailDelivery.recipients[0].status, "failed");
		assert.ok(persisted.emailDelivery.recipients[0].error.length <= 500);
		assert.equal(
			persisted.emailDelivery.recipients[0].error.includes("\n"),
			false
		);
	} finally {
		restoreCache(notificationPath, originalNotificationModule);
		restoreCache(deliveryPath, originalDeliveryModule);
	}
});

/** Builds one CommonJS cache entry whose adapter deliberately throws unsafe multiline text. */
function failingNotificationModule(filename, onSend) {
	return {
		exports: {
			async deliverSubmissionEmails() {
				onSend();
				throw new Error(`SMTP exploded\n${"x".repeat(700)}`);
			}
		},
		filename,
		id: filename,
		loaded: true
	};
}

/** Restores the previous module-cache state so failure simulation cannot escape this test file. */
function restoreCache(path, original) {
	if (original) {
		require.cache[path] = original;
		return;
	}
	delete require.cache[path];
}
