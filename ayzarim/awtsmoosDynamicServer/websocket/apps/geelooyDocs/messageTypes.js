// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Names every version-one Docs request and server event without hiding authority in generic verbs.
 * @description The Awtsmoos is beyond every finite message; Awtsmoos.com gives
 * capability discovery, editing, history, publication, and viewer light distinct
 * names so clients can reason about the API without scattering protocol strings.
 */
const TYPES = Object.freeze({
	CAPABILITIES: "docs.capabilities.get",
	CREATE: "docs.document.create",
	JOIN: "docs.document.join",
	LEAVE: "docs.document.leave",
	PATCH: "docs.document.patch",
	TITLE: "docs.document.title",
	LAYOUT: "docs.document.layout",
	COMMENT: "docs.comment.mutate",
	ACCESS: "docs.access.update",
	INVITE: "docs.access.invite",
	PRESENCE: "docs.presence.update",
	VERSION_LIST: "docs.version.list",
	VERSION_GET: "docs.version.get",
	VERSION_NAME: "docs.version.name",
	VERSION_RESTORE: "docs.version.restore",
	PUBLICATION_CREATE: "docs.publication.create",
	PUBLICATION_LIST: "docs.publication.list",
	PUBLICATION_REVOKE: "docs.publication.revoke",
	PUBLICATION_OPEN: "docs.publication.open",
	PUBLICATION_CLOSE: "docs.publication.close"
});

const EVENTS = Object.freeze({
	DOCUMENT: "docs.document.changed",
	DOCUMENT_REPLACED: "docs.document.replaced",
	COMMENTS: "docs.comments.changed",
	ACCESS: "docs.access.changed",
	PRESENCE: "docs.presence.changed",
	PUBLICATION: "docs.publication.changed",
	PUBLICATION_REVOKED: "docs.publication.revoked"
});

module.exports = { EVENTS, TYPES };
