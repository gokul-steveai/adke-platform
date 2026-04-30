import { PieChart, Pie, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Cpu, Shapes } from "lucide-react";

export default function MemoryVisualizer({
  used,
  total,
}: {
  used: number;
  total: number;
}) {
  const data = [
    { name: "Used Memory", value: used },
    { name: "Available", value: total - used },
  ];
  const COLORS = ["#3b82f6", "#1e293b"]; // Blue and Dark Gray

  return (
    <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-2xl">
      <div className="flex items-center gap-2 mb-4 text-gray-400">
        <Cpu size={18} />
        <h3 className="text-sm font-semibold uppercase tracking-wider">
          RAM Allocation
        </h3>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={8}
              dataKey="value"
              stroke="none"
            >
              {data.map((_, index) => (
                <Shapes
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  type="circle"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                border: "1px solid #374151",
                color: "#fff",
              }}
              itemStyle={{ color: "#fff" }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center mt-2">
        <span className="text-2xl font-mono font-bold">
          {((used / total) * 100).toFixed(1)}%
        </span>
        <p className="text-xs text-gray-500">System Load</p>
      </div>
    </div>
  );
}
