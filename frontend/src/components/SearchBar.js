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
        const response = await axios.post('https://bruin-planner-fb8f6f96ea51.herokuapp.com/getUserClasses/', { username: storedUsername });
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
  };

  const handleDrop = async (e, toZone) => {
    e.preventDefault();
    if (draggedItem) {
      const updatedSelectedClasses = { ...selectedClasses };
      if (draggedFromZone) {
        updatedSelectedClasses[draggedFromZone] = updatedSelectedClasses[draggedFromZone].filter(item => item !== draggedItem);
      }
      if (!Array.isArray(updatedSelectedClasses[toZone])) {
        updatedSelectedClasses[toZone] = [];
      }
      updatedSelectedClasses[toZone].push(draggedItem);
      setSelectedClasses(updatedSelectedClasses);
      setDraggedFromZone(null);
      try {
        await axios.post('https://bruin-planner-fb8f6f96ea51.herokuapp.com/updateUserClasses/', { username, selected_classes: updatedSelectedClasses, custom_options: customOptions });
      } catch (error) {
        console.error('Error updating selected classes:', error);
      }
    }
  };

  const handleDragOverDropZone = (e) => {
    e.preventDefault();
    setIsDraggingOut(false);
  };

  const handleDragLeaveDropZone = (e) => {
    e.preventDefault();
    setIsDraggingOut(true);
  };

  const handleDropOutside = async (e) => {
    e.preventDefault();
    if (draggedItem && isDraggingOut && draggedFromZone) {
      const updatedSelectedClasses = { ...selectedClasses };
      updatedSelectedClasses[draggedFromZone] = updatedSelectedClasses[draggedFromZone].filter(item => item !== draggedItem);
      setSelectedClasses(updatedSelectedClasses);
      setDraggedFromZone(null);
      try {
        await axios.post('https://bruin-planner.herokuapp.com/updateUserClasses/', { username, selected_classes: updatedSelectedClasses, custom_options: customOptions });
      } catch (error) {
        console.error('Error updating selected classes:', error);
      }
    }
  };

  const handleSearchTypeChange = (e) => {
    setSearchType(e.target.value);
  };

  const handleSubjectChange = (e) => {
    setSubject(e.target.value);
    setQuery('');
  };

  const handleAddCustomOption = async () => {
    const newOption = { subject: '', className: '', units: '', description: '' };
    setCustomOptions([...customOptions, newOption]);
    try {
      await axios.post('https://bruin-planner.herokuapp.com/updateUserClasses/', { username, selected_classes: selectedClasses, custom_options: [...customOptions, newOption] });
    } catch (error) {
      console.error('Error adding custom option:', error);
    }
  };

  const handleCustomOptionChange = (index, field, value) => {
    const updatedCustomOptions = customOptions.map((option, i) => i === index ? { ...option, [field]: value } : option);
    setCustomOptions(updatedCustomOptions);
  };

  const handleCustomOptionRemove = async (index) => {
    const updatedCustomOptions = customOptions.filter((_, i) => i !== index);
    setCustomOptions(updatedCustomOptions);
    try {
      await axios.post('https://bruin-planner.herokuapp.com/updateUserClasses/', { username, selected_classes: selectedClasses, custom_options: updatedCustomOptions });
    } catch (error) {
      console.error('Error removing custom option:', error);
    }
  };

  const handleInfoBoxClose = () => {
    setShowInfo(null);
  };

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      setInfoBoxPosition((prevPosition) => ({ top: prevPosition.top + deltaY, left: prevPosition.left + deltaX }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, [isDragging, dragStart]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove]);

  const filteredClasses = query ? Object.keys(classesData).reduce((result, subject) => {
    const filtered = classesData[subject].filter((item) => item.className.toLowerCase().includes(query.toLowerCase()));
    if (filtered.length) {
      result[subject] = filtered;
    }
    return result;
  }, {}) : { [subject]: classesData[subject] };

  return (
    <div className="search-bar">
      <input type="text" value={query} onChange={handleChange} placeholder="Search classes..." />
      <div className="dropdown">
        <button className="dropbtn" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          {searchType}
        </button>
        <div className={`dropdown-content ${isDropdownOpen ? 'show' : ''}`}>
          <button onClick={() => setSearchType('All')}>All</button>
          {Object.keys(classesData).map((subject) => (
            <button key={subject} onClick={() => setSearchType(subject)}>{subject}</button>
          ))}
        </div>
      </div>
      <div className="search-results">
        {Object.keys(filteredClasses).map((subject) => (
          <div key={subject}>
            <h3>{subject}</h3>
            {filteredClasses[subject].map((item, index) => (
              <div
                key={index}
                draggable
                onDragStart={(e) => handleDragStart(e, item, subject)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, subject)}
                className="draggable-item"
                style={{ backgroundColor: generateColor(subject) }}
              >
                {item.className} - {item.units} units
              </div>
            ))}
          </div>
        ))}
      </div>
      <div
        className="drop-zone"
        onDragOver={handleDragOverDropZone}
        onDrop={(e) => handleDropOutside(e)}
        onDragLeave={handleDragLeaveDropZone}
      >
        Drop here to remove
      </div>
      {showInfo && (
        <div
          className="info-box"
          style={{ top: infoBoxPosition.top, left: infoBoxPosition.left }}
          onMouseDown={handleMouseDown}
        >
          <button className="close-btn" onClick={handleInfoBoxClose}>×</button>
          <h4>{infoContent.subject} - {infoContent.className}</h4>
          <p>{infoContent.description}</p>
          <p>Units: {infoContent.units}</p>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
