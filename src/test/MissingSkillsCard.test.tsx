import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MissingSkillsCard } from "@/components/MissingSkillsCard";
import i18n from "@/i18n";

describe("MissingSkillsCard", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("es");
  });

  it("renders the component with title and description", () => {
    render(<MissingSkillsCard skills={[]} />);
    
    expect(
      screen.getByText("Habilidades a Desarrollar")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Estas skills te ayudarían a mejorar tu fit para el puesto"
      )
    ).toBeInTheDocument();
  });

  it("renders empty state when no skills provided", () => {
    render(<MissingSkillsCard skills={[]} />);
    
    // Should not have any skill badges
    const badges = screen.queryAllByRole("status");
    expect(badges).toHaveLength(0);
  });

  it("renders list of missing skills as badges", () => {
    const skills = ["TypeScript", "GraphQL", "Docker"];
    render(<MissingSkillsCard skills={skills} />);
    
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("GraphQL")).toBeInTheDocument();
    expect(screen.getByText("Docker")).toBeInTheDocument();
  });

  it("renders badges with correct styling classes", () => {
    const skills = ["React"];
    const { container } = render(<MissingSkillsCard skills={skills} />);
    
    const badge = container.querySelector('[class*="border-secondary"]');
    expect(badge).toBeInTheDocument();
  });
});
