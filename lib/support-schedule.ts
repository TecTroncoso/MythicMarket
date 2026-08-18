export type SupportShift = {
  from: string; // "HH:MM" 24h, inclusive
  to: string; // "HH:MM" 24h, exclusive (so 17:00 belongs to the shift starting at 17:00)
  number: string; // international format without "+", e.g. "5491136799182"
  label: string; // short name, e.g. "A"
};

export type OnDutyInfo = {
  number: string;
  label: string | null; // null when closed
  isOpen: boolean;
  shiftName: string | null;
};

export const SUPPORT_TIMEZONE = "America/Argentina/Buenos_Aires";

// Person A: real owner number (5491136799182).
// Person B: fictitious number (5491100000001) — replace with the real one.
export const SUPPORT_SHIFTS: SupportShift[] = [
  { from: "09:00", to: "17:00", number: "5491136799182", label: "A" },
  { from: "17:00", to: "23:00", number: "5491100000001", label: "B" }, // TODO: replace with real number of owner 2
];

// Used when closed (off-hours) or when getOnDuty fails.
export const SUPPORT_FALLBACK_NUMBER = "5491136799182";

export const SUPPORT_PREFILLED_MESSAGE =
  "Hola! Vengo de MythicMarket y necesito ayuda con mi compra.";

// h23 cycle guarantees hour parts are 00-23 (hour12: false alone can emit "24"
// for midnight in some runtimes).
const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  hourCycle: "h23",
  timeZone: SUPPORT_TIMEZONE,
});

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesSinceMidnight(now: Date): number {
  const parts = timeFormatter.formatToParts(now);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

function isInShift(currentMinutes: number, fromMinutes: number, toMinutesValue: number): boolean {
  if (toMinutesValue <= fromMinutes) {
    // Overnight shift (e.g. 23:00-09:00): matches after start OR before end.
    return currentMinutes >= fromMinutes || currentMinutes < toMinutesValue;
  }
  return currentMinutes >= fromMinutes && currentMinutes < toMinutesValue;
}

/**
 * Evaluates the given instant against an arbitrary list of shifts, in
 * SUPPORT_TIMEZONE (NOT the caller's local timezone). First matching shift
 * wins. Returns the fallback number with isOpen: false when nothing matches.
 */
export function getOnDutyInfoForShifts(now: Date, shifts: SupportShift[]): OnDutyInfo {
  const currentMinutes = minutesSinceMidnight(now);

  for (const shift of shifts) {
    if (isInShift(currentMinutes, toMinutes(shift.from), toMinutes(shift.to))) {
      return {
        number: shift.number,
        label: shift.label,
        isOpen: true,
        shiftName: shift.label,
      };
    }
  }

  return { number: SUPPORT_FALLBACK_NUMBER, label: null, isOpen: false, shiftName: null };
}

/**
 * Returns which support person is on duty at the given instant, evaluated in
 * SUPPORT_TIMEZONE. In-shift returns that shift's number (isOpen: true);
 * off-hours returns SUPPORT_FALLBACK_NUMBER (isOpen: false, label: null).
 */
export function getOnDutyInfo(now: Date): OnDutyInfo {
  return getOnDutyInfoForShifts(now, SUPPORT_SHIFTS);
}
