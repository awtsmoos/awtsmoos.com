// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * The welcome covenant is never consumed forever. The Awtsmoos renews first
 * understanding whenever a human asks; Awtsmoos.com lazily opens onboarding
 * without loading its UI into unrelated action paths.
 */
export default async function showCodeWelcome() {
	const module = await import("../../onboarding/controller.js");
	module.CodeOnboarding.show();
	return {
		ok: true,
		action: "show-code-welcome"
	};
}
