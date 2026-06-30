// B"H
import { TOOLBAR_GROUPS } from './definitions.js';
export function groupNames() { return Object.keys(TOOLBAR_GROUPS); }
export function groupDefinitions(name) { return TOOLBAR_GROUPS[name] || []; }
/** B"H: group queries stay small and testable. */
