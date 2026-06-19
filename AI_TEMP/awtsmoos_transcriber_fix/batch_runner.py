"""B"H

Command-line entry point for the resumable transcription batch.
"""

from __future__ import annotations

import argparse
import sys
import traceback
from datetime import datetime, timezone
from pathlib import Path

from .media_index import AudioItem, iter_audio
from .output_paths import is_complete, transcript_paths
from .renderers import write_json, write_srt, write_txt, write_vtt
from .settings import BatchSettings
from .whisper_engine import TranslationEngine


def parse_args() -> argparse.Namespace:
    """Parse CLI knobs for the archive procession."""

    parser = argparse.ArgumentParser(description="Offline Rebbe audio subtitle transcriber.")
    parser.add_argument("--source", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--model", default="small")
    parser.add_argument("--language", default="he")
    parser.add_argument("--task", default="transcribe", choices=["translate", "transcribe"])
    parser.add_argument("--device", default="cpu")
    parser.add_argument("--compute-type", default="int8")
    parser.add_argument("--beam-size", default=3, type=int)
    parser.add_argument("--max-files", default=None, type=int)
    parser.add_argument("--year-start", default=5740, type=int)
    parser.add_argument("--year-end", default=5752, type=int)
    parser.add_argument("--no-vad", action="store_true")
    return parser.parse_args()


def build_settings(args: argparse.Namespace) -> BatchSettings:
    """Build immutable settings from command-line arguments."""

    return BatchSettings(
        source_root=args.source.resolve(),
        output_root=args.output.resolve(),
        model_name=args.model,
        device=args.device,
        compute_type=args.compute_type,
        task=args.task,
        language=args.language or None,
        beam_size=args.beam_size,
        vad_filter=not args.no_vad,
        max_files=args.max_files,
        priority_start=args.year_start,
        priority_end=args.year_end,
    )


def write_success(item: AudioItem, paths, result: dict) -> None:
    """Persist one completed transcript in every useful format."""

    payload = {
        "source": str(item.path),
        "relative_path": str(item.relative_path),
        "year": item.year,
        "completed_at": datetime.now(timezone.utc).isoformat(),
        **result,
    }
    segments = result["segments"]
    write_json(paths.json_path, payload)
    write_srt(paths.srt_path, segments)
    write_vtt(paths.vtt_path, segments)
    write_txt(paths.txt_path, segments)
    paths.done_path.write_text("done\n", encoding="utf-8")
    if paths.error_path.exists():
        paths.error_path.unlink()


def write_error(paths, error: BaseException) -> None:
    """Record a failed file without stopping the whole run."""

    paths.error_path.parent.mkdir(parents=True, exist_ok=True)
    paths.error_path.write_text(
        "".join(traceback.format_exception(type(error), error, error.__traceback__)),
        encoding="utf-8",
    )


def main() -> int:
    """Run the complete resumable batch."""

    settings = build_settings(parse_args())
    if not settings.source_root.exists():
        print(f"Source folder does not exist: {settings.source_root}", file=sys.stderr)
        return 2
    items = iter_audio(settings)
    span = f"{settings.priority_start}-{settings.priority_end}"
    print(f"Discovered {len(items)} matching audio files for Hebrew years {span}.")
    if not items:
        return 0
    engine = TranslationEngine(settings)
    for index, item in enumerate(items, start=1):
        paths = transcript_paths(settings, item)
        if is_complete(paths):
            print(f"[{index}/{len(items)}] SKIP {item.relative_path}")
            continue
        print(f"[{index}/{len(items)}] START {item.relative_path}", flush=True)
        try:
            result = engine.translate(item.path)
            write_success(item, paths, result)
            print(f"[{index}/{len(items)}] DONE {item.relative_path}", flush=True)
        except Exception as error:
            write_error(paths, error)
            print(f"[{index}/{len(items)}] ERROR {item.relative_path}: {error}", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
