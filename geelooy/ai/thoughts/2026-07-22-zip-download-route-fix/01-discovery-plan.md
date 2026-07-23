<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Discovery Plan

## Observed failure

The browser is opening an `/ai/relay/install/...` URL and receiving `DYN_ROUTE_NOT_FOUND`. The requested ZIP route is therefore not reaching a real server handler or is pointing at a filename/path that does not exist.

## Evidence to collect

1. Locate every UI link and route string containing `relay/install`, `server-extension`, `.zip`, or ZIP download language.
2. Locate the actual ZIP artifact or the build process that should create it.
3. Trace the request router for `/ai/relay/install/*` and determine whether it serves static files, dynamic install scripts, or redirects.
4. Compare filename, public URL, filesystem directory, and deployment-copy rules.
5. Inspect Git history only if current files do not reveal the intended public path.

## Completion gate

A fix is complete only when the exact public URL returns HTTP 200 with a ZIP-compatible content type and non-empty archive bytes, and the visible installer link points to that verified URL.
