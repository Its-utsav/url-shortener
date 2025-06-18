import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { useNavigate, useParams } from "react-router";
import { Button, ErrorCmp } from "../components";
import env from "../config/env";
import urlService from "../service/url";

ChartJS.register(ArcElement, Tooltip, Legend);

interface IUrlData {
  deviceType: string;
  percentage: number;
  totalClicks: number;
}

export default function Analytics() {
  const { urlId } = useParams();
  const [urlData, setUrlData] = useState<IUrlData[] | null>(null);
  const [error, setError] = useState("");
  if (!urlId) throw new Error("Url is required");

  const fetchData = async () => {
    try {
      const res = await urlService.getAnalytics(urlId);
      setUrlData(res.data);
    } catch (error) {
      if (error instanceof Error) setError(error.message);
    }
  };
  useEffect(() => {
    fetchData();
  }, [urlId]);
  // console.log(error);
  const deviceTypes = urlData?.map((d) => d.deviceType);
  const clicks = urlData?.map((d) => d.totalClicks);
  const data = {
    labels: deviceTypes,
    datasets: [
      {
        label: "# of clicks",
        data: clicks,
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(153, 102, 255, 0.2)",
          "rgba(255, 159, 64, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
        hoverOffset: 4,
      },
    ],
  };

  const navigate = useNavigate();
  const handleClick = () => {
    urlService.deleteUrl(urlId).then(() => navigate("/"));
  };

  return (
    <div className="my-2">
      <div>
        <div className="flex items-center justify-end gap-2">
          {/* <Button>Edit Info</Button> */}
          <Button className="bg-red-500" onClick={handleClick}>
            Delete
          </Button>
        </div>
        <div className="flex my-4">
          <div className="w-1/2 flex items-center justify-center text-center">
            <a
              target="_blank"
              href={`${env.BACKEND_URL}/api/v1/urls/r/${urlId}`}
            >
              <h1>Visit Now</h1>
            </a>
          </div>
          <div className="w-1/2">
            {urlData && <Pie data={data} />}
            {error && <ErrorCmp message={error} />}
          </div>
        </div>
      </div>
    </div>
  );
}
