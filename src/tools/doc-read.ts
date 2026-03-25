import { z } from "zod";
import { feishuApi } from "../feishu-client.js";

export const docReadTool = {
  name: "feishu_doc_read",
  description: "读取飞书文档内容，返回 raw text（markdown 格式）",
  inputSchema: z.object({
    doc_token: z.string().describe("飞书文档的 document_id / doc_token"),
  }),
  handler: async (input: { doc_token: string }) => {
    const data = await feishuApi<{ content: string }>(
      "GET",
      `/open-apis/docx/v1/documents/${input.doc_token}/raw_content`
    );
    return {
      content: [{ type: "text" as const, text: data.content ?? "(empty)" }],
    };
  },
};
