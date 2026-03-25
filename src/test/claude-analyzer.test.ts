import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { analyzeJobFitWithClaude } from "@/lib/claude-analyzer";

describe("claude-analyzer API client", () => {
  const mockJobDescription = "Senior Frontend Developer position";
  const mockCvText = "Frontend Developer with 3 years experience";

  const mockValidResponse = {
    fitScore: 80,
    fitSummary: "Tienes un buen fit para el puesto",
    missingSkills: ["TypeScript", "GraphQL"],
    payGapContext: "La brecha salarial es del 15%",
    salaryNegotiationTips: ["Investiga salarios", "Destaca tus logros"],
    coverLetter: "Estimado equipo,\n\nMe interesa el puesto...",
  };

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls the API endpoint with correct parameters", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockValidResponse,
    } as Response);

    await analyzeJobFitWithClaude(mockJobDescription, mockCvText);

    expect(global.fetch).toHaveBeenCalledWith(
      "/.netlify/functions/analyze",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription: mockJobDescription,
          cvText: mockCvText,
        }),
      })
    );
  });

  it("returns parsed result on successful response", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockValidResponse,
    } as Response);

    const result = await analyzeJobFitWithClaude(mockJobDescription, mockCvText);

    expect(result).toEqual(mockValidResponse);
    expect(result.fitScore).toBe(80);
    expect(result.missingSkills).toHaveLength(2);
  });

  it("throws error when API returns error status", async () => {
    const errorMessage = "API key not configured";
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => errorMessage,
    } as Response);

    await expect(
      analyzeJobFitWithClaude(mockJobDescription, mockCvText)
    ).rejects.toThrow("API Error: 500");
  });

  it("throws error when response is missing required fields", async () => {
    const invalidResponse = {
      fitScore: 80,
      // Missing other required fields
    };

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => invalidResponse,
    } as Response);

    await expect(
      analyzeJobFitWithClaude(mockJobDescription, mockCvText)
    ).rejects.toThrow("Invalid response format from API");
  });

  it("throws error on network failure", async () => {
    vi.mocked(global.fetch).mockRejectedValue(new Error("Network error"));

    await expect(
      analyzeJobFitWithClaude(mockJobDescription, mockCvText)
    ).rejects.toThrow();
  });

  it("handles rate limit errors (429)", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 429,
      text: async () => "Rate limit exceeded",
    } as Response);

    await expect(
      analyzeJobFitWithClaude(mockJobDescription, mockCvText)
    ).rejects.toThrow("API Error: 429");
  });

  it("retries on 529 error and succeeds on the next attempt", async () => {
    vi.useFakeTimers();

    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: false,
        status: 529,
        text: async () => '{"error":"AI API error: 529"}',
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockValidResponse,
      } as Response);

    const resultPromise = analyzeJobFitWithClaude(mockJobDescription, mockCvText);
    await vi.runAllTimersAsync();
    const result = await resultPromise;

    expect(result).toEqual(mockValidResponse);
    expect(global.fetch).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });

  it("throws after exhausting all 3 retries on persistent 529 errors", async () => {
    vi.useFakeTimers();

    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 529,
      text: async () => '{"error":"AI API error: 529"}',
    } as Response);

    const resultPromise = analyzeJobFitWithClaude(mockJobDescription, mockCvText);
    // Attach rejection handler immediately to prevent unhandled rejection warning
    const caughtPromise = resultPromise.catch((err: unknown) => err);

    await vi.runAllTimersAsync();

    const error = await caughtPromise;
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain("API Error: 529");
    expect(global.fetch).toHaveBeenCalledTimes(4); // 1 initial + 3 retries

    vi.useRealTimers();
  });

  it("does not retry on non-529 errors", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "Internal Server Error",
    } as Response);

    await expect(
      analyzeJobFitWithClaude(mockJobDescription, mockCvText)
    ).rejects.toThrow("API Error: 500");
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
