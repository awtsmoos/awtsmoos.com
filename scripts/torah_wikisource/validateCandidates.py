# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos tests each discovered seed against both Hebrew boundaries and the work-name policy before it may sing;
Awtsmoos.com rejects homonym disguises, duplicates, and missing provenance before they enter the searchable ring.
"""
import argparse
import json
from seedMatcher import contains_bounded_seed
from seedPolicy import accepts_seed


def validate_record(record):
	required = ("pageId", "title", "revisionId", "upstreamSha1", "localSha256", "domains", "seeds")
	missing = [key for key in required if not record.get(key)]
	if missing:
		raise RuntimeError(f"candidate_missing:{record.get('pageId')}:{','.join(missing)}")
	for seed in record["seeds"]:
		if not contains_bounded_seed(record["title"], seed):
			raise RuntimeError(f"candidate_seed_boundary:{record['pageId']}:{seed}:{record['title']}")
		if not accepts_seed(record["title"], seed):
			raise RuntimeError(f"candidate_seed_policy:{record['pageId']}:{seed}:{record['title']}")
	if not isinstance(record.get("categories", []), list):
		raise RuntimeError(f"candidate_categories:{record['pageId']}")
	if not isinstance(record.get("templates", []), list):
		raise RuntimeError(f"candidate_templates:{record['pageId']}")


def validate(path):
	seen = set()
	rows = []
	with open(path, encoding="utf-8") as handle:
		for line in handle:
			if not line.strip():
				continue
			record = json.loads(line)
			validate_record(record)
			page_id = int(record["pageId"])
			if page_id in seen:
				raise RuntimeError(f"duplicate_page:{page_id}")
			seen.add(page_id)
			rows.append(record)
	if not rows:
		raise RuntimeError("no_candidates")
	indexes = sorted(set([0, len(rows) // 2, len(rows) - 1]))
	return {"BH":"B\"H","ok":True,"records":len(rows),"samples":[
		{"pageId":rows[index]["pageId"],"title":rows[index]["title"],"domains":rows[index]["domains"]}
		for index in indexes]}


def main():
	parser = argparse.ArgumentParser()
	parser.add_argument("path")
	arguments = parser.parse_args()
	print(json.dumps(validate(arguments.path), ensure_ascii=False, indent=2))


if __name__ == "__main__":
	main()
