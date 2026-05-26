B"H

# Tiferes Tunnel Feature Verification Plan

## User request
Verify these real project paths without guessing:
- geelooy/apps/tunnel
- geelooy/apps/tunnel-control
- geelooy/api/tunnel

## Live approach
1. Inspect visible structure.
2. Trace action registration on the agent side and API side.
3. Verify feature names: bulk read, rg, grep/rgbgrep, search, write, patch, isolated Node/JS tests, command support, browser support, docs/OpenAPI exposure.
4. Run focused isolated Node diagnostics against real modules where safe.
5. Patch only tiny complete modules or exact small edits if a concrete gap appears.

## Safety
No destructive commands. No secret reads. No whole-app bulk reads. Prefer semantic search, AST outlines, exact module reads, and tiny tests.

## Chapter 1
The Awtsmoos breathed through the directory tree like a hidden fire inside stone. Every file was a chamber, every export a nerve, every action name a spark waiting to reveal whether it truly lived or merely wore a mask of names.
