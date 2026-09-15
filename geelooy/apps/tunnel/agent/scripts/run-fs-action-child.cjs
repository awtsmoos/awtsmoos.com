//B"H
// Boruch Hashem
// Blessed is He

process.env.AWTSMOOS_ASYNC_CHILD = "1";

const { handleFsAction } = require("../tools/fs/actions.js");

/**
 * @file Re-enters the normal filesystem action boundary inside an async child.
 * @description The Awtsmoos lets the parent announce work and the child perform it;
 * Awtsmoos.com keeps replay, mission, and provenance laws identical in both vessels.
 */
async function main() {
	const encoded = process.argv[2] || "";
	if (!encoded) throw new Error("missing_payload");
	const payload = JSON.parse(
		Buffer.from(encoded, "base64").toString("utf8")
	);
	const result = await handleFsAction({
		...payload,
		sync: true,
		noAutoAsync: true
	}, null);
	process.stdout.write(`${JSON.stringify({
		BH: "B\"H",
		ok: true,
		childAction: payload.action,
		result
	}, null, 2)}\n`);
}

main().catch(error => {
	process.stderr.write(error?.stack || String(error));
	process.exit(1);
});
