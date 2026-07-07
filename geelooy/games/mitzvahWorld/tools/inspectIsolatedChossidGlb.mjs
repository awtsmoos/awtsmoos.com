// B"H
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { findBrowser } from "../tests/chrome/ChromePath.js";
import { launchChrome } from "../tests/chrome/ChromeLauncher.js";
import { connectCdp } from "../tests/chrome/ChromeDevTools.js";
const outDir = "ai_thoughts/20260707-004045-full-repair-no-freeze-loading-ui-targeting-doors/proof/isolated-glb";
const frames = `${outDir}/frames`;
mkdirSync(frames, { recursive:true });
rmSync(frames, { recursive:true, force:true });
mkdirSync(frames, { recursive:true });
const url = "http://127.0.0.1:8080/games/mitzvahWorld/tools/isolatedChossidGlbInspector.html?bust=" + Date.now();
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function ev(c, expression, timeoutMs = 20000) {
  const r = await c.send("Runtime.evaluate", { expression, awaitPromise:true, returnByValue:true }, timeoutMs);
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text || "eval failed");
  return r.result?.value;
}
const chrome = await launchChrome(findBrowser().path, "about:blank", 9784, { width:1280, height:720 });
try {
  const client = await connectCdp(chrome.page.webSocketDebuggerUrl);
  await client.send("Runtime.enable");
  await client.send("Page.enable");
  await ev(client, `location.assign(${JSON.stringify(url)}); true`, 30000);
  await sleep(2500);
  let report = null;
  for (let i = 0; i < 180; i++) {
    report = await ev(client, "window.__CHOSSID_GLB_INSPECTION__||null").catch(() => null);
    if (await ev(client, "window.__CHOSSID_GLB_DONE__===true").catch(() => false)) break;
    await sleep(500);
  }
  if (!report) throw new Error("no isolated glb report at " + await ev(client, "location.href"));
  for (let i = 0; i < 90; i++) {
    const png = await client.send("Page.captureScreenshot", { format:"png", captureBeyondViewport:false }, 15000);
    writeFileSync(`${frames}/frame_${String(i).padStart(4, "0")}.png`, Buffer.from(png.data, "base64"));
    await sleep(1000 / 15);
  }
  writeFileSync(`${outDir}/isolated-chossid-glb-report.json`, JSON.stringify(report, null, 2));
  const ff = spawnSync("ffmpeg", ["-y", "-framerate", "15", "-i", `${frames}/frame_%04d.png`, "-vf", "scale=1280:720,format=yuv420p", "-c:v", "libx264", "-pix_fmt", "yuv420p", `${outDir}/isolated-chossid-glb-actions.mp4`], { encoding:"utf8" });
  if (ff.status !== 0) throw new Error(ff.stderr);
  const passed = report.ok && report.tests?.some?.(t => String(t.clip).includes("generated") && t.pass);
  if (!passed) throw new Error("motion proof failed " + JSON.stringify(report.tests));
  console.log(JSON.stringify({ ok:true, url, video:`${outDir}/isolated-chossid-glb-actions.mp4`, passed:report.tests.filter(t => t.pass).map(t => ({ clip:t.clip, motion:t.motion })), failed:report.tests.filter(t => !t.pass).map(t => t.clip) }, null, 2));
  client.close?.();
} finally {
  await chrome.close();
}
