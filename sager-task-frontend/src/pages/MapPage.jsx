import MapView from '../components/MapView';
import DroneList from '../components/DroneList';
import Counter from '../components/Counter';

export default function MapPage() {
  return (
    <div className="app">
      <DroneList />
      <div className="map-container">
        <MapView />
        <Counter />
      </div>
    </div>
  );
}