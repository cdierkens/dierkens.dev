import { render } from "@testing-library/react";
import React from "react";
import NavBar from "./NavBar";

it("matches snapshot", () => {
  const { asFragment } = render(<NavBar />);

  expect(asFragment()).toMatchSnapshot();
});
