// B"H
// The Awtsmoos preserves catalog metadata at the gate of Awtsmoos.com.
"use strict";

module.exports = Object.freeze({
	"groups": [
		{
			"id": "heichelos",
			"title": "Heichelos",
			"summary": "Heichel records and alias-owned heichel lists."
		},
		{
			"id": "series",
			"title": "Series",
			"summary": "Series reads: single, detailed, and sub-series."
		},
		{
			"id": "posts",
			"title": "Posts",
			"summary": "Post reads plus alias-authorized create, edit, and delete."
		}
	],
	"metadata": {
		"BH": "B\"H",
		"ok": true,
		"name": "Awtsmoos Application API Catalog",
		"version": "1.0.0",
		"scope": "awtsmoos.api",
		"base": "https://awtsmoos.com",
		"callEndpoint": "https://awtsmoos.com/api/tunnel/control/app-api/call",
		"catalogEndpoint": "https://awtsmoos.com/api/tunnel/control/app-api/catalog",
		"howToCall": {
			"auth": "Bearer <redacted> with scope awtsmoos.api (OAuth client_id=external-agent, device flow).",
			"shape": "POST {callEndpoint} with JSON body {\"operation\": \"<operation-id>\", \"params\": {...}, \"query\": {...}, \"body\": {...}}.",
			"identity": "The gateway binds your OAuth identity to the call; write operations additionally require an aliasId you own.",
			"limits": "Responses are bounded; oversized results return a truncation notice instead of silent cuts."
		},
		"operationCount": 12
	}
});
