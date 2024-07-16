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
        const response = await fetch('/classes.csv');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const reader = response.body.getReader();
        const result = await reader.read();
        const decoder = new TextDecoder('utf-8');
        const csvData = decoder.decode(result.value);

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
