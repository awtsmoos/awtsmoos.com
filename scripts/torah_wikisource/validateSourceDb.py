# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos counts source vessels and recomputes their hashes before selection may begin;
Awtsmoos.com proves category and template targets through linktarget so no hidden relation fails within.
"""
import argparse
import hashlib
import json
import sqlite3

CATEGORY_NAMESPACE = 14


def scalar(connection, statement, params=()):
	row = connection.execute(statement, params).fetchone()
	return None if row is None else row[0]


def valid_upstream_sha1(value):
	text = str(value or "")
	return 20 <= len(text) <= 40 and text.isalnum() and text == text.lower()


def sample_ids(connection):
	count = scalar(connection, "SELECT COUNT(*) FROM pages") or 0
	if not count:
		return []
	offsets = sorted(set([0, count // 2, count - 1]))
	return [
		connection.execute("SELECT page_id FROM pages ORDER BY page_id LIMIT 1 OFFSET ?", (offset,)).fetchone()[0]
		for offset in offsets
	]


def validate_page(connection, page_id):
	row = connection.execute(
		"SELECT title,revision_id,upstream_sha1,wikitext,local_sha256 FROM pages WHERE page_id=?", (page_id,)
	).fetchone()
	if not row:
		raise RuntimeError(f"missing page: {page_id}")
	title, revision_id, upstream_sha1, wikitext, local_sha256 = row
	actual = hashlib.sha256(wikitext.encode("utf-8")).hexdigest()
	if actual != local_sha256:
		raise RuntimeError(f"sha256 mismatch: {page_id}")
	if not revision_id or not valid_upstream_sha1(upstream_sha1):
		raise RuntimeError(f"revision provenance incomplete: {page_id}")
	return {"pageId": page_id, "title": title, "revisionId": revision_id, "upstreamSha1": upstream_sha1}


def validate(database_path):
	connection = sqlite3.connect(database_path)
	page_count = scalar(connection, "SELECT COUNT(*) FROM pages") or 0
	duplicate_ids = scalar(connection,
		"SELECT COUNT(*) FROM (SELECT page_id,COUNT(*) n FROM pages GROUP BY page_id HAVING n>1)") or 0
	if page_count <= 0 or duplicate_ids:
		raise RuntimeError(f"invalid page census: pages={page_count} duplicates={duplicate_ids}")
	metadata = {row[0]: row[1] for row in connection.execute("SELECT key,value FROM ingestion_meta ORDER BY key")}
	samples = [validate_page(connection, page_id) for page_id in sample_ids(connection)]
	unresolved_categories = scalar(connection,
		"SELECT COUNT(*) FROM category_links cl LEFT JOIN linktargets lt ON lt.target_id=cl.target_id "
		"WHERE lt.target_id IS NULL OR lt.namespace<>?", (CATEGORY_NAMESPACE,)) or 0
	unresolved_templates = scalar(connection,
		"SELECT COUNT(*) FROM templates t LEFT JOIN linktargets l ON l.target_id=t.target_id WHERE l.target_id IS NULL") or 0
	connection.close()
	if unresolved_categories or unresolved_templates:
		raise RuntimeError(f"unresolved targets: category={unresolved_categories} template={unresolved_templates}")
	return {"BH":"B\"H","ok":True,"pages":page_count,"duplicatePageIds":duplicate_ids,
		"unresolvedCategoryTargets":unresolved_categories,"unresolvedTemplateTargets":unresolved_templates,
		"metadata":metadata,"samples":samples}


def main():
	parser = argparse.ArgumentParser()
	parser.add_argument("database")
	arguments = parser.parse_args()
	print(json.dumps(validate(arguments.database), ensure_ascii=False, indent=2))


if __name__ == "__main__":
	main()
