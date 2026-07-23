/** Sort order for docs entries within a product. */
export function docSort(a: string, b: string): number {
  if (a === 'README') return -1;
  if (b === 'README') return 1;
  const aDev = a.startsWith('develop/') ? 1 : 0;
  const bDev = b.startsWith('develop/') ? 1 : 0;
  if (aDev !== bDev) return aDev - bDev;
  return a.localeCompare(b);
}
