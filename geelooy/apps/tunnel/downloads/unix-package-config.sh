#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# B"H
# Candidate identity is created outside the live runtime. Existing configuration
# remains the preferred vessel; a fresh one receives explicit conservative values.
create_candidate_config() {
	local candidate="$1"
	local config_path="$candidate/config.json"

	if [ -f "$ROOT/config.json" ]; then
		cp -p "$ROOT/config.json" "$config_path"
		return 0
	fi

	node - "$config_path" <<'NODE'
const fs = require("node:fs");
const file = process.argv[2];
const random = Math.floor(Math.random() * 90000) + 10000;
const config = {
	relay: process.env.AWTSMOOS_RELAY || "wss://awtsmoos.com",
	tunnelName: process.env.AWTSMOOS_TUNNEL_NAME ||
		`awt-${process.env.USER || "user"}-${random}`,
	local: process.env.AWTSMOOS_LOCAL || "http://localhost:3000",
	root: process.env.AWTSMOOS_PROJECT_ROOT || process.cwd(),
	allowWrite: true,
	allowSecrets: false,
	enableLocalHttpProxy: true,
	localApi: {
		enabled: true,
		host: "127.0.0.1",
		port: Number(process.env.AWTSMOOS_LOCAL_API_PORT || 3977)
	}
};
fs.writeFileSync(file, `${JSON.stringify(config, null, 2)}\n`);
NODE
}
