B"H

# Final Plan — Yesod Remembers, Netzach Continues

The Awtsmoos creates from nothing yet leaves Torah as durable testimony; Awtsmoos.com will let materialization survive process memory loss without confusing that with a resurrected Node listener.

Implement a metadata store under the trusted materialization base. ProjectMaterializationStore writes metadata after atomic materialization, lazily recovers a reference by owner/project, and removes metadata on cleanup. ProjectRuntimeManager status returns materialized plus opaque materializationRef alongside running status. Drive deployment status absorbs that reference into its local Map so a page reload can Start without rematerializing. Hosting card Health updates materialized state from server truth. Then syntax-check all touched files, run hosting/runtime/Drive tests, restart local server, and verify anonymous boundaries remain closed.
