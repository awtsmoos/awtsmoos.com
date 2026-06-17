///B"H

import { loadFiles, importFiles } from "/os/helpers/scripts.js";
import System from "/os/system.js";

const TREASURY_LINKS = Object.freeze({
  "Treasury OS": "/api/tunnel/control/treasury/home",
  "Treasury Budgets": "/api/tunnel/control/treasury/budgets",
  "Treasury Forecast": "/api/tunnel/control/treasury/forecast",
  "Treasury Marketplace": "/api/tunnel/control/treasury/marketplace",
  "Treasury Agents": "/api/tunnel/control/treasury/agents",
  "Treasury Providers": "/api/tunnel/control/treasury/providers",
  "Treasury Graph": "/api/tunnel/control/treasury/graph",
  "Treasury Advisor": "/api/tunnel/control/treasury/advisor",
  "Treasury Reputation": "/api/tunnel/control/treasury/reputation",
  "Bank": "/api/tunnel/control/bank",
  "Compute": "/api/tunnel/control/compute",
  "Tunnel Control": "/apps/tunnel-control/",
  "Apps Code": "/apps/code/"
});

function openPortal(path) {
  window.open(path, "_blank", "noopener,noreferrer");
}

function portalAction(label, path) {
  return async ({ os }) => {
    openPortal(path);
    new System({ os }).makeToast(`Opened ${label}`, "success");
  };
}

const menu = {
  "Treasury OS": portalAction("Treasury OS", TREASURY_LINKS["Treasury OS"]),
  "Treasury Budgets": portalAction("Treasury Budgets", TREASURY_LINKS["Treasury Budgets"]),
  "Treasury Marketplace": portalAction("Treasury Marketplace", TREASURY_LINKS["Treasury Marketplace"]),
  "Treasury Graph": portalAction("Treasury Graph", TREASURY_LINKS["Treasury Graph"]),
  "Apps Code": portalAction("Apps Code", TREASURY_LINKS["Apps Code"]),
  "Tunnel Control": portalAction("Tunnel Control", TREASURY_LINKS["Tunnel Control"]),

  "New File": async ({ os }) => {
    const sys = new System({ os });
    const newFile = await sys.prompt("Enter file name:");
    if (!newFile) return;
    await os.createFile({ path: "desktop.folder", title: newFile, content: `//B"H\n// Content of ${newFile}` });
    sys.makeToast(`Created file "${newFile}"`, "success");
  },

  "New Folder": async ({ os }) => {
    const sys = new System({ os });
    const newFolder = await sys.prompt("Enter folder name:");
    if (!newFolder) return;
    await os.createFolder({ path: "desktop.folder", title: newFolder });
    sys.makeToast(`Created folder "${newFolder}"`, "success");
  },

  "Import Files": async ({ os }) => importFiles({ os, path: "desktop.folder" }),

  "Export All": async ({ os }) => {
    const storeNames = await os.db.getAllStoreNames();
    const exportedContents = {};
    for (const store of storeNames) exportedContents[store] = await os.db.getAllData(store);
    const blob = new Blob([JSON.stringify(exportedContents, null, "\t")], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `BH_AwtsmoosOS_Export_${Date.now()}.awtsmoosExport.json`;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(a.href);
    document.body.removeChild(a);
    new System({ os }).makeToast("All files exported successfully!", "success");
  },

  "Import Exported Files": async ({ os }) => {
    await loadFiles(async file => {
      const content = file.type.startsWith("application/") || file.type.startsWith("text/") ? await file.text() : await file.arrayBuffer();
      let bundle = null;
      try {
        if (file.name.startsWith("BH_Scripts_Of_Awtsmoos")) {
          const url = URL.createObjectURL(new Blob([content], { type: "application/javascript" }));
          bundle = (await import(url))?.default;
        } else if (typeof content === "string" && file.name.endsWith(".awtsmoosExport.json")) {
          bundle = JSON.parse(content);
        }
      } catch (_e) {}
      if (!bundle) return os.createFile({ path: "desktop.folder", title: file.name, content });
      Object.keys(bundle).forEach(path => bundle[path].forEach(obj => Object.keys(obj).forEach(key => os.createFile({ path, title: key, content: obj[key] }))));
    });
  },

  "File Explorer": async ({ os }) => {
    await os.addWindow({ title: "Home", content: "", path: "/", programName: "awtsmoosFileExplorer", os });
  }
};

export default menu;
export { TREASURY_LINKS };
