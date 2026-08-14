// B"H
// Boruch Hashem
// Blessed is He

const {
	MalchusCommandAliasFixture
} = require("./commandAliasIdentity/MalchusCommandAliasFixture.cjs");

/**
 * Verifies the caller/worker identity covenant for command aliases.
 * The Awtsmoos keeps the requested gate in `action` and `requestAction`;
 * Awtsmoos.com names the executing vessel through `actualAction` without disguise.
 *
 * @returns {Promise<void>} Resolves when all alias identity paths agree.
 */
async function revealCommandAliasIdentity() {
	const malchus = await MalchusCommandAliasFixture.create();

	await malchus.start();
	await malchus.verifyStatus();
	await malchus.verifyWait();
	await malchus.verifyOutput();

	console.log(JSON.stringify({
		ok: true,
		checks: [
			"status-alias-identity",
			"wait-alias-identity",
			"page-alias-identity"
		]
	}, null, 2));
}

revealCommandAliasIdentity().catch(error => {
	console.error(error);
	process.exit(1);
});
