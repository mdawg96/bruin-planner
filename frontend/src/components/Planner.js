import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import SearchBar from './SearchBar';
import { useNavigate } from 'react-router-dom';

const Planner = () => {
  const [classesData, setClassesData] = useState({});
  const username = localStorage.getItem('username');
  const navigate = useNavigate();

  useEffect(() => {
    if (!username) {
      navigate('/login');
      return;
    }

    const fetchClassesData = async () => {
      try {
        const response = await fetch('https://bruin-planner-fb8f6f96ea51.herokuapp.com/classes.csv', {
          mode: 'cors'
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const csvData = await response.text();

        const parsedData = Papa.parse(csvData, { header: true });
        const classesBySubject = {};
        
        parsedData.data.forEach(row => {
          Object.keys(row).forEach(subject => {
            if (!classesBySubject[subject]) {
              classesBySubject[subject] = [];
            }
            if (row[subject]) {
              classesBySubject[subject].push(row[subject]);
            }
          });
        });

        setClassesData(classesBySubject);
      } catch (error) {
        console.error('Error fetching classes data:', error);
      }
    };

    fetchClassesData();
  }, [username, navigate]);

  return (
    <div>
      <SearchBar username={username} classesData={classesData} />
    </div>
  );
};

export default Planner;
