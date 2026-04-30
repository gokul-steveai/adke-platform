import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient"; // Your existing client
import type { IncidentLog } from "../types/supabase";

export const useAuditLogs = () => {
  const [logs, setLogs] = useState<IncidentLog[]>([]);

  useEffect(() => {
    // 1. Fetch initial logs
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from("incident_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(20);

      if (!error) {
        setLogs(data);
      }
    };

    fetchLogs();

    // 2. Subscribe to real-time changes
    const channel = supabase
      .channel("schema-db-changes")
      .on<IncidentLog>( // Fix: Type the incoming real-time changes
        "postgres_changes",
        { event: "*", schema: "public", table: "incident_logs" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setLogs((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setLogs((prev) =>
              prev.map((log) =>
                log.id === payload.new.id ? payload.new : log,
              ),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  return { logs };
};
