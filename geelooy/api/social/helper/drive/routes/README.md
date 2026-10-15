# B"H — Drive Routes (geelooy/api/social/helper/drive/routes/)

HTTP routes for the Drive domain, mounted via `_awtsmoos.drive.js`. 34 files covering entries, actions, browser, credentials, domains, deployments, projects, jobs, sites, and admin.

## Main endpoints (all under `/drive/:aliasId/`)
- Entries: `entries`, `entry/:path*`; actions: `actions/copy|move|purge|restore|trash`, `actions/bootstrap-site-project`.
- Browser: `browser/sessions[/:sessionId[/targets[/:targetId[/cookies|frame|history|input|navigate]]]]`, `browser/jars[/:jarId]`, `browser/fetch`.
- Credentials: `credentials[/:credentialId]`.
- Domains: `domains[/:hostname[/verify|activate|deactivate|hosting-plan]]`.
- Deployments: deployment routes + `deploymentPreviewRoutes`, `jobRoutes` (`jobs[/:jobId[/cancel|retry]]`, `jobs/health`).
- Projects: `projects[/:projectId[/database|hosting]]`, `project`, `projectHostingRoutes`, `projectPlanRoutes`, `projectRegistryRoutes`.
- Sites/hosting: `sites[/:siteId]`, `site`, `siteRoutes`, `siteRuntimeRoutes`, `hosting/infrastructure`.
- Admin/ops: `admin/quota`, `quotaRoutes`, `managerRoutes`, `reconciliationRoutes`, `serviceProvisioningRoutes`, `serviceAliasRoutes`, `publicRoutes`, `streamingRoutes`, `entry*Operation` helpers, `routeSupport`, `entryRouteData/Values`.
