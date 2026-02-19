import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { useAiHint } from '../hooks/useAiHint';

global.fetch = jest.fn();

describe('useAiHint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  test('caches hint in sessionStorage and prevents duplicate fetch', async () => {
    const mockResponse = { hint: 'Think of energy', hintLevel: 1 };
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => mockResponse });

    const { result, waitForNextUpdate } = renderHook(() => useAiHint());

    let res: any = null;
    await act(async () => {
      res = await result.current.getHint({ questionId: 'q1', text: 'Q1' });
    });

    expect(res.hint).toBe('Think of energy');
    // second call should use cache; fetch should not be called again
    await act(async () => {
      const res2 = await result.current.getHint({ questionId: 'q1', text: 'Q1' });
      expect(res2?.hint).toBe('Think of energy');
    });
    expect((global.fetch as jest.Mock).mock.calls.length).toBe(1);
  });
});
