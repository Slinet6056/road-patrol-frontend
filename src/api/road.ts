import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";

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
  return http.request<Array<Road>>("get", baseUrlApi("roads"));
};

export const addRoad = (data: object) => {
  return http.request("post", baseUrlApi("road"), { data });
};

export const updateRoad = (id: number, data: object) => {
  return http.request("put", baseUrlApi(`road/${id}`), { data });
};

export const deleteRoad = (id: number) => {
  return http.request("delete", baseUrlApi(`road/${id}`));
};
