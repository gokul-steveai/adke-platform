import { Terminal, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuditLogs } from "../hooks/useAuditLogs";

export default function AuditLog() {
  const { logs } = useAuditLogs();

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="bg-gray-800 px-4 py-3 flex items-center gap-2 border-b border-gray-700">
        <Terminal size={16} className="text-green-400" />
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Incident Audit Trail
        </span>
      </div>
      <div className="p-4 space-y-3 font-mono text-xs">
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex gap-3 items-start animate-in fade-in slide-in-from-left-2"
          >
            {log.status === "Success" ? (
              <CheckCircle2 size={14} className="text-green-500 mt-1" />
            ) : (
              <AlertCircle size={14} className="text-red-500 mt-1" />
            )}
            <div className="flex-1">
              <div className="flex justify-between">
                <span className="text-blue-400">@{log.action_type}</span>
                <span className="text-gray-600">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-gray-400 mt-1">
                {log?.details?.output || "Automated Maintenance"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
