import React from "react";
import Container from "../Container";
import NavBar from "../NavBar";
import "./Layout.css";

const Layout: React.FC = ({ children }) => (
  <>
    <header className="mb-4">
      <NavBar />
    </header>
    <main className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto">
      <Container>{children}</Container>
    </main>
    <footer></footer>
  </>
);

export default Layout;
