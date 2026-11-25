#B"H — Voice + Piano recording, improved a lot (main piano first)

Owner asked to improve the tranche-6/fix recording a lot. All items real,
wired, tested; no placeholders. Takes are SESSION-only (not persisted to
the local library — stated honestly; stems live in memory per take).

## Done
1. MIX CONTROL — every take keeps BOTH stems (voice buffer + piano tap).
   Voice/Piano sliders (default 100/85) re-render the mix from stems;
   Play, WAV and To Studio all use the chosen balance. New pure module
   modules/recording/voiceMix.js (mixStemChannels) + 5 unit tests.
   STEM PURITY FIX found by the new fixture: the piano tap previously
   captured the shared record stream, which also carries the mic record
   tap — piano-only exports still contained the voice. Piano stem now
   taps masterGain via a take-private MediaStreamDestination.
2. INPUT GAIN + METER — Mic gain slider (0-200%, live via new
   MicCaptureSession.setInputGain/inputGain node feeding all branches).
   Meter zones green/yellow/red/clip from voiceMix.levelZone; CLIP
   indicator latches. 3-second Level Check button: verdicts good /
   too-quiet / too-loud from classifyLevelCheck with peak printed.
3. COUNT-IN + STATE — optional 4-beat count-in (visual numbers + clicks
   at the piano tempo input or 100bpm, countInBeats pure fn). Recording
   state: pulsing red button, elapsed timer, live voice waveform strip
   (level-history canvas), speakers guidance line inline.
4. VOICE POLISH — ✨ Polish Voice renders a COPY via OfflineAudioContext:
   80Hz highpass -> gentle compressor (same node types as the Studio
   effect chain) -> dry + generated-impulse convolver reverb (16% wet).
   Original take untouched; ▶ Polished A/B against ▶ Take; "Export
   polished" checkbox routes WAV/Studio to the polished buffer.
5. MULTIPLE TAKES — Take 1, 2, 3… list, each row play/WAV/Studio/delete,
   click selects (sliders reflect it). Session-only by design this pass.
6. MOBILE/SPEAKERS — all controls >=44px, flex-wrap panel, no hover;
   fixture runs the flow (its runner page is the piano harness page;
   the dedicated 390px real-page runner remains load-sensitive).

## Evidence
- Fixture test/pianoVoiceMixBrowser.html PASS (fake mic 398Hz, piano A2):
  balance voiceOnly micE=0.0075 pianoE=0.0017 (Goertzel leakage, <1/3 ratio
  asserted); pianoOnly micE=0.0000 pianoE=0.0073; flowA micE=0.0057
  pianoE=0.0240; flowB micE=0.0075 pianoE=0.0079; flowC micE=0.0046
  pianoE=0.0091. Fixture timing hardened (polling waits) after load-20
  flakiness; assertions unchanged or ratio-strengthened.
- studioMicRecordBrowser PASS (playing-during, comp=40ms).
- Full suite 386/386 (381 baseline + 5 voiceMix unit tests).
Rollback: git revert <this commit>.
