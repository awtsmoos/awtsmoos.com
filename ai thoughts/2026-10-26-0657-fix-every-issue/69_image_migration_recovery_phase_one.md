B"H

# Image Migration Recovery — Phase One: Reject the Corrupted Working Wave

Boruch Hashem. Blessed is He.

The first tracked-consumer migration completed its atomic writes but its own stale-reference output exposed a transformer defect: sequential substitutions reprocessed text inserted by earlier substitutions, producing nested Drive URLs such as repeated `repo-image-mirror/https://awtsmoos.com/...` fragments.

## Safety state

- Nothing from the corrupted source wave has been committed or deployed.
- Immutable content custody remains independently verified 92/92.
- Stable application URLs remain independently verified 92/92.
- The pristine tracked source for every affected consumer remains available at current `HEAD` through Git object storage.

## Recovery law

Do not patch corrupted working files. Reconstruct every affected consumer from `git show HEAD:<path>` and apply exactly one migration transform to pristine source. Then atomically replace the complete working file.

The permanent manifest may also be regenerated from the verified 92-entry source metadata so no corrupted source text can influence custody metadata.

NEXT_ACTION: define a single-pass path matcher and explicit dynamic-consumer transforms that cannot reprocess inserted Drive URLs.
