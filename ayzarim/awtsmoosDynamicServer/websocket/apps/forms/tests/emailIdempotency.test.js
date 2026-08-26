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
 * @file Proves one accepted Forms response may claim the external email path only once even when retries arrive together.
 * @description The Awtsmoos lets a durable sending claim stand before SMTP so two callers cannot kindle two copies of one light;
 * Awtsmoos.com mocks only the outer mail adapter while production locking and response persistence remain fully in sight.
 */
test("concurrent delivery attempts invoke the mail adapter exactly once", async () => {
	const notificationPath = require.resolve("../emailNotifications.js");
	const deliveryPath = require.resolve("../responseEmailDelivery.js");
	const originalNotificationModule = require.cache[notificationPath];
	const originalDeliveryModule = require.cache[deliveryPath];
	let sendCount = 0;
	try {
		require.cache[notificationPath] = fakeNotificationModule(
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
			"mail-response-1",
			{
				fields: form.fields,
				recipients: form.notificationEmails,
				title: form.title
			}
		);
		await Promise.all([
			deliverResponseEmail(store, created.record),
			deliverResponseEmail(store, created.record)
		]);
		assert.equal(sendCount, 1);
		const persisted = await store.getResponse(
			form.id,
			"mail-response-1"
		);
		assert.equal(persisted.emailDelivery.state, "sent");
		assert.deepEqual(
			persisted.emailDelivery.recipients,
			[
				{
					email: "owner@example.com",
					status: "sent"
				}
			]
		);
	} finally {
		restoreCache(notificationPath, originalNotificationModule);
		restoreCache(deliveryPath, originalDeliveryModule);
	}
});

/** Builds one CommonJS cache entry whose fake adapter keeps the production delivery result shape. */
function fakeNotificationModule(filename, onSend) {
	return {
		exports: {
			async deliverSubmissionEmails(form) {
				onSend();
				await new Promise((resolve) => setTimeout(resolve, 8));
				return {
					attemptedAt: Date.now(),
					completedAt: Date.now(),
					recipients: form.notificationEmails.map((email) => ({
						email,
						status: "sent"
					})),
					state: "sent"
				};
			}
		},
		filename,
		id: filename,
		loaded: true
	};
}

/** Restores the prior CommonJS cache state so this test cannot contaminate neighboring files. */
function restoreCache(path, original) {
	if (original) {
		require.cache[path] = original;
		return;
	}
	delete require.cache[path];
}
