# feishu-mcp

让 AI Coding Agent（Cursor / Claude Code / Windsurf 等）通过 MCP 协议直接操作飞书。

## 安装

```bash
git clone https://github.com/yourname/feishu-mcp.git
cd feishu-mcp
npm install
npm run build
```

## 配置

### 1. 获取飞书应用凭证

在 [飞书开放平台](https://open.feishu.cn/) 创建应用，获取 `App ID` 和 `App Secret`。

### 2. 设置环境变量

```bash
export FEISHU_APP_ID="cli_xxxxxxxxxxxxxxxx"
export FEISHU_APP_SECRET="xxxxxxxxxxxxxxxxxxxxxxxx"
```

### 3. 飞书应用权限

确保应用已开通以下权限（按需）：

| 权限 | 用途 |
|------|------|
| `docx:document:read` | 读取文档 |
| `docx:document:edit` | 写入文档 |
| `drive:drive:readonly` | 列出文件 |
| `im:message:send_as_bot` | 发送消息 |
| `wiki:wiki:readonly` | 搜索知识库 |

## Cursor 配置

在 Cursor Settings → MCP 中添加：

```json
{
  "mcpServers": {
    "feishu-mcp": {
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

## Claude Code 配置

在项目根目录创建 `.cursor/mcp.json` 或在 `~/.claude/mcp.json` 中添加：

```json
{
  "mcpServers": {
    "feishu-mcp": {
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

## 支持的工具

| 工具名 | 说明 |
|--------|------|
| `feishu_doc_read` | 读取飞书文档内容 |
| `feishu_doc_write` | 写入内容到飞书文档（覆盖） |
| `feishu_doc_create` | 创建新文档 |
| `feishu_doc_list` | 列出文件夹下的文件 |
| `feishu_message_send` | 发送消息给用户或群组 |
| `feishu_wiki_search` | 搜索飞书知识库 |

## 开发

```bash
# 安装依赖
npm install

# 构建
npm run build

# 开发模式（tsx 热重载）
npm run dev
```

## License

MIT
