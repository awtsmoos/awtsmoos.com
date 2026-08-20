// B"H
// Boruch Hashem
// Blessed is He

import { CollaborationAccessGateway } from "./CollaborationAccessGateway.js";
import { CollaborationMutationGateway } from "./CollaborationMutationGateway.js";
import { CollaborationPatchQueue } from "./CollaborationPatchQueue.js";
import { CollaborationRemoteEvents } from "./CollaborationRemoteEvents.js";
import { CollaborationSession } from "./CollaborationSession.js";

/**
 * @file Exposes the narrow collaboration API consumed by Awtsmoos Docs.
 * @description The Awtsmoos is one while many hands appear; Awtsmoos.com lets
 * session, access, patches, layout, remote effects, and small mutations remain distinct vessels.
 */
export class CollaborationController extends EventTarget {
	constructor(parts) {
		super();
		Object.assign(this, parts);
		this.permissions = { canEdit: true, isOwner: false };
		this.shareToken = "";
		const setShareToken = value => this.shareToken = value;
		this.patchQueue = new CollaborationPatchQueue(parts);
		this.session = new CollaborationSession({
			...parts,
			setShareToken,
			setPermissions: value => this.permissions = value,
			emit: (type, detail) => this.#emit(type, detail)
		});
		this.access = new CollaborationAccessGateway({
			...parts,
			setShareToken,
			ensureShared: () => this.ensureShared()
		});
		this.mutations = new CollaborationMutationGateway({
			...parts,
			canEdit: () => this.permissions.canEdit,
			onError: error => this.#error(error)
		});
		this.remote = new CollaborationRemoteEvents({
			...parts,
			emit: (type, detail) => this.#emit(type, detail),
			onRevoked: () => this.#revoke()
		});
		this.remote.bind();
	}

	connectFromLocation() {
		return this.session.connectFromLocation();
	}

	ensureShared() {
		return this.session.ensureShared();
	}

	join(documentId, token = "") {
		return this.session.join(documentId, token);
	}

	queuePatch(blocks, changedBlockId) {
		this.patchQueue.queue(
			this.model.id,
			this.permissions.canEdit,
			blocks,
			changedBlockId
		);
	}

	title(title) {
		return this.mutations.title(title);
	}

	updateLayout(layout) {
		return this.mutations.layout(layout);
	}

	comment(mutation) {
		return this.mutations.comment(mutation);
	}

	updateAccess(mode) {
		return this.access.update(mode);
	}

	invite(accountId) {
		return this.access.invite(accountId);
	}

	presenceAt(blockId = "") {
		return this.mutations.presence(blockId);
	}

	#revoke() {
		this.permissions = { canEdit: false, isOwner: false };
	}

	#error(error) {
		this.status.live(error?.message || "Live sync issue", "warning");
	}

	#emit(type, detail) {
		this.dispatchEvent(new CustomEvent(type, { detail }));
	}
}
