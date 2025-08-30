import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectDrone,
  selectSelected,
  selectAllDrones,
} from "../store/dronesSlice";
import { isAllowed } from "../utils/formatters";
import droneImg from "../assets/drone.svg";

export default function DroneList() {
  const drones = useSelector(selectAllDrones);
  const selected = useSelector(selectSelected);
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(true);

  const sortedDrones = [...drones].sort(
    (a, b) => b.lastTimestamp - a.lastTimestamp
  );

  const toggleList = () => {
    setIsOpen(!isOpen);
  };

  if (!isOpen) {
    return (
      <div className="sidebar collapsed">
        <div className="drone-icon-circle" onClick={toggleList}>
          <img src={droneImg} alt="Drone List" className="DroneListIcon" />
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar">
      <div className="DroneListHead">
        <div className="DroneListTitle">
          <div className="title">DRONE FLYING</div>
          <button className="DroneListBtn" onClick={toggleList}>
            X
          </button>
        </div>
        <div className="DroneListOptions">
          <a href="#" className="DronListOption DroneOption">
            Drones
          </a>
          <a href="#" className="DronListOption HistoryOption">
            Flights History
          </a>
        </div>
      </div>

      <div className="list">
        {sortedDrones.map((drone) => {
          const isActive = selected === drone.registration;
          const isRegistrationAllowed = isAllowed(drone.registration);

          return (
            <div
              key={drone.registration}
              className={`item ${isActive ? "active" : ""}`}
              onClick={() => dispatch(selectDrone(drone.registration))}
            >
              <div className="DroneListItems">
                <div className="DroneListItemsName">
                  <div>{drone.name}</div>
                </div>

                <div className="DroneListItemsDetails">
                  <div className="meta">
                    Serial # <br /> {drone.serial}
                  </div>
                  <div className="meta">
                    Registration # <br /> {drone.registration}
                  </div>
                  <div className="meta">
                    Pilot <br /> {drone.pilot}
                  </div>
                  <div className="meta">
                    Organization <br /> {drone.organization}
                  </div>
                </div>
              </div>

              <div className="DroneListItems">
                <span
                  className={`badge ${isRegistrationAllowed ? "green" : "red"}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
