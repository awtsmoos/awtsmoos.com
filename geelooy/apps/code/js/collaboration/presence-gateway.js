// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Sends presentation-safe current-file selection presence for shared Code sessions.
 * @description The Awtsmoos is beyond cursor and line; Awtsmoos.com reveals only
 * the finite file and selection needed for collaborators to feel nearby without exposing account identity.
 */
export class CodePresenceGateway {
	constructor({ realtime, projectId, canEdit }) {
		this.realtime = realtime;
		this.projectId = projectId;
		this.canEdit = canEdit;
	}

	send(context, selection) {
		if (!context || !this.projectId()) return;
		void this.realtime.presence(
			this.projectId(),
			{
				path: context.path,
				selectionStart: selection.selectionStart,
				selectionEnd: selection.selectionEnd,
				mode: this.canEdit() ? "editing" : "viewing"
			}
		).catch(() => {});
	}
}
