import { useSelector } from 'react-redux'
import { selectRedCount } from '../store/dronesSlice'

export default function Counter() {
  const red = useSelector(selectRedCount)
  return (
    <div className="counter">
      {red} Drone{red !== 1 ? 's' : ''} not allowed
    </div>
  )
}