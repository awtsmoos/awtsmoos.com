//B"H
/** @module SubmitAttachments
 * Files now enter through the local alias-owned asset gate: images, audio, and
 * quiet documents all receive manifests before they shine inside the editor.
 */
import { resolveAlias } from "./target.js";
let activeEditor = null;

export function setupImageUploader() {
  const modal = document.getElementById("imageUploadModal");
  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("fileInput");
  document.getElementById("closeModalBtn").onclick = () => modal.style.display = "none";
  document.getElementById("uploadImageMainBtn")?.addEventListener("click", () => initImageUploadModal(document.getElementById("mainContentEditor")));
  dropZone.ondragover = event => { event.preventDefault(); dropZone.classList.add("dragging"); };
  dropZone.ondragleave = () => dropZone.classList.remove("dragging");
  dropZone.ondrop = event => { event.preventDefault(); dropZone.classList.remove("dragging"); if (event.dataTransfer.files.length) handleUpload(event.dataTransfer.files[0]); };
  dropZone.onclick = () => fileInput.click();
  fileInput.onchange = () => { if (fileInput.files.length) handleUpload(fileInput.files[0]); };
  document.getElementById("uploadImageBtn").onclick = () => fileInput.files.length ? handleUpload(fileInput.files[0]) : alert("Select a file first");
}

export function initImageUploadModal(targetEditor) {
  activeEditor = targetEditor;
  document.getElementById("imageUploadModal").style.display = "flex";
}

function readBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",").pop() || "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function handleUpload(file) {
  if (!activeEditor) return alert("No editor selected");
  const aliasId = await resolveAlias(document.getElementById("aliasId"));
  if (!aliasId) return alert("Choose an alias before attaching files.");
  const marker = placeholder(file.name);
  try {
    const body = new URLSearchParams({ fileBase64: await readBase64(file), filename: file.name, mime: file.type || "application/octet-stream", attachKind: "post", postId: document.getElementById("postId")?.value || "draft" });
    const res = await fetch(`/api/social/assets/${encodeURIComponent(aliasId)}/upload`, { method: "POST", body });
    const data = await res.json().catch(() => null);
    if (!res.ok || data?.error) throw new Error(data?.error?.message || data?.message || "Upload failed.");
    marker.replaceWith(renderAsset((data.success || [])[0], file));
    document.getElementById("imageUploadModal").style.display = "none";
  } catch (error) { marker.remove(); alert(error.message || "Upload failed."); }
}

function placeholder(name) {
  const node = document.createElement("p");
  node.className = "attachment-uploading";
  node.textContent = `Attaching ${name}...`;
  activeEditor.appendChild(node);
  return node;
}

function renderAsset(asset, file) {
  const url = asset?.publicPath || "";
  if ((asset?.mime || file.type).startsWith("image/")) return Object.assign(document.createElement("img"), { src: url, alt: asset?.originalName || file.name });
  if ((asset?.mime || file.type).startsWith("audio/")) { const a = document.createElement("audio"); a.src = url; a.controls = true; return a; }
  const link = document.createElement("a");
  link.href = url;
  link.textContent = asset?.originalName || file.name;
  link.target = "_blank";
  link.rel = "noopener";
  return link;
}
