import API from "../../../api";
export interface ActivityLog {
  id: number;
  user_id: number | null;
  user_email: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  description: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}
interface LogsResponse {
  logs: ActivityLog[];
  pagination: Pagination;
}
interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
export interface Filters {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  userId?: number | string;
  startDate?: string;
  endDate?: string;
}
export const getAuditLogs = async(data:Filters):Promise<LogsResponse>=>{
  const res = await API.get("/api/logs",
    {
        params:
            data
        
    }

  );
  return res.data;
}