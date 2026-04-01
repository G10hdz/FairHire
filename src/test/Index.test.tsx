import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Index from "@/pages/Index";
import { analyzeJobFitWithClaude } from "@/lib/claude-analyzer";

// Mock the API client
vi.mock("@/lib/claude-analyzer", () => ({
  analyzeJobFitWithClaude: vi.fn(),
}));

// Mock the salary benchmark hook to avoid fetch errors in tests
vi.mock("@/hooks/useSalaryBenchmark", () => ({
  useSalaryBenchmark: () => ({
    data: {
      salario_promedio_hombre: 12500,
      salario_promedio_mujer: 10875,
      brecha_porcentaje: 13.0,
      fuente: "INEGI",
      trimestre: "2024-T4",
      moneda: "MXN",
      es_nacional: true,
      es_cdmx: false,
      muestra_suficiente: true,
    },
    isLoading: false,
    isError: false,
  }),
  getSINCODivision: (sinco: string) => sinco.charAt(0),
}));

// Mock toast hook with proper state management
const mockToast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toasts: [],
    toast: mockToast,
    dismiss: vi.fn(),
  }),
}));

describe("Index Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockToast.mockClear();
  });

  it("renders the main heading and description", () => {
    render(<Index />);

    expect(screen.getByText("FairHire")).toBeInTheDocument();
    // Tagline in header (not the badge)
    const header = screen.getByRole("banner");
    expect(header.querySelector("p")?.textContent).toMatch(/Empowering women in tech|Empoderando a mujeres en tech/i);
  });

  it("shows input fields for job description and CV", () => {
    render(<Index />);

    // Check for textareas by placeholder
    expect(screen.getByPlaceholderText(/Ejemplo: Buscamos Frontend Developer|Example: Looking for Frontend/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ejemplo: Frontend Developer con 3 años|Example: Frontend Developer with 3 years/i)).toBeInTheDocument();
  });

  it("disables analyze button when inputs are empty", () => {
    render(<Index />);

    const analyzeButton = screen.getByRole("button", { name: /Analizar Fit|Analyze Fit/i });
    expect(analyzeButton).toBeDisabled();
  });

  it("enables analyze button when both inputs have text", () => {
    render(<Index />);

    const jobDescTextarea = screen.getByPlaceholderText(
      /Ejemplo: Buscamos Frontend Developer|Example: Looking for Frontend/i
    );
    const cvTextarea = screen.getByPlaceholderText(
      /Ejemplo: Frontend Developer con 3 años|Example: Frontend Developer with 3 years/i
    );

    fireEvent.change(jobDescTextarea, {
      target: { value: "Job description text" },
    });
    fireEvent.change(cvTextarea, {
      target: { value: "CV text" },
    });

    const analyzeButton = screen.getByRole("button", { name: /Analizar Fit|Analyze Fit/i });
    expect(analyzeButton).not.toBeDisabled();
  });

  it("calls API and shows results on successful analysis", async () => {
    const mockResult = {
      fitScore: 75,
      fitSummary: "Tienes un buen fit para el puesto",
      missingSkills: ["TypeScript", "GraphQL"],
      payGapContext: "La brecha salarial es del 15%",
      salaryNegotiationTips: ["Investiga salarios", "Destaca tus logros"],
      coverLetter: "Estimado equipo,\n\nMe interesa el puesto...",
    };

    vi.mocked(analyzeJobFitWithClaude).mockResolvedValue(mockResult);

    render(<Index />);

    // Fill in the inputs
    const jobDescTextarea = screen.getByPlaceholderText(
      /Ejemplo: Buscamos Frontend Developer|Example: Looking for Frontend/i
    );
    const cvTextarea = screen.getByPlaceholderText(
      /Ejemplo: Frontend Developer con 3 años|Example: Frontend Developer with 3 years/i
    );

    fireEvent.change(jobDescTextarea, {
      target: { value: "Senior Frontend Developer position with React and TypeScript. We are looking for an experienced developer to join our team." },
    });
    fireEvent.change(cvTextarea, {
      target: { value: "Frontend Developer with 3 years of experience in React, TypeScript, and modern web technologies." },
    });

    // Click analyze button
    const analyzeButton = screen.getByText(/Analizar Fit|Analyze Fit/i);
    fireEvent.click(analyzeButton);

    // Wait for results
    await waitFor(() => {
      expect(screen.getByText(/Análisis Completado|Analysis Completed/i)).toBeInTheDocument();
    }, { timeout: 2000 });

    // Verify API was called
    expect(analyzeJobFitWithClaude).toHaveBeenCalledWith(
      "Senior Frontend Developer position with React and TypeScript. We are looking for an experienced developer to join our team.",
      "Frontend Developer with 3 years of experience in React, TypeScript, and modern web technologies.",
      expect.any(String)
    );

    // Verify results are displayed
    expect(screen.getByText("75")).toBeInTheDocument();
    expect(screen.getByText(/Fit Score/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Habilidades a Desarrollar|Skills to Develop/i)
    ).toBeInTheDocument();
  });

  it("shows error message when API call fails", async () => {
    vi.mocked(analyzeJobFitWithClaude).mockRejectedValue(
      new Error("API key not configured")
    );

    render(<Index />);

    const jobDescTextarea = screen.getByPlaceholderText(
      /Ejemplo: Buscamos Frontend Developer|Example: Looking for Frontend/i
    );
    const cvTextarea = screen.getByPlaceholderText(
      /Ejemplo: Frontend Developer con 3 años|Example: Frontend Developer with 3 years/i
    );

    fireEvent.change(jobDescTextarea, {
      target: { value: "Senior Frontend Developer position with React and TypeScript. We are looking for an experienced developer to join our team and work on challenging projects. Must have 5+ years of experience." },
    });
    fireEvent.change(cvTextarea, {
      target: { value: "Frontend Developer with 3 years of experience in React, TypeScript, and modern web technologies. I have worked on multiple projects and delivered high-quality code." },
    });

    const analyzeButton = screen.getByText(/Analizar Fit|Analyze Fit/i);
    fireEvent.click(analyzeButton);

    // Wait for the error toast message
    await waitFor(() => {
      expect(screen.getByText(/No pudimos conectar con el servicio|API key not configured/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it("allows starting a new analysis after viewing results", async () => {
    const mockResult = {
      fitScore: 80,
      fitSummary: "Excelente fit",
      missingSkills: ["Docker"],
      payGapContext: "Brecha del 10%",
      salaryNegotiationTips: ["Negocia"],
      coverLetter: "Cover letter",
    };

    vi.mocked(analyzeJobFitWithClaude).mockResolvedValue(mockResult);

    render(<Index />);

    // Fill and submit
    const jobDescTextarea = screen.getByPlaceholderText(
      /Ejemplo: Buscamos Frontend Developer|Example: Looking for Frontend/i
    );
    const cvTextarea = screen.getByPlaceholderText(
      /Ejemplo: Frontend Developer con 3 años|Example: Frontend Developer with 3 years/i
    );

    fireEvent.change(jobDescTextarea, { target: { value: "Senior Frontend Developer position with React and TypeScript. We are looking for an experienced developer to join our team." } });
    fireEvent.change(cvTextarea, { target: { value: "Frontend Developer with 3 years of experience in React, TypeScript, and modern web technologies." } });

    fireEvent.click(screen.getByText(/Analizar Fit|Analyze Fit/i));

    await waitFor(() => {
      expect(screen.getByText(/Análisis Completado|Analysis Completed/i)).toBeInTheDocument();
    }, { timeout: 2000 });

    // Click "Nuevo análisis" or "New analysis" button
    const newAnalysisButton = screen.getByText(/← Nuevo análisis|← New analysis/i);
    fireEvent.click(newAnalysisButton);

    // Should return to input form
    expect(
      screen.getByText(/Analiza tu fit laboral|Analyze your job fit/i)
    ).toBeInTheDocument();
  });
});
