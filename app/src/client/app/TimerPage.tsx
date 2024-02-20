import { useState, useEffect, useMemo, useRef } from 'react';
import generateGptResponse from '@wasp/actions/generateGptResponse';
import deleteTask from '@wasp/actions/deleteTask';
import updateTask from '@wasp/actions/updateTask';
import createTask from '@wasp/actions/createTask';
import { useQuery } from '@wasp/queries';
import getAllTasksByUser from '@wasp/queries/getAllTasksByUser';
import { Task } from '@wasp/entities';
import { CgSpinner } from 'react-icons/cg';
import { TiDelete } from 'react-icons/ti';
import { DateTime, Duration } from 'luxon';
import { start } from 'repl';

export default function TimerPage() {
  const [timeEntryDescription, setTimeEntryDescription] = useState('')

  // Stopwatch
  const [isTimerOn, setIsTimerOn] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [now, setNow] = useState<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()

  function handleStopwatchButtonClicked() {
    if (!isTimerOn) { // Start
      console.log('started!')
      setStartTime(Date.now())
      setNow(Date.now())

      clearInterval(intervalRef.current) // TODO(matija): I don't need this?
      intervalRef.current = setInterval(() => {
        setNow(Date.now())
      })

    } else { // Stop
      clearInterval(intervalRef.current)
      setStartTime(null)
      setNow(null)
    }
    setIsTimerOn(prevValue => !prevValue)
  }

  // TODO(matija): tried to create Duration object directly but had some type errors.
  let timeElapsedFormatted = '00:00:00'
  if (startTime != null && now != null) {
    const dtStart = DateTime.fromMillis(startTime)
    const dtNow = DateTime.fromMillis(now)

    const timeElapsed = dtNow.diff(dtStart)
    timeElapsedFormatted = timeElapsed.toFormat('hh:mm:ss')
  }

  return (
    <div className='py-10 lg:mt-10'>

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
              value={timeEntryDescription}
              onChange={(e) => { e.preventDefault; setTimeEntryDescription(e.target.value) }}
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
              <span>{timeElapsedFormatted}</span>
            </div> {/* EOF elapsed time display */}

            {/* Start/stop button */}
            <div className={`ml-2.5 flex flex-row items-center`}>
              <button onClick={handleStopwatchButtonClicked}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="36" height="36" viewBox="0 0 36 36"
                >
                  <g fill="none" fillRule="evenodd">
                    <rect
                      className={`
                        fill-yellow-500 hover:fill-yellow-600
                        transition duration-200 ease-out
                      `}
                      width="36" height="36" rx="18"
                    >
                    </rect>
                    <path fill="#FCFCFC" d="M13 11.994c0-1.101.773-1.553 1.745-.997l10.51 6.005c.964.55.972 1.439 0 1.994l-10.51 6.007c-.964.55-1.745.102-1.745-.997V11.994z"></path>
                  </g>
                </svg>
              </button>
            </div> {/* EOF start/stop button */}
          </div> {/* EOF time elapsed + start/stop button */}

        </div> {/* EOF timer bar container */}
      </div> {/* EOF outer wrapper */}

    </div>
  );
}






type TodoProps = Pick<Task, 'id' | 'isDone' | 'description' | 'time'>;

function Todo({ id, isDone, description, time }: TodoProps) {
  const handleCheckboxChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    await updateTask({
      id,
      isDone: e.currentTarget.checked,
    });
  };

  const handleTimeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await updateTask({
      id,
      time: e.currentTarget.value,
    });
  };

  const handleDeleteClick = async () => {
    await deleteTask({ id });
  };

  return (
    <div className='flex items-center justify-between bg-purple-50 rounded-lg border border-gray-200 p-2 w-full'>
      <div className='flex items-center justify-between gap-5 w-full'>
        <div className='flex items-center gap-3'>
          <input
            type='checkbox'
            className='ml-1 form-checkbox bg-purple-300 checked:bg-purple-300 rounded border-purple-400 duration-200 ease-in-out hover:bg-purple-400 hover:checked:bg-purple-600 focus:ring focus:ring-purple-300 focus:checked:bg-purple-400 focus:ring-opacity-50 text-black'
            checked={isDone}
            onChange={handleCheckboxChange}
          />
          <span
            className={`text-slate-600 ${isDone ? 'line-through text-slate-500' : ''
              }`}
          >
            {description}
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <input
            id='time'
            type='number'
            min={0.5}
            step={0.5}
            className={`w-18 h-8 text-center text-slate-600 text-xs rounded border border-gray-200 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-purple-300 focus:ring-opacity-50 ${isDone && 'pointer-events-none opacity-50'
              }`}
            value={time}
            onChange={handleTimeChange}
          />
          <span
            className={`italic text-slate-600 text-xs ${isDone ? 'text-slate-500' : ''
              }`}
          >
            hrs
          </span>
        </div>
      </div>
      <div className='flex items-center justify-end w-15'>
        <button className='p-1' onClick={handleDeleteClick} title='Remove task'>
          <TiDelete size='20' className='text-red-600 hover:text-red-700' />
        </button>
      </div>
    </div>
  );
}

function NewTaskForm({
  handleCreateTask,
}: {
  handleCreateTask: typeof createTask;
}) {
  const [description, setDescription] = useState<string>('');
  const [todaysHours, setTodaysHours] = useState<string>('8');
  const [response, setResponse] = useState<any>(null);
  const [isPlanGenerating, setIsPlanGenerating] = useState<boolean>(false);

  const { data: tasks, isLoading: isTasksLoading } =
    useQuery(getAllTasksByUser);

  useEffect(() => {
    console.log('response', response);
  }, [response]);

  const handleSubmit = async () => {
    try {
      await handleCreateTask({ description });
      setDescription('');
    } catch (err: any) {
      window.alert('Error: ' + (err.message || 'Something went wrong'));
    }
  };

  const handleGeneratePlan = async () => {
    try {
      setIsPlanGenerating(true);
      const response = await generateGptResponse({
        hours: todaysHours,
      });
      if (response) {
        console.log('response', response);
        setResponse(JSON.parse(response));
      }
    } catch (err: any) {
      window.alert('Error: ' + (err.message || 'Something went wrong'));
    } finally {
      setIsPlanGenerating(false);
    }
  };

  return (
    <div className='flex flex-col justify-center gap-10'>
      <div className='flex flex-col gap-3'>
        <div className='flex items-center justify-between gap-3'>
          <input
            type='text'
            id='description'
            className='text-sm text-gray-600 w-full rounded-md border border-gray-200 bg-[#f5f0ff] shadow-md focus:outline-none focus:border-transparent focus:shadow-none duration-200 ease-in-out hover:shadow-none'
            placeholder='Enter task description'
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit();
              }
            }}
          />
          <button
            type='button'
            onClick={handleSubmit}
            className='min-w-[7rem] font-medium text-gray-800/90 bg-yellow-50 shadow-md ring-1 ring-inset ring-slate-200 py-2 px-4 rounded-md hover:bg-yellow-100 duration-200 ease-in-out focus:outline-none focus:shadow-none hover:shadow-none'
          >
            Add Task
          </button>
        </div>
      </div>

      <div className='space-y-10 col-span-full'>
        {isTasksLoading && <div>Loading...</div>}
        {tasks!! && tasks.length > 0 ? (
          <div className='space-y-4'>
            {tasks.map((task: Task) => (
              <Todo
                key={task.id}
                id={task.id}
                isDone={task.isDone}
                description={task.description}
                time={task.time}
              />
            ))}
            <div className='flex flex-col gap-3'>
              <div className='flex items-center justify-between gap-3'>
                <label
                  htmlFor='time'
                  className='text-sm text-gray-600 dark:text-gray-300 text-nowrap font-semibold'
                >
                  How many hours will you work today?
                </label>
                <input
                  type='number'
                  id='time'
                  step={0.5}
                  min={1}
                  max={24}
                  className='min-w-[7rem] text-gray-800/90 text-center font-medium rounded-md border border-gray-200 bg-yellow-50 hover:bg-yellow-100 shadow-md focus:outline-none focus:border-transparent focus:shadow-none duration-200 ease-in-out hover:shadow-none'
                  value={todaysHours}
                  onChange={(e) => setTodaysHours(e.currentTarget.value)}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className='text-gray-600 text-center'>Add tasks to begin</div>
        )}
      </div>

      <button
        type='button'
        disabled={isPlanGenerating || tasks?.length === 0}
        onClick={() => handleGeneratePlan()}
        className='flex items-center justify-center min-w-[7rem] font-medium text-gray-800/90 bg-yellow-50 shadow-md ring-1 ring-inset ring-slate-200 py-2 px-4 rounded-md hover:bg-yellow-100 duration-200 ease-in-out focus:outline-none focus:shadow-none hover:shadow-none disabled:opacity-70 disabled:cursor-not-allowed'
      >
        {isPlanGenerating ? (
          <>
            <CgSpinner className='inline-block mr-2 animate-spin' />
            Generating...
          </>
        ) : (
          'Generate Schedule'
        )}
      </button>

      {!!response && (
        <div className='flex flex-col'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
            Today's Schedule
          </h3>

          <TaskTable schedule={response.schedule} />
        </div>
      )}
    </div>
  );
}

function TaskTable({ schedule }: { schedule: any[] }) {
  return (
    <div className='flex flex-col gap-6 py-6'>
      {schedule.map((task: any) => (
        <table
          key={task.name}
          className='table-auto w-full border-separate border border-spacing-2 rounded-md border-slate-200 shadow-sm'
        >
          <thead>
            <tr>
              <th
                className={`flex items-center justify-between gap-5 py-4 px-3 text-slate-800 border rounded-md border-slate-200 ${task.priority === 'high'
                  ? 'bg-red-50'
                  : task.priority === 'low'
                    ? 'bg-green-50'
                    : 'bg-yellow-50'
                  }`}
              >
                <span>{task.name}</span>
                <span className='opacity-70 text-xs font-medium italic'>
                  {' '}
                  {task.priority} priority
                </span>
              </th>
            </tr>
          </thead>
          <tbody className=''>
            {task.subtasks.map((subtask: { description: any; time: any }) => (
              <tr>
                <td
                  className={`flex items-center justify-between py-2 px-3 text-slate-600 border rounded-md border-purple-100 bg-purple-50`}
                >
                  <Subtask
                    description={subtask.description}
                    time={subtask.time}
                  />
                </td>
              </tr>
            ))}

            {task.breaks.map((breakItem: { description: any; time: any }) => (
              <tr key={breakItem.description}>
                <td
                  className={`flex items-center justify-between py-2 px-3 text-slate-600 border rounded-md border-purple-100 bg-purple-50`}
                >
                  <Subtask
                    description={breakItem.description}
                    time={breakItem.time}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ))}
    </div>
  );
}

function Subtask({ description, time }: { description: string; time: number }) {
  const [isDone, setIsDone] = useState<boolean>(false);

  const convertHrsToMinutes = (time: number) => {
    if (time === 0) return 0;
    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);
    return `${hours > 0 ? hours + 'hr' : ''} ${minutes > 0 ? minutes + 'min' : ''
      }`;
  };

  const minutes = useMemo(() => convertHrsToMinutes(time), [time]);

  return (
    <>
      <input
        type='checkbox'
        className='ml-1 form-checkbox bg-purple-500 checked:bg-purple-300 rounded border-purple-600 duration-200 ease-in-out hover:bg-purple-600 hover:checked:bg-purple-600 focus:ring focus:ring-purple-300 focus:checked:bg-purple-400 focus:ring-opacity-50'
        checked={isDone}
        onChange={(e) => setIsDone(e.currentTarget.checked)}
      />
      <span
        className={`text-slate-600 ${isDone ? 'line-through text-slate-500 opacity-50' : ''
          }`}
      >
        {description}
      </span>
      <span
        className={`text-slate-600 ${isDone ? 'line-through text-slate-500 opacity-50' : ''
          }`}
      >
        {minutes}
      </span>
    </>
  );
}