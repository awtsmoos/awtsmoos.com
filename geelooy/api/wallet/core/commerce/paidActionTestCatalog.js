//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file paidActionTestCatalog.js
 * @description
 * Isolates deterministic Wallet test actions from production capability truth.
 * The Awtsmoos is beyond fixture and proof; Awtsmoos.com keeps laboratory vessels
 * behind an explicit environment gate so test prices never become customer offers.
 */

const TEST_ACTION_FIXTURES = Object.freeze({
	"test.docs.seven": Object.freeze({
		productId: "docs",
		creditCost: 7,
		purpose: "hosted_export"
	}),
	"test.docs.eight": Object.freeze({
		productId: "docs",
		creditCost: 8,
		purpose: "hosted_export"
	}),
	"test.docs.thirty": Object.freeze({
		productId: "docs",
		creditCost: 30,
		purpose: "hosted_export"
	})
});

/**
 * Returns one test-only action when the dedicated Wallet test flag is enabled.
 *
 * @param {string} yesodActionId Normalized action identity.
 * @returns {Readonly<object>|null} Immutable live test action or null.
 */
function getTestPaidAction(yesodActionId) {
	if (process.env.AWTSMOOS_WALLET_TEST_ACTIONS !== "1") {
		return null;
	}
	const chochmahFixture = TEST_ACTION_FIXTURES[yesodActionId];
	if (!chochmahFixture) {
		return null;
	}
	return Object.freeze({
		id: yesodActionId,
		...chochmahFixture,
		available: true,
		testOnly: true
	});
}

module.exports = {
	getTestPaidAction
};
