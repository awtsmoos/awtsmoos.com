"""B"H

Discovery and ordering for the requested Rebbe audio archive slice.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

from .settings import SUPPORTED_AUDIO_EXTENSIONS, TITLE_WORDS, BatchSettings

YEAR_PATTERN = re.compile(r"(?<!\d)(57\d{2})(?!\d)")


@dataclass(frozen=True)
class AudioItem:
    """B"H

    A single voice-fragment waiting for timestamped subtitles.

    Args:
        path: Absolute path to the audio file.
        relative_path: Path relative to the source root.
        year: Hebrew year discovered from the relative path.
        priority_bucket: Kept for stable sorting and future expansion.
    """

    path: Path
    relative_path: Path
    year: int | None
    priority_bucket: int


def title_matches(path: Path) -> bool:
    """Return whether the filename contains a requested title word."""

    lowered_name = path.name.lower()
    return any(word in lowered_name for word in TITLE_WORDS)


def discover_year(path: Path) -> int | None:
    """Find the first Hebrew year embedded in a relative file path."""

    match = YEAR_PATTERN.search(str(path))
    return int(match.group(1)) if match else None


def year_matches(year: int | None, settings: BatchSettings) -> bool:
    """Return whether the year belongs to the requested closed range."""

    if year is None:
        return False
    return settings.priority_start <= year <= settings.priority_end


def priority_bucket(year: int | None, settings: BatchSettings) -> int:
    """Keep allowed years in the first bucket for deterministic ordering."""

    return 0 if year_matches(year, settings) else 1


def iter_audio(settings: BatchSettings) -> list[AudioItem]:
    """Walk the archive and return only requested, sorted audio items."""

    items: list[AudioItem] = []
    for path in settings.source_root.rglob("*"):
        if not path.is_file():
            continue
        if path.suffix.lower() not in SUPPORTED_AUDIO_EXTENSIONS:
            continue
        relative_path = path.relative_to(settings.source_root)
        if not title_matches(relative_path):
            continue
        year = discover_year(relative_path)
        if not year_matches(year, settings):
            continue
        items.append(
            AudioItem(
                path=path,
                relative_path=relative_path,
                year=year,
                priority_bucket=priority_bucket(year, settings),
            )
        )
    items.sort(key=lambda item: (item.priority_bucket, item.year or 9999, str(item.relative_path).lower()))
    if settings.max_files is not None:
        return items[: settings.max_files]
    return items
