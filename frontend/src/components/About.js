import React, { useState } from 'react';

const About = () => {
  const [isHovered, setIsHovered] = useState(false);

  const containerStyle = {
    position: 'fixed',
    top: '80px', // Move the container down by adjusting the top property
    left: '50%',
    transform: 'translateX(-50%)', // Center the container horizontally
    padding: '20px',
    width: '80%',
    maxWidth: '600px',
    backgroundColor: '#f5f5f5', // Light grey background for contrast
    color: 'black',
    fontSize: '1.2em', // Font size
    zIndex: '1000', // Ensures the text is always on top
    fontStyle: 'italic', // Italic text
    borderRadius: '10px', // Rounded corners
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
    textAlign: 'center', // Center the text
  };

  const linkStyle = {
    color: isHovered ? '#ff0000' : '#4db9e6', // Change color on hover
    textDecoration: 'none',
    transition: 'color 0.3s ease', // Smooth transition for color change
  };

  return (
    <div style={containerStyle}>
      <h1>
        I was bored and thought it would be fun to hack this together. Msg me at
        <a
          href="mailto:mirbahri@ucla.edu"
          style={linkStyle}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {' '}
          mirbahri@ucla.edu{' '}
        </a>
        if you have any cool ideas to improve this project or ur tryna help. <br /> <br />

        ~todo: 
        dars integration 
          (major/minor required classes left, autocompleting classes already taken),
        links to bruinwalk,
        grade adjustments  <br /> <br />
        - mdawg96
      </h1>
    </div>
  );
};

export default About;
