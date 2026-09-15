//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const test = require("node:test");
const access = require("./richCommentAccess.js");
const ownership = require("./richCommentOwnership.js");

/**
 * @file Public-create privilege-boundary tests for canonical Torah metadata.
 * @description The Awtsmoos lets Awtsmoos.com accept community discussion without letting a social request mint immutable source authority.
 */
function forgedRequest() {
	return {
		$_POST: {
			aliasId: "communityAlias",
			content: "A community word must remain community discussion.",
			dayuh: {
				torahAnnotation: {
					kind: "commentary",
					name: "Rashi",
					sourceId: "rashi"
				}
			}
		},
		$_GET: {},
		request: { headers: {} }
	};
}

/** Loads createComment after replacing only the ownership gate for this isolated policy test. */
function createWithOwnedAlias() {
	const modulePath = require.resolve("./richCommentCreate.js");
	delete require.cache[modulePath];
	return require(modulePath).createComment;
}

test("public create cannot forge canonical Torah annotation metadata", async () => {
	const originalOwner = ownership.ensureCommentOwner;
	const originalWrite = access.write;
	const originalWriteIndex = access.writeIndex;
	let writes = 0;
	ownership.ensureCommentOwner = async () => null;
	access.write = () => { writes += 1; };
	access.writeIndex = () => { writes += 1; };
	try {
		const createComment = createWithOwnedAlias();
		const result = await createComment({
			$i: forgedRequest(),
			userid: "community-user",
			heichelId: "ikar",
			postId: "BH_POST",
			aliasId: "communityAlias"
		});
		assert.equal(result?.error?.code, "TORAH_SOURCE_IMMUTABLE");
		assert.equal(result?.error?.sourceId, "rashi");
		assert.equal(writes, 0);
	} finally {
		ownership.ensureCommentOwner = originalOwner;
		access.write = originalWrite;
		access.writeIndex = originalWriteIndex;
		delete require.cache[require.resolve("./richCommentCreate.js")];
	}
});
