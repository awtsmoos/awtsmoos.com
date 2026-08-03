// B"H

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const deploy = fs.readFileSync(path.join(__dirname, "immutable-deploy.sh"), "utf8");
const entry = fs.readFileSync(path.join(__dirname, "remote-deploy-entry.sh"), "utf8");
const unit = fs.readFileSync(
	path.join(root, "ops/systemd/awtsmoos-immutable.conf"),
	"utf8"
);
const timer = fs.readFileSync(
	path.join(root, "ops/systemd/awtsmoos-health-watchdog.timer"),
	"utf8"
);

assert.match(deploy, /git -C "\$repo" archive "\$full_commit"/);
assert.match(deploy, /diff --no-renames --name-only/);
assert.match(deploy, /AWTSMOOS_PRODUCTION_ALLOW_LEGACY_PREDECESSOR/);
assert.match(deploy, /\^awtsmoos-local-\[0-9a-f\]\{64\}\$/);
assert.match(deploy, /\^awtsmoos-hotfix-/);
assert.match(deploy, /legacy_name_allowed/);
assert.match(deploy, /migrating audited legacy predecessor through a clean Git archive/);
assert.match(deploy, /mkdir "\$stage"/);
assert.match(deploy, /node --check "\$previous\/index\.js"/);
assert.match(deploy, /\[ ! -L "\$previous\/users" \]/);
assert.match(deploy, /AWTSMOOS_PRODUCTION_DATA_DIR/);
assert.match(deploy, /ln -s "\$persistent_data" "\$stage\/geelooy\/\.data"/);
assert.match(deploy, /ln -sfn "\$previous" "\$current"/);
assert.match(deploy, /systemctl enable --now awtsmoos-health-watchdog\.timer/);
assert.match(deploy, /ensure-nginx-websocket-timeouts\.sh/);
assert.match(entry, /git -C "\$repo" fetch --prune origin main/);
assert.match(entry, /git -C "\$repo" show "\$commit:scripts\/production\/immutable-deploy\.sh"/);
assert.match(unit, /--max-http-header-size=131072/);
assert.doesNotMatch(unit, /5368709120/);
assert.match(timer, /OnUnitActiveSec=30s/);

console.log(JSON.stringify({
	ok: true,
	suite: "immutable-production-deploy-contract",
	dirtyCheckoutIndependent: true,
	atomicReleaseSwitch: true,
	healthRollback: true,
	durableCredentialStore: true,
	eventLoopWatchdog: true,
	durableWebsocketProxy: true,
	boundedHeaders: true
}, null, 2));
