export type username = string;
export type password = string;
export type email = string;
export interface IUser {
  username: username;
}
export interface IRegister extends IUser {
  email: email;
  password: password;
}
export interface ILogin {
  email: email;
  password: password;
}

export interface ICreateUrl {
  originalUrl: string;
  description: string;
  isPasswordProtected?: boolean;
  password?: string;
}
export interface IUpdateUrl {
  description?: string;
  isPasswordProtected?: boolean;
  password?: string;
}
