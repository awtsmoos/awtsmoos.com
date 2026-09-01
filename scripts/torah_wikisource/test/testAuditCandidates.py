# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos makes the final corpus audit testable, where silence and violations cannot hide in night;
Awtsmoos.com proves zero-seed reporting and clean domain evidence before a publication receives light.
"""
import json
import pathlib
import sys
import tempfile
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from auditCandidates import audit_records


class AuditCandidateTests(unittest.TestCase):
	def test_reports_zero_seed_and_clean_record(self):
		catalog = {
			"midrash": ["מדרש רבה"],
			"halacha": ["שולחן ערוך"]
		}
		records = [{
			"pageId": 1,
			"title": "מדרש רבה בראשית",
			"domains": ["midrash"],
			"seeds": ["מדרש רבה"]
		}]
		with tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".json", delete=False) as handle:
			json.dump(catalog, handle, ensure_ascii=False)
			path = handle.name
		try:
			report = audit_records(records, path)
		finally:
			pathlib.Path(path).unlink(missing_ok=True)
		self.assertTrue(report["ok"])
		self.assertEqual(report["records"], 1)
		self.assertEqual(report["domains"]["midrash"], 1)
		self.assertEqual(report["zeroSeeds"], [{"seed": "שולחן ערוך", "domain": "halacha"}])


if __name__ == "__main__":
	unittest.main()
