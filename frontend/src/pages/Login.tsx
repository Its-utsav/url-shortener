import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { Button, ErrorCmp, Input } from "../components";
import authService from "../service/auth";
import { login } from "../store/authSlice";
import type { ILogin } from "../types";

export default function Login() {
  const [formUserData, setFormUserData] = useState<ILogin | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [formErrorStatus, setFormErrorStatus] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const registerUser = async () => {
    setLoading(true);
    try {
      // console.log("for register", data);
      const user = await authService.login(formUserData!);
      if (user) {
        // console.log(user);
        dispatch(
          login({
            userId: user.data._id,
            username: user.data.username,
            email: user.data.email,
          }),
        );
        navigate("/");
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
    setError("");

    // if (userData && userData.password && userData.password.length > 8) {
    registerUser();
    // }
  };
  return (
    <div className="flex items-center justify-center my-4 flex-wrap">
      <form name="form">
        <Input
          label="email"
          autoComplete="email"
          required
          type="text"
          value={formUserData?.email}
          onChange={(e) =>
            setFormUserData((prevData) => ({
              ...prevData!,
              email: e.target.value,
            }))
          }
        />
        <Input
          label="password"
          autoComplete="current-password"
          required
          minLength={8}
          type="text"
          value={formUserData?.password}
          onChange={(e) =>
            setFormUserData((prevData) => ({
              ...prevData!,
              password: e.target.value,
            }))
          }
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
          {error && <ErrorCmp message={error} />}
        </div>
        {loading && <p className="bg-green-400 p-4">Loading</p>}
      </form>
    </div>
  );
}
