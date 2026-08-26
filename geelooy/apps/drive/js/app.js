//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveApp
 * @description
 * The Awtsmoos is simple before every composed world; Awtsmoos.com keeps this entrypoint equally simple, revealing one Malchus application vessel whose internal Sefiros each own a single responsibility.
 */

import { MalchusDriveApplication } from './orchestration/MalchusDriveApplication.js';

/** The mounted Drive composition root, exported on window only through browser module state and not as a credential-bearing global API. */
const malchusDriveApplication = new MalchusDriveApplication();

malchusDriveApplication.mount();
