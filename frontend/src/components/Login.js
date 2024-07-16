import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ setUsername }) => {
  const [username, setUsernameLocal] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://mdawg96.github.io/bruin-planner/login/', { username, password });
      if (response.data.auth === 'success') {
        setUsername(username);
        localStorage.setItem('username', username);
        navigate('/planner');
      } else {
        setErrorMessage('Login Failed.');
      }
    } catch (error) {
      setErrorMessage('Login Failed.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://mdawg96.github.io/bruin-planner/create_an_account/', { username, password }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.data.status === 'success') {
        setSuccessMessage('Registration successful. Please log in.');
        setErrorMessage('');
        setIsRegister(false);
        resetForm();
      } else {
        setErrorMessage('Registration failed: ' + response.data.message);
        setSuccessMessage('');
      }
    } catch (error) {
      setErrorMessage('Registration failed: ' + error.message);
      setSuccessMessage('');
    }
  };

  const toggleToRegister = () => {
    setIsRegister(true);
    setErrorMessage('');
    setSuccessMessage('');
    resetForm();
  };

  const toggleToLogin = () => {
    setIsRegister(false);
    setErrorMessage('');
    setSuccessMessage('');
    resetForm();
  };

  const resetForm = () => {
    setUsernameLocal('');
    setPassword('');
  };

  const containerStyle = {
    position: 'fixed',
    top: '40%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    padding: '20px',
    width: '40%',
    height: 'auto',
    maxWidth: '800px',
    color: 'black',
    fontSize: '1.2em',
    zIndex: '1000',
    fontFamily: 'Arial',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    border: '1px solid #ccc',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    boxSizing: 'border-box',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '1em',
  };

  const buttonContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: '10px',
  };

  const buttonStyle = {
    padding: '10px 20px',
    fontSize: '1em',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#61dafb',
    color: '#fff',
    textDecoration: 'none',
    textAlign: 'center',
    transition: 'background-color 0.3s ease',
  };

  const toggleButtonStyle = {
    padding: '10px 20px',
    fontSize: '1em',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#ccc',
    color: '#000',
    textDecoration: 'none',
    textAlign: 'center',
    transition: 'background-color 0.3s ease',
  };

  const errorStyle = {
    color: 'red',
    marginTop: '10px',
    padding: '10px',
    border: '1px solid red',
    borderRadius: '5px',
    width: '100%',
    textAlign: 'center',
    backgroundColor: '#fdd',
  };

  const successStyle = {
    color: 'green',
    marginTop: '10px',
    padding: '10px',
    border: '1px solid green',
    borderRadius: '5px',
    width: '100%',
    textAlign: 'center',
    backgroundColor: '#dfd',
  };

  return (
    <div style={containerStyle}>
      {errorMessage && <div style={errorStyle}>{errorMessage}</div>}
      {successMessage && <div style={successStyle}>{successMessage}</div>}
      <form onSubmit={isRegister ? handleRegister : handleLogin} style={{ width: '100%' }}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsernameLocal(e.target.value)}
            required
            autoComplete="username"
            style={inputStyle}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={isRegister ? "new-password" : "current-password"}
            style={inputStyle}
          />
        </div>
        <div style={buttonContainerStyle}>
          <button type="submit" style={buttonStyle}>{isRegister ? 'Register' : 'Login'}</button>
          <button
            type="button"
            onClick={isRegister ? toggleToLogin : toggleToRegister}
            style={toggleButtonStyle}
          >
            {isRegister ? 'Go to Login' : 'Register an Account'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
