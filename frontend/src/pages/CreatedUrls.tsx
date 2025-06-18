import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Loading } from "../components";
import urlService from "../service/url";
import type { IUrl } from "../types";

type RowDataProps = {
  index: number;
  ogUrl: string;
  createdAt: string;
  shortUrl: string;
};

function RowData({ index, ogUrl, createdAt, shortUrl }: RowDataProps) {
  const navigate = useNavigate();
  return (
    <tr
      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
      onClick={() => navigate(`/url/analytics/${shortUrl}`)}
    >
      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
        {index}
      </td>
      <td className="px-6 py-4">{ogUrl}</td>
      <td className=" px-6 py-4">{createdAt}</td>
    </tr>
  );
}

export default function CreatedUrls() {
  const [data, setData] = useState<IUrl[] | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchData = async () => {
    setLoading(false);
    try {
      const res = await urlService.getAllUserUrls();
      setData(res.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  // console.log(data);
  return loading ? (
    <Loading />
  ) : (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg my-4">
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th className="px-6 py-3" scope="col">
              Sr No.
            </th>
            <th className="px-6 py-3" scope="col">
              Original Url
            </th>
            <th className="px-6 py-3" scope="col">
              CreatedAt
            </th>
          </tr>
        </thead>
        <tbody>
          {data &&
            data.map((d, index) => (
              <RowData
                key={d.shortUrl}
                index={index + 1}
                createdAt={d.createdAt}
                ogUrl={d.originalUrl}
                shortUrl={d.shortUrl}
              />
            ))}
        </tbody>
      </table>
    </div>
  );
}
