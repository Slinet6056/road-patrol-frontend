import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";

const { VITE_TENANT_ID } = import.meta.env;

export type Plan = {
  id: number;
  road_ids: Array<number>;
  inspector_id: number;
  date: string;
  status: string;
};

export type Report = {
  id: number;
  plan_id: number;
  content: string;
  created_at: string;
  updated_at: string;
};

export const getPlans = () => {
  return http.request<Array<Plan>>("get", baseUrlApi("plans"), {
    params: { tenant_id: VITE_TENANT_ID }
  });
};

export const addPlan = (data: object) => {
  return http.request("post", baseUrlApi("plan"), {
    params: { tenant_id: VITE_TENANT_ID },
    data
  });
};

export const updatePlan = (id: number, data: object) => {
  return http.request("put", baseUrlApi(`plan/${id}`), {
    params: { tenant_id: VITE_TENANT_ID },
    data
  });
};

export const deletePlan = (id: number) => {
  return http.request("delete", baseUrlApi(`plan/${id}`), {
    params: { tenant_id: VITE_TENANT_ID }
  });
};

export const getReports = () => {
  return http.request<Array<Report>>("get", baseUrlApi("reports"), {
    params: { tenant_id: VITE_TENANT_ID }
  });
};

export const addReport = (data: object) => {
  return http.request("post", baseUrlApi("report"), {
    params: { tenant_id: VITE_TENANT_ID },
    data
  });
};

export const updateReport = (id: number, data: object) => {
  return http.request("put", baseUrlApi(`report/${id}`), {
    params: { tenant_id: VITE_TENANT_ID },
    data
  });
};

export const deleteReport = (id: number) => {
  return http.request("delete", baseUrlApi(`report/${id}`), {
    params: { tenant_id: VITE_TENANT_ID }
  });
};
