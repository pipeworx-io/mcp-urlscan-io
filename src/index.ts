interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * urlscan.io MCP.
 */


const BASE = 'https://urlscan.io/api/v1';
const UA = 'pipeworx-mcp-urlscan-io/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'search',
    description: 'Search past scans (keyless).',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        size: { type: 'number' },
        search_after: { type: 'string' },
      },
      required: ['query'],
    },
  },
  { name: 'result', description: 'Full result by scan uuid (keyless).', inputSchema: { type: 'object', properties: { uuid: { type: 'string' } }, required: ['uuid'] } },
  {
    name: 'submit',
    description: 'Submit a new URL for scanning (requires key).',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
        visibility: { type: 'string', description: 'public (default) | unlisted | private' },
        country: { type: 'string', description: 'ISO 3166-1 alpha-2 of scan country.' },
        tags: { type: 'array', items: { type: 'string' } },
        referer: { type: 'string' },
        customagent: { type: 'string' },
        useragent: { type: 'string' },
      },
      required: ['url'],
    },
  },
  { name: 'domain', description: 'Search by domain.', inputSchema: { type: 'object', properties: { domain: { type: 'string' } }, required: ['domain'] } },
  { name: 'ip', description: 'Search by IP.', inputSchema: { type: 'object', properties: { ip: { type: 'string' } }, required: ['ip'] } },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const apiKey = (args._apiKey as string | undefined)?.trim();
  switch (name) {
    case 'search': {
      const p = new URLSearchParams({ q: reqStr(args, 'query', '"github.com"') });
      if (args.size) p.set('size', String(args.size));
      if (args.search_after) p.set('search_after', String(args.search_after));
      return usGet(undefined, `/search/?${p}`);
    }
    case 'result':
      return usGet(undefined, `/result/${encodeURIComponent(reqStr(args, 'uuid', '"<uuid>"'))}/`);
    case 'submit': {
      if (!apiKey) throw new Error('urlscan submit: requires API key. Set PLATFORM_URLSCAN_KEY or pass ?_apiKey=…');
      const body: Record<string, unknown> = { url: reqStr(args, 'url', '"https://example.com"') };
      for (const k of ['visibility', 'country', 'referer', 'customagent', 'useragent'] as const) {
        if (args[k]) body[k] = String(args[k]);
      }
      if (Array.isArray(args.tags)) body.tags = args.tags;
      const res = await fetch(`${BASE}/scan/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'User-Agent': UA, 'API-Key': apiKey },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`urlscan submit: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
      return res.json();
    }
    case 'domain': {
      const p = new URLSearchParams({ q: `domain:${reqStr(args, 'domain', '"github.com"')}` });
      return usGet(undefined, `/search/?${p}`);
    }
    case 'ip': {
      const p = new URLSearchParams({ q: `ip:${reqStr(args, 'ip', '"8.8.8.8"')}` });
      return usGet(undefined, `/search/?${p}`);
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function usGet(apiKey: string | undefined, path: string): Promise<unknown> {
  const headers: Record<string, string> = { Accept: 'application/json', 'User-Agent': UA };
  if (apiKey) headers['API-Key'] = apiKey;
  const res = await fetch(`${BASE}${path}`, { headers });
  if (res.status === 429) throw new Error('urlscan: 429 rate-limit.');
  if (!res.ok) throw new Error(`urlscan: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
