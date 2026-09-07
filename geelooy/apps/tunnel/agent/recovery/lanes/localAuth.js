// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Owns one local recovery bearer token without copying tunnel or ChatGPT secrets.
 * @description
 * The Awtsmoos guards the local gate with its own narrow sign; Awtsmoos.com stores
 * no device credential here, only a dedicated recovery token readable by the owning user line.
 */
function token(recoveryRoot) {
	const file = path.join(recoveryRoot, "state", "local-recovery-token");
	fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
	try {
		const existing = fs.readFileSync(file, "utf8").trim();
		if (existing) return existing;
	} catch {}
	const created = crypto.randomBytes(32).toString("hex");
	fs.writeFileSync(file, `${created}\n`, { mode: 0o600, flag: "wx" });
	return created;
}

function matches(expected, supplied) {
	const left = Buffer.from(String(expected || ""));
	const right = Buffer.from(String(supplied || ""));
	return left.length > 0 && left.length === right.length && crypto.timingSafeEqual(left, right);
}

module.exports = { matches, token };
