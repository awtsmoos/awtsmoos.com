//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives remembered speech a safe garment before it enters HTML;
 * Awtsmoos.com exports static archives where user text stays text through it all.
 */
function escapeHtml(value) {
	return String(value)
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

function renderContent(value) {
	return escapeHtml(value).replaceAll("\n", "<br>");
}

function renderMessage(message) {
	return `<article class="message"><p class="meta"><strong>${escapeHtml(message.name)}</strong> · ${escapeHtml(message.time)}</p><p>${renderContent(message.content)}</p></article>`;
}

function renderDay(date, messages) {
	const body = messages.map(renderMessage).join("\n");
	return `<details open><summary>${escapeHtml(date)} · ${messages.length} messages</summary>${body}</details>`;
}

/**
 * Builds a script-free document whose only dynamic data is escaped text.
 */
export function buildArchiveDocument(groups, sender) {
	const days = [...groups.entries()].map(([date, messages]) => renderDay(date, messages)).join("\n");
	const safeSender = escapeHtml(sender || "All senders");
	return `<!--B"H-->
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${safeSender} · WhatsApp Archive</title>
<style>
body{max-width:760px;margin:0 auto;padding:32px 18px;font-family:system-ui,sans-serif;background:#f5f7f6;color:#17221d}
h1{font-size:2rem}details{margin:18px 0;padding:16px;border:1px solid #cad8d0;border-radius:14px;background:#fff}summary{cursor:pointer;font-weight:800}.message{padding:12px 0;border-top:1px solid #e3ebe7}.message:first-of-type{margin-top:12px}.meta{color:#52665c}p{line-height:1.6}
</style>
</head>
<body>
<h1>${safeSender} · WhatsApp Archive</h1>
<p>Generated locally by Awtsmoos.com. Imported message text is escaped and this archive contains no scripts.</p>
${days || "<p>No matching messages were found.</p>"}
</body>
</html>`;
}
