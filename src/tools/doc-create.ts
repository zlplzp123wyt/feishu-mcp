import { z } from "zod";
import { feishuApi } from "../feishu-client.js";

export const docCreateTool = {
  name: "feishu_doc_create",
  description: "创建新的飞书文档，可选择指定目标文件夹",
  inputSchema: z.object({
    title: z.string().describe("文档标题"),
    folder_token: z.string().optional().describe("目标文件夹 token（可选）"),
  }),
  handler: async (input: { title: string; folder_token?: string }) => {
    const body: Record<string, string> = { title: input.title };
    if (input.folder_token) {
      body.folder_token = input.folder_token;
    }

    const data = await feishuApi<{
      document: {
        document_id: string;
        revision_id: number;
        title: string;
      };
    }>("POST", "/open-apis/docx/v1/documents", body);

    const doc = data.document;
    return {
      content: [
        {
          type: "text" as const,
          text: `✅ 文档已创建\n标题: ${doc.title}\ndocument_id: ${doc.document_id}\n链接: https://feishu.cn/docx/${doc.document_id}`,
        },
      ],
    };
  },
};
