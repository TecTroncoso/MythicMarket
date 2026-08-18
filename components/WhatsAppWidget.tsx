"use client";

import { useState } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import {
  SUPPORT_FALLBACK_NUMBER,
  SUPPORT_PREFILLED_MESSAGE,
} from "@/lib/support-schedule";

type OnDutyResponse = {
  number?: string;
  label?: string | null;
  isOpen?: boolean;
};

export function WhatsAppWidget() {
  const [opening, setOpening] = useState(false);

  const handleClick = async () => {
    if (opening) return;
    setOpening(true);

    try {
      let number = SUPPORT_FALLBACK_NUMBER;

      // Graceful degradation: a failing API must never block the contact,
      // so any error keeps the fallback number.
      try {
        const res = await fetch("/api/support/on-duty");
        if (res.ok) {
          const data = (await res.json()) as OnDutyResponse;
          if (data.number) number = data.number;
        }
      } catch {
        // keep fallback
      }

      // Closed for the day? Still open wa.me — the message waits for the next shift.
      window.open(
        `https://wa.me/${number}?text=${encodeURIComponent(SUPPORT_PREFILLED_MESSAGE)}`,
        "_blank",
        "noopener,noreferrer"
      );
    } finally {
      setOpening(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={opening}
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-5 right-5 z-50 bg-[#25D366] hover:bg-[#1fb958] text-white rounded-full shadow-lg p-4 transition-all disabled:opacity-70 disabled:cursor-wait"
    >
      {opening ? (
        <Loader2 className="w-6 h-6 animate-spin" aria-hidden="true" />
      ) : (
        <MessageCircle className="w-6 h-6" aria-hidden="true" />
      )}
    </button>
  );
}