//B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Register offline Torah within its lawful Heichelos scope.
 * The Awtsmoos gives each word its own garment of light, even when the page
 * has finished loading before the reader's dynamic script arrives.
 * B"H batch 52 — a new worker installs in the background and claims the
 * page, but the OPEN page keeps running the OLD code until it reloads:
 * three batches "did not show" because the page that triggered the
 * update never reloaded into the new bundle. Reload exactly once when
 * a NEW worker takes control of a page that already had one (an
 * update, not a first install — a first install needs no reload, the
 * page just loaded fresh). Also check for an update when the tab
 * becomes visible again and on a back/forward-cache restore, so a tab
 * left open across a deploy picks up the new worker when the reader
 * returns instead of serving the old bundle indefinitely.
 * B"H batch 52 — ONE instance: the template and postLogic.js used to
 * import this file under two different pins (reader-worker-20261028-2
 * and reader-instant-001), so two module instances ran and the
 * controllerchange listener below would have attached twice. Both
 * imports carry the content hash now, so both resolve to this one
 * module record.
 */
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
	const registerHeichelWorker = () => {
		if (window.__awtsmoosHeichelWorkerRegistrationStarted) return;
		window.__awtsmoosHeichelWorkerRegistrationStarted = true;
		navigator.serviceWorker.register('/heichelos/heichel-sw.js?v=reader-root-sw-20261028-1', {
			scope: '/heichelos/'
		}).then(registration => registration.update()).catch(() => {
			window.__awtsmoosHeichelWorkerRegistrationStarted = false;
			// Offline caching may fail without affecting reading or navigation.
		});
	};
	/* B"H batch 52 — reload once when a NEW worker takes control.
	   hadController distinguishes an update (a worker already
	   controlled this page — reload into the new code) from a first
	   install (no controller yet — the page just loaded fresh, no
	   reload). The flag stops a second reload in this page lifetime;
	   controllerchange fires once per worker change, so there is no
	   loop. The URL (with ?section= / #sec-) is preserved by the
	   reload, so the reader returns to the same passage. */
	let __awtsmoosSwReloaded = false;
	const __awtsmoosHadController = !!navigator.serviceWorker.controller;
	navigator.serviceWorker.addEventListener('controllerchange', () => {
		if (__awtsmoosSwReloaded || !__awtsmoosHadController) return;
		__awtsmoosSwReloaded = true;
		try { window.location.reload(); } catch (_) {}
	});
	/* B"H batch 52 — a tab left open across a deploy must check for
	   the new worker when the reader returns to it (and on a
	   back/forward-cache restore), not only on a fresh load. */
	const __awtsmoosCheckWorkerUpdate = () => {
		try {
			navigator.serviceWorker.getRegistration().then((reg) => {
				if (reg) reg.update();
			}).catch(() => {});
		} catch (_) {}
	};
	document.addEventListener('visibilitychange', () => {
		if (!document.hidden) __awtsmoosCheckWorkerUpdate();
	});
	window.addEventListener('pageshow', (event) => {
		if (event && event.persisted) __awtsmoosCheckWorkerUpdate();
	});
	if (document.readyState === 'complete') {
		registerHeichelWorker();
	} else {
		window.addEventListener('load', registerHeichelWorker, { once: true });
	}
}
