#!/bin/zsh
/usr/bin/python3 - <<'PY' > /tmp/meluket_translation_normalized_audit.json
import collections
import json
import re
from pathlib import Path

archive_root = Path("/Users/awtsmoos/Documents/awtsmoos-jobs/meluket-translation-job/generated/meluket-swarm/chunks")
verification_path = Path("/Users/awtsmoos/awtsmoos.com/ai_thoughts/20260721-corpus-integrity-talmud-tanach-chassidus-rag/meluket-post-verification.json")
chunk_pattern = re.compile(r"__(BH_POST_\d+_theRebbe_\d+)__p(\d+)$")
canonical_pattern = re.compile(r"^BH_POST_\d+_theRebbe_\d+$")

verification = json.loads(verification_path.read_text())
expected_by_month = {}
expected_ids = []
for month in verification.get("months", []):
	month_name = month.get("month") or month.get("name") or month.get("seriesId")
	ids = [value for value in month.get("sourcePostIds", []) if canonical_pattern.fullmatch(str(value))]
	expected_by_month[str(month_name)] = ids
	expected_ids.extend(ids)

records = []
parse_errors = []
directory_errors = []
for chunk_dir in sorted(path for path in archive_root.iterdir() if path.is_dir()):
	match = chunk_pattern.search(chunk_dir.name)
	if not match:
		directory_errors.append({"directory": chunk_dir.name, "error": "name_not_matched"})
		continue
	name_base_id = match.group(1)
	name_part = int(match.group(2))
	source_path = chunk_dir / "source.json"
	try:
		source = json.loads(source_path.read_text())
	except Exception as error:
		parse_errors.append({"path": str(source_path), "error": f"{type(error).__name__}: {error}"})
		continue
	records.append({
		"directory": chunk_dir.name,
		"path": str(source_path),
		"nameBaseId": name_base_id,
		"namePart": name_part,
		"postId": source.get("postId"),
		"part": source.get("part"),
		"globalIndex": source.get("globalIndex"),
		"owner": source.get("owner"),
		"seriesId": source.get("seriesId"),
		"title": source.get("title"),
		"sections": source.get("sections"),
	})

groups = collections.defaultdict(list)
for record in records:
	groups[str(record["postId"])].append(record)

post_rows = []
month_counts = collections.Counter()
global_index_to_posts = collections.defaultdict(set)
all_coordinate_count = 0
all_text_chars = 0
all_text_items = 0
integrity_failures = []

for post_id, chunks in sorted(groups.items()):
	chunks.sort(key=lambda item: (int(item["part"] or 0), item["directory"]))
	parts = [int(item["part"] or 0) for item in chunks]
	name_parts = [item["namePart"] for item in chunks]
	series_values = sorted({str(item["seriesId"]) for item in chunks})
	title_values = sorted({str(item["title"]) for item in chunks})
	global_indexes = sorted({item["globalIndex"] for item in chunks}, key=lambda value: (value is None, value))
	owner_values = sorted({item["owner"] for item in chunks}, key=lambda value: (value is None, value))
	coordinates = []
	texts = []
	section_values = []
	for chunk in chunks:
		for section in chunk["sections"] or []:
			v = section.get("v")
			section_values.append(v)
			for item in section.get("items") or []:
				coordinate = (v, item.get("s"))
				coordinates.append(coordinate)
				texts.append(str(item.get("text") or ""))
	coordinate_counter = collections.Counter(coordinates)
	duplicate_coordinates = sorted([list(key) for key, count in coordinate_counter.items() if count > 1])
	unique_sections = sorted({value for value in section_values if isinstance(value, int)})
	section_gaps = []
	if unique_sections:
		expected_sections = set(range(unique_sections[0], unique_sections[-1] + 1))
		section_gaps = sorted(expected_sections - set(unique_sections))
	contiguous_parts = parts == list(range(1, max(parts) + 1)) if parts else False
	name_part_match = parts == name_parts
	base_id_match = all(chunk["nameBaseId"] == post_id for chunk in chunks)
	nonempty_text = all(bool(text) for text in texts)
	consistent = (
		len(series_values) == 1
		and len(title_values) == 1
		and len(global_indexes) == 1
		and len(owner_values) == 1
	)
	failures = []
	if not contiguous_parts: failures.append("noncontiguous_parts")
	if not name_part_match: failures.append("directory_part_mismatch")
	if not base_id_match: failures.append("directory_post_id_mismatch")
	if not consistent: failures.append("inconsistent_metadata")
	if duplicate_coordinates: failures.append("duplicate_coordinates")
	if section_gaps: failures.append("section_gaps")
	if not texts: failures.append("no_text_items")
	if not nonempty_text: failures.append("empty_text_item")
	if failures:
		integrity_failures.append({"postId": post_id, "failures": failures})
	series_id = series_values[0] if len(series_values) == 1 else None
	if series_id:
		month_counts[series_id] += 1
	for global_index in global_indexes:
		global_index_to_posts[global_index].add(post_id)
	all_coordinate_count += len(coordinates)
	all_text_items += len(texts)
	all_text_chars += sum(len(text) for text in texts)
	post_rows.append({
		"postId": post_id,
		"parts": parts,
		"chunkCount": len(chunks),
		"seriesId": series_id,
		"title": title_values[0] if len(title_values) == 1 else None,
		"globalIndex": global_indexes[0] if len(global_indexes) == 1 else None,
		"owner": owner_values[0] if len(owner_values) == 1 else None,
		"sectionMin": min(unique_sections) if unique_sections else None,
		"sectionMax": max(unique_sections) if unique_sections else None,
		"uniqueSectionCount": len(unique_sections),
		"textItemCount": len(texts),
		"textCharCount": sum(len(text) for text in texts),
		"duplicateCoordinates": duplicate_coordinates,
		"sectionGaps": section_gaps,
		"failures": failures,
	})

archive_ids = set(groups)
expected_set = set(expected_ids)
index_values = sorted(value for value in global_index_to_posts if isinstance(value, int))
index_duplicates = {
	str(index): sorted(posts)
	for index, posts in global_index_to_posts.items()
	if len(posts) > 1
}
index_gaps = []
if index_values:
	index_gaps = sorted(set(range(min(index_values), max(index_values) + 1)) - set(index_values))

print(json.dumps({
	"mode": "read_only",
	"archiveRoot": str(archive_root),
	"expectedIdCount": len(expected_set),
	"archiveChunkCount": len(records),
	"archiveBasePostCount": len(archive_ids),
	"exactIdOverlapCount": len(expected_set & archive_ids),
	"expectedIdsMissingById": sorted(expected_set - archive_ids),
	"archiveIdsNotInExpectedById": sorted(archive_ids - expected_set),
	"parseErrorCount": len(parse_errors),
	"directoryErrorCount": len(directory_errors),
	"integrityFailureCount": len(integrity_failures),
	"monthCounts": dict(sorted(month_counts.items())),
	"expectedMonthCounts": {key: len(value) for key, value in expected_by_month.items()},
	"globalIndexMin": min(index_values) if index_values else None,
	"globalIndexMax": max(index_values) if index_values else None,
	"globalIndexUniqueCount": len(index_values),
	"globalIndexGaps": index_gaps,
	"globalIndexDuplicateCount": len(index_duplicates),
	"globalIndexDuplicates": index_duplicates,
	"totalTextItemCount": all_text_items,
	"totalTextCharCount": all_text_chars,
	"totalCoordinateCount": all_coordinate_count,
	"postRows": post_rows,
	"integrityFailures": integrity_failures,
	"parseErrors": parse_errors,
	"directoryErrors": directory_errors,
}, ensure_ascii=False, indent=2))
PY
printf "%s\n" "$?" > /tmp/meluket_translation_normalized_audit.done
