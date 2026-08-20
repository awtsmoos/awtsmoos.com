// B"H
// Boruch Hashem
// Blessed is He

import { UI } from "../ui.js";
import { CodeConnectionRecovery } from "./connection-recovery.js";
import { CollaborativeEditorAdapter } from "./editor-adapter.js";
import { SharedFileState } from "./file-state.js";
import { CodeFileSync } from "./file-sync.js";
import { openJoinedProjectTabs } from "./joined-tabs.js";
import { CodePresenceGateway } from "./presence-gateway.js";
import { CodeRealtimeClient } from "./realtime-client.js";
import { CodeRemoteEvents } from "./remote-events.js";
import { activeWorkspaceSnapshot } from "./workspace-snapshot.js";

/**
 * @file Owns one opt-in collaborative Awtsmoos Code project session.
 * @description The Awtsmoos is one beyond local and remote revisions; Awtsmoos.com
 * composes focused sync, recovery, presence, and event vessels while this facade stays clear.
 */
export class CodeProjectSession extends EventTarget {
	constructor() {
		super();
		this.realtime = new CodeRealtimeClient();
		this.files = new SharedFileState();
		this.projectId = "";
		this.joinToken = "";
		this.permissions = { canEdit: false, isOwner: false };
		this.presence = [];
		this.adapter = new CollaborativeEditorAdapter({
			input: (context, content) => this.fileSync.localInput(context, content),
			presence: (context, selection) => this.presenceGateway.send(context, selection)
		});
		const accessors = {
			projectId: () => this.projectId,
			canEdit: () => this.permissions.canEdit
		};
		this.fileSync = new CodeFileSync({
			realtime: this.realtime,
			files: this.files,
			adapter: this.adapter,
			...accessors
		});
		this.presenceGateway = new CodePresenceGateway({
			realtime: this.realtime,
			...accessors
		});
		this.recovery = new CodeConnectionRecovery({
			realtime: this.realtime,
			files: this.files,
			adapter: this.adapter,
			projectId: () => this.projectId,
			joinToken: () => this.joinToken,
			updateSession: result => this.#refreshSession(result)
		});
		this.remote = new CodeRemoteEvents({
			realtime: this.realtime,
			fileSync: this.fileSync,
			onPresence: value => this.presence = value,
			onAccess: payload => this.#accessChanged(payload),
			onOpen: () => void this.#restoreConnection(),
			onStatus: () => this.#emitStatus()
		});
		this.adapter.bind();
		this.remote.bind();
	}

	async startSharing() {
		const snapshot = activeWorkspaceSnapshot();
		await this.realtime.connect();
		const result = await this.realtime.create(snapshot.project);
		this.joinToken = "";
		this.adapter.setWorkspace(snapshot.workspace);
		this.#accept(result);
		UI.showToast("Live project created from open files.", "success");
		return result;
	}

	async join(projectId, token = "") {
		await this.realtime.connect();
		const result = await this.realtime.join(projectId, token);
		this.joinToken = token;
		this.adapter.setWorkspace(await openJoinedProjectTabs(result.project));
		this.#accept(result);
		UI.showToast("Joined collaborative project.", "success");
		return result;
	}

	setAccess(mode) {
		if (!this.projectId) throw new Error("No shared project is active");
		return this.realtime.access(this.projectId, mode);
	}

	resolveActiveConflict() {
		return this.fileSync.resolveActiveConflict();
	}

	status() {
		return {
			projectId: this.projectId,
			permissions: { ...this.permissions },
			presence: [...this.presence],
			conflicts: Array.from(this.files.files.values())
				.filter(file => file.conflict)
				.map(file => file.path)
		};
	}

	#accept(result) {
		this.#refreshSession(result);
		this.files.load(result.project || {});
	}

	#refreshSession(result) {
		this.projectId = result.project?.id || this.projectId;
		this.permissions = result.permissions || this.permissions;
		this.presence = result.presence || [];
		this.#emitStatus();
	}

	#accessChanged(payload) {
		if (payload.revoked) {
			this.permissions = { canEdit: false, isOwner: false };
			UI.showToast("Project editing access was revoked.", "warning");
			return;
		}
		void this.recovery.restore({ reconcileFiles: false }).catch(() => {});
	}

	async #restoreConnection() {
		if (!this.projectId) return;
		try {
			await this.recovery.restore({ reconcileFiles: true });
			UI.showToast("Collaboration reconnected.", "success");
		} catch {
			UI.showToast("Could not restore collaboration session.", "warning");
		}
	}

	#emitStatus() {
		this.dispatchEvent(new Event("status"));
	}
}
