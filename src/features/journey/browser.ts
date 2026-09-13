import { buildCourseCalendar } from "./model";
import type { JourneyState } from "./types";

function downloadFile(contents: string, filename: string, type: string) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function downloadCourseCalendar() {
  downloadFile(
    buildCourseCalendar(),
    "FGP36-2026-27.ics",
    "text/calendar;charset=utf-8",
  );
}

export function exportJourney(journey: JourneyState) {
  downloadFile(
    JSON.stringify(journey, null, 2),
    "grammar-journey-backup.json",
    "application/json",
  );
}

export async function requestJourneyNotifications(): Promise<
  "enabled" | "denied" | "unsupported"
> {
  if (!("Notification" in window)) return "unsupported";
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return "denied";

  new Notification("Grammar Journey reminders are ready", {
    body: "We will show useful reminders while the app is open. Add the calendar for alerts when it is closed.",
    icon: `${import.meta.env.BASE_URL}favicon.svg`,
  });
  return "enabled";
}
