import { useDispatch, useSelector } from "react-redux";
import {
  selectDrone,
  selectSelected,
  selectAllDrones,
} from "../store/dronesSlice";
import { isAllowed } from "../utils/formatters";

export default function DroneList() {
  const drones = useSelector(selectAllDrones);
  const selected = useSelector(selectSelected);
  const dispatch = useDispatch();

  const sorted = [...drones].sort((a, b) => b.lastTimestamp - a.lastTimestamp);

  return (
    <div className="sidebar">
      <div className="title">DRONE FLYING</div>
      <div className="list">
        {sorted.map((d) => {
          const active = selected === d.serial;
          const allowed = isAllowed(d.registration);

          return (
            <div
              key={d.serial}
              className={`item ${active ? "active" : ""}`}
              onClick={() => dispatch(selectDrone(d.serial))}
            >
              <div>
                <div style={{ fontWeight: 700 }}>
                  {d.name}{" "}
                  <span className={`badge ${allowed ? "green" : "red"}`} />
                </div>
                <div className="meta">Serial: {d.serial}</div>
                <div className="meta">Registration: {d.registration}</div>
                <div className="meta">
                  Pilot: {d.pilot} • Org: {d.organization}
                </div>
              </div>
              <div className="meta">Alt {d.altitude}m</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}