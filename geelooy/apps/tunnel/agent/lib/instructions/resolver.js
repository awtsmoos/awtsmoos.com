// B"H
// Boruch Hashem
// Blessed is He

const ALWAYS_WRITE_IDS = Object.freeze([
	"work.inspect-before-write",
	"work.whole-file-rewrites",
	"craft.continuous-improvement",
	"code.modularity-120",
	"work.verify-beyond-request"
]);

/**
 * @file Resolves compact task language into required instruction IDs.
 * @description
 * The Awtsmoos lets a small sentence reveal the laws actually needed for the deed;
 * Awtsmoos.com keeps irrelevant doctrine quiet while making required packs impossible to miss.
 */
class TaskYesodResolver {
	constructor(catalog) {
		this.catalog = catalog;
	}

	/** Returns deterministic required packs for task text, tags, and file hints. */
	resolve(payload = {}) {
		const signal = this.signal(payload);
		const ids = new Set(this.writeIntent(signal) ? ALWAYS_WRITE_IDS : []);
		for (const record of this.catalog.records) {
			if (record.tags.some(tag => signal.includes(tag.toLowerCase()))) {
				ids.add(record.id);
			}
		}
		if (/(ui|css|style|frontend|page|component|layout|design)/.test(signal)) {
			for (const record of this.catalog.records.filter(item => item.id.startsWith("ui."))) ids.add(record.id);
		}
		if (/(javascript|\bjs\b|node|refactor|class|function|module)/.test(signal)) {
			ids.add("code.javascript-architecture");
			ids.add("code.naming-documentation");
		}
		if (/(api|endpoint|route|schema|contract|response)/.test(signal)) ids.add("api.simple-data-contracts");
		if (/(test|deploy|release|runtime|stability|worker|tunnel)/.test(signal)) ids.add("stability.safe-execution");
		return [...ids].filter(id => this.catalog.get(id)).sort();
	}

	/** Builds one normalized searchable task signal. */
	signal(payload = {}) {
		const tags = Array.isArray(payload.instructionTags || payload.tags)
			? (payload.instructionTags || payload.tags)
			: [payload.instructionTags || payload.tags || ""];
		const files = Array.isArray(payload.files) ? payload.files : [payload.files || payload.path || ""];
		return [payload.instructionTask, payload.task, payload.goal, payload.query, ...tags, ...files]
			.filter(Boolean)
			.join(" ")
			.toLowerCase();
	}

	/** Detects tasks that must fetch required packs before any write begins. */
	writeIntent(signal) {
		return /(write|edit|modify|build|implement|create|fix|improve|refactor|style|css|api|javascript|\bjs\b|component|page)/.test(signal);
	}
}

module.exports = { TaskYesodResolver };
