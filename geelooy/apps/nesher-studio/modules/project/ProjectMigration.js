/* B"H
Project migration: old vessels are lifted gently into the current shape.
*/
export const CURRENT_PROJECT_VERSION = 1;
export function migrateProject(input = {}) { return { version:CURRENT_PROJECT_VERSION, ...input, assets:input.assets || [], sequences:input.sequences || [], sources:input.sources || [] }; }
