import { z } from "zod";
import { feishuApi } from "../feishu-client.js";

/**
 * 操作飞书多维表格（Bitable）
 */
export const bitableTool = {
  name: "feishu_bitable",
  description: "读写飞书多维表格数据（新增/查询/更新记录）",
  inputSchema: z.object({
    action: z.enum(["list_records", "create_record", "search"]).describe("操作类型"),
    app_token: z.string().describe("多维表格 app_token"),
    table_id: z.string().describe("数据表 table_id"),
    record: z.record(z.string()).optional().describe("新增记录的字段值，如 {\"名称\": \"xxx\", \"状态\": \"进行中\"}"),
    filter: z.string().optional().describe("搜索条件（search action使用）"),
    page_size: z.number().optional().default(20),
  }),
  handler: async (input: {
    action: string;
    app_token: string;
    table_id: string;
    record?: Record<string, string>;
    filter?: string;
    page_size?: number;
  }) => {
    const basePath = `/open-apis/bitable/v1/apps/${input.app_token}/tables/${input.table_id}/records`;

    if (input.action === "create_record") {
      if (!input.record) {
        throw new Error("create_record 需要提供 record 参数");
      }
      // 飞书bitable字段值需要包装在 {fields: {...}} 中
      const fields: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(input.record)) {
        fields[k] = [{ type: "text", text: v }];
      }
      const data = await feishuApi("POST", basePath, { fields });
      return {
        content: [{ type: "text" as const, text: `✅ 记录已创建\n${JSON.stringify(input.record, null, 2)}` }],
      };
    }

    if (input.action === "list_records") {
      const data = await feishuApi<{ items: unknown[]; total: number }>(
        "GET",
        basePath,
        undefined,
        { page_size: String(input.page_size ?? 20) }
      );
      return {
        content: [{ type: "text" as const, text: `📊 共 ${data.total} 条记录（返回 ${data.items?.length ?? 0} 条）\n${JSON.stringify(data.items?.slice(0, 5), null, 2)}` }],
      };
    }

    if (input.action === "search") {
      const data = await feishuApi<{ items: unknown[] }>(
        "POST",
        `${basePath}/search`,
        { filter: input.filter ? { conjunction: "and", conditions: [{ field_name: "名称", operator: "is", value: [input.filter] }] } : undefined, page_size: input.page_size ?? 20 }
      );
      return {
        content: [{ type: "text" as const, text: `🔍 搜索结果：\n${JSON.stringify(data.items, null, 2)}` }],
      };
    }

    throw new Error(`Unknown action: ${input.action}`);
  },
};
