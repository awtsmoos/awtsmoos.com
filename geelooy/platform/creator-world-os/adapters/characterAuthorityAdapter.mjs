// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CharacterAuthorityAdapter
 * @description
 * Bridges trusted identity, leases, and durable characters without allowing
 * game-local progression to overwrite the shared character passport.
 */
import { createCharacterPassport } from '../characters/characterPassport.mjs';
import { createGameProjection, assertProjectionIsolation } from '../characters/gameProjection.mjs';

/** Creates an adapter around a CharacterAuthority-compatible instance. */
export function createCharacterAuthorityAdapter(authority) {
	if (!authority?.identity || !authority?.leases || !authority?.repository) {
		throw new TypeError('Character authority requires identity, leases, and repository.');
	}
	return Object.freeze({
		passport(input) {
			return createCharacterPassport(input);
		},
		projection(input) {
			const projection = createGameProjection(input);
			assertProjectionIsolation(projection);
			return projection;
		},
		releaseSession(session) {
			if (typeof authority.releaseSession !== 'function') {
				throw new TypeError('Character authority cannot release sessions.');
			}
			return authority.releaseSession(session);
		},
		inspect() {
			return Object.freeze({
				hasIdentity: Boolean(authority.identity),
				hasLeases: Boolean(authority.leases),
				hasRepository: Boolean(authority.repository)
			});
		}
	});
}
