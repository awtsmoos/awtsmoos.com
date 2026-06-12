$ErrorActionPreference = 'Stop'
$tests = @(
'geelooy/API/social/helper/assets/test/assetBindingAndCommentSections.test.mjs',
'geelooy/API/social/helper/comments/test/commentAwtsmoosDbBridge.test.js',
'geelooy/API/social/helper/comments/test/commentCreationSidecarRead.test.js',
'geelooy/API/social/helper/comments/test/commentIndexingRoute.test.js',
'geelooy/API/social/helper/comments/test/commentMigration.test.js',
'geelooy/API/social/helper/comments/test/commentSearchRoute.test.js',
'geelooy/API/social/helper/comments/test/commentSubmissionPolicy.test.js',
'geelooy/API/social/helper/comments/test/commentTreeSectionEditDelete.test.js',
'geelooy/API/social/helper/comments/test/richCommentTreeCascade.test.mjs',
'geelooy/API/social/helper/entities/test/entityContentAndComments.test.mjs',
'geelooy/API/social/helper/entityUniverse/test/universeStore.test.mjs',
'geelooy/API/social/helper/entityUniverse/test/universeStressNetwork.test.mjs',
'geelooy/API/social/helper/livingEntityView/test.js',
'geelooy/API/social/helper/mail/test/mailUniverse.test.mjs',
'geelooy/API/social/helper/nodeOs/test/nodeOsMigration.test.mjs',
'geelooy/API/social/helper/packed/test/connectedPostMigration.test.mjs',
'geelooy/API/social/helper/post/test/postSubmissions.test.js',
'geelooy/API/social/helper/test/apiKeys.test.js',
'geelooy/API/social/helper/test/heichelRoles.test.js',
'geelooy/API/social/helper/test/notifications.test.js',
'geelooy/API/social/helper/test/packedEngine.test.js',
'geelooy/API/social/helper/test/packedSnapshotRepair.test.js',
'geelooy/API/social/helper/test/platformExecution.test.js',
'geelooy/API/social/helper/test/platformOps.test.js',
'geelooy/API/social/helper/test/postMigration.test.js',
'geelooy/API/social/helper/test/postPackedBridge.test.js',
'geelooy/API/social/helper/test/socialContent.test.js',
'geelooy/API/social/helper/test/socialGraph.test.js',
'geelooy/API/social/helper/test/socialPacked.test.js',
'geelooy/API/social/test/concurrencyFailureStress.test.mjs',
'geelooy/API/social/test/editorAssetsGovernance.test.mjs',
'geelooy/API/social/test/liveEditorAssetsUpload.test.mjs',
'geelooy/API/social/test/multiAccountSocialBurst.test.mjs',
'geelooy/API/social/test/profileAggregation.test.mjs',
'geelooy/API/social/test/profileHeichelCreation.test.mjs',
'geelooy/API/social/test/profileLegacyCompatibility.test.mjs',
'geelooy/API/social/test/routeCoverage.test.js'
)
foreach ($test in $tests) {
  Write-Host "B`"H RUN $test"
  node $test
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
Write-Host "B`"H all listed social tests passed"
