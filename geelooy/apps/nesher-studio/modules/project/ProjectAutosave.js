/* B"H
Autosave: the vessel remembers even when the browser wind shifts.
*/
import { serializeProject, parseProject } from './ProjectSerializer.js';
export function saveProjectToStorage(storage, key, project) { storage.setItem(key, serializeProject(project)); return key; }
export function loadProjectFromStorage(storage, key) { const value = storage.getItem(key); return value ? parseProject(value) : null; }
