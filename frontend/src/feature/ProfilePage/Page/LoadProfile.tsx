import React from 'react';
import { useAuth } from '../../../context/authContext';
import Profile from './Profile';
function LoadProfile() {
    const { user } = useAuth();

if (!user) {
  return <div>Loading...</div>;
}
console.log("user:::",user)
return <Profile user={user} />;
  
}

export default LoadProfile;
