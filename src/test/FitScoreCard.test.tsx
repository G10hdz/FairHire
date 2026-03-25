import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FitScoreCard } from "@/components/FitScoreCard";

describe("FitScoreCard", () => {
  const mockProps = {
    score: 75,
    summary: "Tienes un buen fit para el puesto",
  };

  it("renders the component with score and summary", () => {
    render(<FitScoreCard {...mockProps} />);
    
    expect(screen.getByText("Fit Score")).toBeInTheDocument();
    expect(screen.getByText("75")).toBeInTheDocument();
    expect(screen.getByText("/ 100")).toBeInTheDocument();
    expect(
      screen.getByText("Tienes un buen fit para el puesto")
    ).toBeInTheDocument();
  });

  it("displays green color for scores >= 70", () => {
    const { container } = render(
      <FitScoreCard score={85} summary="Excelente fit" />
    );
    
    const scoreElement = container.querySelector(".text-green-600");
    expect(scoreElement).toBeInTheDocument();
  });

  it("displays yellow color for scores between 50-69", () => {
    const { container } = render(
      <FitScoreCard score={60} summary="Fit moderado" />
    );
    
    const scoreElement = container.querySelector(".text-yellow-600");
    expect(scoreElement).toBeInTheDocument();
  });

  it("displays red color for scores < 50", () => {
    const { container } = render(
      <FitScoreCard score={35} summary="Necesitas mejorar tu fit" />
    );
    
    const scoreElement = container.querySelector(".text-red-600");
    expect(scoreElement).toBeInTheDocument();
  });

  it("renders progress bar", () => {
    render(<FitScoreCard {...mockProps} />);
    
    // Progress component should be present with role="progressbar"
    const progressElement = screen.getByRole("progressbar");
    expect(progressElement).toBeInTheDocument();
  });

  it("renders circular score display", () => {
    const { container } = render(<FitScoreCard {...mockProps} />);
    
    // Check for the circular container
    const circularContainer = container.querySelector('[class*="relative"]');
    expect(circularContainer).toBeInTheDocument();
  });
});
