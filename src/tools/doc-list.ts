import { z } from "zod";
import { feishuApi } from "../feishu-client.js";

export const docListTool = {
  name: "feishu_doc_list",
  description: "列出飞书云空间指定文件夹下的文件",
  inputSchema: z.object({
    folder_token: z.string().describe("文件夹 token"),
    page_size: z.number().optional().default(50).describe("每页数量，默认 50"),
    page_token: z.string().optional().describe("翻页 token"),
  }),
  handler: async (input: {
    folder_token: string;
    page_size?: number;
    page_token?: string;
  }) => {
    const params: Record<string, string> = {
      folder_token: input.folder_token,
      page_size: String(input.page_size ?? 50),
    };
    if (input.page_token) {
      params.page_token = input.page_token;
    }

    const data = await feishuApi<{
      files: Array<{
        token: string;
        name: string;
        type: string;
        created_time: string;
        modified_time: string;
        url: string;
      }>;
      page_token?: string;
      has_more?: boolean;
    }>("GET", "/open-apis/drive/v1/files", undefined, params);

    const files = data.files ?? [];
    if (files.length === 0) {
      return {
        content: [{ type: "text" as const, text: "该文件夹为空" }],
      };
    }

    const list = files
      .map(
        (f) =>
          `- [${f.type}] ${f.name} (${f.token}) — modified: ${f.modified_time}`
      )
      .join("\n");

    const moreInfo = data.has_more
      ? `\n\n还有更多文件，page_token: ${data.page_token}`
      : "";

    return {
      content: [
        {
          type: "text" as const,
          text: `📁 共 ${files.length} 个文件:\n${list}${moreInfo}`,
        },
      ],
    };
  },
};
