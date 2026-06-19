"""B"H

Path planning for mirrored Yiddish transcript artifacts.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from .media_index import AudioItem
from .settings import BatchSettings


@dataclass(frozen=True)
class TranscriptPaths:
    """B"H

    All files written for one source audio item.

    Args:
        base: Output path without final artifact suffix.
        json_path: Machine-readable segment data.
        srt_path: Subtitle file with phrase timestamps.
        vtt_path: Web subtitle file with phrase timestamps.
        txt_path: Human-readable plain text.
        done_path: Completion marker used for resumable runs.
        error_path: Failure report path for retry/debugging.
    """

    base: Path
    json_path: Path
    srt_path: Path
    vtt_path: Path
    txt_path: Path
    done_path: Path
    error_path: Path


def transcript_paths(settings: BatchSettings, item: AudioItem) -> TranscriptPaths:
    """Mirror the source tree and mark the artifact as Yiddish transcription."""

    mirrored = settings.output_root / item.relative_path
    base = mirrored.with_suffix(mirrored.suffix + ".yiddish-transcript")
    return TranscriptPaths(
        base=base,
        json_path=base.with_suffix(base.suffix + ".segments.json"),
        srt_path=base.with_suffix(base.suffix + ".srt"),
        vtt_path=base.with_suffix(base.suffix + ".vtt"),
        txt_path=base.with_suffix(base.suffix + ".txt"),
        done_path=base.with_suffix(base.suffix + ".done"),
        error_path=base.with_suffix(base.suffix + ".error.txt"),
    )


def is_complete(paths: TranscriptPaths) -> bool:
    """Return whether a previous run already finished this file."""

    return paths.done_path.exists() and paths.json_path.exists()
