import React from 'react';
import { GoogleLogout } from '@react-oauth/google';

const clientId = '49717070246-9k1671m2i4d31872r67117f5d0aekdbf.apps.googleusercontent.com';

const GoogleLogoutButton = (onSuccess) => {
  return (
    <GoogleLogout
      clientId={clientId}
      buttonText="Logout"
      onLogoutSuccess={onSuccess}
    />
  );
};

export default GoogleLogoutButton;