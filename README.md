# 📄 feishu-mcp

> 让 AI Coding Agent（Cursor / Claude Code / Windsurf / OpenClaw）通过 MCP 协议直接操作飞书。

[![MCP](https://img.shields.io/badge/MCP-Compatible-blue)](https://modelcontextprotocol.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

## 🎯 解决什么问题

你用 Cursor/Claude 写代码时，需要：
- 读飞书文档里的需求 → **以前：切换浏览器复制粘贴**
- 把代码文档写到飞书 → **以前：手动创建文档再粘贴**
- 给同事发个飞书消息通知 → **以前：切换到飞书App**

**现在：直接在 AI 对话框里说一句话就行。**

## 🛠️ 8 个工具

| 工具 | 功能 | 示例指令 |
|------|------|---------|
| `feishu_doc_read` | 读取文档内容 | "帮我读一下飞书文档 doc_xxx" |
| `feishu_doc_write` | 写入/更新文档 | "把这段markdown写到飞书文档里" |
| `feishu_doc_create` | 创建新文档 | "在飞书创建一个API设计文档" |
| `feishu_doc_list` | 列出文件夹文件 | "看看我的飞书xxx文件夹里有什么" |
| `feishu_message_send` | 发送消息 | "给张三发条飞书说代码已上线" |
| `feishu_wiki_search` | 搜索知识库 | "在飞书知识库搜一下部署流程" |
| `feishu_calendar_create` | 创建日历事件 | "帮我建个明天10点的需求评审会议" |
| `feishu_bitable` | 操作多维表格 | "在项目跟踪表里加一条新需求" |

## 🚀 安装（3步）

### 1. 克隆并安装依赖

```bash
git clone https://github.com/zlplzp123wyt/feishu-mcp.git
cd feishu-mcp
npm install
npm run build
```

### 2. 获取飞书应用凭证

1. 登录 [飞书开放平台](https://open.feishu.cn/)
2. 创建企业自建应用
3. 获取 `App ID` 和 `App Secret`
4. 开通所需权限（文档读写、消息发送等）

### 3. 配置 MCP Client

#### Cursor

在 `~/.cursor/mcp.json` 中添加：

```json
{
  "mcpServers": {
    "feishu": {
      "command": "node",
      "args": ["/path/to/feishu-mcp/dist/index.js"],
      "env": {
        "FEISHU_APP_ID": "cli_xxxxxxxxxxxxxxxx",
        "FEISHU_APP_SECRET": "xxxxxxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

#### Claude Desktop

在 `claude_desktop_config.json` 中添加相同的配置。

#### OpenClaw

在 OpenClaw 配置中添加 MCP server。

## 📋 飞书应用所需权限

| 权限 | 用途 |
|------|------|
| `docx:document` | 读写文档 |
| `drive:drive` | 访问云空间 |
| `im:message:send_as_bot` | 发送消息 |
| `wiki:wiki` | 知识库搜索 |

## 🏗️ 技术栈

- TypeScript + Node.js
- MCP SDK (`@modelcontextprotocol/sdk`)
- Zod（参数校验）
- 飞书 Open API

## 💰 适用场景

- **开发者**：Cursor/Claude写代码时直接操作飞书
- **团队协作**：AI自动把代码文档同步到飞书
- **自动化**：用AI Agent自动管理飞书内容
- **企业定制**：基于此MCP server开发定制化飞书集成

## 📄 License

MIT
