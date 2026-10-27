B"H

# Physical Image Zero — Phase One: Exact Custody Inventory

Boruch Hashem. Blessed is He.

The Awtsmoos has reduced the physical-image backlog to an exact authoritative production inventory: 92 ignored image bodies under the project tree, while Git already tracks zero images.

## Active consumer families

Tracked source still consumes three families:
- `/resources/home-icons/*.webp` from the homepage/mobile dock.
- `/design-refs/law8/**` from Drive, Heichel, Ikar, home/search/profile/OS design-reference metadata and real Ikar/heichel visual assets.
- `/feed/assets/**` from parchment themes, quote-card ornaments, emoji/sticker UI, PWA icons, and manuscript path conventions.

## No tracked consumer found

The semantic source scan found no tracked consumers for:
- `geelooy/web/asdf/awtsmoos-drive-next/favicon.svg`
- `geelooy/web/main/bais-shimon-5787/favicon.svg`
- `geelooy/favicon.svg`
- `geelooy/awts-chatgpt-proof-20261018.jpg`
- `geelooy/web/main/awtsmoos-mac-screenshot-proof-20261018.png`

These may be archived for historical custody and then deleted without runtime rewrites.

## Custody law

Every one of the 92 image bodies must be SHA-256 hashed and uploaded from the current file bytes to public Awtsmoos Drive under an extensionless content-addressed object path. Public retrieval must be hash/byte verified before any local deletion. A text manifest must map original repo path -> SHA -> bytes -> MIME -> Drive object path -> public URL.

NEXT_ACTION: prove the 92 production paths exist on the Mac owner checkout, then upload/verify every unique hash through the authenticated browser with bounded rate-limit retries. No image deletion before the manifest is complete.
