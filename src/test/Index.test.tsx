import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Index from "@/pages/Index";
import { analyzeJobFitWithClaude } from "@/lib/claude-analyzer";

// Mock the API client
vi.mock("@/lib/claude-analyzer", () => ({
  analyzeJobFitWithClaude: vi.fn(),
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
    expect(screen.getByText("por Positronica Labs")).toBeInTheDocument();
    expect(
      screen.getByText("Analiza tu fit laboral")
    ).toBeInTheDocument();
  });

  it("shows input fields for job description and CV", () => {
    render(<Index />);
    
    expect(
      screen.getByText("Descripción del Trabajo")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Tu CV/Currículum")
    ).toBeInTheDocument();
  });

  it("disables analyze button when inputs are empty", () => {
    render(<Index />);
    
    const analyzeButton = screen.getByText("Analizar Fit y Brecha Salarial");
    expect(analyzeButton).toBeDisabled();
  });

  it("enables analyze button when both inputs have text", () => {
    render(<Index />);
    
    const jobDescTextarea = screen.getByPlaceholderText(
      /Ejemplo: Buscamos Frontend Developer/i
    );
    const cvTextarea = screen.getByPlaceholderText(
      /Ejemplo: Frontend Developer con 3 años/i
    );
    
    fireEvent.change(jobDescTextarea, {
      target: { value: "Job description text" },
    });
    fireEvent.change(cvTextarea, {
      target: { value: "CV text" },
    });
    
    const analyzeButton = screen.getByText("Analizar Fit y Brecha Salarial");
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
      /Ejemplo: Buscamos Frontend Developer/i
    );
    const cvTextarea = screen.getByPlaceholderText(
      /Ejemplo: Frontend Developer con 3 años/i
    );
    
    fireEvent.change(jobDescTextarea, {
      target: { value: "Senior Frontend Developer position" },
    });
    fireEvent.change(cvTextarea, {
      target: { value: "Frontend Developer with 3 years experience" },
    });
    
    // Click analyze button
    const analyzeButton = screen.getByText("Analizar Fit y Brecha Salarial");
    fireEvent.click(analyzeButton);
    
    // Wait for results
    await waitFor(() => {
      expect(screen.getByText("Análisis Completado")).toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Verify API was called
    expect(analyzeJobFitWithClaude).toHaveBeenCalledWith(
      "Senior Frontend Developer position",
      "Frontend Developer with 3 years experience"
    );
    
    // Verify results are displayed
    expect(screen.getByText("75")).toBeInTheDocument();
    expect(screen.getByText("Fit Score")).toBeInTheDocument();
    expect(
      screen.getByText("Habilidades a Desarrollar")
    ).toBeInTheDocument();
  });

  it("shows error message when API call fails", async () => {
    vi.mocked(analyzeJobFitWithClaude).mockRejectedValue(
      new Error("API key not configured")
    );
    
    render(<Index />);
    
    const jobDescTextarea = screen.getByPlaceholderText(
      /Ejemplo: Buscamos Frontend Developer/i
    );
    const cvTextarea = screen.getByPlaceholderText(
      /Ejemplo: Frontend Developer con 3 años/i
    );
    
    fireEvent.change(jobDescTextarea, {
      target: { value: "Job description" },
    });
    fireEvent.change(cvTextarea, {
      target: { value: "CV text" },
    });
    
    const analyzeButton = screen.getByText("Analizar Fit y Brecha Salarial");
    fireEvent.click(analyzeButton);
    
    // The error message is displayed in an alert div
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("API key not configured")).toBeInTheDocument();
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
      /Ejemplo: Buscamos Frontend Developer/i
    );
    const cvTextarea = screen.getByPlaceholderText(
      /Ejemplo: Frontend Developer con 3 años/i
    );
    
    fireEvent.change(jobDescTextarea, { target: { value: "Job" } });
    fireEvent.change(cvTextarea, { target: { value: "CV" } });
    
    fireEvent.click(screen.getByText("Analizar Fit y Brecha Salarial"));
    
    await waitFor(() => {
      expect(screen.getByText("Análisis Completado")).toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Click "Nuevo análisis" button
    const newAnalysisButton = screen.getByText("← Nuevo análisis");
    fireEvent.click(newAnalysisButton);
    
    // Should return to input form
    expect(
      screen.getByText("Analiza tu fit laboral")
    ).toBeInTheDocument();
  });
});
