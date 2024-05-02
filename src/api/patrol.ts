import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";

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
  return http.request<Array<Plan>>("get", baseUrlApi("plans"));
};

export const addPlan = (data: object) => {
  return http.request("post", baseUrlApi("plan"), { data });
};

export const updatePlan = (id: number, data: object) => {
  return http.request("put", baseUrlApi(`plan/${id}`), { data });
};

export const deletePlan = (id: number) => {
  return http.request("delete", baseUrlApi(`plan/${id}`));
};

export const getReports = () => {
  return http.request<Array<Report>>("get", baseUrlApi("reports"));
};

export const addReport = (data: object) => {
  return http.request("post", baseUrlApi("report"), { data });
};

export const updateReport = (id: number, data: object) => {
  return http.request("put", baseUrlApi(`report/${id}`), { data });
};

export const deleteReport = (id: number) => {
  return http.request("delete", baseUrlApi(`report/${id}`));
};
