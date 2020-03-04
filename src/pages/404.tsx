import React from "react";
import { Layout } from "../components";

const NotFound: React.FC = () => {
  return (
    <Layout>
      <h1>Page not found</h1>
      <p>Oops! This page you are looking for has been removed or relocated.</p>
      <p>
        <button className="link" onClick={() => window?.history?.back()}>
          Go Back
        </button>
      </p>
    </Layout>
  );
};

export default NotFound;
