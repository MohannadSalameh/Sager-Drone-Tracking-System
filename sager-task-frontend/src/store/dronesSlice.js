import { createSlice, createSelector } from "@reduxjs/toolkit";

const initialState = {
  byId: {},
  selectedSerial: null,
  focusedSerial: null,
};

// Replicate the isAllowed logic directly in the slice to avoid import issues
const isAllowed = (registration = "") => {
  return registration.startsWith("B") || registration.includes("-B");
};

const slice = createSlice({
  name: "drones",
  initialState,
  reducers: {
    upsertFromFeature: (state, { payload }) => {
      const f = payload;
      const p = f.properties || {};
      const serial = p.serial;
      if (!serial) return;
      
      const now = Date.now();
      const prev = state.byId[serial];
      
      const base = prev || {
        serial,
        registration: p.registration || "",
        name: p.Name || "Unknown",
        pilot: p.pilot || "",
        organization: p.organization || "",
        firstTimestamp: now,
        path: [],
        coord: [0, 0],
        altitude: 0,
        yaw: 0,
        lastTimestamp: now
      };

      const coord = f.geometry?.coordinates || base.coord || [0, 0];
      
      const next = {
        ...base,
        altitude: p.altitude ?? base.altitude ?? 0,
        yaw: p.yaw ?? base.yaw ?? 0,
        coord,
        lastTimestamp: now,
      };
      
      // Add to path if position has changed
      if (Array.isArray(coord) && coord.length === 2 && !isNaN(coord[0]) && !isNaN(coord[1])) {
        const last = base.path[base.path.length - 1];
        if (!last || last[0] !== coord[0] || last[1] !== coord[1]) {
          // Limit path length for performance
          if (base.path.length > 50) {
            base.path = base.path.slice(-50);
          }
          base.path.push([...coord]);
        }
      }
      next.path = base.path;

      state.byId[serial] = next;
    },
    
    updateDronePosition: (state, { payload }) => {
      const { serial, coord, yaw } = payload;
      const drone = state.byId[serial];
      
      if (drone) {
        drone.coord = coord;
        
        if (yaw !== undefined) {
          drone.yaw = yaw;
        }
        
        if (!drone.path) {
          drone.path = [];
        }
        
        // Add to path if coordinates changed
        const last = drone.path[drone.path.length - 1];
        if (!last || last[0] !== coord[0] || last[1] !== coord[1]) {
          if (drone.path.length > 50) {
            drone.path.shift();
          }
          drone.path.push([...coord]);
        }
        
        drone.lastTimestamp = Date.now();
      }
    },
    
    selectDrone: (state, { payload }) => {
      state.selectedSerial = payload;
      state.focusedSerial = payload;
    },
    
    focusDrone: (state, { payload }) => {
      state.focusedSerial = payload;
    },
    
    unfocusDrone: (state) => {
      state.focusedSerial = null;
    },
  },
});

export const { 
  upsertFromFeature, 
  updateDronePosition, 
  selectDrone, 
  focusDrone, 
  unfocusDrone 
} = slice.actions;

export default slice.reducer;

// Selectors
export const selectDronesById = (state) => state.drones.byId;

export const selectAllDrones = createSelector(
  [selectDronesById],
  (byId) => Object.values(byId)
);

export const selectSelected = (state) => state.drones.selectedSerial;
export const selectFocused = (state) => state.drones.focusedSerial;

export const selectRedCount = createSelector(
  selectAllDrones,
  (list) => list.filter((d) => !isAllowed(d.registration)).length
);