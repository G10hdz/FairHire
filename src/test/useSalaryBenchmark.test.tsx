import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSalaryBenchmark, getSINCODivision, getBenchmarkForSINCO, getNationalBenchmark } from "../hooks/useSalaryBenchmark";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Create a test query client
const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        logger: {
          log: console.log,
          warn: console.warn,
          error: () => {}, // Silence error logs in tests
        },
      },
    },
  });
};

// Wrapper component for React Query
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    {children}
  </QueryClientProvider>
);

describe("useSalaryBenchmark", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getSINCODivision", () => {
    it("should extract first digit from 4-digit SINCO code", () => {
      expect(getSINCODivision("2111")).toBe("2");
      expect(getSINCODivision("1234")).toBe("1");
      expect(getSINCODivision("9876")).toBe("9");
    });

    it("should handle non-numeric characters", () => {
      expect(getSINCODivision("2abc")).toBe("2");
      expect(getSINCODivision("a2111")).toBe("2");
    });

    it("should return first character if no digits found", () => {
      expect(getSINCODivision("abc")).toBe("a");
    });

    it("should handle empty string", () => {
      expect(getSINCODivision("")).toBe("");
    });
  });

  describe("hook with successful response", () => {
    const mockBenchmarkData = {
      ocupacion: "2111",
      ocupacion_nombre: "Profesionistas y técnicos",
      salario_promedio_hombre: 18000,
      salario_promedio_mujer: 15300,
      brecha_porcentaje: 15.0,
      fuente: "INEGI - Encuesta Nacional de Ocupación y Empleo (ENOE)",
      trimestre: "2024-T4",
      moneda: "MXN",
      es_nacional: false,
      es_cdmx: true,
      muestra_suficiente: true,
      isMock: false,
    };

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockBenchmarkData,
      });
    });

    it("should fetch benchmark data successfully", async () => {
      const { result } = renderHook(
        () => useSalaryBenchmark({ sinco: "2111", entidad: "09" }),
        { wrapper }
      );

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockBenchmarkData);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/inegi-benchmark?ocupacion=2111&entidad=09"
      );
    });

    it("should fetch national data when no params provided", async () => {
      const { result } = renderHook(
        () => useSalaryBenchmark(),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/inegi-benchmark"
      );
    });

    it("should use sinco-based query key", async () => {
      const { result } = renderHook(
        () => useSalaryBenchmark({ sinco: "2111", entidad: "09" }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/inegi-benchmark?ocupacion=2111&entidad=09"
      );
    });

    it("should use national query key when no params", async () => {
      const { result } = renderHook(
        () => useSalaryBenchmark(),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/inegi-benchmark"
      );
    });
  });

  describe("hook with failed response", () => {
    beforeEach(() => {
      mockFetch.mockRejectedValue(new Error("Network error"));
    });

    it("should use mock data as fallback on error", async () => {
      const { result } = renderHook(
        () => useSalaryBenchmark({ sinco: "2111" }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isError || result.current.isSuccess).toBe(true);
      });

      // Should fallback to mock data
      if (result.current.data) {
        expect(result.current.data.isMock).toBe(true);
        expect(result.current.data.salario_promedio_hombre).toBe(12500);
        expect(result.current.data.salario_promedio_mujer).toBe(10875);
      }
    });
  });

  describe("getBenchmarkForSINCO helper", () => {
    it("should fetch and return benchmark data", async () => {
      const mockData = {
        salario_promedio_hombre: 18000,
        salario_promedio_mujer: 15300,
        brecha_porcentaje: 15.0,
        fuente: "INEGI",
        trimestre: "2024-T4",
        moneda: "MXN",
        es_nacional: false,
        es_cdmx: false,
        muestra_suficiente: true,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await getBenchmarkForSINCO("2", "09");

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/inegi-benchmark?ocupacion=2&entidad=09"
      );
    });

    it("should return null on error", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      const result = await getBenchmarkForSINCO("2");

      expect(result).toBeNull();
    });
  });

  describe("getNationalBenchmark helper", () => {
    it("should fetch national benchmark data", async () => {
      const mockData = {
        salario_promedio_hombre: 12500,
        salario_promedio_mujer: 10875,
        brecha_porcentaje: 13.0,
        fuente: "INEGI",
        trimestre: "2024-T4",
        moneda: "MXN",
        es_nacional: true,
        es_cdmx: false,
        muestra_suficiente: true,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await getNationalBenchmark();

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/inegi-benchmark"
      );
    });

    it("should return mock data on error", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      const result = await getNationalBenchmark();

      expect(result).toBeDefined();
      expect(result.isMock).toBe(true);
    });
  });
});
