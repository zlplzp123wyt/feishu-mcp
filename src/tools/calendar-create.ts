import { z } from "zod";
import { feishuApi } from "../feishu-client.js";

/**
 * 创建飞书日历事件
 */
export const calendarCreateTool = {
  name: "feishu_calendar_create",
  description: "创建飞书日历事件（会议/提醒/日程）",
  inputSchema: z.object({
    summary: z.string().describe("事件标题"),
    description: z.string().optional().describe("事件描述"),
    start_time: z.string().describe("开始时间，ISO 8601格式，如 2026-03-26T10:00:00+08:00"),
    end_time: z.string().describe("结束时间，ISO 8601格式"),
    attendees: z.array(z.string()).optional().describe("参与者 open_id 列表"),
    calendar_id: z.string().optional().describe("日历ID，默认使用主日历"),
  }),
  handler: async (input: {
    summary: string;
    description?: string;
    start_time: string;
    end_time: string;
    attendees?: string[];
    calendar_id?: string;
  }) => {
    const body: Record<string, unknown> = {
      summary: input.summary,
      description: input.description ?? "",
      start_time: { timestamp: Math.floor(new Date(input.start_time).getTime() / 1000).toString() },
      end_time: { timestamp: Math.floor(new Date(input.end_time).getTime() / 1000).toString() },
    };

    if (input.attendees && input.attendees.length > 0) {
      body.need_notification = true;
    }

    const calId = input.calendar_id ?? "primary";
    const data = await feishuApi<{ event_id: string }>(
      "POST",
      `/open-apis/calendar/v4/calendars/${calId}/events`,
      body
    );

    return {
      content: [
        {
          type: "text" as const,
          text: `✅ 日历事件已创建\n事件ID: ${data.event_id}\n标题: ${input.summary}\n时间: ${input.start_time} ~ ${input.end_time}`,
        },
      ],
    };
  },
};
