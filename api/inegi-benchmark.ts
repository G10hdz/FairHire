import type { VercelRequest, VercelResponse } from "@vercel/node";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

/**
 * INEGI Benchmark API
 *
 * Endpoint: GET /api/inegi-benchmark?ocupacion={sinco_code}&entidad={ent_code}
 *
 * Query params:
 *   - ocupacion: SINCO code (4 digits) or division (1 digit)
 *   - entidad: Entity code (09 = CDMX)
 *
 * Returns salary benchmarks from ENOE data with gender gap analysis.
 */

// Mock data fallback when salary_benchmarks.json doesn't exist
const MOCK_DATA = {
  fuente: "INEGI - Encuesta Nacional de Ocupación y Empleo (ENOE)",
  trimestre: "2024-T4",
  moneda: "MXN",
  unidad: "ingreso_mensual_promedio",
  isMock: true,
  datos: {
    nacional: {
      hombre: 12500,
      mujer: 10875,
      brecha_pct: 13.0,
      descripcion: "Brecha salarial de género a nivel nacional"
    },
    por_ocupacion: {
      "1": { nombre: "Funcionarios, directores y jefes", hombre: 25000, mujer: 21250, brecha_pct: 15.0 },
      "2": { nombre: "Profesionistas y técnicos", hombre: 18000, mujer: 15300, brecha_pct: 15.0 },
      "3": { nombre: "Trabajadores auxiliares administrativos", hombre: 9500, mujer: 8550, brecha_pct: 10.0 },
      "4": { nombre: "Comerciantes y agentes de ventas", hombre: 11000, mujer: 9350, brecha_pct: 15.0 },
      "5": { nombre: "Trabajadores en servicios personales", hombre: 8500, mujer: 7650, brecha_pct: 10.0 },
      "6": { nombre: "Trabajadores agrícolas", hombre: 7000, mujer: 5950, brecha_pct: 15.0 },
      "7": { nombre: "Trabajadores artesanales y construcción", hombre: 10500, mujer: 8925, brecha_pct: 15.0 },
      "8": { nombre: "Operadores de maquinaria industrial", hombre: 12000, mujer: 10200, brecha_pct: 15.0 },
      "9": { nombre: "Trabajadores en actividades elementales", hombre: 6500, mujer: 5850, brecha_pct: 10.0 }
    },
    cdmx: {
      hombre: 16000,
      mujer: 13600,
      brecha_pct: 15.0
    }
  }
};

export interface BenchmarkData {
  fuente: string;
  trimestre: string;
  moneda: string;
  unidad: string;
  datos: {
    nacional: {
      hombre: number;
      mujer: number;
      brecha_pct: number;
      descripcion: string;
    };
    por_ocupacion: Record<string, {
      nombre: string;
      hombre: number;
      mujer: number;
      brecha_pct: number;
    }>;
    cdmx?: {
      hombre: number;
      mujer: number;
      brecha_pct: number;
    };
  };
}

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

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=604800", // 7 days
  "ETag": `"inegi-benchmark-${Date.now()}"`
};

function loadBenchmarkData(): BenchmarkData {
  const dataPath = process.env.INEGI_DATA_PATH || join(__dirname, "data", "salary_benchmarks.json");

  if (existsSync(dataPath)) {
    try {
      const fileContent = readFileSync(dataPath, "utf-8");
      return JSON.parse(fileContent) as BenchmarkData;
    } catch (error) {
      console.error("Error loading salary_benchmarks.json:", error);
      return MOCK_DATA as unknown as BenchmarkData;
    }
  }

  // Fallback to mock data
  return MOCK_DATA as unknown as BenchmarkData;
}

function extractSINCODivision(sincoCode: string): string {
  // Extract first digit from 4-digit SINCO code
  const cleanCode = sincoCode.replace(/\D/g, "");
  return cleanCode.charAt(0) || sincoCode.charAt(0);
}

function calculateSampleSufficient(division: string, data: BenchmarkData): boolean {
  // Heuristic: if we have data for this division, assume sample is sufficient
  // In production, this could be enhanced with actual sample size data
  return !!data.datos.por_ocupacion[division];
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(204).setHeader("Access-Control-Allow-Origin", "*").send("");
  }

  if (req.method !== "GET") {
    return res.status(405).setHeader("Access-Control-Allow-Origin", "*").json({ error: "Method Not Allowed" });
  }

  try {
    const data = loadBenchmarkData();
    const queryOcupacion = req.query.ocupacion as string | undefined;
    const queryEntidad = req.query.entidad as string | undefined;

    const isCDMX = queryEntidad === "09" || queryEntidad === "9";
    let response: BenchmarkResponse;

    if (!queryOcupacion) {
      // Return only national data
      response = {
        salario_promedio_hombre: data.datos.nacional.hombre,
        salario_promedio_mujer: data.datos.nacional.mujer,
        brecha_porcentaje: data.datos.nacional.brecha_pct,
        fuente: data.fuente,
        trimestre: data.trimestre,
        moneda: data.moneda,
        es_nacional: true,
        es_cdmx: false,
        muestra_suficiente: true,
        isMock: (data as any).isMock
      };
    } else {
      // Get data for specific occupation/division
      const division = extractSINCODivision(queryOcupacion);
      const ocupacionData = data.datos.por_ocupacion[division];

      if (ocupacionData) {
        // Check if CDMX-specific data is requested and available
        let salarioHombre = ocupacionData.hombre;
        let salarioMujer = ocupacionData.mujer;
        let brechaPct = ocupacionData.brecha_pct;

        // If CDMX is requested and we have national data, we could apply a CDMX multiplier
        // For now, we use national occupation data with a note
        if (isCDMX && data.datos.cdmx) {
          // Apply CDMX premium (CDMX salaries are typically ~28% higher than national avg)
          const cdmxMultiplier = data.datos.cdmx.hombre / data.datos.nacional.hombre;
          salarioHombre = Math.round(ocupacionData.hombre * cdmxMultiplier);
          salarioMujer = Math.round(ocupacionData.mujer * cdmxMultiplier);
          // Brecha percentage stays the same
        }

        response = {
          ocupacion: queryOcupacion,
          ocupacion_nombre: ocupacionData.nombre,
          salario_promedio_hombre: salarioHombre,
          salario_promedio_mujer: salarioMujer,
          brecha_porcentaje: brechaPct,
          fuente: data.fuente,
          trimestre: data.trimestre,
          moneda: data.moneda,
          es_nacional: !isCDMX,
          es_cdmx: isCDMX,
          muestra_suficiente: calculateSampleSufficient(division, data),
          isMock: (data as any).isMock
        };
      } else {
        // No data for this specific division, return national with warning
        response = {
          ocupacion: queryOcupacion,
          salario_promedio_hombre: data.datos.nacional.hombre,
          salario_promedio_mujer: data.datos.nacional.mujer,
          brecha_porcentaje: data.datos.nacional.brecha_pct,
          fuente: data.fuente,
          trimestre: data.trimestre,
          moneda: data.moneda,
          es_nacional: true,
          es_cdmx: false,
          muestra_suficiente: false,
          isMock: (data as any).isMock
        };
      }
    }

    return res.status(200).setHeader("Access-Control-Allow-Origin", "*").setHeader("Cache-Control", "public, max-age=604800").json(response);
  } catch (error) {
    console.error("INEGI Benchmark error:", error);
    return res.status(500).setHeader("Access-Control-Allow-Origin", "*").json({
      error: "Error processing INEGI benchmark data",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
