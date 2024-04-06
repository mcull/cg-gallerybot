import * as React from "react"
import { Link } from "gatsby"
import { useAuth0 } from "@auth0/auth0-react";

const Header = ({ siteTitle }) => {
  const {
    isAuthenticated,
    logout,
    } = useAuth0();
  return (
  <header
    style={{
      margin: `0 auto`,
      padding: `var(--space-4) var(--size-gutter)`,
      display: `flex`,
      alignItems: `center`,
      justifyContent: `space-between`,
    }}
  >
    <Link
      to="/"
      style={{
        fontSize: `var(--font-sm)`,
        textDecoration: `none`,
      }}
    >
    <div>  
      <div> 
        <img
        alt="Cute little art robot"
        height={64}
        style={{ margin: 0 }}
        src="/artbot5000.png"
      />
      </div> 
      <div style={{
        fontSize: `var(--font-sxxx)`,
        fontFamily: `var(--font-mono)`,
      }}>
        Gallery Bot 5000
      </div>
    </div>
    </Link>
    {isAuthenticated && (
     <div className="logout" 
          onClick={() => { logout({ returnTo: window.location.origin });}}
          style={{cursor: "pointer",
                  color: `blue`}}  
        >[Log out]</div>)}
    <img
      alt="Creative Growth logo"
      height={20}
      style={{ margin: 0 }}
      src="/CG_logo.png"
    />
  </header>
)}

export default Header
