/* B"H
Project validation: a save file must be honest before it becomes memory.
*/
export function validateProject(project = {}) {
  const errors = [];
  if (!project.version) errors.push('missing version');
  if (!Array.isArray(project.assets)) errors.push('assets must be an array');
  if (!Array.isArray(project.sequences)) errors.push('sequences must be an array');
  return { valid:errors.length === 0, errors };
}
