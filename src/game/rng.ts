export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed | 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function ri(r: Rng, min: number, max: number): number {
  return Math.floor(r() * (max - min + 1)) + min;
}

export function pick<T>(r: Rng, a: readonly T[]): T {
  return a[Math.floor(r() * a.length)];
}

export function shuffle<T>(r: Rng, a: readonly T[]): T[] {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

export function wpick<T>(r: Rng, items: readonly (readonly [T, number])[]): T {
  const total = items.reduce((s, i) => s + i[1], 0);
  let x = r() * total;
  for (const [v, w] of items) {
    x -= w;
    if (x <= 0) return v;
  }
  return items[items.length - 1][0];
}
