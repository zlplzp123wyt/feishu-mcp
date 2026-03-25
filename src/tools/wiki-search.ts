import { z } from "zod";
import { feishuApi } from "../feishu-client.js";

export const wikiSearchTool = {
  name: "feishu_wiki_search",
  description: "搜索飞书知识库中的页面",
  inputSchema: z.object({
    query: z.string().describe("搜索关键词"),
    space_id: z.string().optional().describe("指定知识库空间 ID（可选）"),
    page_size: z.number().optional().default(20).describe("返回数量，默认 20"),
  }),
  handler: async (input: {
    query: string;
    space_id?: string;
    page_size?: number;
  }) => {
    const body: Record<string, unknown> = {
      query: input.query,
      page_size: input.page_size ?? 20,
    };
    if (input.space_id) {
      body.space_id = input.space_id;
    }

    const data = await feishuApi<{
      items: Array<{
        space_id: string;
        node_token: string;
        obj_token: string;
        obj_type: string;
        title: string;
      }>;
      page_token?: string;
      total?: number;
    }>("POST", "/open-apis/wiki/v2/spaces/search", body);

    const items = data.items ?? [];
    if (items.length === 0) {
      return {
        content: [
          { type: "text" as const, text: `未找到与 "${input.query}" 相关的知识库页面` },
        ],
      };
    }

    const list = items
      .map(
        (item) =>
          `- [${item.obj_type}] ${item.title}\n  node: ${item.node_token} | obj: ${item.obj_token} | space: ${item.space_id}`
      )
      .join("\n");

    return {
      content: [
        {
          type: "text" as const,
          text: `🔍 找到 ${items.length} 个结果:\n${list}`,
        },
      ],
    };
  },
};
