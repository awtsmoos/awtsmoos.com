// B"H
/** @module SubmitPostMedia
 * One audio and/or one video attachment for the whole post. Files upload
 * immediately to the alias vault through the post-media gate (stored on this
 * server); the returned manifests ride the post payload as `media` + `assets`
 * when the post is published.
 */
import { resolveAlias } from "./target.js";

const LIMITS = { audio: 25 * 1024 * 1024, video: 100 * 1024 * 1024 };
const state = { audio: null, video: null };

function nodes(kind) {
  const cap = kind === "audio" ? "Audio" : "Video";
  return {
    input: document.getElementById(`post${cap}Input`),
    status: document.getElementById(`post${cap}Status`),
    remove: document.getElementById(`post${cap}Remove`)
  };
}

function humanSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function setStatus(kind, text) {
  const { status, remove } = nodes(kind);
  if (status) status.textContent = text;
  if (remove) remove.hidden = !state[kind];
}

async function upload(kind, file) {
  if (file.size > LIMITS[kind]) {
    setStatus(kind, `That ${kind} file is ${humanSize(file.size)} — the limit is ${humanSize(LIMITS[kind])}.`);
    return;
  }
  const aliasId = await resolveAlias(document.getElementById("aliasId"));
  if (!aliasId) {
    setStatus(kind, "Choose an alias before attaching files.");
    return;
  }
  setStatus(kind, `Uploading ${file.name}…`);
  try {
    const body = new FormData();
    body.append("file", file, file.name);
    body.append("attachKind", "post-media");
    body.append("postId", document.getElementById("postId")?.value || "draft");
    const res = await fetch(`/api/social/assets/${encodeURIComponent(aliasId)}/upload-post-media`, { method: "POST", body, credentials: "include" });
    const data = await res.json().catch(() => null);
    if (!res.ok || data?.error) throw new Error(data?.error?.message || data?.message || "Upload failed.");
    const manifest = (data.success || [])[0];
    if (!manifest?.publicPath) throw new Error("Upload returned no file reference.");
    state[kind] = manifest;
    setStatus(kind, `Attached: ${manifest.originalName || file.name} (${humanSize(manifest.size || file.size)})`);
  } catch (error) {
    state[kind] = null;
    setStatus(kind, error.message || "Upload failed.");
  }
}

function wire(kind) {
  const { input, remove } = nodes(kind);
  if (!input) return;
  input.addEventListener("change", () => {
    const file = input.files?.[0];
    if (file) upload(kind, file);
  });
  remove?.addEventListener("click", () => {
    state[kind] = null;
    input.value = "";
    setStatus(kind, `No ${kind} attached`);
  });
}

export function setupPostMedia() {
  wire("audio");
  wire("video");
}

/** The post's media for the submit payload: first-class refs + raw manifests. */
export function getPostMedia() {
  const media = {};
  const assets = [];
  for (const kind of ["audio", "video"]) {
    const manifest = state[kind];
    if (!manifest) continue;
    media[kind] = {
      id: manifest.id,
      publicPath: manifest.publicPath,
      mime: manifest.mime,
      type: kind,
      originalName: manifest.originalName,
      size: manifest.size
    };
    assets.push(manifest);
  }
  return { media: Object.keys(media).length ? media : null, assets };
}
