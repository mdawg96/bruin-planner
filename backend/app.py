import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import TerryIcon from './terry.png';
import JzIcon from './jz.png';
import PjIcon from './pj.png';

const icons = [TerryIcon, JzIcon, PjIcon];

const generateColor = (() => {
  const subjectColorMap = {};
  const colors = [
    '#ffcccc', '#ccffcc', '#ccccff', '#ffccff', '#ccffff',
    '#ffc0cb', '#add8e6', '#90ee90', '#dda0dd', '#ffb6c1', '#ffa07a'
  ];
  let colorIndex = 0;

  return (subject) => {
    if (!subjectColorMap[subject]) {
      subjectColorMap[subject] = colors[colorIndex % colors.length];
      colorIndex++;
    }
    return subjectColorMap[subject];
  };
})();

const SearchBar = ({ username, classesData }) => {
  const [query, setQuery] = useState('');
  const [selectedClasses, setSelectedClasses] = useState({});
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedFromZone, setDraggedFromZone] = useState(null);
  const [isDraggingOut, setIsDraggingOut] = useState(false);
  const [searchType, setSearchType] = useState('All');
  const [subject, setSubject] = useState('');
  const [showInfo, setShowInfo] = useState(null);
  const [infoContent, setInfoContent] = useState({ subject: '', className: '', units: '', description: '' });
  const [infoBoxPosition, setInfoBoxPosition] = useState({ top: 100, left: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [customOptions, setCustomOptions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUsername = username || localStorage.getItem('username');
      if (!storedUsername) {
        return;
      }
      try {
        const response = await axios.post('https://bruin-planner.herokuapp.com/getUserClasses/', { username: storedUsername });
        if (response.data) {
          const data = response.data;
          if (data.selected_classes) {
            const updatedClasses = {};
            Object.keys(data.selected_classes).forEach(key => {
              updatedClasses[key] = Array.isArray(data.selected_classes[key]) ? data.selected_classes[key] : [];
            });
            setSelectedClasses(updatedClasses);
          }
          if (data.custom_options) {
            setCustomOptions(data.custom_options);
          }
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserData();
  }, [username]);

  useEffect(() => {
    if (classesData && Object.keys(classesData).length > 0 && !subject) {
      setSubject(Object.keys(classesData)[0]);
    }
  }, [classesData, subject]);

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  const handleDragStart = (e, item, fromZone = null) => {
    setDraggedItem(item);
    setDraggedFromZone(fromZone);
    setIsDraggingOut(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOut(true);
  };

  const handleDrop = (e, zone) => {
    e.preventDefault();
    if (draggedItem) {
      const updatedClasses = { ...selectedClasses };
      if (draggedFromZone) {
        updatedClasses[draggedFromZone] = updatedClasses[draggedFromZone].filter(
          (className) => className !== draggedItem
        );
      }
      if (zone !== draggedFromZone) {
        updatedClasses[zone] = [...(updatedClasses[zone] || []), draggedItem];
      }
      setSelectedClasses(updatedClasses);
      setDraggedItem(null);
      setDraggedFromZone(null);
      setIsDraggingOut(false);
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDraggedFromZone(null);
    setIsDraggingOut(false);
  };

  const handleToggle = (subject, className) => {
    const updatedClasses = { ...selectedClasses };
    if (!updatedClasses[subject]) {
      updatedClasses[subject] = [];
    }
    if (updatedClasses[subject].includes(className)) {
      updatedClasses[subject] = updatedClasses[subject].filter((name) => name !== className);
    } else {
      updatedClasses[subject].push(className);
    }
    setSelectedClasses(updatedClasses);
  };

  const handleSave = async () => {
    const storedUsername = username || localStorage.getItem('username');
    if (!storedUsername) {
      return;
    }
    try {
      await axios.post('https://bruin-planner.herokuapp.com/updateUserClasses/', {
        username: storedUsername,
        selected_classes: selectedClasses,
        custom_options: customOptions
      });
    } catch (error) {
      console.error('Error saving user classes:', error);
    }
  };

  const filteredClasses = query
    ? classesData[subject]?.filter((className) =>
        className.toLowerCase().includes(query.toLowerCase())
      )
    : classesData[subject];

  const iconSize = 20;

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100vh',
    backgroundColor: '#f0f0f0',
  };

  const searchBarStyle = {
    width: '80%',
    maxWidth: '600px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    marginTop: '20px',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '1em',
  };

  const listStyle = {
    width: '100%',
    listStyleType: 'none',
    padding: '0',
  };

  const listItemStyle = (className) => ({
    padding: '10px',
    borderBottom: '1px solid #ddd',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    backgroundColor: selectedClasses[subject]?.includes(className) ? '#e0f7fa' : '#fff',
  });

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
    margin: '10px 0',
  };

  const selectedClassesContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '20px',
    width: '80%',
    maxWidth: '600px',
  };

  const selectedClassesStyle = {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  };

  const selectedClassListStyle = {
    listStyleType: 'none',
    padding: '0',
  };

  const selectedClassItemStyle = (subject, className) => ({
    padding: '10px',
    borderBottom: '1px solid #ddd',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: generateColor(subject),
  });

  const customOptionStyle = {
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '1em',
  };

  const dropdownStyle = {
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '1em',
    cursor: 'pointer',
  };

  const dropdownItemStyle = {
    padding: '10px',
    cursor: 'pointer',
    borderBottom: '1px solid #ddd',
  };

  const iconStyle = {
    marginRight: '10px',
    width: `${iconSize}px`,
    height: `${iconSize}px`,
  };

  return (
    <div style={containerStyle}>
      <div style={searchBarStyle}>
        <input
          type="text"
          placeholder="Search classes..."
          value={query}
          onChange={handleChange}
          style={inputStyle}
        />
        <ul style={listStyle}>
          {filteredClasses?.map((className, index) => (
            <li
              key={index}
              style={listItemStyle(className)}
              draggable
              onDragStart={(e) => handleDragStart(e, className, subject)}
              onDragEnd={handleDragEnd}
              onClick={() => handleToggle(subject, className)}
            >
              <span>{className}</span>
              {selectedClasses[subject]?.includes(className) && (
                <img src={icons[index % icons.length]} alt="icon" style={iconStyle} />
              )}
            </li>
          ))}
        </ul>
        <button onClick={handleSave} style={buttonStyle}>
          Save
        </button>
      </div>
      <div style={selectedClassesContainerStyle}>
        <div style={selectedClassesStyle}>
          <h3>Selected Classes</h3>
          {Object.keys(selectedClasses).map((subject) => (
            <div key={subject}>
              <h4>{subject}</h4>
              <ul style={selectedClassListStyle}>
                {selectedClasses[subject].map((className, index) => (
                  <li
                    key={index}
                    style={selectedClassItemStyle(subject, className)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, className, subject)}
                    onDragEnd={handleDragEnd}
                  >
                    <span>{className}</span>
                    <img src={icons[index % icons.length]} alt="icon" style={iconStyle} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
