import { useSelector } from 'react-redux';
import { selectAllDrones } from '../store/dronesSlice';
import { isAllowed } from '../utils/formatters';

export default function Dashboard() {
  const drones = useSelector(selectAllDrones);
  
  // Calculate statistics
  const totalDrones = drones.length;
  const allowedDrones = drones.filter(drone => isAllowed(drone.registration)).length;
  const notAllowedDrones = totalDrones - allowedDrones;
  const averageAltitude = drones.length > 0 
    ? Math.round(drones.reduce((sum, drone) => sum + drone.altitude, 0) / totalDrones) 
    : 0;
  
  // Group drones by organization
  const organizations = {};
  drones.forEach(drone => {
    const org = drone.organization || 'Unknown';
    if (!organizations[org]) {
      organizations[org] = 0;
    }
    organizations[org]++;
  });
  
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Drone Statistics Dashboard</h1>
      </div>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Drones</h3>
          <div className="stat-value">{totalDrones}</div>
        </div>
        
        <div className="stat-card">
          <h3>Allowed Drones</h3>
          <div className="stat-value green">{allowedDrones}</div>
        </div>
        
        <div className="stat-card">
          <h3>Not Allowed</h3>
          <div className="stat-value red">{notAllowedDrones}</div>
        </div>
        
        <div className="stat-card">
          <h3>Average Altitude</h3>
          <div className="stat-value">{averageAltitude}m</div>
        </div>
      </div>
      
      <div className="dashboard-details">
        <div className="detail-card">
          <h3>Organizations</h3>
          <div className="org-list">
            {Object.entries(organizations).map(([org, count]) => (
              <div key={org} className="org-item">
                <span>{org}</span>
                <span className="org-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="detail-card">
          <h3>Drone List</h3>
          <div className="drone-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Serial</th>
                  <th>Registration</th>
                  <th>Status</th>
                  <th>Altitude</th>
                </tr>
              </thead>
              <tbody>
                {drones.map(drone => (
                  <tr key={drone.serial}>
                    <td>{drone.name}</td>
                    <td>{drone.serial}</td>
                    <td>{drone.registration}</td>
                    <td>
                      <span className={`status-badge ${isAllowed(drone.registration) ? 'green' : 'red'}`}>
                        {isAllowed(drone.registration) ? 'Allowed' : 'Not Allowed'}
                      </span>
                    </td>
                    <td>{drone.altitude}m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}