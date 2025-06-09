import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { Button, Input } from "../components";
import authService from "../service/auth";
import { login } from "../store/authSlice";
import type { ILogin } from "../types";

export default function Login() {
  const [userData, setUserData] = useState<ILogin | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [formErrorStatus, setFormErrorStatus] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const registerUser = async (data: ILogin) => {
    setLoading(true);
    try {
      console.log("for register", data);
      const user = await authService.login(data);
      if (user) {
        console.log(user);
        dispatch(
          login({ userId: user._id, usename: user.name, email: user.email }),
        );
        navigate("/");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    // setFormErrorStatus(e.currentTarget.form?.reportValidity()!);
    // console.log(e.currentTarget.form?.elements);

    const email = e.currentTarget.form?.elements.namedItem(
      "email",
    ) as HTMLInputElement;
    const password = e.currentTarget.form?.elements.namedItem(
      "password",
    ) as HTMLInputElement;

    setUserData({
      email: email.value,
      password: password.value,
    });
    console.log(userData!);
    setError("");

    // if (userData && userData.password && userData.password.length > 8) {
    registerUser(userData!);
    // }
  };
  return (
    <div className="flex items-center justify-center my-4 flex-wrap">
      <form name="form">
        <Input label="email" autoComplete="email" required />
        <Input
          label="password"
          autoComplete="current-password"
          required
          minLength={8}
        />
        <div className="flex items-center justify-center my-4 flex-col">
          <Button
            value="Register"
            type="submit"
            onClick={handleSubmit}
            disabled={formErrorStatus ? true : false}
          >
            Login
          </Button>
          <div className="text-red-400 m-4 font-bold">
            {error && <p>{error}</p>}
          </div>
        </div>
        {loading && <p className="bg-green-400 p-4">Loading</p>}
      </form>
    </div>
  );
}
function dispatch(arg0: any) {
  throw new Error("Function not implemented.");
}
