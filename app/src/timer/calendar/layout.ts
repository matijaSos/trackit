import { DateTime } from 'luxon'

// Pure layout module for the Calendar view: turns Time Entries plus a target
// week into per-day positioned blocks. No React, DB, or browser dependencies.

export type LayoutEntry = {
  id: string
  description: string
  start: Date
  stop: Date | null
}

export type CalendarBlock = {
  entryId: string
  description: string
  // Vertical position within the day-column, in minutes from midnight.
  topMinutes: number
  heightMinutes: number
}

export type CalendarDay = {
  date: DateTime // Start of the day, local time.
  blocks: CalendarBlock[]
}

// The week is Monday-anchored (luxon's ISO default).
export function weekStartFor(moment: DateTime): DateTime {
  return moment.startOf('week')
}

export function layoutWeek(entries: LayoutEntry[], weekStart: DateTime): CalendarDay[] {
  const days: CalendarDay[] = Array.from({ length: 7 }, (_, i) => ({
    date: weekStart.plus({ days: i }),
    blocks: [],
  }))

  for (const entry of entries) {
    if (entry.stop === null) continue

    const start = DateTime.fromJSDate(entry.start)
    const stop = DateTime.fromJSDate(entry.stop)

    // Entries that cross midnight are skipped until a later increment splits
    // them into per-day segments.
    if (!stop.hasSame(start, 'day')) continue

    const dayIndex = days.findIndex(d => start.hasSame(d.date, 'day'))
    if (dayIndex === -1) continue

    const dayStart = days[dayIndex].date
    days[dayIndex].blocks.push({
      entryId: entry.id,
      description: entry.description,
      topMinutes: start.diff(dayStart).as('minutes'),
      heightMinutes: stop.diff(start).as('minutes'),
    })
  }

  for (const day of days) {
    day.blocks.sort((b1, b2) => b1.topMinutes - b2.topMinutes)
  }

  return days
}
