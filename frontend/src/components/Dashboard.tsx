import { useState } from "react";
import { Activity, ShieldCheck } from "lucide-react";
import ChatInterface from "./ChatInterface";
// import MemoryVisualizer from "./MemoryVisualizer";
import AuditLog from "./AuditLog";

export default function DevOpsDashboard() {
  const [lastMetrics, setLastMetrics] = useState({ used: 3421, total: 7864 });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-green-500 w-8 h-8" />
          <h1 className="text-2xl font-bold tracking-tight">
            ADKE{" "}
            <span className="text-gray-500 font-light">Control Center</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Ubuntu VPS: Online
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Metrics & Logs */}
        <div className="lg:col-span-2 space-y-8">
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MemoryVisualizer
              used={lastMetrics.used}
              total={lastMetrics.total}
            />
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
              <h3 className="text-gray-400 text-sm mb-4 flex items-center gap-2">
                <Activity size={16} /> System Health
              </h3>
              <p className="text-3xl font-mono">HEALTHY</p>
              <p className="text-sm text-gray-500 mt-2">
                All processes (PM2) running within project thresholds.
              </p>
            </div>
          </div> */}
          <AuditLog />
        </div>

        {/* Right: AI Chat Interface */}
        <div className="lg:col-span-1">
          <ChatInterface onMetricsUpdate={setLastMetrics} />
        </div>
      </div>
    </div>
  );
}
