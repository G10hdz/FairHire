import { useQuery } from "@tanstack/react-query";

/**
 * useSalaryBenchmark Hook
 * 
 * Fetches salary benchmark data from INEGI ENOE with React Query caching.
 * Cache duration: 7 days (604800000 ms)
 * 
 * @param params - Query parameters
 * @param params.sinco - SINCO occupation code (4 digits, e.g., "2111")
 * @param params.entidad - Entity code (e.g., "09" for CDMX)
 */

export interface BenchmarkResponse {
  ocupacion?: string;
  ocupacion_nombre?: string;
  salario_promedio_hombre: number;
  salario_promedio_mujer: number;
  brecha_porcentaje: number;
  fuente: string;
  trimestre: string;
  moneda: string;
  es_nacional: boolean;
  es_cdmx: boolean;
  muestra_suficiente: boolean;
  isMock?: boolean;
}

export interface UseSalaryBenchmarkParams {
  sinco?: string;
  entidad?: string;
}

const QUERY_KEY_BASE = "inegi-benchmark";
const STALE_TIME = 604800000; // 7 days in milliseconds
const CACHE_TIME = 604800000; // 7 days

// Mock data fallback
const MOCK_BENCHMARK: BenchmarkResponse = {
  salario_promedio_hombre: 12500,
  salario_promedio_mujer: 10875,
  brecha_porcentaje: 13.0,
  fuente: "INEGI - Encuesta Nacional de Ocupación y Empleo (ENOE)",
  trimestre: "2024-T4",
  moneda: "MXN",
  es_nacional: true,
  es_cdmx: false,
  muestra_suficiente: true,
  isMock: true
};

/**
 * Extracts SINCO division (first digit) from a 4-digit SINCO code
 * @param sinco - SINCO code (e.g., "2111" → "2")
 */
export function getSINCODivision(sinco: string): string {
  const cleanCode = sinco.replace(/\D/g, "");
  return cleanCode.charAt(0) || sinco.charAt(0);
}

/**
 * Fetches benchmark data for a specific SINCO division
 * @param division - SINCO division (first digit)
 * @param entidad - Entity code (optional)
 */
export async function getBenchmarkForSINCO(
  division: string,
  entidad?: string
): Promise<BenchmarkResponse | null> {
  try {
    const params = new URLSearchParams();
    params.set("ocupacion", division);
    if (entidad) {
      params.set("entidad", entidad);
    }

    const response = await fetch(`/.netlify/functions/inegi-benchmark?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data as BenchmarkResponse;
  } catch (error) {
    console.error("Failed to fetch SINCO benchmark:", error);
    return null;
  }
}

/**
 * Fetches national benchmark data
 */
export async function getNationalBenchmark(): Promise<BenchmarkResponse> {
  try {
    const response = await fetch("/.netlify/functions/inegi-benchmark");
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data as BenchmarkResponse;
  } catch (error) {
    console.error("Failed to fetch national benchmark, using mock data:", error);
    return MOCK_BENCHMARK;
  }
}

async function fetchBenchmark(params?: UseSalaryBenchmarkParams): Promise<BenchmarkResponse> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.sinco) {
      searchParams.set("ocupacion", params.sinco);
    }
    if (params?.entidad) {
      searchParams.set("entidad", params.entidad);
    }

    const url = `/.netlify/functions/inegi-benchmark${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data as BenchmarkResponse;
  } catch (error) {
    console.error("INEGI benchmark fetch failed, using fallback:", error);
    return MOCK_BENCHMARK;
  }
}

export function useSalaryBenchmark(params?: UseSalaryBenchmarkParams) {
  const queryKey = params?.sinco
    ? [QUERY_KEY_BASE, params.sinco, params.entidad || "national"]
    : [QUERY_KEY_BASE, "national"];

  return useQuery<BenchmarkResponse>({
    queryKey,
    queryFn: () => fetchBenchmark(params),
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

export default useSalaryBenchmark;
