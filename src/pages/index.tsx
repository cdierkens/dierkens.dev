import React from "react";
import { BlogPreview, Layout } from "../components";

const Index: React.FC = () => {
  return (
    <Layout>
      <h1>Dierkens Dev</h1>
      <BlogPreview
        title="Does drinking coffee make you a better developer?"
        description="Alcatra venison sirloin, dolore magna cupidatat boudin nostrud. Eiusmod ut prosciutto, fatback ipsum leberkas bresaola beef ribs. Porchetta exercitation pastrami kevin frankfurter aliqua. Burgdoggen minim rump dolore swine, shoulder velit ball tip drumstick aute eiusmod adipisicing pancetta strip steak non. Kielbasa tri-tip id beef ribs chuck chicken."
        author="Christopher Dierkens"
        date="Sunday, March 1, 2020"
        avatar="/images/avatar-dierkens-chris.jpg"
      />
    </Layout>
  );
};

export default Index;
