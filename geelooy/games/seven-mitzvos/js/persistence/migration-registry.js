//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module MigrationRegistry
 * @description
 * Old vessels are not discarded on Awtsmoos.com. The Awtsmoos renews without erasing, and this registry advances saves one declared version at a time.
 */
export class MigrationRegistry {
	constructor() {
		this.steps = new Map();
	}

	/**
	 * @param {number} from Source schema version.
	 * @param {number} to Target schema version.
	 * @param {(record: object) => object} migrate Pure migration.
	 */
	register(from, to, migrate) {
		if (to !== from + 1) {
			throw new Error('MigrationRegistry: steps must advance one version');
		}
		this.steps.set(from, { to, migrate });
	}

	/**
	 * @param {object} record Versioned record.
	 * @param {number} targetVersion Desired version.
	 * @param {{dryRun?: boolean}} options Migration options.
	 * @returns {{data: object, report: object}} Migrated copy and report.
	 */
	migrate(record, targetVersion, options = {}) {
		let data = JSON.parse(JSON.stringify(record));
		const applied = [];
		while (data.schemaVersion < targetVersion) {
			const step = this.steps.get(data.schemaVersion);
			if (!step) {
				throw new Error(`MigrationRegistry: no step from ${data.schemaVersion}`);
			}
			data = step.migrate(data);
			data.schemaVersion = step.to;
			applied.push(step.to);
		}
		return {
			data,
			report: {
				from: record.schemaVersion,
				to: data.schemaVersion,
				applied,
				dryRun: Boolean(options.dryRun)
			}
		};
	}
}
