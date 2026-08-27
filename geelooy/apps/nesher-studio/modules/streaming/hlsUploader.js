/* B"H
Direct HLS upload vessel: segment bytes go straight to YouTube, not through Awtsmoos.
*/
export function makeHlsUploader(ingest) {
  const base = ingest?.ingestionAddress || ingest?.streamName || '';
  const key = ingest?.streamName || '';
  return { putPlaylist: text => put(`${base}/${key}.m3u8`, text, 'application/vnd.apple.mpegurl'), putSegment: (name, bytes) => put(`${base}/${name}`, bytes, 'video/mp2t') };
}
async function put(url, body, type) {
  if (!url || url.includes('undefined')) throw new Error('missing_hls_ingest_url');
  const res = await fetch(url, { method:'PUT', headers:{ 'content-type':type }, body });
  if (!res.ok) throw new Error(`hls_put_failed_${res.status}`);
  return true;
}
