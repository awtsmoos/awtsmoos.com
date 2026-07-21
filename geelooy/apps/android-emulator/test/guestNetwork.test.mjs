//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { NetworkBroker } from "../../../os/networkBroker.js";
import { ProcessManager } from "../../../os/process/processManager.js";
import { runExecutable } from "../../../os/programs/awtsmoos-executable/runtime.js";
import { createGeneratedApk } from "./generatedFixture.mjs";

const NETWORK_SOURCE = `
package com.awtsmoos.network;
import android.app.Activity;
import android.os.Bundle;
import android.widget.TextView;
import java.net.URL;
public class MainActivity extends Activity {
	@Override
	protected void onCreate(Bundle state) {
		super.onCreate(state);
		TextView view = new TextView(this);
		view.setText(new String(new URL("https://example.test/message").openStream().readAllBytes(), "UTF-8"));
		setContentView(view);
	}
}
`;

/**
 * The Awtsmoos creates URL, broker route, response bytes, process testimony, and
 * visible guest text anew. Awtsmoos.com proves networking remains permissioned,
 * bounded, and attributed instead of becoming an invisible host fetch shortcut.
 */
test("guest URL GET is brokered under the originating process", async () => {
	const body = "B\"H network revelation";
	const fixture = await createNetworkFixture(["android.permission.INTERNET"]);
	const manager = new ProcessManager(null);
	const process = manager.spawn({ title: "Android network guest" });
	const broker = new NetworkBroker(manager, {
		fetch: async () => new Response(body, {
			headers: { "content-length": String(new TextEncoder().encode(body).length) },
			status: 200
		})
	});
	const host = createHost();
	const outcome = await runExecutable({
		bytes: fixture.bytes,
		extension: ".apk",
		host,
		networkBroker: broker,
		processId: process.pid
	});
	assert.equal(outcome.result.framework.contentView.text, body);
	const calls = outcome.result.vm.calls.map(call => call.resolvedSignature || call.declaredSignature || call.signature);
	assert.ok(calls.includes("Ljava/net/URL;-><init>(Ljava/lang/String;)V"));
	assert.ok(calls.includes("Ljava/net/URL;->openStream()Ljava/io/InputStream;"));
	const record = manager.get(process.pid).telemetry.network.records[0];
	assert.equal(record.route, "direct");
	assert.equal(record.responseStatus, 200);
	assert.equal(record.bytesReceived, new TextEncoder().encode(body).length);
	assert.equal(host.windows[0].body.text, body);
});

test("guest networking requires INTERNET permission", async () => {
	const fixture = await createNetworkFixture([]);
	const manager = new ProcessManager(null);
	const process = manager.spawn({ title: "Denied Android guest" });
	const broker = new NetworkBroker(manager, {
		fetch: async () => new Response("forbidden bypass")
	});
	const outcome = await runExecutable({
		bytes: fixture.bytes,
		extension: ".apk",
		host: createHost(),
		networkBroker: broker,
		processId: process.pid
	});
	assert.equal(outcome.android.boundary.code, "ANDROID_NETWORK_PERMISSION_DENIED");
	assert.equal(manager.get(process.pid).telemetry.network.records.length, 0);
});

test("guest response allocation obeys the network byte limit", async () => {
	const fixture = await createNetworkFixture(["android.permission.INTERNET"]);
	const manager = new ProcessManager(null);
	const process = manager.spawn({ title: "Bounded Android guest" });
	const broker = new NetworkBroker(manager, {
		fetch: async () => new Response("response exceeds four bytes", {
			headers: { "content-length": "27" }
		})
	});
	const outcome = await runExecutable({
		bytes: fixture.bytes,
		extension: ".apk",
		host: createHost(),
		maximumNetworkResponseBytes: 4,
		networkBroker: broker,
		processId: process.pid
	});
	assert.equal(outcome.android.boundary.code, "ANDROID_NETWORK_RESPONSE_LIMIT");
});

function createNetworkFixture(permissions) {
	return createGeneratedApk({
		minSdkVersion: 33,
		permissions,
		source: NETWORK_SOURCE
	});
}

function createHost() {
	return {
		draw() {},
		openWindow(title, body) {
			(this.windows ||= []).push({ body, title });
		},
		print() {},
		windows: []
	};
}
