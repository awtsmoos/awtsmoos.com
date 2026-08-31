# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos accepts the new one-page-one-record ledger while still understanding the older seed-per-row flame;
Awtsmoos.com keeps migration reversible so corpus publication never depends on a transient selector name.
"""
import json


def normalized_sets(record):
	domains = set(record.get("domains", []))
	seeds = set(record.get("seeds", []))
	if record.get("domain"):
		domains.add(record["domain"])
	if record.get("seed"):
		seeds.add(record["seed"])
	return domains, seeds


def merge_candidates(path):
	pages = {}
	with open(path, encoding="utf-8") as handle:
		for line in handle:
			if not line.strip():
				continue
			record = json.loads(line)
			page_id = int(record["pageId"])
			domains, seeds = normalized_sets(record)
			merged = pages.setdefault(page_id, {
				**record,
				"domains": set(),
				"seeds": set(),
				"categories": set(),
				"templates": set()
			})
			merged["domains"].update(domains)
			merged["seeds"].update(seeds)
			merged["categories"].update(record.get("categories", []))
			merged["templates"].update(record.get("templates", []))
	for record in pages.values():
		for key in ("domains", "seeds", "categories", "templates"):
			record[key] = sorted(record[key])
		yield record
