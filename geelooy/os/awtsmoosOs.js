// B"H
import AwtsmoosDB from '/scripts/awtsmoos/api/fileSystem/fileSystemDB.js';
import WindowHandler from './windowHandler.js';
import osStyles from './styles/os-base.js';
import { SettingsManager } from './settingsManager.js';
import { defaultPrograms, initialDefaultPrograms } from './basicPrograms.js';
import { showGenericContextMenu } from './contextMenuManager.js';
import { makeDriveRegistry } from './drives/driveRegistry.js';
import { TaskbarModel } from './taskbar/taskbarModel.js';
import { serializeScene } from './scene/sceneSerializer.js';
import { makeObjectGraph } from './graph/registry.js';
import { syncOsGraph } from './graph/osGraphSync.js';
import { makeVfsRegistry } from './vfs/registry.js';
import { localVirtualAdapter } from './vfs/localVirtualAdapter.js';
import { tunnelAdapter } from './vfs/tunnelAdapter.js';
import { previewAdapter } from './vfs/previewAdapter.js';
import { emitVfsMutation } from './vfs/mutationEvents.js';
import { ProcessManager } from './process/processManager.js';
import { bindWindowToProcess } from './process/windowBinding.js';
import { InputQueue } from './input/queue.js';
import { routeInput } from './input/router.js';
import { displayRecord } from './display/display.js';
import { DamageTracker } from './display/damage.js';
import { sceneDisplay } from './display/sceneDisplay.js';
import { aiUserSession } from './session/aiUser.js';
import { computeOsStatus, createOsStatus, renderStatusPill, statusStyles } from './status/osStatus.js';
import { renderDesktopSurface } from './desktopSurface.js';

export default class AwtsmoosOS {
  constructor() { this.windowHandler = new WindowHandler(); this.db = new AwtsmoosDB(); this.drives = makeDriveRegistry(this); this.taskbar = new TaskbarModel(this.windowHandler); this.graph = makeObjectGraph(); this.vfs = makeVfsRegistry({ onMutation:e => this.recordVfsMutation(e) }); this.processes = new ProcessManager(this.graph); this.inputQueue = new InputQueue(); this.display = displayRecord(); this.damage = new DamageTracker(); this.aiSession = aiUserSession(); this.status = createOsStatus(); this.pendingOperations = []; this.recentMutations = []; this.currentPathForRefresh = 'desktop.folder'; this.clipboard = { action:null, path:null, name:null }; this.started = false; window.os = this; }
  toggleFullScreen() { if (!document.fullscreenElement) document.querySelector('.main')?.requestFullscreen?.().catch(err => this.taskbar.notify(`Fullscreen error: ${err.message}`, 'error')); else document.exitFullscreen?.(); }
  async start() { await this.loadUtilities(); await this.db.init('awtsmoos-os'); this.registerAdapters(); Object.assign(defaultPrograms, await SettingsManager.load(this.db, initialDefaultPrograms)); this.makeDesktop(); this.renderDesktop(); this.updateStatus(); if (!this.started) { this.started = true; this.listeners(); this.maybeOpenRequestedExplorer(); } this.refreshRemoteDrives().then(() => this.renderDesktop()).catch(() => this.updateStatus('needs-login')); this.taskbar.notify('Geelooy OS desktop online', 'success'); this.syncGraph(); }
  async loadUtilities() { const utils = await import('/scripts/awtsmoos/api/utils.js'); Object.keys(utils).forEach(k => { window[k] = utils[k]; }); }
  registerAdapters() { this.vfs.register(localVirtualAdapter(this)); this.vfs.register(tunnelAdapter(this)); this.vfs.register(previewAdapter(this)); }
  listeners() { window.addEventListener('click', e => { this.input('click', { x:e.clientX, y:e.clientY }); if (!hasParentWithProperty(e.target, 'awtsmoosFile', true)) document.querySelector('.contextMenu')?.remove(); }); this.getDesktop()?.addEventListener('contextmenu', e => this.desktopContext(e)); }
  desktopContext(e) { if (!e.target.classList.contains('desktop') && !e.target.closest?.('.awtsmoos-desktop-surface')) return; showGenericContextMenu({ event:e, os:this, menuItems:new Map([['Open Desktop Files', () => this.addWindow({ title:'Desktop Files', path:'desktop.folder', os:this, programName:'awtsmoosFileExplorer' })], ['Open Connected Tunnels', () => this.addWindow({ title:'Connected Tunnels', path:'awtsmoos://tunnels', os:this, programName:'awtsmoosFileExplorer' })], ['Developer Diagnostics', () => this.addWindow({ title:'Developer Diagnostics', os:this, programName:'awtsmoosDiagnostics' })], ['Refresh Remote Drives', () => this.refreshRemoteDrives().then(() => this.renderDesktop())], ['Toggle Full Screen', () => this.toggleFullScreen()], ['Copy Object Graph', () => navigator.clipboard?.writeText(JSON.stringify(this.graphSnapshot(), null, 2))]]) }); }
  addWindow(options) { const p = this.processes.spawn({ app:options.programName || 'window', title:options.title || 'Window', cwd:options.path || '/' }); const w = this.windowHandler.addWindow({ ...options, processId:p.pid }); const id = w.id || w.ID || options.title; w.processId = p.pid; w.sourcePath = options.path; bindWindowToProcess(p, w); this.recordGraphEvent('file.open', { title:options.title, path:options.path, programName:options.programName, windowId:id, processId:p.pid }); const oldClose = w.close?.bind(w); if (oldClose) w.close = () => { this.recordGraphEvent('file.close', { title:w.title, path:w.sourcePath, windowId:id, processId:p.pid }); oldClose(); this.syncGraph(); }; this.taskbar.notify(`Opened ${options.title || 'window'}`, 'open'); this.syncGraph(); return w; }
  input(type, data = {}) { const e = this.inputQueue.push(type, data); this.damage.mark({ x:data.x || 0, y:data.y || 0, width:1, height:1 }); return routeInput(this, e); }
  async refreshRemoteDrives() { const got = await this.drives.refreshRemote(); this.lastSyncAt = Date.now(); this.recordGraphEvent('remote.refresh', { devices:(got.devices?.devices || []).length, previews:(got.previews?.previews || []).length }); this.updateStatus((got.devices?.ok === false) ? 'needs-login' : 'ready'); this.taskbar.notify(`Remote drives: ${(got.devices.devices || []).length} vessels`, 'success'); return got; }
  async createFile({ path, title, content = '' }) { await this.vfs.write(joinVfsPath(path, title), content, { userId:'current' }); await this.showFilesAtPath({ path }); }
  async createFolder({ path, title }) { await this.vfs.mkdir(joinVfsPath(path, title), { userId:'current' }); await this.showFilesAtPath({ path }); }
  async updateDefaultProgram(extension, programName) { if (!extension || !programName) return; defaultPrograms[extension] = programName; await SettingsManager.save(this.db, defaultPrograms); }
  makeDesktop() { window.madeDesk ||= `BH-${Date.now()}`; this.md = window.madeDesk; const desktop = this.getDesktop(); desktop?.classList.add(this.md); if (!document.getElementById('awtsmoos-os-runtime-styles')) { const style = document.createElement('style'); style.id = 'awtsmoos-os-runtime-styles'; document.head.appendChild(style); style.textContent = osStyles(this.md) + extraOsStyles() + statusStyles(); } }
  renderDesktop() { return renderDesktopSurface(this); }
  maybeOpenRequestedExplorer() { const params = new URLSearchParams(location.search); const path = params.get('openExplorer'); if (path) this.addWindow({ title:'File Explorer', path, os:this, programName:'awtsmoosFileExplorer' }); }
  updateStatus(remote) { this.status = computeOsStatus({ remote:remote || this.status?.remote }); renderStatusPill(this.status, this); this.syncGraph(); return this.status; }
  getDesktop() { this.desktop = document.getElementById('desktop') || document.querySelector('.desktop'); return this.desktop; }
  async showFilesAtPath({ path }) { this.currentPathForRefresh = path; this.damage.mark({ x:0, y:0, width:innerWidth, height:innerHeight }); this.recordGraphEvent('explorer.refresh', { path }); if (path === 'desktop.folder') this.renderDesktop(); }
  recordVfsMutation(event) { this.recentMutations.push(event); this.recentMutations = this.recentMutations.slice(-40); emitVfsMutation(this.graph, event); this.taskbar.notify(`VFS ${event.action}: ${event.path}`, 'info'); this.syncGraph(); }
  recordGraphEvent(type, data = {}) { const event = this.graph?.emit?.(type, data); this.syncGraph(); return event; }
  syncGraph() { return syncOsGraph(this); }
  graphSnapshot() { return this.syncGraph(); }
  scene() { return serializeScene(this); }
  displaySnapshot() { return sceneDisplay(this); }
  snapshot() { return { title:document.title, currentPath:this.currentPathForRefresh, status:this.status, drives:this.drives.list(), scene:this.scene(), graph:this.graphSnapshot(), graphEvents:this.graph.history({ limit:50 }), recentMutations:this.recentMutations, processes:this.processes.list(), pendingOperations:this.pendingOperations, taskbar:this.taskbar.snapshot(), input:this.inputQueue.list(), display:this.displaySnapshot(), aiSession:this.aiSession }; }
}
function joinVfsPath(path = '/', title = '') { const base = String(path || '/'); const tail = String(title || '').split('/').filter(Boolean).join('/'); if (base.startsWith('awtsmoos://')) return `${base.replace(/\/+$/, '')}/${tail}`; return `/${[base, tail].join('/').split('/').filter(Boolean).join('/')}`; }
function extraOsStyles() { return `.awtsmoos-toast-container{position:fixed;right:18px;bottom:18px;z-index:999999;display:grid;gap:8px}.awtsmoos-toast{display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:start;max-width:360px;padding:10px 12px;border-radius:12px;background:rgba(5,12,24,.9);border:1px solid rgba(125,211,252,.22);color:#dff6ff;box-shadow:0 12px 40px rgba(0,0,0,.32)}.awtsmoos-toast.success{border-color:rgba(34,197,94,.45)}.awtsmoos-toast.error{border-color:rgba(239,68,68,.55)}.awtsmoos-toast progress{grid-column:1/-1;width:100%}.awtsmoos-toast details{grid-column:1/-1}.awtsmoos-toast pre{white-space:pre-wrap;max-height:120px;overflow:auto}`; }
function hasParentWithProperty(element, property, value = null) { for (let current = element; current; current = current.parentElement) if (property in current && (value === null || current[property] === value)) return true; return false; }

/** B"H: OS boot reveals desktop icons first; explorer windows open as gates, not the shell itself. */
