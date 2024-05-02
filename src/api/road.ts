import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";

const { VITE_TENANT_ID } = import.meta.env;

type Road = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  length: number;
  type: string;
  surface_material: string;
  construction_year: number;
};

export const getRoads = () => {
  return http.request<Array<Road>>("get", baseUrlApi("roads"), {
    params: { tenant_id: VITE_TENANT_ID }
  });
};

export const addRoad = (data: object) => {
  return http.request("post", baseUrlApi("road"), {
    data: { ...data, tenant_id: VITE_TENANT_ID }
  });
};

export const updateRoad = (id: number, data: object) => {
  return http.request("put", baseUrlApi(`road/${id}`), {
    data: { ...data, tenant_id: VITE_TENANT_ID }
  });
};

export const deleteRoad = (id: number) => {
  return http.request("delete", baseUrlApi(`road/${id}`), {
    params: { tenant_id: VITE_TENANT_ID }
  });
};
