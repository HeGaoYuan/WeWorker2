/**
 * API 端点单元测试
 *
 * Tests the core logic that the scheduled-tasks API routes use:
 * store CRUD operations + Scheduler validation. The routes are thin
 * wrappers around these functions, so testing them directly validates
 * the same behaviour the API exposes.
 *
 * **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6**
 */
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import { z } from 'zod'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  _initTestDb,
  createScheduledTask,
  getScheduledTask,
  listScheduledTasks,
  updateScheduledTask,
  deleteScheduledTask,
  createWork,
  createTaskExecution,
  listTaskExecutions,
  listScheduledTasksForAgent,
  saveChannelNotifyTarget,
  listChannelNotifyTargets,
} from '../works-store.js'
import { Scheduler } from '../scheduler.js'

beforeEach(() => {
  _initTestDb()
})

function createTaskEndpoint() {
  // Exercise the real route without starting the server or using the user's database.
  const source = fs.readFileSync(new URL('../server.ts', import.meta.url), 'utf8')
  const start = source.indexOf('const CreateTaskSchema =')
  const end = source.indexOf("app.get('/scheduled-tasks/:id'", start)
  expect(start).toBeGreaterThanOrEqual(0)
  expect(end).toBeGreaterThan(start)
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn() }
  let handler!: (req: { body: unknown }, response: typeof res) => void
  const register = vi.fn()
  const context = vm.createContext({
    z,
    Scheduler,
    store: { createScheduledTask, listScheduledTasks },
    scheduler: { register },
    app: {
      get: () => {},
      post: (_route: string, callback: typeof handler) => { handler = callback },
    },
  })
  vm.runInContext(ts.transpileModule(source.slice(start, end), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText, context)
  return { invoke: (body: unknown) => handler({ body }, res), res, register }
}

// ── GET /scheduled-tasks — listScheduledTasks ─────────────────────────────────

describe('GET /scheduled-tasks', () => {
  it('returns empty list when no tasks exist', () => {
    const result = listScheduledTasks()
    expect(result).toEqual([])
  })

  it('returns all tasks with last_execution_status', () => {
    const t1 = createScheduledTask({
      title: '日报',
      cron_expression: '0 9 * * *',
      prompt_template: '生成日报',
      enabled: true,
      notify_channels: [],
    })
    const t2 = createScheduledTask({
      title: '周报',
      cron_expression: '0 9 * * 1',
      prompt_template: '生成周报',
      enabled: false,
      notify_channels: ['weixin'],
    })

    // Add an execution for t1
    const work = createWork('exec-work')
    createTaskExecution(t1.id, work.id)

    const tasks = listScheduledTasks()
    expect(tasks.length).toBe(2)

    const taskIds = tasks.map((t) => t.id)
    expect(taskIds).toContain(t1.id)
    expect(taskIds).toContain(t2.id)

    // t1 has an execution with status 'pending'
    const fetchedT1 = tasks.find((t) => t.id === t1.id)!
    expect(fetchedT1.last_execution_status).toBe('pending')
    // t2 has no executions
    const fetchedT2 = tasks.find((t) => t.id === t2.id)!
    expect(fetchedT2.last_execution_status).toBeUndefined()
  })
})

// ── POST /scheduled-tasks — create + cron validation ──────────────────────────

describe('POST /scheduled-tasks', () => {
  it('enables new tasks by default and registers their schedule', () => {
    const endpoint = createTaskEndpoint()
    endpoint.invoke({ title: 'Example schedule', cron_expression: '0 * * * *' })

    expect(endpoint.res.status).not.toHaveBeenCalled()
    const task = endpoint.res.json.mock.calls[0][0]
    expect(task.enabled).toBe(true)
    expect(getScheduledTask(task.id)?.enabled).toBe(true)
    expect(endpoint.register).toHaveBeenCalledWith(task.id, '0 * * * *')
  })

  it('preserves an explicitly disabled task without registering its schedule', () => {
    const endpoint = createTaskEndpoint()
    endpoint.invoke({ title: 'Example schedule', cron_expression: '0 * * * *', enabled: false })

    expect(endpoint.res.status).not.toHaveBeenCalled()
    const task = endpoint.res.json.mock.calls[0][0]
    expect(task.enabled).toBe(false)
    expect(getScheduledTask(task.id)?.enabled).toBe(false)
    expect(endpoint.register).not.toHaveBeenCalled()
  })

  it('creates a task with valid data', () => {
    const task = createScheduledTask({
      title: '每日摘要',
      cron_expression: '0 2 * * *',
      prompt_template: '请生成今日摘要',
      enabled: true,
      notify_channels: ['weixin'],
    })

    expect(task.id).toBeTruthy()
    expect(task.title).toBe('每日摘要')
    expect(task.cron_expression).toBe('0 2 * * *')
    expect(task.prompt_template).toBe('请生成今日摘要')
    expect(task.enabled).toBe(true)
    expect(task.notify_channels).toEqual(['weixin'])
    expect(task.created_at).toBeTruthy()
    expect(task.updated_at).toBeTruthy()
  })

  it('rejects invalid cron expression (Scheduler.validateCron returns 400 logic)', () => {
    const result = Scheduler.validateCron('not a cron')
    expect(result.valid).toBe(false)
    expect(result.error).toBeTruthy()
    expect(typeof result.error).toBe('string')
  })

  it('accepts valid cron expressions', () => {
    const validCrons = ['* * * * *', '0 2 * * *', '*/15 * * * *', '0 9 * * 1']
    for (const cron of validCrons) {
      const result = Scheduler.validateCron(cron)
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    }
  })

  it('rejects various invalid cron expressions', () => {
    const invalidCrons = ['hello', '60 * * * *', 'a b c d e', '0 25 * * *']
    for (const cron of invalidCrons) {
      const result = Scheduler.validateCron(cron)
      expect(result.valid).toBe(false)
    }
  })
})

// ── GET /scheduled-tasks/:id — getScheduledTask + executions ──────────────────

describe('GET /scheduled-tasks/:id', () => {
  it('returns task details with executions and next_run', () => {
    const task = createScheduledTask({
      title: '测试任务',
      cron_expression: '0 * * * *',
      prompt_template: '测试',
      enabled: true,
      notify_channels: [],
    })

    const work = createWork('test-work')
    createTaskExecution(task.id, work.id)

    const fetched = getScheduledTask(task.id)
    expect(fetched).not.toBeNull()
    expect(fetched!.id).toBe(task.id)
    expect(fetched!.title).toBe('测试任务')

    const executions = listTaskExecutions(task.id)
    expect(executions.length).toBe(1)
    expect(executions[0].task_id).toBe(task.id)

    const nextRun = Scheduler.getNextRun(task.cron_expression)
    expect(nextRun).toBeInstanceOf(Date)
    expect(nextRun!.getTime()).toBeGreaterThan(Date.now())
  })

  it('returns null for non-existent task (404 logic)', () => {
    const result = getScheduledTask('non-existent-id')
    expect(result).toBeNull()
  })
})

// ── PATCH /scheduled-tasks/:id — updateScheduledTask ──────────────────────────

describe('PATCH /scheduled-tasks/:id', () => {
  it('updates only specified fields', () => {
    const task = createScheduledTask({
      title: '原始标题',
      cron_expression: '0 2 * * *',
      prompt_template: '原始模板',
      enabled: true,
      notify_channels: [],
    })

    const updated = updateScheduledTask(task.id, { title: '新标题' })
    expect(updated).not.toBeNull()
    expect(updated!.title).toBe('新标题')
    // Other fields unchanged
    expect(updated!.cron_expression).toBe('0 2 * * *')
    expect(updated!.prompt_template).toBe('原始模板')
    expect(updated!.enabled).toBe(true)
    expect(updated!.notify_channels).toEqual([])
  })

  it('validates cron on update (400 logic)', () => {
    const result = Scheduler.validateCron('invalid cron')
    expect(result.valid).toBe(false)
    // The API route checks this before calling updateScheduledTask
  })

  it('returns null for non-existent task (404 logic)', () => {
    const result = updateScheduledTask('non-existent-id', { title: '新标题' })
    expect(result).toBeNull()
  })

  it('updates enabled state', () => {
    const task = createScheduledTask({
      title: '任务',
      cron_expression: '0 2 * * *',
      prompt_template: '模板',
      enabled: true,
      notify_channels: [],
    })

    const updated = updateScheduledTask(task.id, { enabled: false })
    expect(updated!.enabled).toBe(false)
  })

  it('updates notify_channels', () => {
    const task = createScheduledTask({
      title: '任务',
      cron_expression: '0 2 * * *',
      prompt_template: '模板',
      enabled: true,
      notify_channels: [],
    })

    const updated = updateScheduledTask(task.id, { notify_channels: ['weixin', 'qq'] })
    expect(updated!.notify_channels).toEqual(['weixin', 'qq'])
  })
})

describe('dedicated Agent task metadata', () => {
  it('persists the Agent owner, durable context and explicitly selected targets', () => {
    const task = createScheduledTask({
      title: 'Check example changes', cron_expression: '*/2 * * * *', prompt_template: 'Inspect example.com', enabled: true, notify_channels: [],
      agent_id: 'agent-example', owner_user_id: 'owner-example', context_work_id: 'work-context',
      notification_targets: [{ id: 'group-placeholder', chat_type: 2, observed_user_id: 'owner-example', observed_at: '2026-01-01T00:00:00.000Z' }],
    })
    expect(listScheduledTasksForAgent('agent-example')).toMatchObject([{ id: task.id, owner_user_id: 'owner-example', context_work_id: 'work-context' }])
    expect(getScheduledTask(task.id)?.notification_targets).toEqual(task.notification_targets)
  })

  it('lists every observed target for a dedicated Agent channel', () => {
    saveChannelNotifyTarget('agent:agent-example', 'direct-placeholder', { chat_type: '1', user_id: 'owner-example' })
    saveChannelNotifyTarget('agent:agent-example', 'group-placeholder', { chat_type: '2', user_id: 'owner-example' })
    expect(listChannelNotifyTargets('agent:agent-example').map((target) => target.user_id).sort()).toEqual(['direct-placeholder', 'group-placeholder'])
  })
})

// ── DELETE /scheduled-tasks/:id — deleteScheduledTask ─────────────────────────

describe('DELETE /scheduled-tasks/:id', () => {
  it('deletes task and all associated executions', () => {
    const task = createScheduledTask({
      title: '待删除',
      cron_expression: '0 2 * * *',
      prompt_template: '模板',
      enabled: true,
      notify_channels: [],
    })

    // Create some executions
    const w1 = createWork('w1')
    const w2 = createWork('w2')
    createTaskExecution(task.id, w1.id)
    createTaskExecution(task.id, w2.id)

    expect(listTaskExecutions(task.id).length).toBe(2)

    deleteScheduledTask(task.id)

    expect(getScheduledTask(task.id)).toBeNull()
    expect(listTaskExecutions(task.id)).toEqual([])
  })

  it('returns null when trying to get a non-existent task (404 logic)', () => {
    // The API route checks getScheduledTask before deleting
    const task = getScheduledTask('does-not-exist')
    expect(task).toBeNull()
  })
})
