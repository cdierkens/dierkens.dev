import { Link } from "gatsby";
import React from "react";
import * as styles from "./NavBar.module.css";

const NavBarLinks: React.FC = () => (
  <div className={styles.Links}>
    <div className={styles.LinksWrapper}>
      <Link
        className={styles.Link}
        activeClassName={styles.ActiveLink}
        to="/blog/"
      >
        Blog
      </Link>
    </div>
  </div>
);

const Logo: React.FC = () => (
  <div className={styles.Logo}>
    <Link className={styles.Link} activeClassName={styles.ActiveLink} to="/">
      Christopher Dierkens
    </Link>
  </div>
);

const NavBar: React.FC = () => {
  return (
    <nav className={styles.NavBar}>
      <Logo />
      <NavBarLinks />
    </nav>
  );
};

export default NavBar;
