# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos streams each Hebrew page directly into a durable source ledger of light;
Awtsmoos.com hashes raw wikitext before derived parsing so every later structure proves its right.
"""
import argparse
import bz2
import hashlib
import xml.etree.ElementTree as element_tree
from sourceDb import connect, set_meta

NAMESPACE = "http://www.mediawiki.org/xml/export-0.11/"
TAG = lambda name: f"{{{NAMESPACE}}}{name}"


def text_of(parent, name, default=""):
	node = parent.find(TAG(name))
	return default if node is None or node.text is None else node.text


def integer_of(parent, name):
	value = text_of(parent, name, "").strip()
	return None if not value else int(value)


def page_values(page):
	revision = page.find(TAG("revision"))
	if revision is None:
		return None
	text_node = revision.find(TAG("text"))
	raw = "" if text_node is None or text_node.text is None else text_node.text
	redirect = page.find(TAG("redirect"))
	return (
		integer_of(page, "id"), integer_of(page, "ns"), text_of(page, "title"),
		None if redirect is None else redirect.attrib.get("title"), integer_of(revision, "id"),
		integer_of(revision, "parentid"), text_of(revision, "timestamp"), text_of(revision, "sha1"),
		text_of(revision, "model", "wikitext"), text_of(revision, "format", "text/x-wiki"), raw,
		hashlib.sha256(raw.encode("utf-8")).hexdigest()
	)


def import_xml(input_path, database_path, commit_every=1000, limit=0):
	connection = connect(database_path)
	statement = """INSERT OR REPLACE INTO pages(
		page_id,namespace,title,redirect_title,revision_id,parent_revision_id,
		revision_timestamp,upstream_sha1,content_model,content_format,wikitext,local_sha256
	) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)"""
	count = 0
	with bz2.open(input_path, "rb") as compressed:
		for _, element in element_tree.iterparse(compressed, events=("end",)):
			if element.tag != TAG("page"):
				continue
			values = page_values(element)
			if values:
				connection.execute(statement, values)
				count += 1
				if count % commit_every == 0:
					connection.commit()
					print(f'B"H pages={count}', flush=True)
			element.clear()
			if limit and count >= limit:
				break
	set_meta(connection, "xml_pages", count)
	connection.commit()
	connection.close()
	return count


def main():
	parser = argparse.ArgumentParser()
	parser.add_argument("input")
	parser.add_argument("database")
	parser.add_argument("--limit", type=int, default=0)
	arguments = parser.parse_args()
	count = import_xml(arguments.input, arguments.database, limit=arguments.limit)
	print(f'B"H complete pages={count}', flush=True)


if __name__ == "__main__":
	main()
