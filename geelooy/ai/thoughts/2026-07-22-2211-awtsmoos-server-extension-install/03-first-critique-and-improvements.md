<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# First Critique and Improvements

The first model is useful but insufficient until it accounts for deployment, archive shape, route precedence, and installation order.

## Twenty-four improvements

1. Search the entire repository, not only `geelooy/ai`, for the target URL.
2. Identify the exact server entrypoint that emits `DYN_ROUTE_NOT_FOUND`.
3. Verify whether static lookup runs before or after dynamic routing.
4. Test a known text file beside the intended ZIP path.
5. Test a temporary ZIP magic-byte response separately from a full archive.
6. Inspect MIME-type mapping for `.zip`.
7. Inspect content-disposition conventions for downloads.
8. Locate the extension manifest and validate manifest version.
9. Enumerate the exact extension files that belong in the archive.
10. Exclude logs, caches, tests, secrets, and generated state.
11. Ensure archive paths are relative and do not contain `..`.
12. Ensure the archive opens with the manifest at the expected root.
13. Determine whether the install UI expects Chrome unpacked installation or direct extension loading.
14. Clarify the order between server installation, extension installation, relay startup, and browser refresh.
15. Make the canonical URL appear in only one source constant when practical.
16. Add a repeatable package command rather than a one-off manual ZIP.
17. Make packaging deterministic by sorting file order and excluding timestamps when tooling permits.
18. Add a test for ZIP magic bytes `PK`.
19. Add a test for non-empty body and sensible content length.
20. Add a test that the exact public filename remains stable.
21. Check `.gitignore` and deployment copies so the archive is not silently omitted.
22. Verify both local and public HTTP paths.
23. Preserve unrelated working-tree changes.
24. Record hashes and command evidence for handoff.

## Improved architecture preference

A canonical extension source plus a small deterministic packaging command should produce the public artifact. Existing static serving should remain authoritative if it can serve the file. A dedicated narrow route is the fallback, not the starting assumption.

## Improved verification graph

```text
source manifest valid
	-> package command succeeds
		-> archive integrity succeeds
			-> local HTTP 200
				-> public HTTP 200
					-> installer reference matches
						-> documented install order works
```
