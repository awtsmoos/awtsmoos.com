from pathlib import Path
from faster_whisper import WhisperModel

sample = Path(r"C:\Users\Yackov Yitzchak\Documents\Codex\2026-06-18\b-h-hey-i-have-like\outputs\awtsmoos_transcriber\yiddish_model_test_sample_90s.mp3")
out = Path(r"C:\Users\Yackov Yitzchak\Documents\Codex\2026-06-18\b-h-hey-i-have-like\outputs\awtsmoos_transcriber\yiddish_model_test_results.txt")
model_name = "ivrit-ai/yi-whisper-large-v3-turbo-ct2"

with out.open("w", encoding="utf-8") as f:
    print("MODEL", model_name, file=f)
    print("SAMPLE", sample, file=f)
    print("LOADING_MODEL", flush=True)
    model = WhisperModel(model_name, device="cpu", compute_type="int8")
    print("MODEL_LOADED", file=f, flush=True)
    for lang in ["yi", "he"]:
        print(f"\n=== LANGUAGE_HINT {lang} ===", file=f, flush=True)
        segments, info = model.transcribe(
            str(sample),
            task="transcribe",
            language=lang,
            beam_size=5,
            vad_filter=True,
            word_timestamps=False,
        )
        print("detected_language=", info.language, "prob=", info.language_probability, "duration=", info.duration, file=f, flush=True)
        for segment in segments:
            print(f"[{segment.start:.2f} - {segment.end:.2f}] {segment.text}", file=f, flush=True)
print(out)
