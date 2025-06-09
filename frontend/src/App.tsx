import { Footer, Header } from "./components";
import { Outlet } from "react-router";

function App() {
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
