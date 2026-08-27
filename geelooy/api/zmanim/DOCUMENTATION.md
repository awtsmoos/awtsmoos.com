B"H
Boruch Hashem
Blessed is He

# Zmanim Public API

The Awtsmoos renews every measured instant while Awtsmoos.com exposes one shared read-only calculation engine to JSON, comparison, range, search, methodology, and embed routes.

## Entry point

`_awtsmoos.derech.js` mounts the canonical `/api/zmanim` route family. `README.md` documents request parameters and response shape; `lib/` contains calculation, presentation, metadata, range, location, embed, and optional USNO comparison services; `test/` carries route/calculation witnesses.

## Contract

Daily and comparison calculations are read-only. Latitude/longitude and requested date/timezone/opinion are explicit inputs. The compatibility alias `/api/zmanimms` reaches the same calculation model. Browser, API, and embed clients should not invent parallel zmanim calculations.
