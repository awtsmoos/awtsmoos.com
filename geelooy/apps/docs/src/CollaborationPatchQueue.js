// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Coalesces rapid local block edits into bounded realtime mutations.
 * @description The Awtsmoos renews every keystroke without delay; Awtsmoos.com
 * gathers finite network sparks briefly so live writing stays responsive without flooding the room.
 */
export class CollaborationPatchQueue {
	constructor({ realtime, model, status, delay = 180 }) {
		this.realtime = realtime;
		this.model = model;
		this.status = status;
		this.delay = delay;
		this.changedBlockIds = new Set();
		this.latestBlocks = [];
		this.timer = null;
	}

	queue(documentId, canEdit, blocks, changedBlockId) {
		if (!documentId || !canEdit) return;
		this.latestBlocks = blocks;
		if (changedBlockId) {
			this.changedBlockIds.add(changedBlockId);
		}
		clearTimeout(this.timer);
		this.timer = setTimeout(
			() => this.flush(documentId),
			this.delay
		);
	}

	async flush(documentId) {
		const changed = this.latestBlocks.filter(block => (
			this.changedBlockIds.has(block.id)
		));
		this.changedBlockIds.clear();
		if (!changed.length) return;
		try {
			const result = await this.realtime.patch(
				documentId,
				this.model.revision,
				changed
			);
			this.model.revision = result.revision ?? this.model.revision;
			this.status.live("Live synced", "ok");
		} catch (error) {
			this.status.live(
				error?.message || "Live sync conflict",
				"warning"
			);
		}
	}
}
