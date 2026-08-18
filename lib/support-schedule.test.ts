import { describe, it, expect } from "vitest";
import {
  SUPPORT_FALLBACK_NUMBER,
  getOnDutyInfo,
  getOnDutyInfoForShifts,
} from "@/lib/support-schedule";

// Buenos Aires is UTC-3 year-round (no DST), so AR wall time = UTC - 3h:
// 13:00Z = 10:00 AR, 19:59Z = 16:59 AR, 20:00Z = 17:00 AR, 23:00Z = 20:00 AR,
// 05:00Z = 02:00 AR, 03:30Z = 00:30 AR, 11:00Z = 08:00 AR, 15:00Z = 12:00 AR,
// 12:00Z = 09:00 AR.

describe("getOnDutyInfo", () => {
  it("returns person A during the morning shift (10:00 AR)", () => {
    const info = getOnDutyInfo(new Date("2026-08-18T13:00:00.000Z"));
    expect(info).toEqual({
      number: "5491136799182",
      label: "A",
      isOpen: true,
      shiftName: "A",
    });
  });

  it("returns person B during the evening shift (20:00 AR)", () => {
    const info = getOnDutyInfo(new Date("2026-08-18T23:00:00.000Z"));
    expect(info).toEqual({
      number: "5491100000001",
      label: "B",
      isOpen: true,
      shiftName: "B",
    });
  });

  it("boundary: exactly 17:00 AR belongs to B (to is exclusive)", () => {
    const atStartOfB = getOnDutyInfo(new Date("2026-08-18T20:00:00.000Z"));
    expect(atStartOfB.label).toBe("B");

    // One minute earlier is still A (from is inclusive).
    const justBeforeB = getOnDutyInfo(new Date("2026-08-18T19:59:00.000Z"));
    expect(justBeforeB.label).toBe("A");
  });

  it("off-hours returns the fallback number with isOpen false (02:00 AR)", () => {
    const info = getOnDutyInfo(new Date("2026-08-18T05:00:00.000Z"));
    expect(info).toEqual({
      number: SUPPORT_FALLBACK_NUMBER,
      label: null,
      isOpen: false,
      shiftName: null,
    });
  });

  it("evaluates in SUPPORT_TIMEZONE, not the caller's UTC wall time", () => {
    // 20:00Z is 17:00 in Buenos Aires (start of shift B). If the function
    // used the caller's UTC wall time, 20:00 would be off-hours and the
    // result would be the fallback with isOpen false.
    const info = getOnDutyInfo(new Date("2026-08-18T20:00:00.000Z"));
    expect(info.isOpen).toBe(true);
    expect(info.number).toBe("5491100000001");
  });
});

describe("getOnDutyInfoForShifts (overnight shifts)", () => {
  const overnightShift = [
    { from: "23:00", to: "09:00", number: "5491136799999", label: "N" },
  ];

  it("matches just after midnight (00:30 AR)", () => {
    const info = getOnDutyInfoForShifts(new Date("2026-08-18T03:30:00.000Z"), overnightShift);
    expect(info.isOpen).toBe(true);
    expect(info.label).toBe("N");
  });

  it("matches before the shift end (08:00 AR)", () => {
    const info = getOnDutyInfoForShifts(new Date("2026-08-18T11:00:00.000Z"), overnightShift);
    expect(info.isOpen).toBe(true);
    expect(info.label).toBe("N");
  });

  it("does not match outside the overnight window (12:00 AR)", () => {
    const info = getOnDutyInfoForShifts(new Date("2026-08-18T15:00:00.000Z"), overnightShift);
    expect(info.isOpen).toBe(false);
    expect(info.number).toBe(SUPPORT_FALLBACK_NUMBER);
  });

  it("does not match exactly at the exclusive end (09:00 AR)", () => {
    const info = getOnDutyInfoForShifts(new Date("2026-08-18T12:00:00.000Z"), overnightShift);
    expect(info.isOpen).toBe(false);
  });
});