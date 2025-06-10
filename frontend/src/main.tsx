import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "./pages/Home.tsx";
import Login from "./pages/Login.tsx";
import SignUp from "./pages/SignUp.tsx";
import { Provider } from "react-redux";
import store from "./store/auth.ts";
import AuthLayout from "./components/AuthLayout.tsx";
import Me from "./pages/Me.tsx";
import Analytics from "./pages/Analytics.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/signup",
        element: (
          <AuthLayout>
            <SignUp />
          </AuthLayout>
        ),
      },
      {
        path: "/login",
        element: (
          <AuthLayout>
            <Login />
          </AuthLayout>
        ),
      },
      {
        path: "/info",
        element: (
          <AuthLayout>
            <Me />
          </AuthLayout>
        ),
      },
      {
        path: "/url",
        // element: <App />,
        children: [
          {
            path: "new",
            element: <Home />,
          },
          {
            path: "analytics/:urlId",
            element: <Analytics />,
          },
        ],
      },
    ],
  },
  // {
  //   path: "/url",
  //   element: <App />,
  //   children: [
  //     {
  //       path: "new",
  //       element: <Home />,
  //     },
  //     {
  //       path: "analytics/:urlId",
  //       element: <Analytics />,
  //     },
  //   ],
  // },
]);
console.log(router.routes);
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
    {/* <App /> */}
  </StrictMode>
);
