import React, { useState } from 'react';
import { FaBars } from 'react-icons/fa';
import { FaX } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';

function Navigation() {
  const [menu, setMenu] = useState(false);
  const navigate = useNavigate();

  const handleCreate = () => {
    setMenu(false);
    navigate('/create');
  };

  const handleMyBounties = () => {
    setMenu(false);
    navigate('/my-bounties');
  };

  const handleAllBounties = () => {
    setMenu(false);
    navigate('/');
  };

  const handleFaq = () => {
    setMenu(false);
    window.open('https://info.poidh.xyz/', '_blank');
  };

  const handleSocial = () => {
    setMenu(false);
    window.open(
      'https://www.discove.xyz/?a=new&h=1&q=Poidh.xyz&t=Poidh.xyz+Bounty+Tracker',
      '_blank'
    );
  };

  const handleGithub = () => {
    setMenu(false);
    window.open('https://github.com/kaspotz/pics-or-it', '_blank');
  };

  const handleArbiscan = () => {
    setMenu(false);
    window.open(
      'https://arbiscan.io/address/0xdffe8a4a4103f968ffd61fd082d08c41dcf9b940',
      '_blank'
    );
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
            <li onClick={handleAllBounties}>home</li>
            <li onClick={handleCreate}>create bounty</li>
            <li onClick={handleMyBounties}>my bounties</li>
            <li onClick={handleFaq}>faq</li>
            <li onClick={handleGithub}>github</li>
            <li onClick={handleArbiscan}>arbiscan</li>
            <li onClick={handleSocial}>social</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default Navigation;
