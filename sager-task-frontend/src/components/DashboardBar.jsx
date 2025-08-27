// src/components/DashboardBar.jsx
import { useNavigate, useLocation } from 'react-router-dom';
import '../assets/DashboardBar.css';
import locationIcon from '../assets/location-svgrepo-com-2.svg';
import dashboardIcon from '../assets/dashboard-svgrepo-com-2.svg';

function DashboardBar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine active page based on current path
  const isMapActive = location.pathname === '/';
  const isDashboardActive = location.pathname === '/dashboard';

  return (
    <aside className="dashboardbar">
      <ul>
        <li
          className={isDashboardActive ? "active" : ""}
          onClick={() => navigate('/dashboard')}
        >
          <span className="icon">
            <img src={dashboardIcon} alt="Dashboard" style={{ width: 22, height: 22 }} />
          </span>
          <div>DASHBOARD</div>
        </li>
        
        <li
          className={isMapActive ? "active" : ""}
          onClick={() => navigate('/')}
        >
          <span className="icon">
            <img src={locationIcon} alt="Map" style={{ width: 22, height: 22 }} />
          </span>
          <div>MAP</div>
        </li>
      </ul>
    </aside>
  );
}

export default DashboardBar;