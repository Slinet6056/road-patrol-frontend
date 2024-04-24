import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";

export type LoginResult = {
  success: boolean;
  message: string;
  data: {
    /** 用户名 */
    username: string;
    /** 当前登陆用户的角色 */
    roles: Array<string>;
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date;
  };
};

export type RefreshTokenResult = {
  success: boolean;
  message: string;
  data: {
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date;
  };
};

type User = {
  id: number;
  username: string;
  password: string;
  role: string;
};

/** 登录 */
export const getLogin = (data: object) => {
  return http.request<LoginResult>("post", baseUrlApi("login"), { data });
};

/** 刷新token */
export const refreshTokenApi = (data: object) => {
  return http.request<RefreshTokenResult>("post", baseUrlApi("refresh-token"), {
    data
  });
};

export const getUsers = () => {
  return http.request<Array<User>>("get", baseUrlApi("users"));
};

export const addUser = (data: object) => {
  return http.request("post", baseUrlApi("user"), { data });
};

export const updateUser = (id: number, data: object) => {
  return http.request("put", baseUrlApi(`user/${id}`), { data });
};

export const deleteUser = (id: number) => {
  return http.request("delete", baseUrlApi(`user/${id}`));
};
