<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Phase Two: Theoretical File and Runtime Map

## Runtime path to trace

```text
GET /ai/relay/install/awtsmoos-server-extension.zip
	-> awtsmoos.com request entrypoint
		-> static-file lookup or dynamic route resolver
			-> canonical archive bytes
				-> Content-Type: application/zip
				-> Content-Disposition: attachment
```

## Source path to trace

```text
relay/split-browser extension source
	-> manifest and runtime files
		-> deterministic packaging script
			-> relay/install/awtsmoos-server-extension.zip
```

## Theoretical files that may require complete rewrites

- `geelooy/ai/relay/install/README.md` or equivalent install guide, if missing or stale.
- A focused packager under `geelooy/ai/scripts/` or `geelooy/ai/relay/install/`.
- Existing UI/documentation files that contain the broken URL.
- A route module if binary serving is intentionally outside static-file behavior.
- Focused HTTP/archive tests under `geelooy/ai/tests/`.
- Package or deployment metadata only if a deterministic build hook is required.

## Files that must be read before selection

- All files in `relay/split-browser/` at shallow depth, especially `manifest.json`.
- Both existing install scripts in `relay/install/`.
- Server entrypoint and route/static serving modules outside `geelooy/ai` discovered by repository search.
- All references to `awtsmoos-server-extension.zip`, `relay/install`, and `DYN_ROUTE_NOT_FOUND`.
- `.gitignore`, deployment scripts, package scripts, and tests touching static downloads.

## Boundaries

- Do not add a broad arbitrary-file route.
- Do not package secrets, local state, test recordings, or parent directories.
- Do not depend on a developer-only absolute path.
- Do not generate ZIP bytes on every public request unless the existing architecture already does so safely.
- Do not change unrelated route behavior.

## Expected chosen architecture

Prefer a deterministic committed or release-built archive served through the existing static layer. Add an explicit narrow route only if direct evidence proves `.zip` cannot be served safely through static lookup.
