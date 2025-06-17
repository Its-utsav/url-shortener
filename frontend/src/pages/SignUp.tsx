import { useState } from "react";
import { useNavigate } from "react-router";
import { Button, ErrorCmp, Input, Loading } from "../components";
import authService from "../service/auth";
import type { IRegister } from "../types";

export default function SignUp() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [formErrorStatus, setFormErrorStatus] = useState(false);
  const [formData, setFormData] = useState<IRegister | null>(null);
  const navigate = useNavigate();

  const registerUser = async () => {
    setLoading(true);
    try {
      console.log("for register", formData);
      const user = await authService.register(formData!);
      if (user) {
        console.log(user);
        // dispatch(
        //   login({
        //     userId: user.data._id,
        //     username: user.data.username,
        //     email: user.data.email,
        //   })
        // );
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

    setError("");

    // if (userData && userData.password && userData.password.length > 8) {
    // registerUser(userData!);
    registerUser();
    // }
  };
  return (
    <div className="flex items-center justify-center my-4 flex-wrap">
      <form name="form">
        <Input
          label="username"
          autoComplete="username"
          required
          type="text"
          value={formData?.username}
          onChange={(e) =>
            setFormData((prevData) => ({
              ...prevData!,
              username: e.target.value,
            }))
          }
        />
        <Input
          label="email"
          autoComplete="email"
          required
          type="text"
          value={formData?.email}
          onChange={(e) =>
            setFormData((prevData) => ({
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
          value={formData?.password}
          onChange={(e) =>
            setFormData((prevData) => ({
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
            Resgister
          </Button>
          {error && <ErrorCmp message={error} />}
        </div>
        {loading && <Loading />}
      </form>
    </div>
  );
}
