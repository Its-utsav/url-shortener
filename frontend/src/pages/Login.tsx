import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { Button, ErrorCmp, Input } from "../components";
import authService from "../service/auth";
import { login } from "../store/authSlice";
import type { ILogin } from "../types";
import { getFormValidationErrors } from "../utils/validation";

export default function Login() {
  const [formUserData, setFormUserData] = useState<ILogin | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
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

  const validate = () => {
    // email , password
    //
    type FormErrorType = {
      [key: string]: string;
    };
    const formErrors: FormErrorType = {};
    if (!formUserData?.email || formUserData.email.trim() === "")
      formErrors.email = "Email is required";
    if (!formUserData?.password || formUserData.password.trim() === "")
      formErrors.password = "Password is required";

    const emailPattern = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}/;
    if (formUserData?.email && !emailPattern.test(formUserData.email))
      formErrors.email = "Invalid Email format";

    if (formUserData?.password && formUserData.password.length < 8)
      formErrors.password = "Password should be atleast 8 character long";

    return formErrors;
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    // setFormErrorStatus(e.currentTarget.form?.reportValidity()!);
    // console.log(e.currentTarget.form?.elements);
    setError("");

    const validationErrors = validate();

    // No Errors
    if (Object.keys(validationErrors).length === 0) registerUser();
    else {
      setError(getFormValidationErrors(validationErrors));
    }
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
            // disabled={formErrorStatus ? true : false}
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
