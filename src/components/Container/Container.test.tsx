import { render } from "@testing-library/react";
import React from "react";
import Container from "./Container";

it("matches snapshot", () => {
  const { asFragment } = render(<Container />);

  expect(asFragment()).toMatchSnapshot();
});
