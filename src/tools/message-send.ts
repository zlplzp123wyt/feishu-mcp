import { z } from "zod";
import { feishuApi } from "../feishu-client.js";

export const messageSendTool = {
  name: "feishu_message_send",
  description: "发送飞书消息给用户或群组",
  inputSchema: z.object({
    receive_id: z
      .string()
      .describe("接收方 ID（open_id 或 chat_id）"),
    receive_id_type: z
      .enum(["open_id", "user_id", "union_id", "chat_id", "email"])
      .optional()
      .default("open_id")
      .describe("接收方 ID 类型"),
    msg_type: z
      .string()
      .describe(
        "消息类型: text, post, image, interactive, share_chat, share_user 等"
      ),
    content: z.string().describe("消息内容 JSON 字符串"),
  }),
  handler: async (input: {
    receive_id: string;
    receive_id_type?: string;
    msg_type: string;
    content: string;
  }) => {
    const data = await feishuApi<{
      message_id: string;
      create_time: string;
    }>(
      "POST",
      `/open-apis/im/v1/messages?receive_id_type=${input.receive_id_type ?? "open_id"}`,
      {
        receive_id: input.receive_id,
        msg_type: input.msg_type,
        content: input.content,
      }
    );

    return {
      content: [
        {
          type: "text" as const,
          text: `✅ 消息已发送\nmessage_id: ${data.message_id}\ncreate_time: ${data.create_time}`,
        },
      ],
    };
  },
};
