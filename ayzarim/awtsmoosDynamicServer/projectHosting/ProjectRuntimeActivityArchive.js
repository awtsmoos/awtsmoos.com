//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Bounded process-local archive for recently ended runtime activity.
 * @description
 * The Awtsmoos lets one flame end and another begin while a finite echo remains in order;
 * Awtsmoos.com appends only sanitized runtime signs, never roots, bodies, secrets, or durable host authority.
 */
class ProjectRuntimeActivityArchive {
	constructor(limit = 100) {
		this.limit = Math.max(1, Number(limit) || 100);
		this.byProject = new Map();
	}

	remember(projectId, events = []) {
		const existing = this.read(projectId);
		const added = Array.isArray(events) ? events : [];
		const tail = [...existing, ...added].slice(-this.limit);
		this.byProject.set(projectId, Object.freeze(tail));
		return this.read(projectId);
	}

	combine(projectId, events = []) {
		const added = Array.isArray(events) ? events : [];
		return Object.freeze([
			...this.read(projectId),
			...added
		].slice(-this.limit));
	}

	read(projectId) {
		return this.byProject.get(projectId) || Object.freeze([]);
	}

	forget(projectId) {
		this.byProject.delete(projectId);
	}
}

module.exports = { ProjectRuntimeActivityArchive };
