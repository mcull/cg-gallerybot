
/**
 * @type {import('gatsby').GatsbySSR['onRenderBody']}
 */
export const onRenderBody = ({ setHtmlAttributes }) => {
  setHtmlAttributes({ lang: `en` })
}

import { GoogleOAuthProvider } from '@react-oauth/google';
import React from 'react';
export const wrapRootElement = ({ element }) => <GoogleOAuthProvider clientId="49717070246-9k1671m2i4d31872r67117f5d0aekdbf.apps.googleusercontent.com">{element}</GoogleOAuthProvider>;

