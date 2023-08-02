import React, { useState } from 'react';
import { FaBars } from 'react-icons/fa';
import { FaX } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';

function Navigation() {
  const [menu, setMenu] = useState(false);
  const navigate = useNavigate();

  const handleHome = () => {
    setMenu(false);
    navigate('/');
  };

  const handleMyBounties = () => {
    setMenu(false);
    navigate('/my-bounties');
  };

   const handleFaq = () => {
    setMenu(false);
    navigate('https://enormous-dew-43b.notion.site/3dd435b542394c80bb7507e866acba2f');
  };

  return (
    <div>
      <span className="hamburger-menu-wrap">
        {!menu && (
          <FaBars onClick={() => setMenu(!menu)} color="#F4595B" size={25} />
        )}
      </span>
      {menu && (
        <div className="menu-wrap">
          <span className="menu-close-wrap">
            <FaX onClick={() => setMenu(!menu)} color="#F4595B" size={25} />
          </span>
          <ul className="menu-list-wrap">
            <li onClick={handleHome}>home</li>
            <li onClick={handleMyBounties}>my bounties</li>
            <li onClick={handleFaq}>faq</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default Navigation;
