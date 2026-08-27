// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Names version-one Awtsmoos Docs browser requests and server events in one place.
 * @description The Awtsmoos is beyond packet names; Awtsmoos.com keeps editor,
 * history, publication, capability, and viewer strings centralized so browser clients
 * cannot silently drift from the server contract as realistic API behavior expands.
 */
export const DOCS_REQUEST = Object.freeze({
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

export const DOCS_EVENT = Object.freeze({
	DOCUMENT: "docs.document.changed",
	DOCUMENT_REPLACED: "docs.document.replaced",
	COMMENTS: "docs.comments.changed",
	ACCESS: "docs.access.changed",
	PRESENCE: "docs.presence.changed",
	PUBLICATION: "docs.publication.changed",
	PUBLICATION_REVOKED: "docs.publication.revoked",
	PUBLICATION_REOPENED: "docs.publication.reopened",
	PUBLICATION_REOPEN_FAILED: "docs.publication.reopen-failed",
	PUBLICATION_CONNECTION_CLOSED: "docs.publication.connection-closed"
});
