import { describe, expect, test } from 'vitest'
import { DateTime } from 'luxon'

import { layoutWeek, weekStartFor } from './layout'

// Monday, 2026-10-19, start of day (local time).
const weekStart = DateTime.local(2026, 10, 19)

describe('layoutWeek', () => {
  test('an empty week yields seven Monday-to-Sunday day-columns with no blocks', () => {
    const days = layoutWeek([], weekStart)

    expect(days).toHaveLength(7)
    expect(days.map(d => d.date.toISODate())).toEqual([
      '2026-10-19', // Mon
      '2026-10-20',
      '2026-10-21',
      '2026-10-22',
      '2026-10-23',
      '2026-10-24',
      '2026-10-25', // Sun
    ])
    expect(days.every(d => d.blocks.length === 0)).toBe(true)
  })

  test('a same-day finished entry becomes a block in its day-column, placed by start and sized by Duration', () => {
    const entry = {
      id: 'e1',
      description: 'Writing the calendar spec',
      // Wednesday of the target week, 09:30 - 11:00 local time.
      start: new Date(2026, 9, 21, 9, 30),
      stop: new Date(2026, 9, 21, 11, 0),
    }

    const days = layoutWeek([entry], weekStart)

    const wednesday = days[2]
    expect(wednesday.blocks).toHaveLength(1)
    expect(wednesday.blocks[0]).toMatchObject({
      entryId: 'e1',
      description: 'Writing the calendar spec',
      topMinutes: 9 * 60 + 30,
      heightMinutes: 90,
    })

    const otherDays = days.filter((_, i) => i !== 2)
    expect(otherDays.every(d => d.blocks.length === 0)).toBe(true)
  })

  test('the Running entry (no stop) produces no block in this read-only increment', () => {
    const running = {
      id: 'e-running',
      description: 'Still hacking',
      start: new Date(2026, 9, 21, 9, 30),
      stop: null,
    }

    const days = layoutWeek([running], weekStart)

    expect(days.every(d => d.blocks.length === 0)).toBe(true)
  })

  test('a finished entry that crosses midnight produces no block yet (split arrives in a later increment)', () => {
    const overnight = {
      id: 'e-overnight',
      description: 'Late night session',
      start: new Date(2026, 9, 21, 23, 0),
      stop: new Date(2026, 9, 22, 1, 0),
    }

    const days = layoutWeek([overnight], weekStart)

    expect(days.every(d => d.blocks.length === 0)).toBe(true)
  })

  test('an entry from another week produces no block', () => {
    const lastWeek = {
      id: 'e-old',
      description: 'Last week work',
      start: new Date(2026, 9, 14, 9, 0),
      stop: new Date(2026, 9, 14, 10, 0),
    }

    const days = layoutWeek([lastWeek], weekStart)

    expect(days.every(d => d.blocks.length === 0)).toBe(true)
  })
})

describe('weekStartFor', () => {
  test('returns the Monday start-of-day of the week containing the given moment', () => {
    // Wednesday, 2026-10-21, mid-afternoon.
    const wednesday = DateTime.local(2026, 10, 21, 15, 42)
    expect(weekStartFor(wednesday).toISO()).toBe(DateTime.local(2026, 10, 19).toISO())
  })

  test('a Sunday belongs to the week of the preceding Monday', () => {
    const sunday = DateTime.local(2026, 10, 25, 23, 59)
    expect(weekStartFor(sunday).toISO()).toBe(DateTime.local(2026, 10, 19).toISO())
  })
})
