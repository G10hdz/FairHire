import { describe, it, expect, vi } from "vitest";
import { handler as analyzeNetlify } from "../../../netlify/functions/analyze";
import { handler as inegiNetlify } from "../../../netlify/functions/inegi-benchmark";
import analyzeVercel from "../../../api/analyze";
import inegiVercel from "../../../api/inegi-benchmark";

const ORIGIN_OK = "https://fairfit-ai.netlify.app";
const ORIGIN_PREVIEW = "https://deploy-preview-12--fairfit-ai.netlify.app";
const ORIGIN_MALO = "https://evil.example";
const ACAO = "Access-Control-Allow-Origin";

const fakeRes = () => {
  const res: any = { statusCode: undefined, body: undefined, headers: {} as Record<string, string> };
  res.status = (c: number) => { res.statusCode = c; return res; };
  res.setHeader = (k: string, v: string) => { res.headers[k] = v; return res; };
  res.json = (b: unknown) => { res.body = b; return res; };
  res.send = (b: unknown) => { res.body = b; return res; };
  return res;
};

describe("CORS: solo orígenes permitidos, nunca *", () => {
  it("analyze (netlify): OPTIONS de un origen ajeno no concede CORS", async () => {
    const res = await analyzeNetlify(
      { httpMethod: "OPTIONS", headers: { origin: ORIGIN_MALO }, body: "" } as any, {} as any);
    expect(res?.headers?.[ACAO]).toBeUndefined();
  });

  it("analyze (netlify): OPTIONS del dominio de producción devuelve ese origen y Vary", async () => {
    const res = await analyzeNetlify(
      { httpMethod: "OPTIONS", headers: { origin: ORIGIN_OK }, body: "" } as any, {} as any);
    expect(res?.headers?.[ACAO]).toBe(ORIGIN_OK);
    expect(res?.headers?.["Vary"]).toBe("Origin");
  });

  it("analyze (netlify): los deploy previews de Netlify sí pasan", async () => {
    const res = await analyzeNetlify(
      { httpMethod: "OPTIONS", headers: { origin: ORIGIN_PREVIEW }, body: "" } as any, {} as any);
    expect(res?.headers?.[ACAO]).toBe(ORIGIN_PREVIEW);
  });

  it("analyze (netlify): POST desde origen ajeno no devuelve ACAO *", async () => {
    const res = await analyzeNetlify(
      { httpMethod: "POST", headers: { origin: ORIGIN_MALO }, body: "{}" } as any, {} as any);
    expect(res?.headers?.[ACAO]).not.toBe("*");
  });

  it("inegi (netlify): GET de origen ajeno no concede CORS", async () => {
    const res = await inegiNetlify(
      { httpMethod: "GET", headers: { origin: ORIGIN_MALO }, queryStringParameters: {} } as any, {} as any);
    expect(res?.headers?.[ACAO]).toBeUndefined();
  });

  it("analyze (vercel): OPTIONS de origen ajeno responde 204 sin ACAO", () => {
    const res = fakeRes();
    analyzeVercel({ method: "OPTIONS", headers: { origin: ORIGIN_MALO } } as any, res);
    expect(res.statusCode).toBe(204);
    expect(res.headers[ACAO]).toBeUndefined();
  });

  it("analyze (vercel): OPTIONS del dominio de producción sí setea ACAO", () => {
    const res = fakeRes();
    analyzeVercel({ method: "OPTIONS", headers: { origin: ORIGIN_OK } } as any, res);
    expect(res.headers[ACAO]).toBe(ORIGIN_OK);
  });

  it("inegi (vercel): GET de origen ajeno no setea ACAO", async () => {
    const res = fakeRes();
    inegiVercel({ method: "GET", headers: { origin: ORIGIN_MALO }, query: {} } as any, res);
    await vi.waitFor(() => expect(res.statusCode).toBe(200));
    expect(res.headers[ACAO]).toBeUndefined();
  });
});
