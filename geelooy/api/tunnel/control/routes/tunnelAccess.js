// B"H
// Boruch Hashem
// Blessed is He

const { currentIdentity } = require("../core/auth.js");
const { body } = require("../core/request.js");
const { json } = require("../core/respond.js");
const Authorization = require("../core/tunnelSecurity/authorization.js");
const Binding = require("../core/tunnelSecurity/bindingStore.js");
const Grant = require("../core/tunnelSecurity/grantStore.js");
const Id = require("../core/tunnelSecurity/identifiers.js");

/**
 * @file Exposes explicit tunnel grants and device revocation to verified owners.
 * @description
 * The Awtsmoos renews giving and withdrawing without confusion. Awtsmoos.com
 * persists each grant, denies client-selected owners, and closes a revoked device
 * socket immediately so old relay presence cannot masquerade as current authority.
 */

/** Lists owned and received access plus grants created by the owner. */
async function accessList($i) {
	const identity = currentIdentity($i);
	if (!identity.ok) {
		return json($i, denial("not_authenticated"), 401);
	}
	const tunnels = Authorization.accessibleBindings(identity.accountId)
		.map(Authorization.publicAccess);
	return json($i, {
		BH: "B\"H",
		ok: true,
		tunnels,
		grants: Grant.grantsOwnedBy(identity.accountId)
	});
}

/** Creates a scoped grant only from the authenticated owner account. */
async function grantCreate($i) {
	const identity = currentIdentity($i);
	if (!identity.ok) {
		return json($i, denial("not_authenticated"), 401);
	}
	const input = await body($i);
	const grant = Grant.createGrant({
		...input,
		ownerAccountId: identity.accountId
	});
	return grant
		? json($i, { BH: "B\"H", ok: true, grant }, 201)
		: json($i, denial("tunnel_not_found"), 404);
}

/** Revokes one grant and advances its permission version. */
async function grantRevoke($i) {
	const identity = currentIdentity($i);
	if (!identity.ok) {
		return json($i, denial("not_authenticated"), 401);
	}
	const input = await body($i);
	const grant = Grant.revokeGrant(input.grantId, identity.accountId);
	return grant
		? json($i, { BH: "B\"H", ok: true, grant })
		: json($i, denial("grant_not_found"), 404);
}

/** Revokes an owned device binding and severs its active relay socket. */
async function deviceRevoke($i) {
	const identity = currentIdentity($i);
	if (!identity.ok) {
		return json($i, denial("not_authenticated"), 401);
	}
	const input = await body($i);
	const binding = Binding.bindingById(input.tunnelId);
	if (!binding || binding.ownerAccountId !== identity.accountId) {
		return json($i, denial("tunnel_not_found"), 404);
	}
	if (!Binding.revokeBinding(binding.tunnelId, identity.accountId)) {
		return json($i, denial("tunnel_not_found"), 404);
	}
	closeLiveBinding($i, binding);
	return json($i, {
		BH: "B\"H",
		ok: true,
		tunnelId: binding.tunnelId,
		revoked: true
	});
}

/** Removes the authoritative relay key and closes the corresponding socket. */
function closeLiveBinding($i, binding) {
	const key = Id.registryKey(binding.ownerAccountId, binding.tunnelName);
	const client = $i.ws?.tunnels?.get?.(key);
	$i.ws?.tunnels?.delete?.(key);
	$i.ws?.tunnelRegistrations?.delete?.(key);
	if (!client) {
		return;
	}
	try {
		client.send?.({ type: "TUNNEL_REVOKED", tunnelId: binding.tunnelId });
	} catch {}
	const close = () => {
		try {
			if (typeof client.close === "function") client.close(4003, "Device revoked");
			else client.socket?.end?.();
		} catch {
			try { client.socket?.destroy?.(); } catch {}
		}
	};
	const timer = setTimeout(close, 50);
	timer.unref?.();
}

function denial(error) {
	return { BH: "B\"H", ok: false, error };
}

module.exports = {
	accessList,
	deviceRevoke,
	grantCreate,
	grantRevoke
};
