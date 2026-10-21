import { useMemo } from 'react'

import { type TimeEntry } from 'wasp/entities'
import { DateTime } from 'luxon'

import { layoutWeek, weekStartFor, type CalendarDay } from './layout'

const PX_PER_HOUR = 48
const PX_PER_MINUTE = PX_PER_HOUR / 60
const DAY_HEIGHT_PX = 24 * PX_PER_HOUR

export function CalendarView({ timeEntries }: { timeEntries: TimeEntry[] }) {
  const weekStart = weekStartFor(DateTime.now())
  const days = useMemo(
    () => layoutWeek(timeEntries, weekStart),
    [timeEntries, weekStart.toMillis()]
  )

  return (
    <div
      className={`
        bg-card text-card-foreground
        shadow-[0_1px_3px_0_rgba(0,0,0,0.08)]
      `}
    >
      {/* Day headers */}
      <div className='grid grid-cols-[3.5rem_repeat(7,1fr)] border-b'>
        <div /> {/* Spacer above the hour ruler */}
        {days.map(day => (
          <div
            key={day.date.toISODate()}
            className='py-2 text-center text-sm font-semibold border-l'
          >
            {day.date.toLocaleString({ weekday: 'short', day: 'numeric' })}
          </div>
        ))}
      </div>

      {/* Hour ruler + day columns */}
      <div className='grid grid-cols-[3.5rem_repeat(7,1fr)]'>
        <HourRuler />
        {days.map(day => (
          <DayColumn day={day} key={day.date.toISODate()} />
        ))}
      </div>
    </div>
  )
}

function HourRuler() {
  return (
    <div style={{ height: DAY_HEIGHT_PX }} className='relative'>
      {Array.from({ length: 24 }, (_, hour) => (
        <div
          key={hour}
          style={{ top: hour * PX_PER_HOUR }}
          className={`
            absolute right-1 -translate-y-1/2
            text-xs text-muted-foreground tabular-nums
          `}
        >
          {hour > 0 && DateTime.fromObject({ hour }).toFormat('HH:mm')}
        </div>
      ))}
    </div>
  )
}

function DayColumn({ day }: { day: CalendarDay }) {
  return (
    <div style={{ height: DAY_HEIGHT_PX }} className='relative border-l'>
      {/* Hour gridlines */}
      {Array.from({ length: 23 }, (_, i) => (
        <div
          key={i}
          style={{ top: (i + 1) * PX_PER_HOUR }}
          className='absolute inset-x-0 border-t border-border/60'
        />
      ))}

      {/* Entry blocks */}
      {day.blocks.map(block => (
        <div
          key={block.entryId}
          style={{
            top: block.topMinutes * PX_PER_MINUTE,
            height: block.heightMinutes * PX_PER_MINUTE,
          }}
          className={`
            absolute inset-x-0.5 overflow-hidden
            rounded-sm px-1.5 py-0.5
            bg-yellow-500/20 border-l-2 border-yellow-500
            text-xs
          `}
        >
          {block.description.length > 0 ? (
            <span>{block.description}</span>
          ) : (
            <span className='text-muted-foreground italic'>No description</span>
          )}
        </div>
      ))}
    </div>
  )
}
