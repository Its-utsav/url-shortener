import { useEffect, useState } from "react";
import authService from "../service/auth";
import { ErrorCmp, Loading } from "../components";

interface UserData {
  username: string;
  email: string;
}

export default function Me() {
  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getData = async () => {
    setLoading(true);
    try {
      const res = await authService.getUserInfo();
      setData(res.data);
    } catch (error) {
      if (error instanceof Error) setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);
  return loading ? (
    <Loading />
  ) : (
    <div className="bg-red-400 text-center p-3 rounded-3xl">
      {error && <ErrorCmp message={error} />}
      <h2>Username : {data!.username}</h2>
      <h2>Email : {data!.email}</h2>
    </div>
  );
}
