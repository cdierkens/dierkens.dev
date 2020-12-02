import { render } from "@testing-library/react";
import React from "react";
import BlogPreview from "./BlogPreview";

it("matches snapshot", () => {
  const { asFragment } = render(
    <BlogPreview
      title="Does drinking coffee make you a better developer?"
      description="Alcatra venison sirloin, dolore magna cupidatat boudin nostrud. Eiusmod ut prosciutto, fatback ipsum leberkas bresaola beef ribs. Porchetta exercitation pastrami kevin frankfurter aliqua. Burgdoggen minim rump dolore swine, shoulder velit ball tip drumstick aute eiusmod adipisicing pancetta strip steak non. Kielbasa tri-tip id beef ribs chuck chicken."
      author="Christopher Dierkens"
      date="Sunday, March 1, 2020"
      avatar="/images/avatar-dierkens-chris.jpg"
      href="mock-href"
    />
  );

  expect(asFragment()).toMatchSnapshot();
});
