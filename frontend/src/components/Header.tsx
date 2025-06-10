import { Navigate, NavLink } from "react-router";
import { Logo, Container, Button } from "./index";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store/auth";
import authService from "../service/auth";
import { logout } from "../store/authSlice";

export function Logout() {
  const dispatch = useDispatch();
  const handleClick = () => {
    authService.logout().then((res) => {
      if (res) dispatch(logout());
      Navigate({ to: "/" });
    });
  };
  return (
    <Button onClick={handleClick} className="cursor-pointer hover:underline">
      Logout
    </Button>
  );
}

export default function Header() {
  const authStatus = useSelector((state: RootState) => state.auth.user);

  const headerItems = [
    { name: "Home", link: "/", visible: true },
    { name: "Login", link: "/login", visible: !authStatus },
    { name: "Sign Up", link: "/signup", visible: !authStatus },
    { name: "Create", link: "/url/new", visible: authStatus },
    { name: "You", link: "/info", visible: authStatus },
  ];

  return (
    <header className="flex items-center justify-between w-full">
      <Container>
        <nav className="h-24 flex items-center justify-between ">
          <Logo />
          <div>
            {headerItems.map((item) =>
              item.visible ? (
                <NavLink
                  key={item.name}
                  to={item.link}
                  className={({ isActive }) =>
                    `gap-2 p-4 ${isActive ? "" : " "}text-red-400`
                  }
                >
                  {item.name}
                </NavLink>
              ) : null
            )}
            {authStatus && <Logout />}
          </div>
        </nav>
      </Container>
    </header>
  );
}
