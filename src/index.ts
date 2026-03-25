#!/usr/bin/env node

/**
 * 飞书 MCP Server
 * 让 AI Coding Agent (Cursor / Claude Code 等) 直接操作飞书
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { docReadTool } from "./tools/doc-read.js";
import { docWriteTool } from "./tools/doc-write.js";
import { docCreateTool } from "./tools/doc-create.js";
import { docListTool } from "./tools/doc-list.js";
import { messageSendTool } from "./tools/message-send.js";
import { wikiSearchTool } from "./tools/wiki-search.js";
import { calendarCreateTool } from "./tools/calendar-create.js";
import { bitableTool } from "./tools/bitable.js";

function log(...args: unknown[]): void {
  console.error("[feishu-mcp]", ...args);
}

// --- 环境变量检查 ---
const appId = process.env.FEISHU_APP_ID;
const appSecret = process.env.FEISHU_APP_SECRET;

if (!appId || !appSecret) {
  log(
    "⚠️  未设置 FEISHU_APP_ID / FEISHU_APP_SECRET，飞书 API 将无法调用"
  );
}

// --- 创建 MCP Server ---
const server = new McpServer({
  name: "feishu-mcp",
  version: "0.2.0",
});

// --- 注册 Tools ---
const tools = [
  docReadTool,
  docWriteTool,
  docCreateTool,
  docListTool,
  messageSendTool,
  wikiSearchTool,
  calendarCreateTool,
  bitableTool,
];

for (const tool of tools) {
  server.tool(
    tool.name,
    tool.description,
    tool.inputSchema.shape,
    async (params: unknown) => {
      try {
        const parsed = tool.inputSchema.parse(params);
        return await tool.handler(parsed as any);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        log(`Tool ${tool.name} error:`, msg);
        return {
          content: [{ type: "text" as const, text: `❌ Error: ${msg}` }],
          isError: true,
        };
      }
    }
  );
  log(`Registered tool: ${tool.name}`);
}

// --- 启动 ---
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  log("Server started on stdio transport");
}

main().catch((err) => {
  log("Fatal error:", err);
  process.exit(1);
});
