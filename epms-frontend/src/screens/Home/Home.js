// src/pages/Home/Home.js
import React from 'react';
// FIX: Changed '../../../components/Button/Button' to '../../components/Button/Button'
import Button from '../../components/Button/Button'; 
import './Home.css'; 

function Home({ firstName, userRole, onLogout }) {
    return (
        <div className="home-container">
            <div className="home-content-box">
                <h1 className="home-title">
                    Welcome, {firstName}!
                </h1>
                
                <p className="home-role-text">
                    Login successful. Your role is: <span className="home-role-span">{userRole}</span>
                </p>

                {/* The Button component is used with the same props */}
                <Button
                    onClick={onLogout}
                    type="button"
                    size="lg"
                    color="secondary"
                    className="home-logout-button" /* Specific class for additional styling if needed */
                >
                    Logout
                </Button>
            </div>
        </div>
    );
}
export default Home;