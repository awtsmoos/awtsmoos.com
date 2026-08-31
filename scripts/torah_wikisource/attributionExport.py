# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos gathers revision, history, license, and change notices beside every selected work;
Awtsmoos.com exports attribution as data so credit is never an afterthought hidden by later work.
"""
import argparse
import json
import urllib.parse

SOURCE_HOST = "https://he.wikisource.org"
LICENSE = "CC-BY-SA-4.0"


def page_url(title, query):
	page = urllib.parse.quote(str(title).replace(" ", "_"), safe="")
	return f"{SOURCE_HOST}/w/index.php?title={page}&{query}"


def attribution(record):
	return {
		"sourceProject": "hewikisource", "pageId": record["pageId"], "pageTitle": record["title"],
		"revisionId": record["revisionId"], "revisionTimestamp": record.get("revisionTimestamp"),
		"upstreamSha1": record.get("upstreamSha1"),
		"revisionUrl": page_url(record["title"], f"oldid={int(record['revisionId'])}"),
		"historyUrl": page_url(record["title"], "action=history"), "license": LICENSE,
		"locallyTransformed": True,
		"changeNotice": "Parsed, hierarchically structured, normalized for search, and/or segmented by Awtsmoos.com; original source text and revision provenance are preserved separately."
	}


def export(selection_path, output_path):
	count = 0
	seen = set()
	with open(selection_path, encoding="utf-8") as source, open(output_path, "w", encoding="utf-8") as output:
		for line in source:
			if not line.strip():
				continue
			record = json.loads(line)
			key = (record["pageId"], record["revisionId"])
			if key in seen:
				continue
			seen.add(key)
			output.write(json.dumps(attribution(record), ensure_ascii=False) + "\n")
			count += 1
	return count


def main():
	parser = argparse.ArgumentParser()
	parser.add_argument("selection")
	parser.add_argument("output")
	arguments = parser.parse_args()
	count = export(arguments.selection, arguments.output)
	print(json.dumps({"BH": "B\"H", "attributions": count, "output": arguments.output}))


if __name__ == "__main__":
	main()
