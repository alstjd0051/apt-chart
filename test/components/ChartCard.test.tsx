import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ChartCard } from "../../src/components/ChartCard";

describe("ChartCard", () => {
  it("제목과 children을 렌더링한다", () => {
    render(
      <ChartCard title="테스트 차트">
        <div data-testid="child">내용</div>
      </ChartCard>,
    );
    expect(screen.getByText("테스트 차트")).toBeInTheDocument();
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("description이 있으면 표시한다", () => {
    render(
      <ChartCard title="차트" description="설명 텍스트">
        <span>OK</span>
      </ChartCard>,
    );
    expect(screen.getByText("설명 텍스트")).toBeInTheDocument();
  });

  it("description이 없으면 표시하지 않는다", () => {
    const { container } = render(
      <ChartCard title="차트">
        <span>OK</span>
      </ChartCard>,
    );
    const descriptions = container.querySelectorAll(".text-sm.text-gray-500");
    expect(descriptions.length).toBe(0);
  });
});
