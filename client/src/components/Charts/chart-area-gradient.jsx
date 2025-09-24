import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const chartData = [
  { month: "January", transportation: 145, energy: 118, food: 95, waste: 23 },
  { month: "February", transportation: 132, energy: 110, food: 87, waste: 21 },
  { month: "March", transportation: 158, energy: 95, food: 92, waste: 25 },
  { month: "April", transportation: 167, energy: 82, food: 98, waste: 27 },
  { month: "May", transportation: 189, energy: 73, food: 105, waste: 29 },
  { month: "June", transportation: 205, energy: 68, food: 110, waste: 31 },
  { month: "July", transportation: 198, energy: 85, food: 115, waste: 33 },
  { month: "August", transportation: 176, energy: 92, food: 108, waste: 28 },
  { month: "September", transportation: 162, energy: 87, food: 102, waste: 26 },
  { month: "October", transportation: 148, energy: 94, food: 96, waste: 24 },
  { month: "November", transportation: 139, energy: 102, food: 89, waste: 22 },
  { month: "December", transportation: 156, energy: 125, food: 112, waste: 35 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum, entry) => sum + entry.value, 0)
    const categoryLabels = {
      transportation: 'Transportation',
      energy: 'Energy',
      food: 'Food',
      waste: 'Waste'
    }
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {categoryLabels[entry.dataKey]}: {entry.value} kg CO₂
          </p>
        ))}
        <hr className="my-1 border-gray-200" />
        <p className="text-sm font-medium text-gray-900">
          Total: {total} kg CO₂
        </p>
      </div>
    )
  }
  return null
}

export default function ChartAreaCarbon() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm col-span-full">
      {/* Card Header */}
      <div className="p-6 pb-0">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">
          Monthly Carbon Emissions by Category
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Transportation, Energy, Food, and Waste emissions throughout the year
        </p>
      </div>
      
      {/* Card Content */}
      <div className="p-6">
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                left: 20,
                right: 20,
                top: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                tickLine={false} 
                axisLine={false} 
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
                fontSize={12}
                fill="#6b7280"
              />
              <YAxis 
                tickLine={false} 
                axisLine={false} 
                tickMargin={8}
                fontSize={12}
                fill="#6b7280"
                tickFormatter={(value) => `${value}kg`}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Gradient Definitions */}
              <defs>
                <linearGradient id="fillTransportation" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillEnergy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillFood" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillWaste" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              
              <Area 
                dataKey="waste" 
                type="monotone" 
                fill="url(#fillWaste)" 
                fillOpacity={0.6} 
                stroke="#ef4444"
                strokeWidth={2}
                stackId="a" 
              />
              <Area 
                dataKey="food" 
                type="monotone" 
                fill="url(#fillFood)" 
                fillOpacity={0.6} 
                stroke="#f59e0b"
                strokeWidth={2}
                stackId="a" 
              />
              <Area 
                dataKey="energy" 
                type="monotone" 
                fill="url(#fillEnergy)" 
                fillOpacity={0.6} 
                stroke="#10b981"
                strokeWidth={2}
                stackId="a" 
              />
              <Area 
                dataKey="transportation" 
                type="monotone" 
                fill="url(#fillTransportation)" 
                fillOpacity={0.6} 
                stroke="#3b82f6"
                strokeWidth={2}
                stackId="a" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Card Footer */}
      <div className="p-6 pt-0">
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              <span className="text-red-600">Trending up by 8.7% this year</span>
              <TrendingUp className="h-4 w-4 text-red-600" />
            </div>
            <div className="text-gray-600 flex items-center gap-2 leading-none">
              Annual carbon footprint breakdown across all major categories
            </div>
            <div className="flex items-center gap-6 mt-3 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Transportation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Energy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Food</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Waste</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}