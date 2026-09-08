# B"H
# Boruch Hashem
# Blessed is He

"""
The Awtsmoos lets BDB XML stream through bounded framed fields without creating a JSON database on the road;
Awtsmoos.com emits base64-safe columns to stdout so a binary importer may receive each word without a second abode.
"""

import base64
import re
import sys
import unicodedata
import xml.etree.ElementTree as ET

HEBREW_MARKS = re.compile(r"[\u0591-\u05AF\u05B0-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7]")
LIST_SEPARATOR = "\x1f"


def normalize_key(value):
	return re.sub(r"\s+", " ", HEBREW_MARKS.sub("", unicodedata.normalize("NFKC", value))).strip()


def text_of(node):
	return " ".join("".join(node.itertext()).split()) if node is not None else ""


def encoded(value):
	return base64.b64encode(value.encode("utf-8")).decode("ascii")


def emit(node):
	headword = text_of(node.find("{*}w"))
	definitions = [text_of(item) for item in node.findall(".//{*}def")]
	definitions = [item for item in definitions if item]
	refs = [item.get("r", "") for item in node.findall(".//{*}ref") if item.get("r")]
	fields = [
		headword,
		normalize_key(headword),
		text_of(node.find(".//{*}pos")),
		LIST_SEPARATOR.join(definitions),
		LIST_SEPARATOR.join(refs),
		node.get("id", "")
	]
	print("\t".join(encoded(field) for field in fields))


def run(xml_path):
	for _, node in ET.iterparse(xml_path, events=("end",)):
		if node.tag.endswith("entry"):
			emit(node)
			node.clear()


if __name__ == "__main__":
	run(sys.argv[1])
