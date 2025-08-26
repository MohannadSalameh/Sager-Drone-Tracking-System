import { isAllowed } from '../utils/formatters'

export default function DroneIcon({ 
  yaw = 0, 
  registration = '', 
  isSelected = false, 
  isFocused = false,
  // Add props for movement direction
  movementDirection = 0
}) {
  const color = isAllowed(registration) ? '#00C48C' : '#FF5252';
  const size = isSelected || isFocused ? 28 : 24;
  const haloSize = isSelected || isFocused ? 8 : 6;
  
  return (
    <div 
      className="drone-wrapper" 
      style={{ 
        width: `${size + haloSize * 2}px`,
        height: `${size + haloSize * 2}px`,
        position: 'relative',
        transition: 'all 0.3s ease',
        transform: `scale(${isSelected ? 1.2 : 1})`
      }}
    >
      {/* Selection/focus halo */}
      {(isSelected || isFocused) && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: `${size + haloSize * 2}px`,
            height: `${size + haloSize * 2}px`,
            borderRadius: '50%',
            backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.3)' : 'rgba(200, 200, 200, 0.2)',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            animation: 'pulse 1.5s infinite',
            zIndex: 0
          }}
        />
      )}

      {/* Drone body with proper rotation */}
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) rotate(${yaw}deg)`,
          transition: 'transform 0.5s ease',
          zIndex: 2
        }}
      >
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main body - circular center */}
          <circle cx="12" cy="12" r="5" fill={color} stroke="white" strokeWidth="1.5" />
          
          {/* Direction indicator arrow */}
          <path 
            d="M12 5L14 9H10L12 5Z" 
            fill="white" 
            stroke="white" 
            strokeWidth="0.5"
          />
          
          {/* Rotor arms */}
          <line x1="12" y1="7" x2="12" y2="3" stroke="white" strokeWidth="1.5" />
          <line x1="12" y1="17" x2="12" y2="21" stroke="white" strokeWidth="1.5" />
          <line x1="7" y1="12" x2="3" y2="12" stroke="white" strokeWidth="1.5" />
          <line x1="17" y1="12" x2="21" y2="12" stroke="white" strokeWidth="1.5" />
          
          {/* Rotors */}
          <circle cx="12" cy="3" r="2" fill={color} stroke="white" strokeWidth="1" />
          <circle cx="12" cy="21" r="2" fill={color} stroke="white" strokeWidth="1" />
          <circle cx="3" cy="12" r="2" fill={color} stroke="white" strokeWidth="1" />
          <circle cx="21" cy="12" r="2" fill={color} stroke="white" strokeWidth="1" />
        </svg>
      </div>

      {/* Movement direction arrow (outside the drone) */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: `${size * 1.2}px`,
          height: `${size * 1.2}px`,
          transform: `translate(-50%, -50%) rotate(${movementDirection}deg)`,
          zIndex: 1,
          pointerEvents: 'none'
        }}
      >
        <svg 
          width={size * 1.2} 
          height={size * 1.2} 
          viewBox="0 0 24 24"
          style={{
            filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.5))',
          }}
        >
          <path 
            d="M12 2L16 10H8L12 2Z" 
            fill={color} 
            stroke="white" 
            strokeWidth="0.5"
            opacity="0.8"
          />
        </svg>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.3; transform: translate(-50%, -50%) scale(1.1); }
          100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </div>
  )
}