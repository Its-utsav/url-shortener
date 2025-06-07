import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="bg-red-300 m-f flex">
        <h1>Hello World</h1>
      </div>
    </>
  );
}

export default App;
