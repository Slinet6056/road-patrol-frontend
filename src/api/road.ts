import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";

type Road = {
  name: string;
  latitude: number;
  longitude: number;
  length: number;
  type: string;
  surface_material: string;
  construction_year: number;
};

export const getRoads = (data?: object) => {
  return http.request<Array<Road>>("get", baseUrlApi("roads"), { data });
};
