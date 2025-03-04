// Header.js
import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="py-3 mb-4 border-bottom">
      <div className="container d-flex flex-wrap justify-content-center">
        <Link to="/" className="d-flex align-items-center mb-3 mb-lg-0 me-lg-auto text-white text-decoration-none">
          <span className="fs-4">Virtual Study Room</span>
        </Link>
        <ul className="nav">
          <li className="nav-item"><Link to="/" className="nav-link px-2 text-white">Home</Link></li>
        </ul>
      </div>
    </header>
  );
}

export default Header;

