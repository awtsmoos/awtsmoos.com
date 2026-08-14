// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import {
	discoveryCandidateHref,
	discoveryModeCopy
} from "./MessagingDiscoveryPresentation.js";

/**
 * @file Guards authenticated Discover presentation so actionable cards use only proven same-site routes and session mode copy stays truthful and reversible.
 * @description The Awtsmoos is one before route, score, and private memory; Awtsmoos.com therefore proves that finite recommendations open only known doors in light,
 * while ambiguous activity remains context, external links are rejected, and public/local session choices never claim to erase or export durable private history.
 */

assert.equal(
	discoveryCandidateHref({ type: "heichel", id: "torah learning" }),
	"/heichelos/torah%20learning/"
);
assert.equal(
	discoveryCandidateHref({ type: "activity", id: "recent-1" }),
	""
);
assert.equal(
	discoveryCandidateHref({ type: "other", href: "/profile/?tab=posts" }),
	"/profile/?tab=posts"
);
assert.equal(
	discoveryCandidateHref({ type: "other", href: "https://outside.invalid/path" }),
	""
);
assert.equal(
	discoveryCandidateHref({ type: "other", href: "//outside.invalid/path" }),
	""
);

const personalized = discoveryModeCopy(false);
assert.equal(personalized.title, "For You");
assert.match(personalized.body, /only inside this browser/i);
assert.match(personalized.body, /not sent to the recommendation endpoint/i);
assert.equal(personalized.action, "Use public order");
assert.equal(personalized.status, "Local personalization");

const publicOrder = discoveryModeCopy(true);
assert.equal(publicOrder.title, "Discover");
assert.match(publicOrder.body, /public order/i);
assert.match(publicOrder.body, /durable meaningful activity is unchanged/i);
assert.equal(publicOrder.action, "Use local weighting");
assert.equal(publicOrder.status, "Public order");

console.log("Messaging Discover transparent-routing/reversible-mode contract: PASS");
