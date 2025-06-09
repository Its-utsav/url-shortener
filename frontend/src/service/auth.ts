import { combineSlices } from "@reduxjs/toolkit";
import env from "../config/env";
import type { IRegister, ILogin } from "../types";

export class AuthService {
  BASE_URL: string;

  constructor() {
    const isDev = env.IS_DEV;
    this.BASE_URL = isDev ? "/api/v1" : env.BACKEND_URL;
    console.log(this.BASE_URL);
  }

  async register(data: IRegister) {
    try {
      const res = await fetch(`${this.BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      // if (!res.ok) throw new Error("Registration failed");
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.message);
      }

      return resData;
    } catch (error) {
      console.log(`error :: register : ${error}`);
      throw error;
    }
  }

  async login(data: ILogin) {
    try {
      const res = await fetch(`${this.BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.message);
      }
      return resData;
    } catch (error) {
      console.log(`Error :: while login: ${error}`);
      throw error;
    }
  }

  async logout() {
    try {
      const res = await fetch(`${this.BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Logout failed");
      return await res.json();
    } catch (error) {
      console.log(`Error :: while logout: ${error}`);
      throw error;
    }
  }

  async getUserInfo() {
    try {
      const res = await fetch(`${this.BASE_URL}/auth/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) throw new Error("getUserInfo failed");
      return await res.json();
    } catch (error) {
      console.log(`Error :: while getUserInfo: ${error}`);
      throw error;
    }
  }

  async refershToken() {
    try {
      const res = await fetch(`${this.BASE_URL}/auth/refreshToken`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) throw new Error("refershToken failed");
      return await res.json();
    } catch (error) {
      console.log(`Error :: while refershToken: ${error}`);
      throw error;
    }
  }
}

const authService = new AuthService();

export default authService;
