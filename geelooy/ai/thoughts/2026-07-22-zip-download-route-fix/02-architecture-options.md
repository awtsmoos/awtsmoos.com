<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Architecture Options

## Option A: Correct a stale href

Point the installer UI at an already deployed ZIP artifact. This is preferred when the archive exists and the server already exposes a stable static directory.

## Option B: Add a dedicated download route

Create an explicit route that resolves the canonical archive path, validates it remains inside the allowed installer directory, and streams it with ZIP headers. This is preferred when generic dynamic routing intentionally excludes binary artifacts.

## Option C: Generate the archive on demand

Build a ZIP from the extension source at request time. This avoids stale archives but adds runtime CPU, complexity, and deployment dependencies.

## Option D: Build the ZIP during release

Keep a canonical source folder and create the public archive in a deterministic build/release step. This is the strongest long-term path when deployment can guarantee the artifact.

## Selection rule

Use the smallest architecture that produces a verified public URL without bypassing route security. Preserve existing installer names when possible, but make one canonical path authoritative.
