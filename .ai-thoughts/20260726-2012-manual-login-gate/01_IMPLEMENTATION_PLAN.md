B"H

# Manual Login Gate Implementation Plan

## Goal
Provide one command that opens the dedicated visible Chrome profile, lets the operator sign in manually, detects the authenticated session without DOM interaction, closes Chrome immediately, and launches the automated verification sequence.

## Boundaries
- No clicks, typing, selectors, composer access, or DOM evaluation by automation.
- Authentication is performed only by the human in normal visible Chrome.
- Detection uses browser-cookie synchronization plus the existing redacted session verdict.
- Actual strict chat remains fail-closed when upstream normal enforcement is required.
- No token, cookie value, prompt, upstream identifier, or stack appears in logs.
