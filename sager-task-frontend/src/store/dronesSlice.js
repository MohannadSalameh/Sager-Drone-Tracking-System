import { createSlice, createSelector } from '@reduxjs/toolkit'

const initialState = {
  byId: {},
  selectedRegistration: null,
}

const slice = createSlice({
  name: 'drones',
  initialState,
  reducers: {
    upsertFromFeature: (state, { payload }) => {
      const f = payload
      const p = f.properties || {}
      const registration = p.registration
      if (!registration) return

      const now = Date.now()
      const prev = state.byId[registration]

      const base = prev || {
        registration,
        serial: p.serial || '', // ممكن ما تجي
        name: p.Name || 'Unknown',
        pilot: p.pilot || '',
        organization: p.organization || '',
        firstTimestamp: now,
        path: []
      }

      const coord = f.geometry?.coordinates || prev?.coord || [0,0]
      const next = {
        ...base,
        altitude: p.altitude ?? prev?.altitude ?? 0,
        yaw: p.yaw ?? prev?.yaw ?? 0,
        coord,
        lastTimestamp: now,
      }

      // add to path if moved
      const last = base.path[base.path.length - 1]
      if (!last || last[0] !== coord[0] || last[1] !== coord[1]) {
        base.path.push(coord)
      }
      next.path = base.path

      state.byId[registration] = next
    },

    selectDrone: (state, { payload }) => {
      state.selectedRegistration = payload //registration
    },
  }
})

export const { upsertFromFeature, selectDrone } = slice.actions
export default slice.reducer

// selectors
export const selectAllDrones = state => Object.values(state.drones.byId)
export const selectSelected = state => state.drones.selectedRegistration

// مثال فلترة حسب registration
export const selectRedCount = createSelector(selectAllDrones, list =>
  list.filter(d => !d.registration?.startsWith('SD-B')).length
)
