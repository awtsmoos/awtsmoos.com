#!/usr/bin/env bash
# B"H — Awtsmoos.com verifies the boundaries before release.
set -euo pipefail
cd "$(dirname "$0")/../.."
if [[ -z "${CHROME_BIN:-}" ]]; then
	export CHROME_BIN="$(command -v google-chrome || command -v chromium)"
fi
node --test geelooy/social/test/CanonicalPostRoute.test.mjs
node --test geelooy/social-composer/js/ui/ComposerWorkflow.test.mjs geelooy/social-composer/js/ui/ComposerNavigationSafety.test.mjs
node geelooy/profile/profileRepairContract.test.mjs
node geelooy/profile/profileActionDrawerContract.test.mjs
node geelooy/profile/profileCardHierarchyV4Contract.test.mjs
node geelooy/profile/profileSocialUxV4Contract.test.mjs
node geelooy/social/test/css/isolation-contract.cjs
node geelooy/social/test/css/library-search.cjs
node geelooy/social/test/css/audio-playback.cjs
for suite in schemaParity aliasMemory publicationPlan quickDestination quickDestinationFlow quickRefinement; do
	node "geelooy/social-composer/tests/$suite.test.mjs"
done
node geelooy/social-composer/tests/quickBrowserJourney.test.mjs
node --test geelooy/apps/tunnel/agent/lib/connection-vessel/parentConsumerIngressEvidence.test.cjs
for suite in attachmentStorage cloneSource routes schema service visualizerRoundTrip; do
	node "geelooy/api/social/helper/richSocial/test/$suite.test.js"
done
if [[ "${1:-}" == '--live' ]]; then
	node geelooy/social/test/css/browser-regression.cjs
fi
