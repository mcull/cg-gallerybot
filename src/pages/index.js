import React, { useState, useEffect } from "react"
import { GoogleSpreadsheet } from "google-spreadsheet";
import { useAuth0 } from "@auth0/auth0-react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";

import Layout from "../components/layout"
import Seo from "../components/seo"
import * as styles from "../components/index.module.css"

const CLIENT_ID = '49717070246-9k1671m2i4d31872r67117f5d0aekdbf.apps.googleusercontent.com';
const API_KEY = 'AIzaSyDMVUc4jpAANVvejAm9TqVpXj55GYObDzw';
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';



const checkOrIcon = (phase, currentPhase, icon) => {
  return currentPhase%7 > phase ? "✅" : icon
}

const IndexPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const onSuccess = (response) => {
    setIsLoggedIn(true);
    console.log(response);
  };

  const onFailure = (response) => {
    console.log(response);
  };

  const [phase, setPhase] = React.useState(isLoggedIn ? 2 : 1);
  const check = "✅";

  return (
  <GoogleOAuthProvider clientId="49717070246-9k1671m2i4d31872r67117f5d0aekdbf.apps.googleusercontent.com">
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
        <div>
          {isLoggedIn ? (
            <div>
              Spreadsheet picker goes here
            </div>
          ) : (
            
            <GoogleLogin className={styles.button}
            onSuccess={onSuccess}
            onFailure={onFailure}
          />
          )}
        </div>
      </div>
    </div>
  </Layout>
  </GoogleOAuthProvider>
)}

export const Head = () => <Seo title="Home" />

export default IndexPage
