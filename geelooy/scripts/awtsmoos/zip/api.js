// B"H
import { ZipFile } from "./encoder.js";

/**
 * Chapter 2: The Archive Gate Learns Its True Name.
 *
 * The Awtsmoos reveals every file as a letter held inside a vessel; this
 * helper receives remote URLs, gathers their bytes without guessing folder
 * magic, seals them into a native ZIP, and hands the browser a real archive.
 *
 * @param {{name:string,url:string}[]} files Files to fetch and place in the ZIP.
 * @param {{zipName?:string}} options Download behavior for the generated ZIP.
 * @returns {Promise<Blob>} The generated ZIP blob.
 * @sideEffects Fetches URLs and clicks a temporary anchor to download the ZIP.
 * @throws {Error} When any listed file cannot be fetched successfully.
 */
export async function downloadZipFromUrls(files = [], options = {}) {
  const zip = new ZipFile();
  for (const file of files) {
    const response = await fetch(file.url, { cache: "no-store" });
    if (!response.ok) throw new Error(`Could not fetch ${file.url}: ${response.status}`);
    zip.addFile(file.name, new Uint8Array(await response.arrayBuffer()));
  }
  const blob = zip.build();
  downloadBlob(blob, options.zipName || "awtsmoos-files.zip");
  return blob;
}

/**
 * Downloads a Blob through a temporary object URL.
 *
 * @param {Blob} blob The payload to save.
 * @param {string} name The filename shown to the browser.
 * @returns {void}
 * @sideEffects Creates and revokes an object URL, appends/removes an anchor.
 */
function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
