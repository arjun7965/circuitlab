// Match ordinary keyboard spellings with typography used in engineering labels.
export function normalizeSearch(value: string): string {
  return value.normalize("NFKC").replace(/[‘’]/g, "'").toLowerCase().trim().replace(/\s+/g, " ");
}

export function matchesSearch(text: string, query: string): boolean {
  return normalizeSearch(text).includes(normalizeSearch(query));
}
