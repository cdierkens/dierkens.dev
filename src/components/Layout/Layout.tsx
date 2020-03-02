import React from "react";
import Container from "../Container";
import NavBar from "../NavBar";
import "./Layout.scss";

const Layout: React.FC = ({ children }) => (
  <>
    <header>
      <NavBar />
    </header>
    <main>
      <Container>{children}</Container>
    </main>
    <footer></footer>
  </>
);

export default Layout;
