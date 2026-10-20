import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { handler } from "../../../netlify/functions/analyze";

const VALID_BODY = JSON.stringify({ jobDescription: "Backend en Node", cvText: "3 años con Node", language: "es" });

const anthropicOk = () => ({
  ok: true,
  status: 200,
  json: async () => ({ content: [{ text: '{"fitScore":42}' }] }),
  text: async () => "",
});

describe("analyze (netlify) exige BYOK", () => {
  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = "sk-ant-server-key";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(anthropicOk()));
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.ANTHROPIC_API_KEY;
  });

  it("sin X-Anthropic-Key responde 401 y jamas toca la key del servidor", async () => {
    const res = await handler(
      { httpMethod: "POST", headers: {}, body: VALID_BODY } as any,
      {} as any,
    );
    expect(res?.statusCode).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("con X-Anthropic-Key llama a Anthropic con la key del usuario", async () => {
    const res = await handler(
      { httpMethod: "POST", headers: { "x-anthropic-key": "sk-ant-user-key" }, body: VALID_BODY } as any,
      {} as any,
    );
    expect(res?.statusCode).toBe(200);
    const call = vi.mocked(fetch).mock.calls[0];
    expect((call[1]?.headers as Record<string, string>)["x-api-key"]).toBe("sk-ant-user-key");
  });
});
