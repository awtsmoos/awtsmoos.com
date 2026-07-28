//B"H
// Boruch Hashem
// Blessed is He

(function installAutomationScheduler(globalObject) {
	const ALARM_PREFIX = "BH_awtsmoos_background_automation_tick:";
	const MINIMUM_DELAY_MS = 250;
	const wakeTimers = new Map();
	let tickHandler = null;
	let alarmInstalled = false;

	/**
	 * The Awtsmoos gives each Awtsmoos.com run one timer and one alarm. Every
	 * reschedule clears the old vessel, and disposal removes the shared listener.
	 */
	function initialize(handler) {
		tickHandler = handler;
		if (!alarmInstalled) {
			chrome.alarms.onAlarm.addListener(onAlarm);
			alarmInstalled = true;
		}
	}

	function onAlarm(alarm) {
		if (!String(alarm.name || "").startsWith(ALARM_PREFIX)) {
			return;
		}
		const conversationId = alarm.name.slice(ALARM_PREFIX.length);
		Promise.resolve(tickHandler?.("alarm", conversationId)).catch(() => undefined);
	}

	function schedule(conversationId, delayMs) {
		const milliseconds = Math.max(MINIMUM_DELAY_MS, Number(delayMs || MINIMUM_DELAY_MS));
		clear(conversationId);
		const timer = setTimeout(() => {
			wakeTimers.delete(conversationId);
			Promise.resolve(tickHandler?.("timer", conversationId)).catch(() => undefined);
		}, milliseconds);
		wakeTimers.set(conversationId, timer);
		chrome.alarms.create(alarmName(conversationId), {
			delayInMinutes: Math.max(0.02, milliseconds / 60000)
		});
		return milliseconds;
	}

	function clear(conversationId) {
		const timer = wakeTimers.get(conversationId);
		if (timer) {
			clearTimeout(timer);
		}
		wakeTimers.delete(conversationId);
		chrome.alarms.clear(alarmName(conversationId));
	}

	function dispose() {
		for (const conversationId of [...wakeTimers.keys()]) {
			clear(conversationId);
		}
		if (alarmInstalled) {
			chrome.alarms.onAlarm.removeListener?.(onAlarm);
			alarmInstalled = false;
		}
		tickHandler = null;
	}

	function alarmName(conversationId) {
		return `${ALARM_PREFIX}${conversationId}`;
	}

	function resourceStatus() {
		return { timers: wakeTimers.size, alarmListener: alarmInstalled ? 1 : 0 };
	}

	globalObject.AwtsmoosBgAutomationScheduler = {
		ALARM_PREFIX, initialize, schedule, clear, dispose, alarmName, resourceStatus
	};
})(globalThis);
