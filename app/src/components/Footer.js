import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const handleClick = () => {
        window.scrollTo(0, 0); // Scrolls to top
    };

    return (
        <footer className="footer-style">
            <span style={{ color: 'white' }}>© 2023 </span>
            <span style={{ marginRight: '1em' }}></span>
            <span style={{ color: 'white' }}>{'\u2022'}</span>
            <span style={{ marginRight: '1em' }}></span>
            <Link to="/terms" onClick={handleClick}>terms</Link>
        </footer>
    );
}

export default Footer;
