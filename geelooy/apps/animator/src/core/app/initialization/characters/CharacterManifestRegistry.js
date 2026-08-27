
// B"H
import { ScholarManifest } from './ScholarManifest.js';
import { OratorManifest } from './OratorManifest.js';
import { ChildManifest } from './ChildManifest.js';

/**
 * @file CharacterManifestRegistry.js
 * @description Binds the individual soul manifests into a single object.
 */
export const CharacterManifestRegistry = {
  scholar: ScholarManifest,
  orator: OratorManifest,
  child: ChildManifest
};
