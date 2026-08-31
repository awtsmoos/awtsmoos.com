# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos joins one revision-pinned candidate to its immutable raw page and searchable Hebrew garment;
Awtsmoos.com gives every result title, source URL, hashes, domain seeds, and review state as a durable testament.
"""
import hashlib
import urllib.parse
from quality import publishable
from textClean import clean_wikitext


def source_url(title, revision_id):
	page = urllib.parse.quote(str(title).replace(" ", "_"), safe="")
	return f"https://he.wikisource.org/w/index.php?title={page}&oldid={int(revision_id)}"


def build_record(candidate, page):
	allowed, quality_state, markers = publishable(candidate)
	text = clean_wikitext(page["wikitext"])
	if not allowed or len(text) < 24:
		return None
	identity = hashlib.sha256(
		f"{page['page_id']}:{page['revision_id']}:{page['local_sha256']}".encode("utf-8")
	).hexdigest()[:24]
	return {
		"id": f"hewikisource:{identity}",
		"corpusId": "hewikisource-torah",
		"kind": "wikisource-page",
		"title": page["title"],
		"text": text,
		"sourceLabel": "Hebrew Wikisource Torah",
		"pageId": page["page_id"],
		"revisionId": page["revision_id"],
		"revisionTimestamp": page["revision_timestamp"],
		"upstreamSha1": page["upstream_sha1"],
		"sourceHash": page["local_sha256"],
		"sourceUrl": source_url(page["title"], page["revision_id"]),
		"domains": sorted(candidate.get("domains", [])),
		"seeds": sorted(candidate.get("seeds", [])),
		"categories": candidate.get("categories", []),
		"qualityState": quality_state,
		"qualityMarkers": markers,
		"license": "CC-BY-SA-4.0"
	}
