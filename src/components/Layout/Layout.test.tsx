import { render } from "@testing-library/react";
import React from "react";
import { HeadProvider } from "react-head";
import Layout from "./Layout";

it("matches snapshot", () => {
  const { asFragment } = render(
    <HeadProvider>
      <Layout />
    </HeadProvider>
  );

  expect(asFragment()).toMatchSnapshot();
});
