// B"H
export function syncOsGraph(os) {
  const graph = os.graph;
  if (!graph) return null;

  graph.upsert({
    id:"desktop:main", type:"desktop", title:"Geelooy Desktop",
    path:os.currentPathForRefresh || "/", children:["display:main", "session:ai", "clipboard:main"]
  });
  graph.upsert({ id:"display:main", type:"display", title:"Main Display", parentId:"desktop:main", data:os.display || {} });
  graph.upsert({ id:"clipboard:main", type:"clipboard", title:"Clipboard", parentId:"desktop:main", data:os.clipboard || {} });
  graph.upsert({ id:"session:ai", type:"session", title:"AI OS User", parentId:"desktop:main", data:os.aiSession || {} });

  for (const drive of os.drives?.list?.() || []) syncDrive(graph, drive);
  for (const win of os.windowHandler?.windows || []) syncWindow(graph, win);
  for (const proc of os.processes?.list?.() || []) syncProcess(graph, proc);
  return graph.snapshot();
}

function syncDrive(graph, drive) {
  graph.upsert({ id:`drive:${drive.id}`, type:"drive", title:drive.title, url:drive.root, parentId:"desktop:main", refs:["session:ai"], data:drive });
}

function syncWindow(graph, win) {
  const id = win.id || win.ID || `window:${win.title}`;
  graph.upsert({ id, type:"window", title:win.title || "Window", parentId:"desktop:main", refs:[win.processId].filter(Boolean), data:{ programId:win.programId, minimized:win.win?.style?.display === "none" } });
}

function syncProcess(graph, proc) {
  graph.upsert({ id:proc.pid, type:"process", title:proc.title, parentId:"session:ai", refs:proc.windows || [], data:proc });
}

/**
 * B"H
 * Sync is the court scribe. It sees desktop, drive, display, session, window,
 * process, and clipboard, then writes each as a graph object with parent and
 * reference lines, so the browser OS and tunnel mirror can speak one language.
 */
