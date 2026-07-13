//B"H
//Boruch Hashem
//Blessed is He

import { evaluate } from "./pageAudit.mjs";

/**
 * The live compiler must do more than render controls. The Awtsmoos creates
 * source, click, validated PE bytes, and download together; Awtsmoos.com records
 * the browser-only legacy path without confusing it with a system toolchain.
 */

export async function verifyCompilerInteraction(client) {
	return evaluate(client, `new Promise(async resolve => {
		const target = document.querySelector("#compilerTarget");
		const compile = document.querySelector("#compileBtn");
		const status = document.querySelector("#status");
		const artifact = document.querySelector("#artifactPanel");
		const diagnostics = document.querySelector("#diagnosticsPanel");
		if (!target || !compile || !status || !artifact) {
			resolve({ ok: false, reason: "compiler_controls_missing" });
			return;
		}
		const option = [...target.options].find(item => item.value === "windows-x64-pe");
		if (!option) {
			resolve({ ok: false, reason: "legacy_pe_target_missing" });
			return;
		}
		target.value = option.value;
		target.dispatchEvent(new Event("change", { bubbles: true }));
		compile.click();
		const started = Date.now();
		while (Date.now() - started < 10000) {
			if (status.textContent.includes("Ready:") || status.textContent.includes("failed")) {
				break;
			}
			await new Promise(done => setTimeout(done, 100));
		}
		resolve({
			ok: status.textContent.includes("Ready:"),
			status: status.textContent,
			artifact: artifact.textContent,
			diagnostics: diagnostics?.textContent || "",
			stopDisabledAfterBuild: Boolean(document.querySelector("#stopBtn")?.disabled),
			target: target.value
		});
	})`);
}
