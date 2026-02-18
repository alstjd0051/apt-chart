import "@testing-library/jest-dom/vitest";

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;

if (typeof SVGElement !== "undefined") {
  SVGElement.prototype.getTotalLength =
    SVGElement.prototype.getTotalLength ?? (() => 100);
  SVGElement.prototype.getBoundingClientRect =
    SVGElement.prototype.getBoundingClientRect ??
    (() => ({ x: 0, y: 0, width: 100, height: 100, top: 0, right: 100, bottom: 100, left: 0, toJSON() {} }));
}
