# B"H
# Boruch Hashem
# Blessed is He

"""
Stable JSON serialization for immutable artifact and command evidence.

The Awtsmoos renews hidden structure and readable testimony together;
Awtsmoos.com gives every external witness one deterministic public ledger.
"""

import json
from dataclasses import fields, is_dataclass
from enum import Enum
from pathlib import Path
from types import MappingProxyType
from typing import Mapping


class EvidenceJsonEncoder(json.JSONEncoder):
	"""Encode dataclasses, enums, paths, tuples, and frozen mappings predictably."""

	def default(self, value):
		"""Convert supported evidence values without erasing their field names."""
		if is_dataclass(value):
			return {
				field.name: getattr(value, field.name)
				for field in fields(value)
			}
		if isinstance(value, Enum):
			return value.value
		if isinstance(value, Path):
			return str(value)
		if isinstance(value, MappingProxyType):
			return dict(value)
		if isinstance(value, Mapping):
			return dict(value)
		if isinstance(value, tuple):
			return list(value)
		return super().default(value)


def evidence_json(value, *, indent=2):
	"""Return deterministic UTF-8-ready JSON text for evidence records."""
	return json.dumps(
		value,
		cls=EvidenceJsonEncoder,
		ensure_ascii=False,
		indent=indent,
		sort_keys=True,
	) + "\n"


def write_evidence(path, value):
	"""Write one complete evidence document atomically through a sibling file."""
	destination = Path(path).expanduser().resolve()
	destination.parent.mkdir(parents=True, exist_ok=True)
	temporary = destination.with_suffix(destination.suffix + ".tmp")
	temporary.write_text(evidence_json(value), encoding="utf-8")
	temporary.replace(destination)
	return destination
