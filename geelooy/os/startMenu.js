///B"H
import { loadFiles, importFiles } from "/os/helpers/scripts.js";
import System from "/os/system.js";
const TREASURY_LINKS = Object.freeze({
  "Treasury OS":"/api/tunnel/control/treasury/home", "Treasury Budgets":"/api/tunnel/control/treasury/budgets",
  "Treasury Marketplace":"/api/tunnel/control/treasury/marketplace", "Treasury Graph":"/api/tunnel/control/treasury/graph",
  "Apps Code":"/apps/code/", "Tunnel Control":"/apps/tunnel-control/"
});
function openPortal(path) { window.open(path, "_blank", "noopener,noreferrer"); }
function toast(os, text, kind = "success") { new System({ os }).makeToast(text, kind); os?.taskbar?.notify?.(text, kind); }
function portalAction(label, path) { return async ({ os }) => { openPortal(path); toast(os, `Opened ${label}`); }; }
async function openExplorer(os, title, path) { await os.addWindow({ title, content:"", path, programName:"awtsmoosFileExplorer", os }); }
const menu = {
  "File Explorer": async ({ os }) => openExplorer(os, "Home", "/"),
  "Remote Drives": async ({ os }) => openExplorer(os, "Connected Tunnels", "awtsmoos://tunnels"),
  "Preview Artifacts": async ({ os }) => openExplorer(os, "Preview Artifacts", "awtsmoos://previews"),
  "Mission Receipts": async ({ os }) => openExplorer(os, "Receipts", "awtsmoos://receipts"),
  "Mission Cockpit": portalAction("Mission Cockpit", TREASURY_LINKS["Tunnel Control"]),
  "Fake Desktop Plan": portalAction("Fake Desktop Plan", "/apps/tunnel-control/?action=remoteNativeDesktopPlan"),
  "Tunnel Control": portalAction("Tunnel Control", TREASURY_LINKS["Tunnel Control"]),
  "Apps Code": portalAction("Apps Code", TREASURY_LINKS["Apps Code"]),
  "Treasury OS": portalAction("Treasury OS", TREASURY_LINKS["Treasury OS"]),
  "Treasury Budgets": portalAction("Treasury Budgets", TREASURY_LINKS["Treasury Budgets"]),
  "Treasury Marketplace": portalAction("Treasury Marketplace", TREASURY_LINKS["Treasury Marketplace"]),
  "Treasury Graph": portalAction("Treasury Graph", TREASURY_LINKS["Treasury Graph"]),
  "Copy Scene JSON": async ({ os }) => { await navigator.clipboard?.writeText(JSON.stringify(os.scene?.() || {}, null, 2)); toast(os, "Copied scene JSON", "success"); },
  "Enable Virtual OS Tunnel": async ({ os }) => { await window.VirtualOSTunnelAgent?.start?.(); toast(os, "Virtual OS tunnel enabled", "success"); },
  "New File": async ({ os }) => { const sys = new System({ os }); const title = await sys.prompt("Enter file name:"); if (!title) return; await os.createFile({ path:"desktop.folder", title, content:`//B"H\n// Content of ${title}` }); toast(os, `Created file "${title}"`); },
  "New Folder": async ({ os }) => { const sys = new System({ os }); const title = await sys.prompt("Enter folder name:"); if (!title) return; await os.createFolder({ path:"desktop.folder", title }); toast(os, `Created folder "${title}"`); },
  "Import Files": async ({ os }) => importFiles({ os, path:"desktop.folder" }),
  "Export All": async ({ os }) => {
    const exported = {}; for (const store of await os.db.getAllStoreNames()) exported[store] = await os.db.getAllData(store);
    const blob = new Blob([JSON.stringify(exported, null, "\t")], { type:"application/json" }); const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = `BH_AwtsmoosOS_Export_${Date.now()}.awtsmoosExport.json`; a.style.display = "none"; document.body.appendChild(a); a.click(); URL.revokeObjectURL(a.href); a.remove(); toast(os, "All files exported successfully!");
  },
  "Import Exported Files": async ({ os }) => loadFiles(async file => {
    const content = file.type.startsWith("application/") || file.type.startsWith("text/") ? await file.text() : await file.arrayBuffer();
    try { const bundle = typeof content === "string" && file.name.endsWith(".awtsmoosExport.json") ? JSON.parse(content) : null; if (bundle) return Object.keys(bundle).forEach(path => bundle[path].forEach(obj => Object.keys(obj).forEach(key => os.createFile({ path, title:key, content:obj[key] })))); } catch (_) {}
    return os.createFile({ path:"desktop.folder", title:file.name, content });
  })
};
export default menu;
export { TREASURY_LINKS };
/**
 * B"H
 * The start menu now remembers that Geelooy is not only a folder: it is a
 * remote-drive cockpit, preview ledger, scene source, and fake desktop seed.
 */
