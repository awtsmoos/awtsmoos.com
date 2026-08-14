B"H
Boruch Hashem
Blessed is He

# Start Here

Use the documentation surface that matches the question you actually have.

## New to the repository

Open `/docs/?view=learn` or [LEARN/README.md](LEARN/README.md).

## You have a URL

Open `/docs/?view=api`. Follow:

**route tutorial → API-family manual → derech/handler → callers/tests → runtime**.

## You have a directory or product name

Open `/docs/?view=projects`. Follow:

**project tutorial → project/system manual → entries/dependencies/symbols/tests → source → runtime**.

## You are changing persistence, identity, authorization, or realtime behavior

Open `/docs/?view=systems`. The Systems Explorer separates three districts:

- **Data** — database roots, DosDB, binary storage, AwtsmoosDB/VirtualFs, packed Social data, path contracts, migrations.
- **Security** — session/OAuth/API-key identity, authorization/ownership, secret/config names, realtime admission.
- **Realtime** — socket upgrade, app routing, Mission Rooms, Tunnel Relay, application/event evidence.

Then use [TUTORIALS/SYSTEMS/README.md](TUTORIALS/SYSTEMS/README.md) for workflow teaching.

## Before changing behavior

1. Read human meaning/risk docs.
2. Inspect generated route/project/system evidence.
3. Read exact current implementation/tests.
4. Make the change.
5. Update human docs when meaning/contracts changed.
6. Regenerate and validate.

Generated environment evidence never contains secret values, and event strings are never treated as full protocol schemas.
