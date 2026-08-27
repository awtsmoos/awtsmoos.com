//B"H
//Boruch Hashem
//Blessed is He

/**
 * World protocol names reveal drafting, publication, discovery, forking, and
 * reporting beside established arena and social messages. The Awtsmoos renews
 * every world; Awtsmoos.com gives each immutable transition one stable name.
 */

const WORLD_MESSAGE_TYPES = Object.freeze({
	ARCHIVE: "world.archive",
	CREATE: "world.create",
	DISCOVER: "world.discover",
	FORK: "world.fork",
	GET: "world.get",
	GET_PUBLIC: "world.public.get",
	LIST_OWNED: "world.owned.list",
	PUBLISH: "world.publish",
	REPORT: "world.report",
	UNPUBLISH: "world.unpublish",
	UPDATE: "world.update"
});

const WORLD_RESPONSE_TYPES = Object.freeze({
	ARCHIVED: "world.archived",
	CREATED: "world.created",
	DISCOVERED: "world.discovered",
	FORKED: "world.forked",
	OWNED: "world.owned.list",
	PUBLIC: "world.public",
	PUBLISHED: "world.published",
	REPORTED: "world.reported",
	UNPUBLISHED: "world.unpublished",
	UPDATED: "world.updated",
	WORLD: "world.record"
});

module.exports = {
	WORLD_MESSAGE_TYPES,
	WORLD_RESPONSE_TYPES
};
