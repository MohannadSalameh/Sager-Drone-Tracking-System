import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectDrone, selectSelected, selectAllDrones } from "../store/dronesSlice";
import { isAllowed } from "../utils/formatters";
import '../assets/SidePanel.css';

function SidePanel() {
  const drones = useSelector(selectAllDrones);
  const selectedSerial = useSelector(selectSelected);
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(true);
  const droneListRef = useRef(null);
  const itemRefs = useRef({});
  const hasScrolledRef = useRef(false);

  // Listen for toggle events from the Header component
  useEffect(() => {
    const handleToggle = (event) => {
      setVisible(event.detail.visible);
    };
    window.addEventListener('toggleSidePanel', handleToggle);
    return () => window.removeEventListener('toggleSidePanel', handleToggle);
  }, []);

  // Auto-show on wider screens; keep user's choice on small screens
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 770) setVisible(true);
      else setVisible(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Scroll selected drone into view inside the side panel
  useEffect(() => {
    hasScrolledRef.current = false; // Reset scroll flag when selection changes
  }, [selectedSerial]);

  useEffect(() => {
    if (!selectedSerial || !visible || hasScrolledRef.current) return;

    const container = droneListRef.current;
    const el = itemRefs.current[selectedSerial];
    if (el && container) {
      const containerHeight = container.clientHeight;
      const elOffsetTop = el.offsetTop;
      const elHeight = el.clientHeight;

      container.scrollTo({
        top: elOffsetTop - containerHeight / 2 + elHeight / 2,
        behavior: 'smooth'
      });

      hasScrolledRef.current = true; // mark as scrolled for this selection
    }
  }, [selectedSerial, visible, drones]);

  // Don't render anything when panel is hidden
  if (!visible) {
    return null;
  }

  const sorted = [...drones].sort((a, b) => b.lastTimestamp - a.lastTimestamp);

  return (
    <div className={`side-panel ${visible ? 'visible' : ''}`}>
      <div className="panel-header panel-title">
        <div className="title">DRONE FLYING</div>
        <button className="close-panel-btn" onClick={() => setVisible(false)} title="Close Panel">
          ×
        </button>
      </div>

      <div className="panel-header">
        <span className="tab active">Drones</span>
        <span className="tab">Flights History</span>
      </div>

      <div className="drone-list" ref={droneListRef}>
        {sorted.length === 0 ? (
          <div className="drone-list-placeholder">No drones detected yet...</div>
        ) : (
          <ul>
            {sorted.map((d) => {
              const active = selectedSerial === d.serial;
              const allowed = isAllowed(d.registration);
              
              return (
                <li
                  key={d.serial}
                  ref={(el) => { if (el) itemRefs.current[d.serial] = el; }}
                  onClick={() => dispatch(selectDrone(d.serial))}
                  className={active ? "selected" : ""}
                >
                  <div className="drone-info-grid">
                    <div className="drone-title"><strong>{d.name}</strong></div>
                    <div className="drone-status">
                      <span
                        className="drone-status-dot"
                        style={{ background: allowed ? "green" : "red" }}
                        title={allowed ? "Can fly" : "Cannot fly"}
                      />
                    </div>
                    <div className="drone-serial">
                      <span className="label">Serial #</span>
                      <span className="value">{d.serial}</span>
                    </div>
                    <div className="drone-registration">
                      <span className="label">Registration</span>
                      <span className="value">{d.registration}</span>
                    </div>
                    <div className="drone-pilot">
                      <span className="label">Pilot</span>
                      <span className="value">{d.pilot}</span>
                    </div>
                    <div className="drone-organization">
                      <span className="label">Organization</span>
                      <span className="value">{d.organization}</span>
                    </div>
                    <div className="drone-altitude">
                      <span className="label">Altitude</span>
                      <span className="value">{d.altitude}m</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default SidePanel;