# @pipeworx/urlscan-io

[urlscan.io](https://urlscan.io) MCP — URL scanner (renders pages in a sandbox, records HTTP transactions, screenshots, certificates). Free API key for higher rate.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Auth

- Some endpoints are keyless (search, result lookup); `submit` requires a key.
- Platform: `PLATFORM_URLSCAN_KEY`. BYO: `?_apiKey=…`.

## Tools

- `search(query, size?, search_after?)` — search past scans
- `result(uuid)` — full result by scan uuid
- `submit(url, visibility?, country?, tags?, referer?, customagent?, useragent?)` — submit a new scan (requires key)
- `domain(domain)` — convenience: search by domain
- `ip(ip)` — convenience: search by IP

## Data source

`https://urlscan.io/api/v1/`

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "urlscan-io": {
      "url": "https://gateway.pipeworx.io/urlscan-io/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Urlscan Io data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
