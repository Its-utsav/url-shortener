import { useLocation } from "react-router";
import { Loading, NewUrl } from "../components";

export default function Home() {
  const { pathname } = useLocation();

  // if path is / and login than display some created urls
  // if path is /new than form for creating

  // other wise show login to generate short urls
  return <>{pathname === "/" ? <h1>Created short urls</h1> : <NewUrl />}</>;
}
