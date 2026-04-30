type Details = {
  output: string;
};

export interface Database {
  public: {
    Tables: {
      incident_logs: {
        Row: {
          id: string;
          timestamp: string;
          action_type: string;
          status: string;
          details: Details | null;
          project_context: string | null;
          state: string | null; // Maps to your custom 'action_state' type
          command_text: string | null;
        };
        Insert: {
          id?: string;
          timestamp?: string;
          action_type: string;
          status: string;
          details?: Details | null;
          project_context?: string | null;
          state?: string | null;
          command_text?: string | null;
        };
        Update: {
          id?: string;
          timestamp?: string;
          action_type?: string;
          status?: string;
          details?: Details | null;
          project_context?: string | null;
          state?: string | null;
          command_text?: string | null;
        };
      };
    };
  };
}

export type IncidentLog = Database["public"]["Tables"]["incident_logs"]["Row"];
