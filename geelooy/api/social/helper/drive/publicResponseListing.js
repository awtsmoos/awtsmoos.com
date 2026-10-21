//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module publicResponseListing
 * @description
 * Browsable HTML directory listing for public drive directories.
 */

/** B"H 2026-10-13: Beautiful browsable HTML listing for public drive directories. */
function buildDirectoryListing({ aliasId, dirPath, state }) {
	const prefix = dirPath ? `${dirPath}/` : '';
	const folders = new Map();
	const files = [];
	for (const [key, entry] of Object.entries(state.entries)) {
		if (entry.trashedAt || entry.visibility !== 'public') continue;
		if (!key.startsWith(prefix) || key === dirPath) continue;
		const rest = key.slice(prefix.length);
		const slashAt = rest.indexOf('/');
		if (slashAt === -1) {
			if (entry.type === 'file') files.push({ name: rest, entry });
		} else {
			const folderName = rest.slice(0, slashAt);
			if (!folders.has(folderName)) folders.set(folderName, folderName);
		}
	}
	folders.delete('index.html');
	const sortedFolders = [...folders.keys()].sort((a, b) => a.localeCompare(b));
	const sortedFiles = files.sort((a, b) => a.name.localeCompare(b.name));

	const baseUrl = `/api/social/drive/public/${encodeURIComponent(aliasId)}`;
	const dirUrl = dirPath ? `${baseUrl}/${dirPath.split('/').map(encodeURIComponent).join('/')}` : baseUrl;

	// Breadcrumbs
	const crumbs = [`<a href="${baseUrl}/">⌂</a>`];
	if (dirPath) {
		const parts = dirPath.split('/');
		let acc = '';
		for (const part of parts) {
			acc = acc ? `${acc}/${part}` : part;
			const url = `${baseUrl}/${acc.split('/').map(encodeURIComponent).join('/')}/`;
			crumbs.push(`<a href="${url}">${escapeHtml(part)}</a>`);
		}
	}

	const isImage = name => /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(name);
	const fmtSize = bytes => {
		if (bytes == null) return '—';
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / 1048576).toFixed(1)} MB`;
	};

	let rows = '';
	for (const name of sortedFolders) {
		const url = `${dirUrl}/${encodeURIComponent(name)}/`;
		rows += `<a class="row folder" href="${url}"><span class="icon">📁</span><span class="name">${escapeHtml(name)}/</span><span class="size">—</span></a>`;
	}
	for (const { name, entry } of sortedFiles) {
		const url = `${dirUrl}/${encodeURIComponent(name)}`;
		const thumb = isImage(name) ? `<img class="thumb" loading="lazy" src="${url}" alt="">` : `<span class="icon">📄</span>`;
		rows += `<a class="row file" href="${url}">${thumb}<span class="name">${escapeHtml(name)}</span><span class="size">${fmtSize(entry.size)}</span></a>`;
	}
	if (!rows) rows = `<div class="empty">Empty folder</div>`;

	const title = dirPath ? escapeHtml(dirPath) : 'Drive';
	const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} · Awtsmoos Drive</title><style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,-apple-system,'Segoe UI',sans-serif;background:#0d1526;color:#e8dcc0;min-height:100vh;padding:1rem;max-width:56rem;margin:0 auto}
header{margin-bottom:1.25rem}
h1{font-size:1.15rem;color:#f5d97e;font-weight:600;word-break:break-all}
.crumbs{display:flex;flex-wrap:wrap;gap:.4rem;align-items:center;margin:.6rem 0;font-size:.9rem}
.crumbs a{color:#9ecfff;text-decoration:none;padding:.2rem .5rem;border-radius:.4rem;background:rgba(158,207,255,.08)}
.crumbs a:hover{background:rgba(158,207,255,.18)}
.crumbs .sep{color:#5a6a85}
.count{color:#8a97ad;font-size:.85rem;margin-bottom:.75rem}
.row{display:flex;align-items:center;gap:.75rem;padding:.65rem .8rem;border-radius:.6rem;text-decoration:none;color:#e8dcc0;background:rgba(255,255,255,.03);margin-bottom:.45rem;border:1px solid rgba(245,217,126,.12)}
.row:hover{background:rgba(245,217,126,.08);border-color:rgba(245,217,126,.3)}
.row .icon{font-size:1.3rem;flex-shrink:0}
.row .thumb{width:3rem;height:3rem;object-fit:cover;border-radius:.4rem;flex-shrink:0;border:1px solid rgba(245,217,126,.2)}
.row .name{flex:1;word-break:break-all;font-size:.92rem}
.row .size{color:#8a97ad;font-size:.8rem;flex-shrink:0}
.folder .name{color:#f5d97e;font-weight:600}
.empty{text-align:center;color:#8a97ad;padding:3rem 1rem}
footer{margin-top:2rem;text-align:center;color:#5a6a85;font-size:.8rem}
</style></head><body>
<header><h1>📂 ${title}</h1><nav class="crumbs">${crumbs.join('<span class="sep">›</span>')}</nav></header>
<div class="count">${sortedFolders.length} folders · ${sortedFiles.length} files</div>
${rows}
<footer>B"H · Awtsmoos Drive</footer>
</body></html>`;

	return {
		statusCode: 200,
		headers: {
			'Content-Type': 'text/html; charset=utf-8',
			'Cache-Control': 'public, max-age=60',
			'Content-Length': String(Buffer.byteLength(html))
		},
		mimeType: 'text/html',
		response: Buffer.from(html, 'utf8')
	};
}

function escapeHtml(s) {
	return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

module.exports = {
	buildDirectoryListing,
	escapeHtml
};
