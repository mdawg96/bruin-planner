import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const MainHeader = () => {
  // Initialize the isHovered state with a default value of false
  const [isHovered, setIsHovered] = useState(false);

  const containerStyle = {
    position: 'fixed',
    top: '40%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    padding: '20px', // Increase padding
    width: '30%', // Set a specific width
    height: 'auto', // Adjust height as needed
    maxWidth: '800px', // Optionally set a max width
    color: 'black',
    fontSize: '1.2em', // Increase font size
    zIndex: '1000',
    fontFamily: 'Arial',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    border: '1px solid #ccc', // Optional border for better visual separation
    borderRadius: '10px', // Optional border radius for rounded corners
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Optional shadow for better depth
  };
  
  const buttonStyle = {
    marginTop: '10px',
    padding: '5px 30px',
    fontSize: '0.8em',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: isHovered ? '#4db9e6' : '#61dafb', // Change color based on hover state
    color: '#fff',
    textDecoration: 'none',
    display: 'inline-block',
    textAlign: 'center',
    transition: 'background-color 0.3s ease',
  };

  return (
    <div style={containerStyle}>
      <h1>Bruin Planner</h1>
      <Link
        to="/login"
        style={buttonStyle}
        onMouseEnter={() => setIsHovered(true)} // Set hover state to true on mouse enter
        onMouseLeave={() => setIsHovered(false)} // Set hover state to false on mouse leave
      >
        Login
      </Link>
    </div>
  );
};

export default MainHeader;
