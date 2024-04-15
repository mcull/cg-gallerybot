//gatsby-browser.js
import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { navigate } from 'gatsby';

const onRedirectCallback = (appState) => {
 // Use Gatsby's navigate method to replace the url
 navigate(appState?.returnTo || '/', { replace: true });
};

export const wrapRootElement = ({ element }) => {
    return (
        <GoogleOAuthProvider clientId="49717070246-9k1671m2i4d31872r67117f5d0aekdbf.apps.googleusercontent.com">
            {element}
        </GoogleOAuthProvider>
 );
};