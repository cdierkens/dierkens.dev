import { describe, expect, it, vitest } from "vitest";
import { Signal } from "./signal";

describe("signal", () => {
  it("holds a value", () => {
    const signal = Signal("Hello, World!");

    expect(signal.value).toBe("Hello, World!");
  });

  it("updates subscribers", () => {
    const signal = Signal("Hello, World!");

    const fn = vitest.fn();
    signal.subscribe(fn);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("Hello, World!");

    signal.value = "Goodbye, World!";

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenCalledWith("Goodbye, World!");
  });

  it("does not update subscribers when the value is the same", () => {
    const signal = Signal("Hello, World!");

    const fn = vitest.fn();
    signal.subscribe(fn);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("Hello, World!");

    signal.value = "Hello, World!";

    expect(fn).toHaveBeenCalledTimes(1);
  });
});
