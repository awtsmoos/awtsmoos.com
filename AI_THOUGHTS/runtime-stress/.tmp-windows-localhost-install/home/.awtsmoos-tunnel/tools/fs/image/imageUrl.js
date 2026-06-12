// B"H

/**
 * B"H
 * Chapter 4: The local shard asked whether the outside world had a window.
 *
 * A filesystem path is not a public URL. When the caller brings a real serving
 * base, this helper joins it honestly; when not, it leaves a precise null and a
 * clear next step rather than pretending the private chamber is already public.
 *
 * @param {object} payload Tunnel payload.
 * @param {string} relativePath Repo-relative path using forward slashes.
 * @returns {{publicUrl:string|null,localUrl:string|null,guidance:string}}
 */
function buildImageUrls(payload = {}, relativePath = "") {
  const publicUrl = join(payload.publicBaseUrl || payload.baseUrl, relativePath);
  const localUrl = join(payload.localBaseUrl, relativePath);
  const guidance = publicUrl
    ? "public_url_built_from_caller_base_url"
    : "No publicBaseUrl was supplied, so the image was written locally only. Serve that directory or upload the file to storage to make a public URL.";
  return { publicUrl, localUrl, guidance };
}

function join(base, relativePath) {
  if (!base) return null;
  return String(base).replace(/\/+$/, "") + "/" + String(relativePath).replace(/^\/+/, "");
}

module.exports = { buildImageUrls, join };
