const NAMESPACES: Record<string, string> = {
  writtenin: 'Written in',
  bindingsfor: 'Bindings for',
  user: 'Target user',
  interface: 'Interface',
  audience: 'Audience',
  completion_status: 'Status',
};

/** Turn a namespaced tag like "writtenin:C++" into "Written in C++". */
export function tagLabel(tag: string): string {
  const [ns, val] = tag.split(':');
  if (val && NAMESPACES[ns]) return `${NAMESPACES[ns]} ${val}`;
  return tag.replace(/_/g, ' ');
}
