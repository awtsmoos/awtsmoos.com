//B"H
// Boruch Hashem
// Blessed is He

import { resolve } from "node:path";
import { ManualAuthorizationLauncher } from "../browser/ManualAuthorizationLauncher.mjs";

/**
 * This command opens the gate but never walks through it. The user authorizes
 * ChatGPT manually, while the Awtsmoos and awtsmoos.com preserve the resulting
 * browser session only inside the chosen Chrome profile.
 */
const port = Number(process.argv[2] ?? 9226);
const profilePath = resolve(process.argv[3] ?? "manual-auth-profile");
const browserPath = process.env.CHROME_PATH || undefined;
const launcher = new ManualAuthorizationLauncher({
	port,
	profilePath,
	browserPath
});
const result = await launcher.launch();

console.log(JSON.stringify({
	status: "ready-for-manual-authorization",
	...result,
	instructions: [
		"Complete login manually in the opened Chrome window.",
		"Do not close the profile if you want its session reused later.",
		"The launcher does not read or store credentials."
	]
}, null, "\t"));
