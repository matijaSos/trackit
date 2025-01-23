import { useState, useEffect, useMemo, useRef, Fragment, Dispatch, SetStateAction } from 'react';

import {
  useQuery,
  createTimeEntry,
  updateTimeEntry,
  getAllTimeEntriesByUser
} from 'wasp/client/operations';

import { type TimeEntry } from 'wasp/entities';
import { DateTime, Duration } from 'luxon';
import { Popover, Transition } from '@headlessui/react'
import {
  Calendar, CalendarCell, CalendarGrid,
  Heading,
  Button as AriaButton
} from 'react-aria-components'
import type {
  ButtonProps
} from 'react-aria-components'
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { parseDate } from '@internationalized/date'
import { start } from 'repl';

export default function TimerPage() {
  const { data: timeEntries, isLoading: isTimeEntriesLoading } =
    useQuery(getAllTimeEntriesByUser);

  // TODO(matija): store the id only, that's enough?
  const runningTimeEntry = useRef<TimeEntry | null>(null)

  const [description, setDescription] = useState('')

  // Stopwatch
  const [isTimerOn, setIsTimerOn] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [now, setNow] = useState<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => {
    // See if there is a time entry without a stop time. If there is more than one,
    // throw an error.
    const runningTimeEntries = timeEntries?.filter(t => t.stop === null)
    if (runningTimeEntries && runningTimeEntries.length > 1) {
      window.alert('This should never happen - you have more than one time entry without stop time.')
    }
    if (runningTimeEntries && runningTimeEntries.length === 1) {
      const rte = runningTimeEntries[0]

      // Recreate local state from the db data.
      setIsTimerOn(true)
      setStartTime(rte.start.getTime())
      setDescription(rte.description)
      runningTimeEntry.current = rte

      clearInterval(intervalRef.current) // TODO(matija): I don't need this?
      intervalRef.current = setInterval(() => {
        setNow(Date.now())
      })

    }
  }, [timeEntries])

  async function handleOnTimerInputBlur() {
    if (runningTimeEntry.current && description !== runningTimeEntry.current.description) {
      try {
        await updateTimeEntry({ id: runningTimeEntry.current.id, description })

      } catch (err: any) {
        window.alert('Error: ' + (err.message || 'Something went wrong'))
        // Revert to the original description
        setDescription(runningTimeEntry.current.description)
      }
    }
  }

  async function handleStopwatchButtonClicked() {
    if (!isTimerOn) { // Start
      const startMoment = new Date()

      try {
        runningTimeEntry.current = await createTimeEntry({ description, start: startMoment })
      } catch (err: any) {
        window.alert('Error: ' + (err.message || 'Something went wrong'))
      }

    } else { // Stop
      // TODO(matija): should we check that now is not null?
      const stopMoment = new Date(now!)

      // Update time entry in the database with the stop time.
      try {
        await updateTimeEntry({ id: runningTimeEntry.current?.id, stop: stopMoment })

        // Reset timer.
        clearInterval(intervalRef.current)
        setStartTime(null)
        setNow(null)
        setDescription('')
        runningTimeEntry.current = null

      } catch (err: any) {
        window.alert('Error: ' + (err.message || 'Something went wrong'))
      }
    }
    setIsTimerOn(prevValue => !prevValue)
  }

  const endedTimeEntriesGroupedByDayAndSortedDesc = useMemo(
    () => {
      if (!timeEntries) return null
      if (timeEntries.length === 0) return []

      const endedAndSortedByDateDesc = timeEntries
        .filter(t => t.stop !== null)
        .toSorted((t1, t2) => t2.start.getTime() - t1.start.getTime())

      if (endedAndSortedByDateDesc.length === 0) return []

      // Group by day - initial setup
      // TODO(matija): toISODate() can return null, and that messes up my types -> should I handle that situation here?
      let currentDay = DateTime.fromJSDate(endedAndSortedByDateDesc[0].start).toISODate()
      let groupedByDayAndSortedDesc = [{ day: currentDay, entries: [endedAndSortedByDateDesc[0]] }]

      for (let i = 1; i < endedAndSortedByDateDesc.length; i++) {
        const timeEntry = endedAndSortedByDateDesc[i]
        // TODO(matija): the same here, toISODate() can return null
        const timeEntryDay = DateTime.fromJSDate(timeEntry.start).toISODate()

        // TODO(matija): I don't have to get out of Luxon to do this comparison. I can just use
        // hasSame(otherDT, 'day'), as in the code below.
        if (timeEntryDay === currentDay) {
          groupedByDayAndSortedDesc[groupedByDayAndSortedDesc.length - 1].entries.push(timeEntry)
        } else {
          currentDay = timeEntryDay
          groupedByDayAndSortedDesc.push({ day: currentDay, entries: [timeEntry] })
        }
      }
      return groupedByDayAndSortedDesc
    },
    [timeEntries]
  )

  // TODO(matija): tried to create Duration object directly but had some type errors.
  let timeElapsedFormatted = '00:00:00'
  if (startTime != null && now != null) {
    const dtStart = DateTime.fromMillis(startTime)
    const dtNow = DateTime.fromMillis(now)

    const timeElapsed = dtNow.diff(dtStart)
    timeElapsedFormatted = timeElapsed.toFormat('hh:mm:ss')
  }

  return (
    <div
      className={`
        mx-auto max-w-7xl sm:px-6 lg:px-8
        py-10 lg:pt-20
      `}
    >

      {/* Outer wrapper of the timer bar */}
      <div
        className={`
          px-6 lg:px-8
          bg-amber-100 shadow-lg
          flex flex-col
        `}
      >
        {/* Holds all elements of the timer bar */}
        <div
          className={`flex flex-row items-center basis-[84px]`}
        >
          {/* Time entry input */}
          <div
            className={`
              h-[70px] 
              flex flex-row grow items-center
            `}
          >
            <input
              className={`
                w-full bg-transparent mr-2
                border-0 focus:ring-0
                text-lg font-semibold
              `}
              placeholder='What are you hacking on?'
              value={description}
              onChange={(e) => { setDescription(e.target.value) }}
              onBlur={handleOnTimerInputBlur}
            />
          </div> {/* EOF time entry input */}

          {/* Time elapsed + start/stop button */}
          <div
            className={`
              flex flex-row
              items-center justify-between
            `}
          >
            {/* Elapsed time display */}
            <div
              className={`
                text-lg font-semibold text-[#827089]
              `}
            >
              <span className='tabular-nums'>{timeElapsedFormatted}</span>
            </div> {/* EOF elapsed time display */}

            {/* Start/stop button */}
            <div className={`ml-2.5 flex flex-row items-center`}>
              <button onClick={handleStopwatchButtonClicked}>
                {isTimerOn ? <TimerButtonStop /> : <TimerButtonStart />}
              </button>
            </div> {/* EOF start/stop button */}
          </div> {/* EOF time elapsed + start/stop button */}

        </div> {/* EOF timer bar container */}
      </div> {/* EOF outer wrapper of the timer bar */}

      {/* Ended time entries */}
      <div className='mt-8'>
        {isTimeEntriesLoading && <div>Loading stuff...</div>}
        {endedTimeEntriesGroupedByDayAndSortedDesc &&
          (endedTimeEntriesGroupedByDayAndSortedDesc.length > 0 ? (
            <div>
              {endedTimeEntriesGroupedByDayAndSortedDesc.map(({ day, entries }) =>
                <>
                  {/* TODO(matija): I had to put day! here, because it might be null, due to toISODate (look above). */}
                  <TimeEntriesForDay day={day!} timeEntries={entries} />
                </>
              )}
            </div>
          ) : ( // User hasn't created any time entries yet.
            <div className='text-stone-500 text-center'>Better start hacking...</div>
          ))
        }
      </div> {/* EOF time entries */}

    </div >
  );
}

function TimeEntriesForDay({ day, timeEntries }: { day: string, timeEntries: TimeEntry[] }) {

  // TODO(matija): I will probably want to extract and reuse this in other places.
  function calcDurationOfEndedTimeEntry(timeEntry: TimeEntry) {
    const start = DateTime.fromJSDate(timeEntry.start)
    const stop = DateTime.fromJSDate(timeEntry.stop!)

    return stop.diff(start)
  }

  // TODO(matija): get duration for the whole day etc
  const totalDuration = timeEntries.reduce(
    (res: Duration, timeEntry: TimeEntry) => res.plus(calcDurationOfEndedTimeEntry(timeEntry)),
    Duration.fromMillis(0)
  )

  // TODO(matija): Should I call this function within useMemo(), instead of calling directly?
  // Seems like I can actually put the whole component in useMemo()?
  // E.g. if timeEntries change, but day not, I do not want to recalculate this?
  function formatDate(isoDate: string) {
    const dayDiffFromToday =
      DateTime.now().startOf('day').diff(
        DateTime.fromISO(isoDate).startOf('day')
      ).as('days')

    if (dayDiffFromToday === 0) {
      return 'Today'
    } else if (dayDiffFromToday === 1) {
      return 'Yesterday'
    } else {
      return DateTime.fromISO(isoDate).toLocaleString({
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      })
    }
  }

  return (
    <div
      className={`
        mb-8 bg-white
        shadow-[0_1px_3px_0_rgba(0,0,0,0.08)]
      `}
    >
      {/* Header with day info */}
      <div className='h-[50px] flex flex-row justify-between items-center px-9'>
        <div className='font-bold'>
          {formatDate(day)}
        </div>
        <div className='tabular-nums font-semibold'>
          {totalDuration.toFormat('hh:mm:ss')}
        </div>
      </div>

      {/* Individual entries */}
      {timeEntries.map((timeEntry: TimeEntry) => (
        <TimeEntryAsRow timeEntry={timeEntry} key={timeEntry.id} />
      ))}
    </div>
  )

}

// TODO(matija): should I also useMemo() this component, so it doesn't calculate
// time diffs on every render?
function TimeEntryAsRow({ timeEntry }: { timeEntry: TimeEntry }) {
  const [description, setDescription] = useState(timeEntry.description)
  const [isEditing, setIsEditing] = useState(false)
  // TODO(matija): this is for description - rename to "isDescriptionInputFocused"?
  const [isInputFocused, setIsInputFocused] = useState(false)

  // TODO(matija): Used by calendar - I should extract this from here.
  // TODO(matija): had to use '!' here, because toISODate apparently can return string | null.
  // Although I don't get why it would return null since it is always invoked from the DateTime object,
  // which should be valid since it is instantiated?
  const startDateIntl = parseDate(DateTime.fromJSDate(timeEntry.start).toISODate()!)
  const [startDate, setStartDate] = useState(startDateIntl)

  const start = DateTime.fromJSDate(timeEntry.start)
  const startMark = start.toLocaleString(DateTime.TIME_SIMPLE, { locale: 'en-US' })

  // TODO(matija): why do I use 'n/a', why not null? Do I anywhere print this value?
  let stopMark = 'n/a'
  let durationMark = 'n/a'
  if (timeEntry.stop) {
    const stop = DateTime.fromJSDate(timeEntry.stop)

    stopMark = stop.toLocaleString(DateTime.TIME_SIMPLE, { locale: 'en-US' })
    // TODO(matija): I have duplicated "hh:mm:ss" format around the code, unify that.
    durationMark = stop.diff(start).toFormat('hh:mm:ss')
  }

  // Duration input state
  const [duration, setDuration] = useState(durationMark)
  const durationInputRef = useRef<HTMLInputElement>(null)

  const popoverButtonRef = useRef<HTMLButtonElement>(null)

  // TODO(matija): used by calendar, this should also be extracted with it.
  const [calStartTime, setCalStartTime] = useState(startMark)
  const [calEndTime, setCalEndTime] = useState(stopMark)

  const [isTimeBeingEdited, setIsTimeBeingEdited] = useState(false)

  async function handleStartStopTimesSave() {
    // Get new start time.
    const startDateNewLx = DateTime.fromISO(startDate.toString())
    // TODO(matija): I have duplication in specifying this format.
    const startTimeNewLx = DateTime.fromFormat(calStartTime, 'h:mm a')
    const startDateTimeNewLx = startDateNewLx.set({
      hour: startTimeNewLx.hour,
      minute: startTimeNewLx.minute,
      second: startTimeNewLx.second,
      millisecond: startTimeNewLx.millisecond
    })

    if (!timeEntry.stop) {
      window.alert('Error: This should never happen, stop time should not be undefined')
      return
    }

    // Get new end time.
    // NOTE(matija): we always take the start date as a reference point. That way we preserve duration of the task
    // as we move it across dates. IMO it is a more expected behavior.
    const endDateNewLx = startDateNewLx
    const endTimeNewLx = DateTime.fromFormat(calEndTime, 'h:mm a')
    let endDateTimeNewLx = endDateNewLx?.set({
      hour: endTimeNewLx.hour,
      minute: endTimeNewLx.minute,
      second: endTimeNewLx.second,
      millisecond: endTimeNewLx.millisecond
    })

    if (endDateTimeNewLx && (endDateTimeNewLx < startDateTimeNewLx)) {
      endDateTimeNewLx = endDateTimeNewLx.plus({ days: 1 })
    }

    try {
      await updateTimeEntry({
        id: timeEntry.id,
        start: startDateTimeNewLx.toJSDate(),
        stop: endDateTimeNewLx?.toJSDate()
      })
    } catch (err: any) {
      window.alert('Error: ' + (err.message || 'Something went wrong'))
      // Reset form.
      setStartDate(startDateIntl)
      setCalStartTime(startMark)
      setCalEndTime(stopMark)
    }
  }

  async function handleOnBlur() {
    setIsInputFocused(false)
    setIsEditing(false)

    if (description !== timeEntry.description) {
      try {
        await updateTimeEntry({ id: timeEntry.id, description })

      } catch (err: any) {
        window.alert('Error: ' + (err.message || 'Something went wrong'))
        // Revert to the original description
        setDescription(timeEntry.description)
      }
    }
  }

  // TODO(matija): onMouseLeave is not captured if I'm moving mouse too fast over
  // the rows. Seems like this: https://stackoverflow.com/questions/31775182/react-event-onmouseleave-not-triggered-when-moving-cursor-fast 
  function handleOnMouseLeave() {
    if (!isInputFocused) {
      setIsEditing(false)
    }
  }

  type SetString = Dispatch<SetStateAction<string>>

  function handleOnBlurStartEndTime(timeInput: string, setTime: SetString, prevTime: string) {
    // This method is simply doing input field validation on blur. It doesn't do any saving to the
    // database.

    const normalizedTimeInput = timeInput.trim().replace(/\s+/g, " ").toUpperCase();
    // TODO(matija): I also want it to work if there is no AM/PM denominator.
    const newTime = DateTime.fromFormat(normalizedTimeInput, 'h:mm a')

    if (newTime.isValid) {
      setTime(newTime.toLocaleString(DateTime.TIME_SIMPLE, { locale: 'en-US' }))
    } else {
      setTime(prevTime)
    }
  }

  function handleOnBlurStartTime() {
    // TODO(matija): this should be extracted in a function, I will use it in other places, too.
    // Removes extra spaces, makes everything caps lock.
    const normalizedTimeInput = calStartTime.trim().replace(/\s+/g, " ").toUpperCase();
    // TODO(matija): I also want it to work if there is no AM/PM denominator.
    const newTimeLx = DateTime.fromFormat(normalizedTimeInput, 'h:mm a')

    // If time input is invalid (e.g. user wrote some gibberish), revert to the previous value.
    if (!newTimeLx.isValid) {
      setCalStartTime(startMark)
      return
    }
    setCalStartTime(newTimeLx.toLocaleString(DateTime.TIME_SIMPLE, { locale: 'en-US' }))

    // We have a valid new time - now let's get a full datetime.
    const startDateNewLx = DateTime.fromISO(startDate.toString())
    const startDateTimeNewLx = startDateNewLx.set({
      hour: newTimeLx.hour,
      minute: newTimeLx.minute,
      second: newTimeLx.second,
      millisecond: newTimeLx.millisecond
    })

    // Get the end datetime.
    const endDateNewLx = DateTime.fromISO(startDate.toString())
    // NOTE(matija): this should never fail, since end time hasn't been touched.
    const endTimeNewLx = DateTime.fromFormat(calEndTime, 'h:mm a')
    let endDateTimeNewLx = endDateNewLx?.set({
      hour: endTimeNewLx.hour,
      minute: endTimeNewLx.minute,
      second: endTimeNewLx.second,
      millisecond: endTimeNewLx.millisecond
    })

    // Check if new start time is ahead of the end time - that means I have to bump the end time for 
    // one day ahead.
    if (endDateTimeNewLx && (endDateTimeNewLx < startDateTimeNewLx)) {
      endDateTimeNewLx = endDateTimeNewLx.plus({ days: 1 })
    }

    // Update duration state var.
    setDuration(endDateTimeNewLx.diff(startDateTimeNewLx).toFormat('hh:mm:ss'))
  }

  function handleAfterPopoverEnter() {
    setIsTimeBeingEdited(true)

    durationInputRef.current?.focus()
    durationInputRef.current?.select()
  }

  return (
    <div
      className={`
        flex flex-row justify-between
        px-4 py-4 border-b
      `}
    >
      {/* Time entry description */}
      <div className='pl-5 grow mr-2'>
        {isEditing ? (
          <input
            className={`
              w-full bg-transparent
              placeholder:italic
              border-0 focus:ring-0
              px-0 py-0
            `}
            value={description}
            onChange={(e) => { setDescription(e.target.value) }}
            placeholder='No description'
            onBlur={handleOnBlur}
            onFocus={() => setIsInputFocused(true)}
            onMouseLeave={handleOnMouseLeave}
          />
        ) : (
          <div
            className=''
            onMouseEnter={() => setIsEditing(true)}
          >
            {description.length > 0 ? (
              <span>{description}</span>
            ) : (
              <span className='text-stone-500 italic'>No description</span>
            )}
          </div>
        )}
      </div>
      {/* EOF Time entry description */}

      {/* Start/stop & duration */}
      <div className='pr-3'>
        <Popover
          className={`
            relative
          `}
        >
          <button
            onClick={() => popoverButtonRef.current?.click()}
            disabled={isTimeBeingEdited}
            className={`
              focus:outline-none
              text-stone-500 cursor-pointer
              px-2 rounded-md
              hover:bg-stone-100 hover:text-black
            `}
          >
            {startMark} - {stopMark}
          </button>

          <Popover.Button
            ref={popoverButtonRef}
            disabled={isTimeBeingEdited}
            className={`
              focus:outline-none
              ml-4
              rounded-md
              border-0
            `}
          >
            <input
              ref={durationInputRef}
              className={`
                w-[86px]
                tabular-nums p-0 bg-transparent text-right
                cursor-pointer
                px-2
                border-0 rounded-md
                hover:bg-stone-100
                focus:ring-1 focus:ring-stone-200 focus:bg-transparent focus:ring-offset-4
              `}
              value={duration}
              onChange={e => setDuration(e.target.value)}
            />
          </Popover.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
            afterEnter={handleAfterPopoverEnter}
            afterLeave={() => setIsTimeBeingEdited(false)}
          >
            <Popover.Panel className='absolute mt-2 z-10 left-1/2 -translate-x-1/2'>
              <div
                className={`
                  bg-white rounded-lg shadow-lg p-7 ring-1 ring-black/5
              `}
              >
                {/* Start & stop time container */}
                <div className='flex flex-row items-center justify-between space-x-4 mx-2'>
                  <div className=''>
                    <label className='uppercase text-xs font-semibold'>
                      <span>Start</span>
                    </label>
                    <input
                      className='w-full h-9 rounded-md'
                      value={calStartTime}
                      onChange={(e) => { setCalStartTime(e.target.value) }}
                      onBlur={handleOnBlurStartTime}
                    />
                  </div>

                  <div className=''>
                    <label className='uppercase text-xs font-semibold'>
                      <span>Stop</span>
                    </label>
                    <input
                      className='w-full h-9 rounded-md'
                      value={calEndTime}
                      onChange={(e) => { setCalEndTime(e.target.value) }}
                      onBlur={() => handleOnBlurStartEndTime(calEndTime, setCalEndTime, stopMark)}
                    />
                  </div>
                </div> {/* EOF start & stop time container */}

                <Calendar
                  aria-label='Start date'
                  value={startDate}
                  onChange={setStartDate}
                  className='mt-6 border-t'
                >
                  <header className='flex items-center gap-1 pb-4 px-1 w-full mt-4'>
                    <Heading className='flex-1 font-semibold text-2xl ml-2' />
                    <CalendarNextPrevMonthButton slot='previous'>
                      <FiChevronLeft />
                    </CalendarNextPrevMonthButton>
                    <CalendarNextPrevMonthButton slot='next'>
                      <FiChevronRight />
                    </CalendarNextPrevMonthButton>
                  </header>
                  <CalendarGrid className='border-spacing-1 border-separate'>
                    {(date) =>
                      <CalendarCell
                        date={date}
                        className={`
                          w-9 h-9 rounded-full outline-none
                          flex items-center justify-center
                          hover:bg-gray-100
                          data-[selected]:bg-yellow-500 data-[selected]:text-white
                        `}
                      />
                    }
                  </CalendarGrid>
                </Calendar>

                <Popover.Button
                  className={`
                    ml-2 mt-2
                    px-3 py-2 rounded
                    bg-yellow-500 text-white
                    hover:bg-yellow-600
                    transition duration-200 ease-out
                  `}
                  onClick={handleStartStopTimesSave}
                >
                  Save
                </Popover.Button>

              </div>
            </Popover.Panel>
          </Transition>
        </Popover>
      </div>
      {/* EOF Start/stop & duration */}
    </div>
  )
}

function CalendarNextPrevMonthButton(props: ButtonProps) {
  return (
    <AriaButton
      {...props}
      className={`
        w-9 h-9 bg-transparent rounded-full
        flex items-center justify-center
        hover:bg-gray-100
      `}
    />
  )
}

function TimerButtonStart() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="36" height="36" viewBox="0 0 36 36"
    >
      <g
        fill="none"
        fillRule="evenodd"
        className={`
          fill-yellow-500 hover:fill-yellow-600
          transition duration-200 ease-out
        `}
      >
        <rect
          width="36" height="36" rx="18"
        >
        </rect>
        <path fill="#FCFCFC" d="M13 11.994c0-1.101.773-1.553 1.745-.997l10.51 6.005c.964.55.972 1.439 0 1.994l-10.51 6.007c-.964.55-1.745.102-1.745-.997V11.994z"></path>
      </g>
    </svg>
  )
}

function TimerButtonStop() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
      <g
        fill="none"
        fillRule="evenodd"
        className={`
          fill-orange-500 hover:fill-orange-600
          transition duration-200 ease-out
        `}
      >
        <rect width="36" height="36" rx="18"></rect>
        <rect width="14" height="14" x="11" y="11" fill="#FCFCFC" rx="1.5"></rect>
      </g>
    </svg>
  )
}