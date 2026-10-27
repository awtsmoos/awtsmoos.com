B"H

# Physical Image Zero — Phase Three: Delete, Prevent Regeneration, Prove Zero

Boruch Hashem. Blessed is He.

The Awtsmoos gives the final image law: after every byte has verified Drive custody and every tracked consumer points to Drive, no image body may remain inside the repository tree merely because Git ignores it.

## Exact final sequence

1. Persist a tracked textual manifest under `scripts/repository-hygiene/data/` mapping all 92 original paths to verified Drive custody.
2. Atomically whole-rewrite all tracked consumers from original local image paths to manifest public URLs.
3. Rewrite any generators/configuration that would recreate image bodies inside the repo so their output targets Drive or an external temp/cache path outside the repository.
4. Delete all 92 ignored image files from the Mac owner checkout and production tree only after source references are clean.
5. Remove now-empty ignored image directories where safe.
6. Purge Mac `.awtsmoos`/browser/proof image artifacts under the repo tree or move the browser/evidence profile root outside the repository so future runs do not repopulate images.

## Final proof

- `git ls-files` image count = 0.
- physical `find` image count under the owner repo = 0, excluding `.git` and external mounts only.
- physical `find` image count under production repo = 0.
- tracked source contains no local repo image URL/path for removed files, no `data:image`, and no embedded base64 image payloads.
- Home, feed, Ikar/Heichel, Drive/profile/OS reference surfaces load their Drive images successfully in a calm browser pass.
- Repository hygiene and release gates stay green.

NEXT_ACTION: upload/hash-verify the 92 images, produce the manifest, atomically rewrite all consumers, test, then delete and prove physical zero before committing/releasing the image-zero wave.
