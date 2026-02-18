import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { Tooltip } from "../../src/components/Tooltip";
import { useDashboardStore } from "../../src/store/dashboardStore";

beforeEach(() => {
  useDashboardStore.setState({
    tooltip: { visible: false, x: 0, y: 0, rows: [] },
  });
});

describe("Tooltip", () => {
  it("visible=false일 때 렌더링하지 않는다", () => {
    const { container } = render(<Tooltip />);
    expect(container.firstChild).toBeNull();
  });

  it("visible=true이고 rows가 있으면 내용을 표시한다", () => {
    useDashboardStore.setState({
      tooltip: {
        visible: true,
        x: 100,
        y: 200,
        rows: [
          { label: "2020년", value: "5.5억원", color: "#6366f1" },
          { label: "건수", value: "50,000건" },
        ],
      },
    });

    render(<Tooltip />);
    expect(screen.getByText("2020년")).toBeInTheDocument();
    expect(screen.getByText("5.5억원")).toBeInTheDocument();
    expect(screen.getByText("건수")).toBeInTheDocument();
    expect(screen.getByText("50,000건")).toBeInTheDocument();
  });

  it("rows가 비어있으면 렌더링하지 않는다", () => {
    useDashboardStore.setState({
      tooltip: { visible: true, x: 100, y: 200, rows: [] },
    });

    const { container } = render(<Tooltip />);
    expect(container.firstChild).toBeNull();
  });
});
