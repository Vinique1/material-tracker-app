import React from 'react';
import { useParams } from 'react-router-dom';
import MaterialTable from '../components/MaterialTable';

const MaterialListPage = () => {
  const params = useParams();
  
  // Check if the URL has a filter value (e.g., /category/Pipes)
  // And determine the filter type (category or supplier) from the path
  const filterKey = window.location.pathname.split('/')[1] || null;
  const filterValue = params.filterValue || null;

  return (
    <div>
        <MaterialTable filterKey={filterKey} filterValue={filterValue} />
    </div>
  );
};

export default MaterialListPage;