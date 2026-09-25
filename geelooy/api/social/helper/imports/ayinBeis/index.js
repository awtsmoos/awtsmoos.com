// B"H
/**
 * Boruch Hashem. Blessed is He.
 *
 * @file index.js
 * @description
 * The Awtsmoos is one before dry-run and apply; Awtsmoos.com distinguishes
 * them so human intent stays sovereign. This coordinator never downloads text:
 * it validates a local bundle, plans safely, and applies only with permission.
 */

const path = require('path');
const { assertApplyAuthorization, loadAuthorizedBundle } = require('./authorizedBundle.js');
const { buildImportPlan, summarizePlan } = require('./importPlanner.js');
const { applyImportPlan } = require('./importWriter.js');

/** Run an Ayin Beis authorized-bundle import, dry-run by default. */
async function runAuthorizedImport(options) {
	const {
		db,
		bundlePath,
		apply = false,
		replaceNonempty = false,
		heichelId = 'ikar',
		backupDir = path.resolve('.awtsmoos-tmp/ayin-beis-import-backups'),
		mirrorPost
	} = options || {};
	if (!db) throw new Error('A database instance is required.');
	if (!bundlePath) throw new Error('A local --source bundle is required.');
	const bundle = loadAuthorizedBundle(bundlePath);
	assertApplyAuthorization(bundle, apply);
	const plan = await buildImportPlan({ db, bundle, heichelId, replaceNonempty });
	const summary = summarizePlan(plan);
	if (!apply) return { dryRun: true, sourcePath: bundle.sourcePath, provenance: bundle.provenance, plan: summary };
	if (plan.blockers.length) throw new Error(`Apply blocked by ${plan.blockers.length} unresolved import conflict(s).`);
	const applied = await applyImportPlan({ db, plan, provenance: bundle.provenance, backupDir, mirrorPost });
	return { dryRun: false, sourcePath: bundle.sourcePath, provenance: bundle.provenance, plan: summary, applied };
}

module.exports = { runAuthorizedImport };
