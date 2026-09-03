# B"H
# Boruch Hashem
# Blessed is He

"""
The Awtsmoos lets the historical BDB XML become a searchable vessel without losing its source name;
Awtsmoos.com uses Python's standard XML parser, never brittle text slicing, to carry each lexical flame.
"""

import json
import re
import sys
import unicodedata
import xml.etree.ElementTree as ET
from pathlib import Path

HEBREW_MARKS = re.compile(r"[\u0591-\u05AF\u05B0-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7]")


def normalize_key(value):
	return re.sub(r"\s+", " ", HEBREW_MARKS.sub("", unicodedata.normalize("NFKC", value))).strip()


def text_of(node):
	return " ".join("".join(node.itertext()).split()) if node is not None else ""


def shaped_entry(node):
	headword_node = node.find("{*}w")
	headword = text_of(headword_node)
	definitions = [text_of(item) for item in node.findall(".//{*}def")]
	definitions = [item for item in definitions if item]
	part = text_of(node.find(".//{*}pos"))
	refs = [item.get("r", "") for item in node.findall(".//{*}ref") if item.get("r")]
	return {
		"headword": headword,
		"normalized": normalize_key(headword),
		"language": "Biblical Hebrew",
		"partOfSpeech": part,
		"senses": [{"definition": item} for item in definitions],
		"refs": refs,
		"providerEntryId": node.get("id", "")
	}


def run(xml_path, output_path):
	count = 0
	with Path(output_path).open("w", encoding="utf-8") as output:
		for _, node in ET.iterparse(xml_path, events=("end",)):
			if not node.tag.endswith("entry"):
				continue
			entry = shaped_entry(node)
			if entry["normalized"]:
				output.write(json.dumps(entry, ensure_ascii=False) + "\n")
				count += 1
			node.clear()
	print(json.dumps({"sourceId": "bdb", "count": count, "complete": True}))


if __name__ == "__main__":
	run(sys.argv[1], sys.argv[2])
