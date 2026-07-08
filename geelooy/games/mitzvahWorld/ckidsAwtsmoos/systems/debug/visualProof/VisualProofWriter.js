// B"H
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { renderVisualProofSvg } from "./VisualProofSvg.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { visualProofEntry, visualProofManifest } from "./VisualProofManifest.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export async function writeVisualProofFrame(file, state = {}) {
  await mkdir(dirname(file), { recursive:true });
  await writeFile(file, renderVisualProofSvg(state), "utf8");
  return visualProofEntry({ ...state, image:file });
}

export async function writeVisualProofManifest(file, entries = [], extra = {}) {
  await mkdir(dirname(file), { recursive:true });
  const manifest = visualProofManifest(entries, extra);
  await writeFile(file, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return manifest;
}

export default { writeVisualProofFrame, writeVisualProofManifest };
