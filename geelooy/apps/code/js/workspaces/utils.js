
// B"H
/**
 * @file utils.js
 * @brief Legacy bridge to the Universal Identity.
 */
import { UniversalIdentity } from '../core/identity/UniversalIdentity.js';

export const getItemUniquePath = (item) => UniversalIdentity.getUniquePath(item);

export const WorkspaceUtils = { getItemUniquePath };
