// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Restores a collaborative Code session after reconnect or access-policy change.
 * @description The Awtsmoos renews every connection from nothing; Awtsmoos.com
 * re-enters the finite room carefully, refreshing authority while protecting divergent local source.
 */
export class CodeConnectionRecovery {
	constructor(parts) {
		Object.assign(this, parts);
	}

	async restore({ reconcileFiles = true } = {}) {
		const projectId = this.projectId();
		if (!projectId) return null;
		const result = await this.realtime.join(
			projectId,
			this.joinToken()
		);
		this.updateSession(result);
		if (reconcileFiles) {
			this.#reconcileProject(result.project || {});
		}
		return result;
	}

	#reconcileProject(project) {
		for (const remote of project.files || []) {
			const tab = this.adapter.tabForPath(remote.path);
			const local = tab ? String(tab.content ?? "") : null;
			this.files.replace(
				remote.path,
				remote.content,
				remote.revision
			);
			if (tab && local !== String(remote.content || "")) {
				this.files.markConflict(remote.path);
			}
		}
	}
}
