import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { useLocation, useNavigate } from "react-router";
import type { RootState } from "../store/auth";
import Loading from "./Loading";
export default function AuthLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const authStatus = useSelector((state: RootState) => state.auth.user);
  const localUserData = JSON.parse(localStorage.getItem("user")!);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  //   console.log(authStatus, localUserData);

  useEffect(() => {
    // not data in store or no data in localstorage login it
    if (!authStatus && !localUserData)
      if (pathname != "/signup") navigate("/login");

    if (
      (authStatus || localUserData) &&
      (pathname === "/signup" || pathname === "/login")
    )
      navigate("/");
    setLoading(false);
  }, [authStatus, localUserData]);

  return loading ? <Loading /> : <> {children}</>;
}
