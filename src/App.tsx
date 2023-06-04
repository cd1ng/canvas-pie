import CanvasPie from './CanvasPie'
import type { Data } from './CanvasPie'
const data: Data[] = [
  { name: 'item1', value: 110, color: 'red' },
  { name: 'item2', value: 99, color: 'blue' },
  { name: 'item3', value: 1, color: 'orange' },
  { name: 'item4', value: 2, color: 'pink' },
  { name: 'item5', value: 3, color: 'green' },
  { name: 'item6', value: 1, color: 'yellow' },
  { name: 'item7', value: 0, color: 'Salmon' },
  { name: 'item8', value: 0, color: 'Tomato' },
]

function App() {
  return (
    <div className='App'>
      <CanvasPie data={data} width={200} height={200} radius={[0.4, 0.7]} spacing={true} />
    </div>
  )
}

export default App
