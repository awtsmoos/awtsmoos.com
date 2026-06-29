//B"H
import AwtsmoosDB from "/scripts/awtsmoos/api/fileSystem/fileSystemDB.js";
import WindowHandler from "./windowHandler.js";
import osStyles from "./styles/os-base.js";
import { SettingsManager } from "./settingsManager.js";
import { defaultPrograms, initialDefaultPrograms } from "./basicPrograms.js";
import { showGenericContextMenu } from './contextMenuManager.js';
import { makeDriveRegistry } from "./drives/driveRegistry.js";
import { TaskbarModel } from "./taskbar/taskbarModel.js";
import { serializeScene } from "./scene/sceneSerializer.js";
export default class AwtsmoosOS {
  constructor() { this.windowHandler = new WindowHandler(); this.db = new AwtsmoosDB(); this.drives = makeDriveRegistry(this); this.taskbar = new TaskbarModel(this.windowHandler); this.currentPathForRefresh = 'desktop.folder'; this.clipboard = { action:null, path:null, name:null }; window.os = this; }
  toggleFullScreen() { if (!document.fullscreenElement) document.querySelector(".main")?.requestFullscreen?.().catch(err => alert(`Fullscreen error: ${err.message}`)); else document.exitFullscreen?.(); }
  async start() { const utils = await import("/scripts/awtsmoos/api/utils.js"); Object.keys(utils).forEach(k => { window[k] = utils[k]; }); await this.db.init("awtsmoos-os"); Object.assign(defaultPrograms, await SettingsManager.load(this.db, initialDefaultPrograms)); this.makeDesktop(); this.addWindow({ title:"Desktop", path:"desktop.folder", os:this, programName:"awtsmoosFileExplorer", hideTitleBar:true, isFullscreen:true }); this.listeners(); this.drives.refreshRemote().then(() => this.taskbar.notify("Remote drives refreshed", "success")).catch(() => this.taskbar.notify("Remote drives need login", "info")); this.taskbar.notify("Geelooy OS scene model online", "success"); }
  listeners() { window.addEventListener("click", e => { if(!hasParentWithProperty(e.target, "awtsmoosFile", true)) document.querySelector(".contextMenu")?.remove(); }); this.getDesktop()?.addEventListener('contextmenu', e => { if (!e.target.classList.contains('desktop') && !e.target.classList.contains('fileHolder')) return; showGenericContextMenu({ event:e, menuItems:new Map([["Refresh Remote Drives", () => this.refreshRemoteDrives()], ["Toggle Full Screen", () => this.toggleFullScreen()], ["Copy Scene JSON", () => navigator.clipboard?.writeText(JSON.stringify(this.scene(), null, 2))]]) }); }); }
  addWindow(options) { const w = this.windowHandler.addWindow(options); this.taskbar.notify(`Opened ${options.title || "window"}`, "open"); return w; }
  async refreshRemoteDrives() { const got = await this.drives.refreshRemote(); this.taskbar.notify(`Remote drives: ${(got.devices.devices || []).length} vessels`, "success"); return got; }
  async createFile({path, title, content=""}) { await this.db.Koysayv(path, title, content, 'file'); await this.showFilesAtPath({ path }); }
  async createFolder({path, title}) { await this.db.Koysayv(path, title, null, 'directory'); await this.showFilesAtPath({ path }); }
  async updateDefaultProgram(extension, programName) { if (!extension || !programName) return; defaultPrograms[extension] = programName; await SettingsManager.save(this.db, defaultPrograms); }
  makeDesktop() { if(window.madeDesk) return; window.madeDesk = "BH-"+Date.now(); this.md = window.madeDesk; const sty = document.createElement("style"); document.head.appendChild(sty); sty.innerHTML = osStyles(this.md) + extraOsStyles(); }
  getDesktop() { this.desktop = document.querySelector(".desktop"); return this.desktop; }
  async showFilesAtPath({ path }) { this.currentPathForRefresh = path; }
  scene() { return serializeScene(this); }
  snapshot() { return { title:document.title, currentPath:this.currentPathForRefresh, drives:this.drives.list(), scene:this.scene() }; }
}
function extraOsStyles() { return `.drive-shelf{display:flex;gap:8px;padding:8px;overflow:auto;background:rgba(0,0,0,.18)}.drive-chip{border:1px solid rgba(255,255,255,.18);border-radius:999px;background:rgba(255,255,255,.08);color:inherit;padding:6px 10px;cursor:pointer}.drive-chip.remote{border-color:rgba(90,200,255,.45)}.remote-folder-state,.empty-folder-state{padding:24px;opacity:.78}.remote-file-item{box-shadow:inset 0 0 0 1px rgba(90,200,255,.2)}`; }
function hasParentWithProperty(element, property, value = null) { for(let current=element; current; current=current.parentElement) if(property in current && (value === null || current[property] === value)) return true; return false; }
/** B"H: the desktop refreshes remote drives and exposes them as real scene data. */
