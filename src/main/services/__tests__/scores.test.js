import { describe, it, expect, vi } from 'vitest'
import { createScoreService } from '../scores.js'

const store = new Map()

const docRef = {
  get: vi.fn(async () => {
    const data = store.get('uid') || null
    return { exists: !!data, data: () => data || {} }
  }),
  set: vi.fn(async (val) => {
    store.set('uid', { ...(store.get('uid') || {}), ...val })
  })
}

vi.mock('../auth.js', () => ({
  getCurrentUid: () => 'uid',
  getAdminDb: async () => ({
    collection: () => ({
      doc: () => docRef
    })
  })
}))

describe('score service validation', () => {
  it('rejects invalid payloads', async () => {
    const svc = createScoreService()
    await expect(svc.add(null)).rejects.toThrow()
    await expect(svc.add({ name: '', correct: 1, total: 0 })).rejects.toThrow()
    await expect(svc.add({ name: 'A', correct: 5, total: 3 })).rejects.toThrow()
  })

  it('aggregates scores and computes success rate', async () => {
    store.clear()
    const svc = createScoreService()
    const r1 = await svc.add({ correct: 7, total: 10, displayName: 'Alice' })
    expect(r1.successRate).toBe(70)
    const r2 = await svc.add({ correct: 3, total: 5, displayName: 'Alice' })
    expect(r2.successRate).toBe(67) // 10/15 ~ 66.6
  })
})
