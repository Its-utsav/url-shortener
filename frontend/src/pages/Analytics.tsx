import { useParams } from "react-router";
import urlService from "../service/url";
import { useEffect } from "react";

export default function Analytics() {
  const { urlId } = useParams();
  if (!urlId) throw new Error("Url is required");
  const fetchData = async () => {
    const data = await urlService.getAnalytics(urlId);
    console.log(data);
  };
  useEffect(() => {
    fetchData();
  }, [urlId]);

  return <div>Analytics</div>;
}
