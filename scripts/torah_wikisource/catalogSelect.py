# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos lets one title stream meet every explicit Torah seed in a single measured pass;
Awtsmoos.com then applies work-name policy and batched metadata before sealing one deduplicated glass.
"""
import argparse
import json
import pathlib
import sqlite3
from catalogSignals import load_signals
from seedMatcher import SeedMatcher
from seedPolicy import filter_matches

PAGE_QUERY = """SELECT page_id,namespace,title,revision_id,revision_timestamp,
	upstream_sha1,local_sha256 FROM pages WHERE namespace=0 ORDER BY page_id"""


def load_seed_pairs(path):
	with open(path, encoding="utf-8") as handle:
		catalog = json.load(handle)
	return [(domain, seed) for domain, seeds in catalog.items() for seed in seeds]


def discover(connection, matcher):
	selected = {}
	for row in connection.execute(PAGE_QUERY):
		title = row[2]
		matches = filter_matches(title, matcher.matches(title))
		if not matches:
			continue
		page_id = int(row[0])
		selected[page_id] = {
			"pageId": page_id,
			"namespace": row[1],
			"title": title,
			"revisionId": row[3],
			"revisionTimestamp": row[4],
			"upstreamSha1": row[5],
			"localSha256": row[6],
			"domains": sorted({domain for domain, _seed in matches}),
			"seeds": sorted({seed for _domain, seed in matches})
		}
	return selected


def enrich(connection, selected):
	categories, templates, flagged = load_signals(connection, selected.keys())
	for page_id, record in selected.items():
		record["categories"] = categories.get(page_id, [])
		record["templates"] = templates.get(page_id, [])
		record["flagged"] = flagged.get(page_id)
		yield record


def select(database_path, seeds_path, output_path):
	matcher = SeedMatcher(load_seed_pairs(seeds_path))
	connection = sqlite3.connect(database_path)
	try:
		selected = discover(connection, matcher)
		stage = pathlib.Path(f"{output_path}.tmp")
		with stage.open("w", encoding="utf-8") as output:
			for record in enrich(connection, selected):
				output.write(json.dumps(record, ensure_ascii=False) + "\n")
		stage.replace(output_path)
		return len(selected)
	finally:
		connection.close()


def main():
	parser = argparse.ArgumentParser()
	parser.add_argument("database")
	parser.add_argument("seeds")
	parser.add_argument("output")
	arguments = parser.parse_args()
	count = select(arguments.database, arguments.seeds, arguments.output)
	print(json.dumps({"BH":"B\"H","candidates":count,"output":arguments.output}))


if __name__ == "__main__":
	main()
