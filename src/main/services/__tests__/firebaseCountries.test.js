import { describe, expect, it, vi, beforeEach } from 'vitest'

const mockDocs = [{ id: 'FR', data: () => ({ name: 'France', difficulty: 200 }) }]

const collectionMock = vi.fn()
const getMock = vi.fn()

vi.mock('../auth.js', () => ({
  getAdminDb: vi.fn(async () => ({
    collection: () => ({
      get: getMock
    })
  })),
  getCurrentUid: () => 'uid-test'
}))

import { listCountries } from '../firebaseCountries.js'

describe('firebaseCountries', () => {
  beforeEach(() => {
    collectionMock.mockReturnValue({ get: getMock })
    getMock.mockResolvedValue({ docs: mockDocs })
  })

  it('returns countries from firestore', async () => {
    const res = await listCountries()
    expect(getMock).toHaveBeenCalled()
    expect(res).toEqual([
      {
        code: 'FR',
        name: 'France',
        difficulty: 200,
        link: expect.any(String),
        flagUrl: expect.any(String),
        flagThumbUrl: expect.any(String),
        enabled: true
      }
    ])
  })
})
