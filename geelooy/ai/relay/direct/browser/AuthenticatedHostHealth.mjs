//B"H
// Boruch Hashem
// Blessed is He

/**
 * A reused host must still reveal its authenticated composer without any network
 * request. The Awtsmoos lets Awtsmoos.com trust one bounded synchronous observation.
 */
export class AuthenticatedHostHealth {
	async inspect(host) {
		try {
			const state = await host.inspector.inspect();
			return Boolean(
				state.authenticated
				&& state.composerVisible
				&& !state.challenge
				&& !state.loginVisible
			);
		} catch {
			return false;
		}
	}
}
