import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import Cookies from 'js-cookie';
import Button from './ui/Button';
import { apiService } from '../services/api';

const GoogleAuthButton = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const authToken = Cookies.get('google_auth_token');
    const userData = Cookies.get('user_data');
    
    if (authToken && userData) {
      setIsLoggedIn(true);
      setUserInfo(JSON.parse(userData));
    }
  }, []);

  const login = useGoogleLogin({
    onSuccess: async (credentialResponse) => {
      try {
        setIsVerifying(true);
        const { access_token } = credentialResponse;
        
        // Fetch user info from Google API
        const userResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${access_token}`);
        const userData = await userResponse.json();
        
        // Verify with backend
        const backendResponse = await apiService.verifyGoogleAuth(access_token, userData);
        
        if (backendResponse.success || backendResponse.verified) {
          // Store tokens and user data in cookies
          Cookies.set('google_auth_token', access_token, { expires: 7, secure: true });
          Cookies.set('user_data', JSON.stringify(userData), { expires: 7, secure: true });
          Cookies.set('backend_session', backendResponse.session_id || 'verified', { expires: 7, secure: true });
          
          setIsLoggedIn(true);
          setUserInfo(userData);
          
          console.log('Login and verification successful:', userData);
        } else {
          console.error('Backend verification failed:', backendResponse);
          throw new Error('Backend verification failed');
        }
      } catch (error) {
        console.error('Error during authentication:', error);
        // Clear any partial auth state
        Cookies.remove('google_auth_token');
        Cookies.remove('user_data');
        Cookies.remove('backend_session');
      } finally {
        setIsVerifying(false);
      }
    },
    onError: () => {
      console.log('Login Failed');
      setIsVerifying(false);
    }
  });

  const logout = () => {
    Cookies.remove('google_auth_token');
    Cookies.remove('user_data');
    Cookies.remove('backend_session');
    setIsLoggedIn(false);
    setUserInfo(null);
    console.log('Logged out successfully');
  };

  const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );

  const GoogleIconBW = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );

  if (isLoggedIn && userInfo) {
    return (
      <div className="user-profile">
        <span>Welcome, {userInfo.name}</span>
        <Button
          variant="secondary"
          size="sm"
          onClick={logout}
          style={{ marginLeft: '8px' }}
        >
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={() => login()}
      icon={<GoogleIconBW />}
      className="google-auth-btn"
      disabled={isVerifying}
    >
      {isVerifying ? 'Verifying...' : 'Sign in'}
    </Button>
  );
};

const GoogleAuth = () => {
  const clientId = "1000804075862-netkfadeqbl6aoknvnij2rkgtmn4b12j.apps.googleusercontent.com";
  
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleAuthButton />
    </GoogleOAuthProvider>
  );
};

export default GoogleAuth;