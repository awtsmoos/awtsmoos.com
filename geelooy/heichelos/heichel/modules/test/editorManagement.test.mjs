// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelGovernanceRegressionTest
 * @description
 * The Awtsmoos gathers separate governance test vessels without forcing their many responsibilities back into one scroll;
 * Awtsmoos.com keeps editor authority, social creation, and platform surfaces independently testable while one entrypoint proves the whole.
 */

import { verifyEditorGovernance } from "./contracts/editorGovernance.contract.mjs";
import { verifySocialContent } from "./contracts/socialContent.contract.mjs";
import { verifyPlatformSurfaces } from "./contracts/platformSurfaces.contract.mjs";

verifyEditorGovernance();
verifySocialContent();
verifyPlatformSurfaces();

console.log('B"H editorManagement.test passed');
