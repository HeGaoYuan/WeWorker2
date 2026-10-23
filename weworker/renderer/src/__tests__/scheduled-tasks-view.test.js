import test, { afterEach } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import { scheduledTasksPageState } from '../utils/scheduled-tasks-view.js'
import { useScheduledTasksStore } from '../store/scheduled-tasks.js'

const initialState = useScheduledTasksStore.getState()
const originalFetch = globalThis.fetch
const originalWindow = globalThis.window

test('creating a task from the sidebar requests an enabled schedule', async () => {
  const source = fs.readFileSync(new URL('../components/layout/Sidebar.jsx', import.meta.url), 'utf8')
  const start = source.indexOf('const handleCreateTask =')
  const end = source.indexOf('const handleCreateWork =', start)
  assert.ok(start >= 0 && end > start)
  let requestedTask
  const pageStore = { getState: () => ({ closePage() {} }) }
  const context = vm.createContext({
    leaveWebsiteExploration: async () => true,
    useExplorationPageStore: pageStore,
    useToolPackagePageStore: pageStore,
    createTask: async (task) => { requestedTask = task; return { id: 'task-example', ...task } },
    showAlert: (message) => assert.fail(message),
  })

  await vm.runInContext(`${source.slice(start, end)}\nhandleCreateTask()`, context)
  assert.equal(requestedTask.enabled, true)
  assert.equal(requestedTask.cron_expression, '0 * * * *')
})

afterEach(() => {
  globalThis.fetch = originalFetch
  globalThis.window = originalWindow
  useScheduledTasksStore.setState(initialState, true)
})

test('the scheduled tasks section has its own loading, empty, error and task states', () => {
  assert.equal(scheduledTasksPageState('tasks', null, 'idle'), 'loading')
  assert.equal(scheduledTasksPageState('tasks', null, 'loading'), 'loading')
  assert.equal(scheduledTasksPageState('tasks', null, 'ready'), 'empty')
  assert.equal(scheduledTasksPageState('tasks', null, 'error'), 'error')
  assert.equal(scheduledTasksPageState('tasks', 'task-1', 'ready'), 'task')
})

test('other sidebar sections do not render a scheduled tasks page', () => {
  assert.equal(scheduledTasksPageState('conversation', null, 'ready'), 'none')
  assert.equal(scheduledTasksPageState('conversation', 'task-1', 'ready'), 'none')
})

test('task loading remains pending until the response arrives and preserves selection', async () => {
  globalThis.window = {}
  let respond
  globalThis.fetch = () => new Promise(resolve => { respond = resolve })
  useScheduledTasksStore.setState({ activeTaskId: 'task-1' })
  const pending = useScheduledTasksStore.getState().loadTasks()
  assert.equal(useScheduledTasksStore.getState().tasksStatus, 'loading')
  await new Promise(resolve => setImmediate(resolve))
  respond(Response.json({ tasks: [{ id: 'task-1', title: 'Example schedule' }] }))
  await pending
  assert.equal(useScheduledTasksStore.getState().tasksStatus, 'ready')
  assert.equal(useScheduledTasksStore.getState().tasks[0].id, 'task-1')
  assert.equal(useScheduledTasksStore.getState().activeTaskId, 'task-1')
})

test('failed requests become a retryable error instead of an empty list or unhandled rejection', async () => {
  globalThis.window = {}
  for (const response of [
    async () => Response.json({}, { status: 503 }),
    async () => { throw new Error('Example offline error') },
  ]) {
    globalThis.fetch = response
    await useScheduledTasksStore.getState().loadTasks()
    assert.equal(useScheduledTasksStore.getState().tasksStatus, 'error')
  }
  globalThis.fetch = async () => Response.json({ tasks: [] })
  await useScheduledTasksStore.getState().loadTasks()
  assert.equal(useScheduledTasksStore.getState().tasksStatus, 'ready')
  assert.deepEqual(useScheduledTasksStore.getState().tasks, [])
})
