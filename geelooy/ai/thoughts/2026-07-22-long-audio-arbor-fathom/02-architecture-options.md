<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Architecture Options

## Option A: Keep message-ID synthesis

Use the current endpoint once. This is smallest but cannot fix server-side truncation if the endpoint only emits a bounded segment.

## Option B: Chunk text and synthesize each chunk

Split the full assistant text at sentence boundaries, synthesize each piece through a text-capable endpoint, and join the returned audio. This is strongest when such an endpoint exists.

## Option C: Download numbered audio parts

When safe concatenation is unavailable, synthesize each text chunk and download ordered files. This preserves the complete text but gives a poorer mobile experience.

## Option D: Build a playlist package

Create a manifest or archive containing ordered audio parts. This avoids invalid byte concatenation but is less convenient on mobile.

## Preferred decision rule

Prefer one playable file only when the selected format has a verified concatenation strategy. Otherwise prefer explicit numbered parts over a deceptively truncated file.
