import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { Button, ErrorCmp, Input, Loading } from "../components";
import authService from "../service/auth";
import { login } from "../store/authSlice";
import type { IRegister } from "../types";

export default function SignUp() {
  const [userData, setUserData] = useState<IRegister | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [formErrorStatus, setFormErrorStatus] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const registerUser = async (data: IRegister) => {
    setLoading(true);
    try {
      console.log("for register", data);
      const user = await authService.register(data);
      if (user) {
        console.log(user);
        dispatch(login(user));
        navigate("/login");
      }
    } catch (error) {
      if (error instanceof Error) setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    // setFormErrorStatus(e.currentTarget.form?.reportValidity()!);
    // console.log(e.currentTarget.form?.elements);
    const username = e.currentTarget.form?.elements.namedItem(
      "username",
    ) as HTMLInputElement;
    const email = e.currentTarget.form?.elements.namedItem(
      "email",
    ) as HTMLInputElement;
    const password = e.currentTarget.form?.elements.namedItem(
      "password",
    ) as HTMLInputElement;

    setUserData({
      username: username.value,
      email: email.value,
      password: password.value,
    });

    setError("");

    // if (userData && userData.password && userData.password.length > 8) {
    registerUser(userData!);
    // }
  };
  return (
    <div className="flex items-center justify-center my-4 flex-wrap">
      <form name="form">
        <Input label="username" autoComplete="username" required type="text" />
        <Input label="email" autoComplete="email" required type="text" />
        <Input
          label="password"
          autoComplete="current-password"
          required
          minLength={8}
          type="text"
        />
        <div className="flex items-center justify-center my-4 flex-col">
          <Button
            value="Register"
            type="submit"
            onClick={handleSubmit}
            disabled={formErrorStatus ? true : false}
          >
            Resgister
          </Button>
          {error && <ErrorCmp message={error} />}
        </div>
        {loading && <Loading />}
      </form>
    </div>
  );
}
