import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import MaterialTable from '../components/MaterialTable';

const MaterialListPage = ({ statusFilter }) => {
  const params = useParams();
  const location = useLocation();

  const filterKey = location.pathname.split('/')[1] || null;
  const filterValue = params.filterValue
    ? decodeURIComponent(params.filterValue)
    : null;

  // MODIFIED: Determine the viewType to pass to the table
  const viewType =
    statusFilter ||
    (location.pathname === '/balanced-materials' ? 'balanced' : 'default');

  return (
    <div>
      <MaterialTable
        filterKey={filterKey}
        filterValue={filterValue}
        statusFilter={statusFilter}
        viewType={viewType}
      />
    </div>
  );
};

export default MaterialListPage;
