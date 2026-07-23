<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Discovery Plan

## Goal

Find why long assistant messages produce only a short audio file and correct the Arbor voice payload identifier to `fathom`.

## Evidence to collect

- Current voice catalog labels and payload values.
- Current download action, synthesis request, and response handling.
- Whether the synthesis endpoint truncates by message length, response size, or server-generated segment.
- Whether a text-based speech endpoint already exists that can synthesize chunks.
- Whether audio concatenation utilities or container-specific join logic already exist.
- Existing tests for long text, voice IDs, MIME types, and download filenames.

## Safety boundary

Do not guess the endpoint contract. Trace real code and run a focused browser/service test. Check Git history only if current source leaves the original voice mapping or long-audio strategy ambiguous.
