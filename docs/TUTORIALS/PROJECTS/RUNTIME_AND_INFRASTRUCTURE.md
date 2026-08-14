B"H
Boruch Hashem
Blessed is He

# Runtime and Infrastructure

Runtime/infrastructure boundaries include the dynamic server, persistence machinery, operations roots, and other server-side vessels whose public surface may be indirect or absent.

## Investigate runtime code

1. Start with central architecture/system manuals and the generated project tutorial.
2. Follow source entry files and symbols rather than looking for `index.html`.
3. Trace incoming dependencies to understand who relies on the subsystem.
4. Treat database paths, process boundaries, environment names, and transport protocols as compatibility/security contracts.
5. Use focused server/realtime/data tests before changing behavior.

## Caveats

No public entry is normal for infrastructure. Lexical incoming edges do not enumerate dynamic requires, runtime registration, or process-level coupling. Configuration documentation exposes names and precedence—not secret values.
