B"H

Goal: restore Tunnel Control styling by reconnecting the new future CSS bundle while preserving legacy live-console and room UI styles that are not present in the new bundle.

Observed:
- index.html links only ./css/app.css.
- css/future/index.css imports the richer new modular CSS.
- Existing css/app.css is small fallback/legacy styling and overlaps exact selectors with future CSS.

Risk:
- Directly importing future CSS into old app.css would create duplicate selector ownership.
- Rewriting index.html is unnecessary because app.css is already the linked entrypoint.
