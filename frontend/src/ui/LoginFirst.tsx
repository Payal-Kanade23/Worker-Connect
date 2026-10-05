import React from 'react';
import { Link } from 'react-router-dom';
function LoginFirst() {
  return (
    <div className='flex justify-center items-center text-3xl'>
      <h1>to get  Access Login First</h1>
      <button><Link to="/login">Login</Link></button>
    </div>
  );
}

export default LoginFirst;
