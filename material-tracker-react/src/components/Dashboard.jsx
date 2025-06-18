import React from 'react';
import Header from './Header';
import MaterialTable from './MaterialTable';
import { useAuth } from '../context/authContext';

const Dashboard = () => {
    const { currentUser } = useAuth();
    return (
        <div className={currentUser.isViewer ? 'viewer-mode' : ''}>
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <MaterialTable />
            </main>
        </div>
    );
}

export default Dashboard;