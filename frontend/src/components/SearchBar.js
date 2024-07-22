import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import debounce from 'lodash.debounce';
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
  const [visibleClasses, setVisibleClasses] = useState(10);
  const [filteredResults, setFilteredResults] = useState([]);

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

  const debouncedSearch = useCallback(
    debounce((query, subject, searchType) => {
      let filtered;
      if (query.length >= 3) {
        filtered = searchType === 'All'
          ? getAllClasses().filter(({ item }) => item.toLowerCase().includes(query.toLowerCase()))
          : classesData[subject].filter(item => item.toLowerCase().includes(query.toLowerCase())).map(item => ({ subject, item }));
      } else {
        filtered = searchType === 'All'
          ? getAllClasses()
          : classesData[subject].map(item => ({ subject, item }));
      }
      setFilteredResults(filtered);
    }, 300),
    [classesData]
  );

  useEffect(() => {
    debouncedSearch(query, subject, searchType);
  }, [query, subject, searchType, debouncedSearch]);

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
    if (isDraggingOut && draggedItem) {
      const updatedSelectedClasses = { ...selectedClasses };
      Object.keys(updatedSelectedClasses).forEach(zoneKey => {
        if (!Array.isArray(updatedSelectedClasses[zoneKey])) {
          updatedSelectedClasses[zoneKey] = [];
        }
        updatedSelectedClasses[zoneKey] = updatedSelectedClasses[zoneKey].filter(item => item !== draggedItem);
      });
      setSelectedClasses(updatedSelectedClasses);
      setDraggedFromZone(null);
      try {
        await axios.post('https://bruin-planner-fb8f6f96ea51.herokuapp.com/updateUserClasses/', { username, selected_classes: updatedSelectedClasses, custom_options: customOptions });
      } catch (error) {
        console.error('Error updating selected classes:', error);
      }
    }
  };

  const getAllClasses = () => {
    let allClasses = [];
    Object.keys(classesData).forEach(subject => {
      allClasses = allClasses.concat(classesData[subject].map(item => ({ subject, item })));
    });
    return allClasses;
  };

  const listItemStyle = (subject) => ({
    display: 'block',
    maxWidth: '160px',
    wordWrap: 'break-word',
    border: '1px solid black',
    padding: '10px',
    margin: '6px 0',
    borderRadius: '5px',
    backgroundColor: generateColor(subject),
    cursor: 'pointer',
  });

  const hasSummerClasses = customOptions.some(option => option.includes('Summer'));

  const droppedItemStyle = (subject) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    border: '1px solid black',
    padding: '10px',
    margin: '2px 0',
    borderRadius: '5px',
    backgroundColor: generateColor(subject),
    height: '40px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'normal',
    fontSize: '0.9em',
    wordWrap: 'break-word',
  });

  const rowLabels = ['Quarter 1', 'Quarter 2', 'Quarter 3'];
  const colLabels = ['Year 1', 'Year 2', 'Year 3', 'Year 4'];

  const containerStyle = {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    padding: 0,
    margin: 0,
    boxSizing: 'border-box'
  };

  const searchColumnStyle = {
    marginTop: '50px',
    padding: '20px',
    width: '200px',
    backgroundColor: '#f5f5f5',
    color: 'black',
    fontSize: '1em',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: 'calc(100% - 60px)',
    boxSizing: 'border-box',
    overflowY: 'auto',
    flexShrink: 0
  };

  const gridColumnStyle = {
    flexGrow: 1,
    padding: '10px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    marginLeft: '10px'
  };

  const gridContainerStyle = {
    display: 'grid',
    gridTemplateColumns: `auto repeat(${4 + (customOptions.includes('Year 5') ? 1 : 0)}, 1fr)`,
    gridTemplateRows: `auto repeat(${hasSummerClasses ? 4 : 3}, 1fr)`,
    columnGap: '10px',
    rowGap: '10px',
    width: 'calc(100% - 220px)',
    height: 'calc(100vh - 80px)',
    marginTop: '40px',
    marginLeft: '170px',
    boxSizing: 'border-box',
    justifyContent: 'start',
    alignItems: 'center',
  };

  const rowLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    fontWeight: 'bold',
    boxSizing: 'border-box',
    margin: '0',
    padding: '0',
    textAlign: 'center',
    transform: 'translateX(-20px)',
  };

  const dropZoneStyle = {
    height: hasSummerClasses ? '175px' : '237px',
    width: '100%',
    border: '2px dashed black',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    position: 'relative',
    overflowY: 'auto',
    boxSizing: 'border-box',
    margin: '0',
    padding: '10px',
  };

  const toggleStyle = {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '10px',
  };

  const buttonStyle = {
    padding: '10px',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    transition: 'background-color 0.3s',
    marginRight: '10px',
  };

  const listContainerStyle = {
    flexGrow: 1,
    overflowY: 'auto',
    marginTop: '10px',
  };

  const searchBarStyle = {
    marginBottom: '10px',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    width: '100%',
  };

  const selectStyle = {
    marginBottom: '10px',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    width: '100%',
  };

  const handleInfoClick = (index, subject, className, units, description) => {
    setShowInfo(index);
    setInfoContent({ subject, className, units, description });
  };

  const closeInfoBox = () => {
    setShowInfo(null);
    setInfoContent({ subject: '', className: '', units: '', description: '' });
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - infoBoxPosition.left, y: e.clientY - infoBoxPosition.top });
  };

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      setInfoBoxPosition({
        top: e.clientY - dragStart.y,
        left: e.clientX - dragStart.x,
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCustomOptionChange = async (option) => {
    let updatedOptions;
    setCustomOptions((prevOptions) => {
      if (prevOptions.includes(option)) {
        updatedOptions = prevOptions.filter((opt) => opt !== option);
      } else {
        updatedOptions = [...prevOptions, option];
      }
      return updatedOptions;
    });

    try {
      await axios.post('https://bruin-planner-fb8f6f96ea51.herokuapp.com/updateUserClasses/', { username, selected_classes: selectedClasses, custom_options: updatedOptions });
    } catch (error) {
      console.error('Error updating custom options:', error);
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove]);

  if (!classesData || Object.keys(classesData).length === 0) {
    return <div>Loading...</div>;
  }

  const customOptionsList = [
    'Year 5',
    'Year 1 Summer',
    'Year 2 Summer',
    'Year 3 Summer',
    'Year 4 Summer'
  ];

  const renderCustomDropdown = () => (
    <div style={{ position: 'absolute', bottom: '60px', right: '20px', backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '5px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', zIndex: 1000, padding: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Customize Options</span>
        <button onClick={() => setIsDropdownOpen(false)} style={{ cursor: 'pointer', border: 'none', backgroundColor: 'transparent', fontSize: '1.2em' }}>&times;</button>
      </div>
      {customOptionsList.map((option, index) => (
        <label key={index} style={{ display: 'block', padding: '10px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={customOptions.includes(option)}
            onChange={() => handleCustomOptionChange(option)}
            style={{ marginRight: '10px' }}
          />
          {option}
        </label>
      ))}
    </div>
  );

  return (
    <div 
      onDragOver={handleDragOver}
      onDrop={handleDropOutside}
      style={containerStyle}
    >
      <div style={searchColumnStyle}>
        <div style={toggleStyle}>
          <button 
            onClick={() => setSearchType('All')} 
            style={buttonStyle}
          >
            All
          </button>
          <button 
            onClick={() => setSearchType('Subject')} 
            style={buttonStyle}
          >
            Subject
          </button>
        </div>
        {searchType === 'Subject' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <select 
              value={subject} 
              onChange={(e) => setSubject(e.target.value)}
              style={selectStyle}
            >
              {Object.keys(classesData).map((subject, index) => (
                <option key={index} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
        )}
        <input 
          type="text" 
          value={query} 
          onChange={handleChange} 
          placeholder="Search..." 
          style={searchBarStyle}
        />
        <div style={listContainerStyle}>
          <ul style={{ padding: 0, margin: 0, listStyleType: 'none' }}>
            {filteredResults.slice(0, visibleClasses).map((dataItem, index) => {
              const itemText = dataItem.item || dataItem;
              if (!itemText) return null;

              const [className, rest] = itemText.split(' - ');
              const description = rest ? rest.split(' | ')[1] : '';
              const units = rest ? rest.split(' | ')[0].split(': ')[1] : '';
              const displayName = `${dataItem.subject || subject} - ${className}`;
              const icon = icons[index % icons.length];
              return (
                <li 
                  key={index} 
                  style={listItemStyle(dataItem.subject || subject)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, { subject: dataItem.subject || subject, className: displayName, units, description })}
                >
                  {displayName}
                  <img 
                    src={icon} 
                    alt="info" 
                    style={{ width: '20px', height: '20px', cursor: 'pointer', marginLeft: '10px' }}
                    onClick={() => handleInfoClick(index, dataItem.subject || subject, className, units, description)}
                  />
                </li>
              );
            })}
          </ul>
          {filteredResults.length > visibleClasses && (
            <button onClick={() => setVisibleClasses(visibleClasses + 10)} style={buttonStyle}>Load More</button>
          )}
        </div>
      </div>
      <div style={gridColumnStyle}>
        <div style={gridContainerStyle}>
          <div></div>
          {colLabels.map((colLabel, colIndex) => (
            <div key={`col-${colIndex}`} style={{ textAlign: 'center', fontWeight: 'bold' }}>
              {colLabel}
            </div>
          ))}
          {customOptions.includes('Year 5') && (
            <div style={{ textAlign: 'center', fontWeight: 'bold' }}>Year 5</div>
          )}
          {rowLabels.map((rowLabel, rowIndex) => (
            <React.Fragment key={`row-${rowIndex}`}>
              <div style={{ ...rowLabelStyle, gridRow: `${rowIndex + 2} / span 1` }}>
                {rowLabel}
              </div>
              {colLabels.map((colLabel, colIndex) => {
                const zone = `${rowLabel}-${colLabel}`;
                return (
                  <div
                    key={zone}
                    style={dropZoneStyle}
                    onDragOver={handleDragOverDropZone}
                    onDragLeave={handleDragLeaveDropZone}
                    onDrop={(e) => handleDrop(e, zone)}
                  >
                    {selectedClasses[zone] && selectedClasses[zone].length > 0 ? 
                      selectedClasses[zone].map((item, index) => (
                        <div 
                          key={index} 
                          style={droppedItemStyle(item.subject)}
                          draggable
                          onDragStart={(e) => handleDragStart(e, item, zone)}
                        >
                          {item.className}
                        </div>
                      )) 
                      : 'Drop items here'}
                  </div>
                );
              })}
              {customOptions.includes('Year 5') && (
                <div
                  key={`${rowLabel}-Year 5`}
                  style={dropZoneStyle}
                  onDragOver={handleDragOverDropZone}
                  onDragLeave={handleDragLeaveDropZone}
                  onDrop={(e) => handleDrop(e, `${rowLabel}-Year 5`)}
                >
                  {selectedClasses[`${rowLabel}-Year 5`] && selectedClasses[`${rowLabel}-Year 5`].length > 0 ? 
                    selectedClasses[`${rowLabel}-Year 5`].map((item, index) => (
                      <div 
                        key={index} 
                        style={droppedItemStyle(item.subject)}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item, `${rowLabel}-Year 5`)}
                      >
                        {item.className}
                      </div>
                    )) 
                    : 'Drop items here'}
                </div>
              )}
            </React.Fragment>
          ))}
          {customOptions.some(option => option.includes('Summer')) && (
            <React.Fragment>
              <div style={{ ...rowLabelStyle, gridRow: `${rowLabels.length + 2} / span 1` }}>
                Summer
              </div>
              {colLabels.map((colLabel, colIndex) => {
                const zone = `Summer-${colIndex + 1}`;
                if (customOptions.includes(`Year ${colIndex + 1} Summer`)) {
                  return (
                    <div
                      key={zone}
                      style={dropZoneStyle}
                      onDragOver={handleDragOverDropZone}
                      onDragLeave={handleDragLeaveDropZone}
                      onDrop={(e) => handleDrop(e, zone)}
                    >
                      {selectedClasses[zone] && selectedClasses[zone].length > 0 ? 
                        selectedClasses[zone].map((item, index) => (
                          <div 
                            key={index} 
                            style={droppedItemStyle(item.subject)}
                            draggable
                            onDragStart={(e) => handleDragStart(e, item, zone)}
                          >
                            {item.className}
                          </div>
                        )) 
                        : 'Drop items here'}
                    </div>
                  );
                }
                return <div key={zone} style={dropZoneStyle}></div>;
              })}
            </React.Fragment>
          )}
        </div>
      </div>
      {isDropdownOpen && renderCustomDropdown()}
      <button 
        style={{ position: 'absolute', bottom: '20px', right: '20px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3399ff'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
      >
        Customize
      </button>
      {showInfo !== null && (
        <div
          style={{
            position: 'absolute',
            top: `${infoBoxPosition.top}px`,
            left: `${infoBoxPosition.left}px`,
            padding: '20px',
            width: '400px',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '10px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            cursor: 'move',
          }}
          onMouseDown={handleMouseDown}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Class Info</span>
            <button onClick={closeInfoBox} style={{ cursor: 'pointer', border: 'none', backgroundColor: 'transparent', fontSize: '1.2em' }}>&times;</button>
          </div>
          <div><strong>Subject:</strong> {infoContent.subject}</div>
          <div><strong>Class Name:</strong> {infoContent.className}</div>
          <div><strong>Units:</strong> {infoContent.units}</div>
          <div><strong>Description:</strong> {infoContent.description}</div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
