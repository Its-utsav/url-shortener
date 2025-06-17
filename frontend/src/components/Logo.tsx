import { Link } from "react-router";

export default function Logo() {
  return (
    <div>
      <Link to={"#"}>
        <img src="./logo.png" alt="" className="h-12" />
      </Link>
    </div>
  );
}
