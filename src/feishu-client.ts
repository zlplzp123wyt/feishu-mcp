/**
 * 飞书 API 客户端封装
 * 处理 tenant_access_token 获取、缓存、刷新，以及 HTTP 请求
 */

const FEISHU_BASE = "https://open.feishu.cn";

interface TokenCache {
  token: string;
  expiresAt: number; // unix timestamp ms
}

let tokenCache: TokenCache | null = null;

function log(...args: unknown[]): void {
  console.error("[feishu-mcp]", ...args);
}

/**
 * 获取 tenant_access_token，带缓存和自动刷新
 */
async function getToken(): Promise<string> {
  const appId = process.env.FEISHU_APP_ID;
  const appSecret = process.env.FEISHU_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error(
      "Missing FEISHU_APP_ID or FEISHU_APP_SECRET environment variables"
    );
  }

  // 缓存命中且未过期（提前 60s 刷新）
  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.token;
  }

  log("Refreshing tenant_access_token...");

  const res = await fetch(
    `${FEISHU_BASE}/open-apis/auth/v3/tenant_access_token/internal`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
    }
  );

  if (!res.ok) {
    throw new Error(`Token request failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as {
    code: number;
    msg: string;
    tenant_access_token?: string;
    expire?: number;
  };

  if (data.code !== 0 || !data.tenant_access_token) {
    throw new Error(`Token error: ${data.msg} (code=${data.code})`);
  }

  tokenCache = {
    token: data.tenant_access_token,
    expiresAt: Date.now() + (data.expire ?? 7200) * 1000,
  };

  log("Token refreshed, expires in", data.expire, "seconds");
  return tokenCache.token;
}

/**
 * 通用 API 请求方法
 */
export async function feishuApi<T = unknown>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
  params?: Record<string, string>
): Promise<T> {
  const token = await getToken();

  const url = new URL(`${FEISHU_BASE}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = (await res.json()) as { code: number; msg: string; data?: T };

  if (data.code !== 0) {
    throw new Error(`Feishu API error: ${data.msg} (code=${data.code}, path=${path})`);
  }

  return data.data as T;
}
