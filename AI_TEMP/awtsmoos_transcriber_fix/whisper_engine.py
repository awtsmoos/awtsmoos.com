"""B"H

Thin faster-whisper engine wrapper for offline Yiddish transcription.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

from faster_whisper import WhisperModel

from .settings import BatchSettings


class TranscriptionEngine:
    """B"H

    A careful vessel for one loaded Whisper model.

    Args:
        settings: Batch configuration describing the model and decoder.
    """

    def __init__(self, settings: BatchSettings) -> None:
        self.settings = settings
        self.model = WhisperModel(
            settings.model_name,
            device=settings.device,
            compute_type=settings.compute_type,
        )

    def transcribe(self, audio_path: Path) -> dict[str, Any]:
        """Transcribe one audio file into timestamped original-language phrases."""

        segments, info = self.model.transcribe(
            str(audio_path),
            task="transcribe",
            language=self.settings.language,
            beam_size=self.settings.beam_size,
            vad_filter=self.settings.vad_filter,
            word_timestamps=False,
        )
        rendered_segments = [
            {
                "id": segment.id,
                "start": segment.start,
                "end": segment.end,
                "text": segment.text,
            }
            for segment in segments
        ]
        return {
            "requested_task": "transcribe",
            "requested_language": self.settings.language,
            "detected_language": info.language,
            "language_probability": info.language_probability,
            "duration": info.duration,
            "segments": rendered_segments,
        }
