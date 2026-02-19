"use client";
/**
 * Client hint button component that uses `useAiHint`.
 * Props: { questionId?: string; text: string; choices?: string[] }
 */

import React from "react";
import { useAiHint } from "../hooks/useAiHint";

export default function HintButton({ questionId, text, choices }: { questionId?: string; text: string; choices?: string[] }) {
  const { getHint, loading, error, hint } = useAiHint();
  const [localLevel, setLocalLevel] = React.useState(0);

  async function handleClick() {
    if (localLevel >= 3) return;
    const res = await getHint({ questionId, text, choices, resetLevel: false });
    setLocalLevel((l) => Math.min(3, l + 1));
    return res;
  }

  return (
    <div className="mt-3">
      <button
        className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
        onClick={handleClick}
        disabled={loading || localLevel >= 3}
      >
        {localLevel === 0 ? "Get Hint" : localLevel < 3 ? "More hint" : "No more hints"}
      </button>
      <span className="ml-2 text-xs text-gray-500">(AI hint)</span>
      <div className="mt-2 text-sm">
        {loading && <div className="text-gray-500">Loading hint…</div>}
        {error && <div className="text-red-500">{error}</div>}
        {hint && <div className="p-2 bg-gray-50 border rounded">{hint.hint}</div>}
      </div>
      <div className="mt-1 text-xs text-gray-400">Why this hint? It nudges the right idea without giving the final answer.</div>
    </div>
  );
}
