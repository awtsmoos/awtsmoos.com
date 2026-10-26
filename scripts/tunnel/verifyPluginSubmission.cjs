// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file verifyPluginSubmission.cjs
 * @description
 * The Awtsmoos keeps source image-free, then clothes a temporary publish vessel with a SHA-verified Drive icon.
 * Submission validation guards metadata, skills, privacy, and package integrity without granting runtime credentials.
 */

'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { ICON_RELATIVE_PATH, hydrateIcon, verifyIconFile } = require('./shliachPackageIcon.cjs');

const repo = path.resolve(__dirname, '../..');
const defaultRoot = path.join(repo, 'plugins/awtsmoos-shliach');

/** Verify one canonical source tree or hydrated publishable package. */
function validate(root = defaultRoot, { requireIcon = false } = {}) {
	const read = name => fs.readFileSync(path.join(root, name));
	const json = name => JSON.parse(read(name).toString('utf8'));
	const plugin = json('plugin.json');
	const codex = json('.codex-plugin/plugin.json');
	const config = json('.mcp.json');
	const alternate = json('mcp.json');
	const errors = [];
	const check = (yes, why) => { if (!yes) errors.push(why); };
	check(plugin.version === codex.version && /^\d+\.\d+\.\d+$/.test(plugin.version), 'versions_inconsistent');
	check(plugin.name === codex.name, 'plugin_name_mismatch');
	check(plugin.description?.length >= 70, 'description_too_short');
	check(plugin.author?.name && plugin.author?.url, 'publisher_missing');
	const openai = plugin.extensions?.['com.openai'] || {};
	const ui = openai.interface || {};
	for (const key of ['privacyPolicyURL', 'termsOfServiceURL', 'supportURL', 'websiteURL']) {
		try { check(new URL(ui[key]).protocol === 'https:', `${key}_missing_or_insecure`); }
		catch { errors.push(`${key}_invalid`); }
	}
	check(ui.displayName && ui.shortDescription && ui.longDescription, 'listing_missing');
	check(ui.logo === `./${ICON_RELATIVE_PATH}` && ui.composerIcon === `./${ICON_RELATIVE_PATH}`, 'icon_path_mismatch');
	check(openai.review?.test_cases?.positive?.length === 5, 'review_requires_exactly_five_positive_cases');
	check(openai.review?.test_cases?.negative?.length === 3, 'review_requires_exactly_three_negative_cases');
	for (const kind of ['positive', 'negative']) {
		for (const [index, item] of (openai.review?.test_cases?.[kind] || []).entries()) {
			check(typeof item.prompt === 'string' && item.prompt.trim(), `review_${kind}_${index}_prompt_missing`);
			check(typeof item.description === 'string' && item.description.trim(), `review_${kind}_${index}_description_missing`);
			if (kind === 'positive') {
				check(typeof item.tools_triggered === 'string' && item.tools_triggered.trim(), `review_positive_${index}_tools_missing`);
				check(typeof item.expected_behavior === 'string' && item.expected_behavior.trim(), `review_positive_${index}_expected_behavior_missing`);
			}
		}
	}
	check(openai.review?.commerce === true, 'external_credit_disclosure_missing');
	const endpoint = 'https://awtsmoos.com/api/tunnel/control/mcp';
	check(config.mcpServers?.['awtsmoos-api']?.url === endpoint, 'mcp_url_mismatch');
	check(alternate.mcpServers?.['awtsmoos-api']?.url === endpoint, 'alternate_mcp_url_mismatch');
	if (requireIcon) {
		try { verifyIconFile(path.join(root, ICON_RELATIVE_PATH)); }
		catch (error) { errors.push(error.message); }
	}
	for (const entry of ['skills/instructions', 'skills/tunnel-workflow', 'skills/poetic-code', 'skills/novel-voice']) {
		const file = path.join(root, entry, 'SKILL.md');
		check(fs.existsSync(file) && fs.readFileSync(file, 'utf8').startsWith('---\n'), `${entry}_invalid`);
	}
	for (const name of ['ARTIFACTS_AND_PUBLIC_LINKS.md', 'PUBLIC_SUBMISSION_CHECKLIST.md', 'MODERN_TUNNEL_CONTRACT.md']) {
		check(fs.existsSync(path.join(root, 'skills/instructions/references', name)), `reference_missing:${name}`);
	}
	const files = [];
	const visit = base => {
		for (const entry of fs.readdirSync(base, { withFileTypes: true })) {
			const full = path.join(base, entry.name);
			if (entry.isSymbolicLink()) errors.push(`symlink_disallowed:${entry.name}`);
			else if (entry.isDirectory()) visit(full);
			else if (entry.isFile()) files.push(full);
		}
	};
	visit(root);
	check(files.length >= 64, 'source_inventory_incomplete');
	for (const file of files.filter(file => /\.(?:json|md|txt|yaml|mjs)$/.test(file))) {
		const body = fs.readFileSync(file, 'utf8');
		if (/\bak_[A-Za-z0-9_-]{40,}\b|Bearer [A-Za-z0-9_.-]{64,}/.test(body)) errors.push(`credential_like_literal:${path.relative(root, file)}`);
	}
	return { ok: errors.length === 0, errors, version: plugin.version, files: files.length, bytes: files.reduce((sum, file) => sum + fs.statSync(file).size, 0) };
}

/** Build a temporary hydrated package; source itself remains image-free. */
function build(root = defaultRoot, output = null) {
	const sourceResult = validate(root);
	if (!sourceResult.ok) return sourceResult;
	const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-shliach-package-'));
	try {
		fs.cpSync(root, temp, { recursive: true });
		hydrateIcon(temp);
		const result = validate(temp, { requireIcon: true });
		if (!result.ok) return result;
		const target = output || path.join('/tmp', `awtsmoos-shliach-${result.version}.zip`);
		fs.rmSync(target, { force: true });
		const proc = spawnSync('zip', ['-q', '-X', '-r', target, '.'], { cwd: temp, encoding: 'utf8' });
		if (proc.status !== 0) throw new Error(`zip_failed:${proc.stderr || proc.error?.message || 'unknown'}`);
		const content = fs.readFileSync(target);
		return { ...result, archive: target, archiveBytes: content.length, archiveSha256: crypto.createHash('sha256').update(content).digest('hex') };
	} finally { fs.rmSync(temp, { recursive: true, force: true }); }
}

if (require.main === module) {
	try {
		const report = process.argv.includes('--build') ? build() : validate();
		console.log(JSON.stringify(report, null, 2));
		if (!report.ok) process.exitCode = 1;
	} catch (error) { console.error(JSON.stringify({ ok: false, error: error.message })); process.exitCode = 1; }
}

module.exports = { build, validate };
