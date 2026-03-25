import { z } from "zod";
import { feishuApi } from "../feishu-client.js";

/**
 * 将 markdown 内容转为飞书文档 block children 格式
 * 简单实现：按行分割，每行作为 paragraph block
 */
function markdownToBlocks(content: string) {
  const lines = content.split("\n");
  const blocks: object[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // 空行 → 空 paragraph
    if (!trimmed) {
      blocks.push({
        block_type: 2, // paragraph
        paragraph: {
          elements: [{ text_run: { content: " " } }],
        },
      });
      continue;
    }

    // 标题检测
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const headingTypeMap: Record<number, number> = {
        1: 3, // heading1
        2: 4, // heading2
        3: 5, // heading3
        4: 6, // heading4
        5: 7, // heading5
        6: 8, // heading6
      };
      blocks.push({
        block_type: headingTypeMap[level] ?? 3,
        [`heading${level > 3 ? level : level}`]: {
          elements: [{ text_run: { content: headingMatch[2] } }],
        },
      });
      continue;
    }

    // 普通文本 paragraph
    blocks.push({
      block_type: 2, // paragraph
      paragraph: {
        elements: [{ text_run: { content: trimmed } }],
      },
    });
  }

  return blocks;
}

export const docWriteTool = {
  name: "feishu_doc_write",
  description:
    "写入内容到飞书文档。会先清空文档再写入（用 markdown 内容）。",
  inputSchema: z.object({
    doc_token: z.string().describe("飞书文档的 document_id / doc_token"),
    content: z.string().describe("要写入的 markdown 内容"),
  }),
  handler: async (input: { doc_token: string; content: string }) => {
    const docId = input.doc_token;

    // 1. 获取文档的根 block_id（document block）
    const docInfo = await feishuApi<{
      document: { document_id: string };
      blocks: Array<{ block_id: string; block_type: number }>;
    }>("GET", `/open-apis/docx/v1/documents/${docId}/blocks?page_size=500`);

    const rootBlock = docInfo.blocks?.[0];
    if (!rootBlock) {
      throw new Error("Cannot find root block of document");
    }

    // 2. 删除根 block 下所有子 block（清空文档）
    const childBlockIds = docInfo.blocks
      .slice(1) // skip root
      .map((b) => b.block_id);

    if (childBlockIds.length > 0) {
      // 批量删除，每次最多 50 个
      for (let i = 0; i < childBlockIds.length; i += 50) {
        const batch = childBlockIds.slice(i, i + 50);
        await feishuApi(
          "POST",
          `/open-apis/docx/v1/documents/${docId}/blocks/batch_delete`,
          {
            start_index: 0,
            end_index: batch.length,
          }
        );
      }
    }

    // 3. 写入新内容
    const blocks = markdownToBlocks(input.content);
    // 飞书 API 限制每次最多 50 个 block
    for (let i = 0; i < blocks.length; i += 50) {
      const batch = blocks.slice(i, i + 50);
      await feishuApi(
        "POST",
        `/open-apis/docx/v1/documents/${docId}/blocks/${rootBlock.block_id}/children`,
        { children: batch, index: 0 }
      );
    }

    return {
      content: [
        {
          type: "text" as const,
          text: `✅ 已写入 ${blocks.length} 个 block 到文档 ${docId}`,
        },
      ],
    };
  },
};
