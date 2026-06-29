/* B"H
Project serializer: the studio becomes portable breath without live browser objects.
*/
import { migrateProject } from './ProjectMigration.js';
import { validateProject } from './ProjectValidation.js';
export function serializeProject(project = {}) { return JSON.stringify(migrateProject(project)); }
export function parseProject(json = '{}') { const project = migrateProject(JSON.parse(json)); const check = validateProject(project); if (!check.valid) throw new Error(check.errors.join('; ')); return project; }
