import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('firebase/app', () => {
  return {
    initializeApp: vi.fn().mockReturnValue({})
  };
});

const mockDocs = [
  { id: 'FR', data: () => ({ name: 'France', difficulty: 200 }) }
];

const getDocsMock = vi.fn();
const collectionMock = vi.fn();

vi.mock('firebase/firestore', () => {
  return {
    getFirestore: vi.fn(),
    collection: (...args) => collectionMock(...args),
    getDocs: (...args) => getDocsMock(...args),
    query: vi.fn(),
    where: vi.fn()
  };
});

import { listCountries } from '../firebaseCountries.js';

describe('firebaseCountries', () => {
  beforeEach(() => {
    getDocsMock.mockResolvedValue({
      docs: mockDocs
    });
    collectionMock.mockReturnValue('collectionRef');
  });

  it('returns countries from firestore', async () => {
    const res = await listCountries();
    expect(collectionMock).toHaveBeenCalled();
    expect(getDocsMock).toHaveBeenCalled();
    expect(res).toEqual([
      { code: 'FR', name: 'France', difficulty: 200, link: expect.any(String), flagUrl: expect.any(String), flagThumbUrl: expect.any(String) }
    ]);
  });
});
