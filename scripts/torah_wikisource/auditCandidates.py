# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos asks every configured Torah seed what source light it truly found before publication may begin;
Awtsmoos.com turns silence, domain drift, and policy violations into durable evidence rather than hidden spin.
"""
import argparse
import collections
import json
from seedMatcher import contains_bounded_seed
from seedPolicy import accepts_seed


def load_catalog(path):
	with open(path, encoding="utf-8") as handle:
		catalog = json.load(handle)
	seed_domains = {
		seed: domain
		for domain, seeds in catalog.items()
		for seed in seeds
	}
	return catalog, seed_domains


def load_records(path):
	with open(path, encoding="utf-8") as handle:
		return [json.loads(line) for line in handle if line.strip()]


def audit_records(records, catalog_path):
	catalog, seed_domains = load_catalog(catalog_path)
	seed_counts = collections.Counter()
	domain_counts = collections.Counter()
	violations = []
	for record in records:
		title = record.get("title", "")
		for domain in record.get("domains", []):
			domain_counts[domain] += 1
		for seed in record.get("seeds", []):
			seed_counts[seed] += 1
			if not contains_bounded_seed(title, seed) or not accepts_seed(title, seed):
				violations.append({
					"pageId": record.get("pageId"),
					"title": title,
					"seed": seed
				})
	zero_seeds = [
		{"seed": seed, "domain": seed_domains[seed]}
		for seed in sorted(seed_domains)
		if seed_counts[seed] == 0
	]
	indexes = sorted(set([0, len(records) // 2, len(records) - 1])) if records else []
	return {
		"BH": "B\"H",
		"ok": bool(records) and not violations,
		"records": len(records),
		"configuredDomains": sorted(catalog),
		"domains": dict(sorted(domain_counts.items())),
		"seedCounts": {seed: seed_counts[seed] for seed in sorted(seed_domains)},
		"zeroSeeds": zero_seeds,
		"policyViolations": violations[:50],
		"samples": [
			{
				"pageId": records[index].get("pageId"),
				"title": records[index].get("title"),
				"domains": records[index].get("domains", []),
				"seeds": records[index].get("seeds", [])
			}
			for index in indexes
		]
	}


def main():
	parser = argparse.ArgumentParser()
	parser.add_argument("candidates")
	parser.add_argument("catalog")
	arguments = parser.parse_args()
	report = audit_records(load_records(arguments.candidates), arguments.catalog)
	print(json.dumps(report, ensure_ascii=False, indent=2))
	if not report["ok"]:
		raise SystemExit(1)


if __name__ == "__main__":
	main()
