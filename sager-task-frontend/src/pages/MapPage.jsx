import MapView from '../components/MapView';
import SidePanel from '../components/SidePanel';
import Counter from '../components/Counter';

export default function MapPage() {
  return (
    <div className="app">
      <SidePanel />
      <div className="map-container">
        <MapView />
        <Counter />
      </div>
    </div>
  );
}