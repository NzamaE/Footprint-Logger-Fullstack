import { TrendingUp } from "lucide-react"
import { LabelList, Pie, PieChart, Tooltip, ResponsiveContainer } from "recharts"

const chartData = [
  { browser: "chrome", visitors: 275, fill: "#8884d8" },
  { browser: "safari", visitors: 200, fill: "#82ca9d" },
  { browser: "firefox", visitors: 187, fill: "#ffc658" },
  { browser: "edge", visitors: 173, fill: "#ff7300" },
  { browser: "other", visitors: 90, fill: "#00ff00" },
]

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
  },
  safari: {
    label: "Safari",
  },
  firefox: {
    label: "Firefox",
  },
  edge: {
    label: "Edge",
  },
  other: {
    label: "Other",
  },
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">
          {chartConfig[data.browser]?.label || data.browser}
        </p>
        <p className="text-gray-600">
          Visitors: {data.visitors.toLocaleString()}
        </p>
      </div>
    )
  }
  return null
}

export default function ChartPieLabelList() {
  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Card Header */}
      <div className="flex flex-col items-center space-y-1.5 p-6 pb-0">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">
          Pie Chart - Label List
        </h3>
        <p className="text-sm text-gray-600">January - June 2024</p>
      </div>
      
      {/* Card Content */}
      <div className="flex-1 p-6 pb-0">
        <div className="mx-auto aspect-square max-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie 
                data={chartData} 
                dataKey="visitors"
                cx="50%"
                cy="50%"
                outerRadius={80}
              >
                <LabelList
                  dataKey="browser"
                  className="fill-white font-medium"
                  stroke="none"
                  fontSize={12}
                  formatter={(value) => chartConfig[value]?.label || value}
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Card Footer */}
      <div className="flex flex-col gap-2 text-sm p-6 pt-0">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month 
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-gray-600">
          Showing total visitors for the last 6 months
        </div>
      </div>
    </div>
  )
}