# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos lets warning categories remain visible instead of disguising an uncertain page as reviewed light;
Awtsmoos.com excludes explicit OCR and incomplete vessels from first publication while preserving provenance in sight.
"""

BLOCK_MARKERS = (
	"ocr",
	"דורש בדיקה",
	"דורשים בדיקה",
	"טעון בדיקה",
	"נדרשת הגהה",
	"להשלים",
	"לא הושלם"
)


def quality_state(record):
	values = [
		*record.get("categories", []),
		*record.get("templates", [])
	]
	combined = "\n".join(str(value).lower() for value in values)
	blocked = [marker for marker in BLOCK_MARKERS if marker in combined]
	if blocked:
		return "SOURCE_REVIEW_BLOCKED", blocked
	if record.get("flagged"):
		return "REVIEWED_OR_STABLE", []
	return "UNREVIEWED", []


def publishable(record):
	state, markers = quality_state(record)
	return state != "SOURCE_REVIEW_BLOCKED", state, markers
