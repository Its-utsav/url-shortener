import env from "../config/env";
import type { ICreateUrl, IUpdateUrl } from "../types";

export class UrlService {
  BASE_URL: string;

  constructor() {
    const isDev = env.IS_DEV;
    this.BASE_URL = isDev ? "/api" : env.BACKEND_URL;
  }

  async createUrl(data: ICreateUrl) {
    try {
      const res = await fetch(`${this.BASE_URL}/urls/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("createUrl failed");
      return await res.json();
    } catch (error) {
      console.log(`Error while creating shorturl: ${error}`);
      throw error;
    }
  }

  async getUrl(urlId: string) {
    try {
      const res = await fetch(`${this.BASE_URL}/urls/${urlId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) throw new Error("getUrl failed");
      return await res.json();
    } catch (error) {
      console.log(`Error while getting shorturl: ${error}`);
      throw error;
    }
  }

  async updateUrl(urlId: string, data: IUpdateUrl) {
    try {
      const res = await fetch(`${this.BASE_URL}/urls/${urlId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("updateUrl failed");
      return await res.json();
    } catch (error) {
      console.log(`Error while updating shorturl: ${error}`);
      throw error;
    }
  }

  async deleteUrl(urlId: string) {
    try {
      const res = await fetch(`${this.BASE_URL}/urls/${urlId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) throw new Error("deleteUrl failed");
      return await res.json();
    } catch (error) {
      console.log(`Error while deleteing shorturl: ${error}`);
      throw error;
    }
  }

  async getAnalytics(urlId: string) {
    try {
      const res = await fetch(`${this.BASE_URL}/urls/analytics/${urlId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) throw new Error("getAnalytics failed");
      return await res.json();
    } catch (error) {
      console.log(`Error while getAnalytics shorturl: ${error}`);
      throw error;
    }
  }

  async verifyPassword(urlId: string, password: string) {
    try {
      const res = await fetch(`${this.BASE_URL}/urls/password/${urlId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("verifyPassword failed");
      return await res.json();
    } catch (error) {
      console.log(`Error while verifying password for shorturl: ${error}`);
      throw error;
    }
  }
}

const url = new UrlService();

export default url;
