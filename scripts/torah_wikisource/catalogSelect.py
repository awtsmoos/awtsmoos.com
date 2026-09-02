# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos lets explicit work seeds meet titles, categories, templates, and review marks in one ledger;
Awtsmoos.com resolves modern category links through namespace fourteen before any local gap is pledged.
"""
import argparse
import json
import sqlite3

CATEGORY_NAMESPACE = 14


def page_signals(connection, page_id):
	categories = [row[0] for row in connection.execute(
		"SELECT lt.title FROM category_links cl JOIN linktargets lt ON lt.target_id=cl.target_id "
		"WHERE cl.page_id=? AND lt.namespace=? ORDER BY lt.title", (page_id, CATEGORY_NAMESPACE))]
	templates = [row[0] for row in connection.execute(
		"SELECT lt.title FROM templates t JOIN linktargets lt ON lt.target_id=t.target_id "
		"WHERE t.page_id=? ORDER BY lt.title", (page_id,))]
	flagged = connection.execute(
		"SELECT stable_revision_id,quality FROM flaggedpages WHERE page_id=?", (page_id,)).fetchone()
	return {"categories":categories,"templates":templates,
		"flagged":None if flagged is None else {"revisionId":flagged[0],"quality":flagged[1]}}


def candidates_for_seed(connection, domain, seed, limit=5000):
	query = """SELECT page_id,namespace,title,revision_id,revision_timestamp,
		upstream_sha1,local_sha256 FROM pages
		WHERE namespace=0 AND title LIKE ? ORDER BY title LIMIT ?"""
	for row in connection.execute(query, (f"%{seed}%", limit)):
		yield {"domain":domain,"seed":seed,"pageId":row[0],"namespace":row[1],"title":row[2],
			"revisionId":row[3],"revisionTimestamp":row[4],"upstreamSha1":row[5],"localSha256":row[6],
			**page_signals(connection, row[0])}


def select(database_path, seeds_path, output_path):
	with open(seeds_path, encoding="utf-8") as handle:
		seeds = json.load(handle)
	connection = sqlite3.connect(database_path)
	seen = set()
	count = 0
	with open(output_path, "w", encoding="utf-8") as output:
		for domain, titles in seeds.items():
			for seed in titles:
				for record in candidates_for_seed(connection, domain, seed):
					key = (domain, seed, record["pageId"])
					if key in seen:
						continue
					seen.add(key)
					output.write(json.dumps(record, ensure_ascii=False) + "\n")
					count += 1
	connection.close()
	return count


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
