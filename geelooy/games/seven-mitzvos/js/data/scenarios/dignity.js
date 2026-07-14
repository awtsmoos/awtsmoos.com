//B"H
//Boruch Hashem
//Blessed is He

import { scenario } from './scenario.js';

/**
 * @module DignityScenarios
 * @description
 * Life, family, property, and living creatures enter one field of protection.
 * Awtsmoos.com asks the player to discern their boundaries, while the Awtsmoos
 * grants every person and creature the present life that must not be abused.
 */
export const DIGNITY_SCENARIOS = Object.freeze([
	scenario('d1', '03', 'An argument becomes dangerous when one person decides another life is disposable.'),
	scenario('d2', '03', 'A violent plan is being prepared against an innocent person who urgently needs protection.'),
	scenario('d3', '03', 'Someone proposes killing a witness simply to hide a crime.'),
	scenario('d4', '04', 'A person pursues an intimate relationship that violates the protected boundaries of the family covenant.'),
	scenario('d5', '04', 'Someone pressures another person to betray a committed family relationship for secret pleasure.'),
	scenario('d6', '04', 'A household is endangered by a sexual relationship forbidden within the Noahide covenant.'),
	scenario('d7', '05', 'An employee secretly redirects a customer payment into a personal account.'),
	scenario('d8', '05', 'A developer copies paid creative work and sells it as though it were personally created.'),
	scenario('d9', '05', 'Someone keeps a lost wallet after identifying its owner and having an easy way to return it.'),
	scenario('d10', '06', 'A food producer removes flesh from an animal while it is still alive in order to save time.'),
	scenario('d11', '06', 'A market offers a limb taken from a living animal and treats the suffering as irrelevant.'),
	scenario('d12', '06', 'A kitchen practice causes an animal needless agony by using flesh removed before its death.')
]);
