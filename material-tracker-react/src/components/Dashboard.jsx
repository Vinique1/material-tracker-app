import React from 'react';
import Header from './Header';
import MaterialTable from './MaterialTable';
import { useAuth } from './context/authContext';

const Dashboard = () => {
    const { currentUser } = useAuth(); // Keep useAuth if currentUser is used for logic, not just styling
    return (
        // MODIFIED: Removed viewer-mode class as theme is handled globally
        <div>
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <MaterialTable />
            </main>
        </div>
    );
}

export default Dashboard;