import React, { useState } from 'react';
import logo from './logo2.jpeg'; // Adjust the path to match your directory structure
import { Link } from 'react-router-dom';

const TopStrip = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null); // Track which button is hovered

  const tStyle = {
    position: 'fixed',
    top: '0', // Position at the top of the screen
    left: '0', // Align to the left edge
    width: '100%', // Full width of the screen
    height: '20px', // Adjusted height to ensure enough space for the buttons and image
    padding: '10px',
    color: 'white',
    fontSize: '1em',
    zIndex: '1000', // Ensures the strip is always on top
    backgroundColor: 'blue',
    display: 'flex', // Use flexbox for layout
    justifyContent: 'space-between', // Space between items
    alignItems: 'center', // Center items vertically
  };

  const buttonContainerStyle = {
    display: 'flex', // Use flexbox to align buttons horizontally
    alignItems: 'center', // Center buttons vertically
    marginRight: '10px', // Add right margin to the button container
  };

  const buttonStyle = {
    margin: '0 5px', // Reduce space between buttons
    padding: '5px 10px', // Adjusted padding to make the buttons smaller
    fontSize: '0.8em', // Adjusted font size to make the text smaller
    cursor: 'pointer',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#fff',
    color: 'black',
    transition: 'background-color 0.3s ease',
    textDecoration: 'none', // Ensure text decoration is none for Link
  };

  const linkStyle = (isButtonHovered) => ({
    ...buttonStyle, // Apply the same styles as the button
    display: 'flex', // Ensure flexbox properties
    alignItems: 'center', // Center text vertically
    justifyContent: 'center', // Center text horizontally
    backgroundColor: isButtonHovered ? '#4db9e6' : '#fff', // Change color on hover
  });

  const imageStyle = {
    height: '70px', // Adjust the height as needed
    transition: 'transform 1s linear',
    transform: isHovered ? 'rotate(360deg)' : 'rotate(0deg)', // Rotate on hover
    border: 'none', // Ensure no border is applied
  };

  return (
    <div style={tStyle}>
      <Link
        to="/"
        onMouseEnter={() => setIsHovered(true)} // Set hover state to true on mouse enter
        onMouseLeave={() => setIsHovered(false)} // Set hover state to false on mouse leave
      >
        <img src={logo} alt="Logo" style={imageStyle} />
      </Link>
      <div style={buttonContainerStyle}>
        <Link
          to="/about"
          style={linkStyle(hoveredButton === 'about')}
          onMouseEnter={() => setHoveredButton('about')} // Set hover state for about button
          onMouseLeave={() => setHoveredButton(null)} // Reset hover state
        >
          About
        </Link>
        <Link
          to="/login"
          style={linkStyle(hoveredButton === 'login')}
          onMouseEnter={() => setHoveredButton('login')} // Set hover state for login button
          onMouseLeave={() => setHoveredButton(null)} // Reset hover state
        >
          Login
        </Link>
      </div>
    </div>
  );
};

export default TopStrip;
