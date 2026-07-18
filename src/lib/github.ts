export interface ReleaseInfo {
  tag: string;
  name: string;
  url: string;
  publishedAt: string;
}

/** Pinned fallback (kept in sync with docs_ref / RNP_VERSION). */
const FALLBACK: ReleaseInfo = {
  tag: 'v0.18.1',
  name: 'RNP 0.18.1',
  url: 'https://github.com/rnpgp/rnp/releases/tag/v0.18.1',
  publishedAt: '2025-11-20',
};

/** Latest RNP release, resolved at build time with a pinned fallback. */
export async function getLatestRelease(): Promise<ReleaseInfo> {
  try {
    const res = await fetch('https://api.github.com/repos/rnpgp/rnp/releases/latest', {
      headers: {
        'User-Agent': 'rnpgp.org-build',
        Accept: 'application/vnd.github+json',
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return FALLBACK;
    const data = await res.json();
    return {
      tag: data.tag_name ?? FALLBACK.tag,
      name: data.name || data.tag_name || FALLBACK.name,
      url: data.html_url ?? FALLBACK.url,
      publishedAt: data.published_at ?? FALLBACK.publishedAt,
    };
  } catch {
    return FALLBACK;
  }
}
