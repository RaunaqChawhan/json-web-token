import React, { useState, useEffect } from 'react';
import { Router, navigate} from '@reach/router';

import Navigation from './components/Navigation';
import Login from './components/Login';
import Register from './components/Register';
import Protected from './components/Protected';
import Content from './components/Content';

export const UserContext = React.createContext([]);

function App() {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);

  const logOutCallback = async () => {
    await fetch('http://localhost:4000/logout', {
      method: 'POST',
      credentials: 'include'
    })
    //Clear user from context
    setUser({});
    //Navigate back to start page
    navigate('/');
  }

  //First thing get a new access token if a refresh token exist
  useEffect(() => {
    async function checkRefreshToken() {
      const result = await (await fetch('http://localhost:4000/refresh_token', {
        method: 'POST',
        credentials: 'include', //Needed to include the cookie
        headers: {
          'Content-Type': 'application/json'
        }
      })).json();
      setUser({
        accesstoken: result.accesstoken
      });
      setLoading(false);
    }
    checkRefreshToken();
  }, []); //it will fire off this when we mount the application; it will run just one time

  if (loading) return <div>Loading ...</div>

  return (
    <UserContext.Provider value={[user, setUser]}>
      <div className="app">
        <Navigation logOutCallback={logOutCallback} />
        <Router id="router">
          <Login path="login" />
          <Register path="register"/>
          <Protected path="protected" />
          <Content path="/" />
        </Router>
      </div>
    </UserContext.Provider>
  );
}

export default App;
