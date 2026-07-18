export function GET() {
  return new Response('User-agent: *\nAllow: /\n\nSitemap: https://www.rnpgp.org/sitemap-index.xml\n', {
    headers: { 'Content-Type': 'text/plain' },
  });
}
