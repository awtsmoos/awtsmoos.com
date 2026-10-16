//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");

const repo = path.resolve(__dirname, "../..");
const defaultRoot = path.join(repo, "plugins/awtsmoos-shliach");

/** Verify a single publishable package without granting runtime credentials. */
function validate(root = defaultRoot) {
	const read = name => fs.readFileSync(path.join(root, name));
	const json = name => JSON.parse(read(name).toString("utf8"));
	const plugin = json("plugin.json");
	const codex = json(".codex-plugin/plugin.json");
	const config = json(".mcp.json");
	const alternate = json("mcp.json");
	const errors = [];
	const check = (yes, why) => { if (!yes) errors.push(why); };
	check(plugin.version === codex.version && /^\d+\.\d+\.\d+$/.test(plugin.version), "versions_inconsistent");
	check(plugin.name === codex.name, "plugin_name_mismatch");
	check(plugin.description && plugin.description.length >= 70, "description_too_short");
	check(plugin.author?.name && plugin.author?.url, "publisher_missing");
	const openai = plugin.extensions?.["com.openai"] || {};
	const ui = openai.interface || {};
	for (const key of ["privacyPolicyURL", "termsOfServiceURL", "supportURL", "websiteURL"]) {
		try { check(new URL(ui[key]).protocol === "https:", key + "_missing_or_insecure"); }
		catch { errors.push(key + "_invalid"); }
	}
	check(ui.displayName && ui.shortDescription && ui.longDescription, "listing_missing");
	check(openai.review?.test_cases?.positive?.length >= 5, "review_positive_cases_missing");
	check(openai.review?.test_cases?.negative?.length >= 3, "review_negative_cases_missing");
	check(openai.review?.commerce === true, "external_credit_disclosure_missing");
	const origin = "https://awtsmoos.com/api/tunnel/control/mcp";
	check(config.mcpServers?.["awtsmoos-api"]?.url === origin, "mcp_url_mismatch");
	check(alternate.mcpServers?.["awtsmoos-api"]?.url === origin, "alternate_mcp_url_mismatch");
	const iconName = ui.logo?.replace(/^\.\//, "") || "assets/gpt-icon.png";
	const icon = read(iconName);
	check(icon.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])), "icon_not_png");
	check(icon.length <= 900000, "icon_too_large");
	check(icon.readUInt32BE(16) >= 256 && icon.readUInt32BE(20) >= 256, "icon_dimensions_small");
	for (const entry of ["skills/instructions", "skills/tunnel-workflow", "skills/poetic-code", "skills/novel-voice"]) {
		const file = path.join(root, entry, "SKILL.md");
		check(fs.existsSync(file) && fs.readFileSync(file,"utf8").startsWith("---\n"), entry + "_invalid");
	}
	for (const name of ["ARTIFACTS_AND_PUBLIC_LINKS.md","PUBLIC_SUBMISSION_CHECKLIST.md","MODERN_TUNNEL_CONTRACT.md"]) {
		check(fs.existsSync(path.join(root,"skills/instructions/references",name)), "reference_missing:" + name);
	}
	const files = [];
	function visit(base = root) {
		for (const entry of fs.readdirSync(base,{withFileTypes:true})) {
			const full = path.join(base,entry.name);
			if (entry.isSymbolicLink()) { errors.push("symlink_disallowed:" + entry.name); continue; }
			if (entry.isDirectory()) visit(full);
			else if (entry.isFile()) files.push(full);
		}
	}
	visit();
	check(files.length >= 65, "source_inventory_incomplete");
	for (const file of files.filter(f=>/\.(?:json|md|txt|yaml|mjs)$/.test(f))) {
		const body = fs.readFileSync(file,"utf8");
		if (/\bak_[A-Za-z0-9_-]{40,}\b|Bearer [A-Za-z0-9_.-]{64,}/.test(body)) errors.push("credential_like_literal:" + path.relative(root,file));
	}
	return { ok: errors.length === 0, errors, version:plugin.version, files:files.length, bytes:files.reduce((n,f)=>n+fs.statSync(f).size,0) };
}

/** Package exactly this canonical plugin; never include machine or repo state. */
function build(root = defaultRoot, output = null) {
	const result = validate(root);
	if (!result.ok) return result;
	const target = output || path.join("/tmp", "awtsmoos-shliach-"+result.version+".zip");
	fs.rmSync(target,{force:true});
	const proc = spawnSync("zip",["-q","-X","-r",target,"."],{cwd:root,encoding:"utf8"});
	if (proc.status !== 0) throw Error("zip_failed:"+(proc.stderr||proc.error?.message||"unknown"));
	const content = fs.readFileSync(target);
	return {...result,archive:target,archiveBytes:content.length,archiveSha256:crypto.createHash("sha256").update(content).digest("hex")};
}

if (require.main === module) {
	try {
		const report = process.argv.includes("--build") ? build() : validate();
		console.log(JSON.stringify(report,null,2));
		if (!report.ok) process.exitCode = 1;
	} catch (error) {
		console.error(JSON.stringify({ok:false,error:error.message}));
		process.exitCode=1;
	}
}

module.exports = { validate, build };
