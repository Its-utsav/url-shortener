import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Outlet } from "react-router";
import { Footer, Header } from "./components";
import { login, logout } from "./store/authSlice";
import authService from "./service/auth";

function App() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localUserData = localStorage.getItem("user");
    if (localUserData) {
      dispatch(login(JSON.parse(localUserData)));
      setLoading(false);
    } else {
      authService.getUserInfo().then((res) => {
        if (res) {
          dispatch(
            login({
              userId: res.data._id,
              username: res.data.username,
              email: res.data.email,
            }),
          );
        } else {
          dispatch(logout());
        }
      });
    }
  }, []);
  return (
    <>
      <div className="flex flex-wrap min-h-screen content-between bg-background">
        <div className="mx-4 block w-full">
          <Header />
          <main>
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
}

export default App;
