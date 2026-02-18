import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StatCard } from "../../src/components/StatCard";

describe("StatCard", () => {
  it("label과 value를 렌더링한다", () => {
    render(<StatCard label="총 거래 건수" value="111.9만건" />);
    expect(screen.getByText("총 거래 건수")).toBeInTheDocument();
    expect(screen.getByText("111.9만건")).toBeInTheDocument();
  });

  it("sub 텍스트가 있으면 표시한다", () => {
    render(<StatCard label="최고가" value="2021년" sub="8.5억원" />);
    expect(screen.getByText("8.5억원")).toBeInTheDocument();
  });

  it("sub가 없으면 표시하지 않는다", () => {
    const { container } = render(<StatCard label="구 수" value="25개" />);
    const sub = container.querySelectorAll(".text-xs");
    expect(sub.length).toBe(0);
  });
});
