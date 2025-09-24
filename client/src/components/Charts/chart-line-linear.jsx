import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const chartData = [
  { day: "Monday", emissions: 12.5 },
  { day: "Tuesday", emissions: 18.2 },
  { day: "Wednesday", emissions: 15.8 },
  { day: "Thursday", emissions: 22.1 },
  { day: "Friday", emissions: 28.4 },
  { day: "Saturday", emissions: 35.2 },
  { day: "Sunday", emissions: 19.7 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-blue-600">
          CO₂ Emissions: {payload[0].value} kg
        </p>
      </div>
    )
  }
  return null
}

export default function ChartLineWeekly() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Card Header */}
      <div className="p-6 pb-0">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">
          Weekly Carbon Emissions
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Daily CO₂ emissions for this week
        </p>
      </div>
      
      {/* Card Content */}
      <div className="p-6">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                left: 12,
                right: 12,
                top: 12,
                bottom: 12,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="day" 
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
              <Line 
                dataKey="emissions" 
                type="monotone" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ 
                  fill: "#3b82f6", 
                  strokeWidth: 2, 
                  r: 4 
                }}
                activeDot={{ 
                  r: 6, 
                  stroke: "#3b82f6", 
                  strokeWidth: 2, 
                  fill: "#ffffff" 
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Card Footer */}
      <div className="flex flex-col items-start gap-2 text-sm p-6 pt-0">
        <div className="flex gap-2 leading-none font-medium items-center">
          <span className="text-red-600">Trending up by 8.3% this week</span>
          <TrendingUp className="h-4 w-4 text-red-600" />
        </div>
        <div className="text-gray-600 leading-none">
          Showing daily carbon emissions for the current week
        </div>
      </div>
    </div>
  )
}