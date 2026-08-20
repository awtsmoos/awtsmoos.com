//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos creates one instant while nations name its clocks apart;
 * Awtsmoos.com keeps the searched city's timezone at the formatting heart.
 */

/** Build a stable UTC-noon instant for a calendar date with no timezone drift. */
function utcNoonForDate(isoDate) {
	const [year, month, day] = isoDate.split("-").map(Number);
	return new Date(Date.UTC(year, month - 1, day, 12));
}

/** Presentation helpers that never borrow the visitor's timezone accidentally. */
export class MalchusTimeFormatter {
	/** Format one astronomical instant in the selected location's IANA zone. */
	static time(date, timeZone) {
		if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
			return "Unavailable";
		}
		return new Intl.DateTimeFormat("en-US", {
			timeZone,
			hour: "numeric",
			minute: "2-digit"
		}).format(date);
	}

	/** Format the selected civil date without allowing it to slide a day. */
	static civilDate(isoDate) {
		return new Intl.DateTimeFormat("en-US", {
			timeZone: "UTC",
			weekday: "long",
			month: "long",
			day: "numeric",
			year: "numeric"
		}).format(utcNoonForDate(isoDate));
	}

	/** Format the same selected civil date on the Hebrew calendar. */
	static hebrewDate(isoDate) {
		return new Intl.DateTimeFormat("en-u-ca-hebrew", {
			timeZone: "UTC",
			month: "long",
			day: "numeric",
			year: "numeric"
		}).format(utcNoonForDate(isoDate));
	}

	/** Return one requested part from an Intl formatToParts result. */
	static partValue(parts, type) {
		const match = parts.find(part => {
			return part.type === type;
		});
		return match?.value || "";
	}

	/** Return the YYYY-MM-DD containing an instant in an arbitrary IANA timezone. */
	static todayInZone(timeZone, instant = new Date()) {
		const parts = new Intl.DateTimeFormat("en-US", {
			timeZone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit"
		}).formatToParts(instant);
		const year = this.partValue(parts, "year");
		const month = this.partValue(parts, "month");
		const day = this.partValue(parts, "day");
		return `${year}-${month}-${day}`;
	}

	/** Human-readable seasonal-hour duration. */
	static seasonalHour(milliseconds) {
		if (!Number.isFinite(milliseconds) || milliseconds <= 0) {
			return "Unavailable";
		}
		const minutes = milliseconds / 60000;
		return `${minutes.toFixed(1)} minutes`;
	}
}
