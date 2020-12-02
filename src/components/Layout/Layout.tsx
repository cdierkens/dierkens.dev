import React from "react";
import { Title } from "react-head";
import NavBar from "../NavBar";
import "./Layout.css";

const Layout: React.FC = ({ children }) => (
  <>
    <Title>Dierkens Dev</Title>
    <header>
      <NavBar />
    </header>
    <main className="content">{children}</main>
    <footer></footer>
  </>
);

export default Layout;
