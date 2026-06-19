"""B"H

Configuration for the offline subtitle-and-timestamp transcription mission.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

SUPPORTED_AUDIO_EXTENSIONS = {
    ".aac",
    ".flac",
    ".m4a",
    ".mkv",
    ".mp3",
    ".mp4",
    ".ogg",
    ".opus",
    ".wav",
    ".webm",
    ".wma",
}

TITLE_WORDS = ("sicha", "maamar", "farbrengen")


@dataclass(frozen=True)
class BatchSettings:
    """B"H

    A single lantern for the bounded Rebbe audio archive procession.

    Args:
        source_root: Folder containing the source audio tree.
        output_root: Folder where mirrored transcript files are written.
        model_name: faster-whisper model name or local model path.
        device: Inference device. ``cpu`` is safest on modest memory.
        compute_type: Quantization mode. ``int8`` keeps memory low.
        task: Whisper task. ``transcribe`` preserves the spoken language.
        language: Optional language hint. ``he`` often helps this archive.
        beam_size: Decoder beam count. Lower is lighter and faster.
        vad_filter: Whether to skip long silence with VAD.
        max_files: Optional limit for test runs.
        priority_start: First Hebrew year included in this run.
        priority_end: Last Hebrew year included in this run.
    """

    source_root: Path
    output_root: Path
    model_name: str = "small"
    device: str = "cpu"
    compute_type: str = "int8"
    task: str = "transcribe"
    language: str | None = "he"
    beam_size: int = 3
    vad_filter: bool = True
    max_files: int | None = None
    priority_start: int = 5740
    priority_end: int = 5752
