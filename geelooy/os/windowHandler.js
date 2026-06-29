//B"H
import System from "./system.js";
import ResizableWindow from "./windows.js";
import { programs, defaultPrograms, getDefaultProgram } from "./basicPrograms.js";
export default class WindowHandler {
  constructor() { this.windows = []; this.taskArea = document.getElementById('task-area'); this.minimizedGroups = new Map(); }
  getExtension(title) { const i = String(title || '').lastIndexOf('.'); return i > -1 ? title.substring(i).toLowerCase() : '.js'; }
  addWindow(options) {
    const { title, content, path, os, programName = null, extension = null } = options;
    const ext = extension || this.getExtension(title || "");
    const program = programName && programs[programName] ? programs[programName].launch : getDefaultProgram(ext);
    let finalContent = content, programInstance = null;
    if (program) { const system = new System({ path, os }); programInstance = program({ os:system.os, path, title, fileName:title, content, system, extension:ext }); finalContent = programInstance?.div || content; }
    const wind = new ResizableWindow({ title, content:finalContent, handler:this, programId:programName || defaultPrograms[ext] || 'advancedCodeEditor', hideTitleBar:options.hideTitleBar, isFullscreen:options.isFullscreen });
    wind.id = wind.id || `win-${Date.now()}-${this.windows.length}`; wind.programInstance = programInstance; wind.onresize = e => programInstance?.onresize?.(e); programInstance?.init?.(); this.windows.push(wind); return wind;
  }
  onminimize(window) { const id = window.programId; if (!this.minimizedGroups.has(id)) this.createMinimizedGroup(id, window); else this.addToMinimizedGroup(id, window); }
  createMinimizedGroup(id, window) { const taskItem = document.createElement('div'); taskItem.className = 'task-item'; taskItem.textContent = window.title.replace('.folder', ''); const group = { element:taskItem, windows:[window] }; taskItem.onclick = e => this.handleTaskClick(e, id); this.minimizedGroups.set(id, group); this.taskArea?.appendChild(taskItem); }
  addToMinimizedGroup(id, window) { const group = this.minimizedGroups.get(id); if (!group.windows.includes(window)) group.windows.push(window); group.element.classList.add('stacked'); group.element.dataset.count = group.windows.length; }
  onrestore(window) { const group = this.minimizedGroups.get(window.programId); if (!group) return; group.windows = group.windows.filter(w => w !== window); if (!group.windows.length) { group.element.remove(); this.minimizedGroups.delete(window.programId); } else group.element.dataset.count = group.windows.length; }
  onactive(w) { this.windows.forEach(wn => { if (w !== wn) wn?.makeInactive?.(); }); }
  onclose(w) { this.onrestore(w); const i = this.windows.indexOf(w); if (i > -1) this.windows.splice(i, 1); }
  handleTaskClick(event, programId) { event.stopPropagation(); const group = this.minimizedGroups.get(programId); if (!group) return; document.querySelector('.task-group-popup')?.remove(); if (group.windows.length === 1) return group.windows[0].restore(); this.showTaskPopup(group); }
  showTaskPopup(group) { const popup = document.createElement('div'); popup.className = 'task-group-popup'; group.windows.forEach(win => { const item = document.createElement('div'); item.className = 'task-group-popup-item'; item.textContent = win.title; item.onclick = () => { win.restore(); popup.remove(); }; popup.appendChild(item); }); document.body.appendChild(popup); }
}
