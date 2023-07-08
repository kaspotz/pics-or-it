import React, { useState } from 'react'
import { FaBars } from 'react-icons/fa'
import { FaX } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'

function Navigation() {
  const [menu, setMenu] = useState(false)
  const navigate = useNavigate()

  const handleHome = () => {
    setMenu(false)
    navigate('/pics-or-it')
  }

  const handleAllBounties = () => {
    setMenu(false)
    navigate('/bounties')
  }

  const handleMyBounties = () => {
    setMenu(false)
    navigate('/my-bounties')
  }

  const handleMyClaims = () => {
    setMenu(false)
    navigate('/my-claims')
  }

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
            <li onClick={handleHome}>Home</li>
            <li onClick={handleAllBounties}>All Bounties</li>
            <li onClick={handleMyBounties}>My Bounties</li>
            <li onClick={handleMyClaims}>My Claims</li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default Navigation
