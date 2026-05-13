
import { WeaponNone } from './WeaponNone.js';
import { WeaponShema } from './WeaponShema.js';
import { WeaponAmidah } from './WeaponAmidah.js';
import { WeaponTehillim } from './WeaponTehillim.js';
import { WeaponTefillin } from './WeaponTefillin.js';
import { WeaponLulav } from './WeaponLulav.js';

/**
 * B"H
 * @module WeaponIndex
 * @description
 * The Seder Histalshelus of the Weapons (Kelim). All modular armaments of the soul are aggregated here.
 */
export const WeaponIndex = {
    [WeaponNone.id]: WeaponNone,
    [WeaponShema.id]: WeaponShema,
    [WeaponAmidah.id]: WeaponAmidah,
    [WeaponTehillim.id]: WeaponTehillim,
    [WeaponTefillin.id]: WeaponTefillin,
    [WeaponLulav.id]: WeaponLulav
};
