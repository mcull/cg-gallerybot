import * as React from "react"
import { useAuth0 } from "@auth0/auth0-react";

import Layout from "../components/layout"
import Seo from "../components/seo"
import * as styles from "../components/index.module.css"

const checkOrIcon = (phase, currentPhase, icon) => {
  return currentPhase%7 > phase ? "✅" : icon
}

const IndexPage = () => {
  const {
    isAuthenticated,
    loginWithRedirect,
     } = useAuth0();

  const [phase, setPhase] = React.useState(isAuthenticated ? 2 : 1);
  const check = "✅";

  return (
  <Layout>
    <div className={styles.center}>
      <div className={styles.textCenter}>
        <div className={styles.instructions}>To generate descriptions for Creative Growth artists' work, please:</div>
        <ol className={styles.instructionList}>
          <li>Sign in with a Google account that has permission to edit the spreadsheet { checkOrIcon(1, phase, "☝️") }</li>
          <li>Pick the spreadsheet with artworks to label { checkOrIcon(2, phase, "✌️") }</li> 
          <li>Hit the "Describe art, please" button { checkOrIcon(3, phase, "🫵") }</li>
          <li>Relax with the progress bar while I take care of business { checkOrIcon(4, phase, "⚙️") }</li>
          <li>When I'm done, be sure to read through my results. I make mistakes, I'm only robot! <checkbox/></li>
        </ol>
        { !isAuthenticated && <button className={styles.button} onClick={ loginWithRedirect }>SIGN IN</button> }
      </div>
      
    </div>
  </Layout>
)}

export const Head = () => <Seo title="Home" />

export default IndexPage
