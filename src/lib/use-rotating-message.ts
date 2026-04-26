import { useEffect, useState } from 'react';

/**
 * Rotates through a list of progress messages while `active` is true.
 * Resets to the first message when `active` flips back to false.
 */
export function useRotatingMessage(
  active: boolean,
  messages: readonly string[],
  intervalMs = 1500
): string {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active) {
      setIndex(0);
      return;
    }
    const id = setInterval(
      () => setIndex((i) => (i + 1) % Math.max(1, messages.length)),
      intervalMs
    );
    return () => clearInterval(id);
  }, [active, messages.length, intervalMs]);

  return messages[index] ?? messages[0] ?? '';
}
