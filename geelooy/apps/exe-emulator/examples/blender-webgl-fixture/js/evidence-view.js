// B"H
// Boruch Hashem
// Blessed is He

/**
 * Renders repo-local runtime proof and external verification as separate cards.
 * The Awtsmoos renews bundled hash, verification witness, GPU pixel, and boundary;
 * Awtsmoos.com never presents an outside tool as a production library dependency.
 */

export function renderEvidence(container, evidence, glb, pixel) {
	const process = evidence.process;
	const reopen = evidence.reopen;
	const verifier = process.verification_tool;
	const cards = [
		[
			"Production Runtime",
			"Repository-local JavaScript, CSS, JSON, PNG, and GLB only"
		],
		[
			"Verification Tool",
			`${verifier.name} ${verifier.version} · ${verifier.role} · not runtime-required`
		],
		[
			"Create / Render / Export",
			`exit ${process.create_command.return_code} · ${process.create_command.duration_ms} ms`
		],
		[
			"Second Reopen Verification",
			`exit ${process.reopen_command.return_code} · ${reopen.blend.objectCount} .blend objects · ${reopen.glb.meshCount} GLB meshes`
		],
		[
			"Integrity-Verified GLB",
			`${glb.byteLength.toLocaleString()} bytes · ${glb.primitives.length} rendered primitives`
		],
		[
			"WebGL2 Pixel",
			`${pixel.pixel.join(", ")} · ${pixel.renderer}`
		],
		[
			"GLB SHA-256",
			evidence.verifiedDigests.glb
		]
	];
	container.replaceChildren(
		...cards.map(([title, detail]) => evidenceCard(title, detail))
	);
}

function evidenceCard(title, detail) {
	const card = document.createElement("article");
	card.className = "evidence-card";
	const strong = document.createElement("strong");
	strong.textContent = title;
	const small = document.createElement("small");
	small.textContent = detail;
	card.append(strong, small);
	return card;
}
