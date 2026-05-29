// B"H
/**
 * @file live-platform-probe.cjs
 * @description Chapter 72: the browser is summoned as a witness. The Awtsmoos
 * does not accept guesses about scale; it interrogates the live scene graph and
 * returns every blue platform vessel with geometry, scale, owner, and position.
 */
(async () => {
  const pages = await fetch("http://127.0.0.1:9222/json").then(r => r.json());
  const page = pages.find(p => String(p.url || "").includes("/games/mitzvahWorld/"));
  if (!page) throw new Error("game page not found");
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 1;
  const pending = new Map();
  ws.onmessage = event => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  };
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; setTimeout(() => reject(new Error("ws open timeout")), 5000); });
  const send = (method, params = {}) => new Promise(resolve => { const mid = id++; pending.set(mid, resolve); ws.send(JSON.stringify({ id: mid, method, params })); });
  const expression = `(() => {
    const roots = Object.values(globalThis).filter(v => v && typeof v === 'object');
    const olam = globalThis.olam || globalThis.mana?.olam || roots.find(v => Array.isArray(v.nivrayim) && v.scene?.traverse) || null;
    const fromNivrayim = (olam?.nivrayim || []).map(n => ({
      name: n?.name, type: n?.type, width: n?.width, height: n?.height, depth: n?.depth, size: n?.size,
      meshName: n?.mesh?.name, meshPos: n?.mesh?.position && { x:n.mesh.position.x, y:n.mesh.position.y, z:n.mesh.position.z },
      meshScale: n?.mesh?.scale && { x:n.mesh.scale.x, y:n.mesh.scale.y, z:n.mesh.scale.z },
      geometryParams: n?.mesh?.geometry?.parameters || null,
      bbox: (() => { try { n?.mesh?.geometry?.computeBoundingBox?.(); const b=n?.mesh?.geometry?.boundingBox; return b && { min:{x:b.min.x,y:b.min.y,z:b.min.z}, max:{x:b.max.x,y:b.max.y,z:b.max.z}, size:{x:b.max.x-b.min.x,y:b.max.y-b.min.y,z:b.max.z-b.min.z} }; } catch(e) { return { error:String(e?.message||e) }; } })()
    })).filter(n => /platform|moving|blink|slip|betray/i.test(String(n.name||'') + String(n.type||'') + String(n.meshName||'')));
    const sceneMeshes = [];
    olam?.scene?.traverse?.(node => {
      const s = String(node.name || '') + ' ' + String(node.nivraAwtsmoos?.name || '') + ' ' + String(node.nivraAwtsmoos?.type || '');
      if (!/platform|moving|blink|slip|betray|lava_lab/i.test(s)) return;
      node.geometry?.computeBoundingBox?.();
      const b = node.geometry?.boundingBox;
      sceneMeshes.push({ name: node.name, owner: node.nivraAwtsmoos?.name || null, ownerType: node.nivraAwtsmoos?.type || null, position:{x:node.position.x,y:node.position.y,z:node.position.z}, scale:{x:node.scale.x,y:node.scale.y,z:node.scale.z}, geometryParams:node.geometry?.parameters||null, bbox:b && {size:{x:b.max.x-b.min.x,y:b.max.y-b.min.y,z:b.max.z-b.min.z}} });
    });
    return { href: location.href, hasOlam: !!olam, sourcePath: olam?.sourcePath || null, nivrayimCount: olam?.nivrayim?.length || 0, fromNivrayim, sceneMeshes };
  })()`;
  const evalResult = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  console.log(JSON.stringify(evalResult.result?.result?.value || evalResult, null, 2));
  ws.close();
})().catch(error => { console.error(error.stack || error.message || String(error)); process.exit(1); });
