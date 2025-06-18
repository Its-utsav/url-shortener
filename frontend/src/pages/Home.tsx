import { Link, useLocation } from "react-router";
import { NewUrl } from "../components";
import CreatedUrls from "./CreatedUrls";
import { useSelector } from "react-redux";
import type { RootState } from "../store/auth";

export default function Home() {
  const { pathname } = useLocation();
  const authStatus = useSelector((state: RootState) => state.auth);
  console.log(authStatus);
  if (authStatus.status === false && authStatus.user == null) {
    return (
      <div className="shadow text-center p-4 border-2 rounded-lg tracking-wider">
        <Link to={"/login"} className="underline">
          Login
        </Link>{" "}
        to create short urls
      </div>
    );
  }
  // if path is / and login than display some created urls
  // if path is /new than form for creating

  // other wise show login to generate short urls
  return <>{pathname === "/" ? <CreatedUrls /> : <NewUrl />}</>;
}
