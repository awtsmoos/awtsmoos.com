//B"H
//Boruch Hashem
//Blessed is He

/**
 * Versioning tests prove owner-only drafts, immutable publication, discovery,
 * unlisting, forks, reports, and restart persistence. The Awtsmoos renews draft
 * and version separately; Awtsmoos.com never rewrites published creative truth.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const {
	client,
	draft,
	worldServices
} = require("./worlds/WorldTestFixtures.cjs");

test("publishes immutable hashed versions while later drafts continue", () => {
	const { repository, worlds } = worldServices();
	const owner = client("account:owner");
	const created = worlds.create(owner, draft({
		name: "First World",
		visibility: "public"
	}));
	const published = worlds.publish(owner, created.id);
	const versionId = published.version.id;
	worlds.update(owner, created.id, draft({
		name: "Second Draft",
		visibility: "public"
	}));

	const stored = repository.read((state) => state.worlds[created.id]);
	assert.equal(stored.versions[versionId].content.name, "First World");
	assert.equal(stored.draft.name, "Second Draft");
	assert.match(stored.versions[versionId].contentHash, /^[0-9a-f]{64}$/);
});

test("public discovery excludes private and unlisted publications", () => {
	const { worlds } = worldServices();
	const owner = client("account:owner");
	for (const visibility of ["public", "private", "unlisted"]) {
		const world = worlds.create(owner, draft({
			name: `${visibility} World`,
			visibility
		}));
		worlds.publish(owner, world.id);
	}
	const discovery = worlds.discover({ limit: 10 });
	assert.equal(discovery.items.length, 1);
	assert.equal(discovery.items[0].name, "public World");
});

test("unpublish removes discovery without mutating version content", () => {
	const { repository, worlds } = worldServices();
	const owner = client("account:owner");
	const world = worlds.create(owner, draft({ visibility: "public" }));
	const publication = worlds.publish(owner, world.id);
	worlds.unpublish(owner, publication.version.id);
	assert.equal(worlds.discover({ limit: 10 }).items.length, 0);
	const version = repository.read((state) =>
		state.worlds[world.id].versions[publication.version.id]
	);
	assert.equal(version.content.name, "New Arena World");
	assert.equal(version.listed, false);
});

test("public versions may be forked and reported by verified non-owners", () => {
	const { worlds } = worldServices();
	const owner = client("account:owner");
	const visitor = client("account:visitor");
	const world = worlds.create(owner, draft({ visibility: "public" }));
	const publication = worlds.publish(owner, world.id);
	const fork = worlds.fork(visitor, publication.version.id);
	const report = worlds.report(
		visitor,
		publication.version.id,
		"Hazard placement should be reviewed."
	);
	assert.equal(fork.ownerId, "account:visitor");
	assert.equal(fork.draft.visibility, "private");
	assert.equal(report.reporterId, "account:visitor");
	assert.throws(() => worlds.report(
		owner,
		publication.version.id,
		"Self report"
	));
});

test("world state survives repository replacement through one adapter", () => {
	const first = worldServices();
	const owner = client("account:owner");
	const world = first.worlds.create(owner, draft({ visibility: "public" }));
	const publication = first.worlds.publish(owner, world.id);
	const second = worldServices(first.persistence.load());
	assert.equal(
		second.worlds.getPublic(publication.version.id).name,
		"New Arena World"
	);
});
