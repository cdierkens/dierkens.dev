import React, { PropsWithChildren, useState } from "react";
import useMatchMedia from "../../hooks/useMatchMedia";
import styles from "./NavBar.module.scss";

interface NavBarLinkProps {
  href: string;
}

const NavBarLink: React.FC<PropsWithChildren<NavBarLinkProps>> = ({
  href,
  children
}) => (
  <a href={href} className={styles.Link}>
    {children}
  </a>
);

const NavBarLinks: React.FC = () => (
  <div className={styles.Links}>
    <div className={styles.LinksWrapper}>
      <NavBarLink href="/about">About</NavBarLink>
      <NavBarLink href="/blog">Blog</NavBarLink>
      <NavBarLink href="/uses">Uses</NavBarLink>
    </div>
  </div>
);

const Logo: React.FC = () => (
  <div className={styles.Logo}>
    <span className="logo-text">Christopher Dierkens</span>
  </div>
);

interface MenuButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const MenuButton: React.FC<MenuButtonProps> = ({ onClick }) => (
  <div className={styles.ButtonWrapper}>
    <button onClick={onClick}>
      <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <title>Menu</title>
        <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
      </svg>
    </button>
  </div>
);

const NavBar: React.FC = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);

  useMatchMedia("(min-width: 1024px)", () => setMenuOpen(true));

  return (
    <nav className={styles.NavBar}>
      <Logo />
      <MenuButton onClick={() => setMenuOpen(isMenuOpen => !isMenuOpen)} />
      {isMenuOpen && <NavBarLinks />}
    </nav>
  );
};

export default NavBar;
