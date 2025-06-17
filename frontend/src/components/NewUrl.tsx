import { useState } from "react";
import Input from "./Input";
import Button from "./Button";
import type { ICreateUrl } from "../types";
import urlService from "../service/url";
import ErrorCmp from "./ErrorCmp";
import { useNavigate } from "react-router";

export default function NewUrl() {
  const [formData, setFormData] = useState<null | ICreateUrl>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const createNewUrl = async () => {
    setLoading(true);
    try {
      const res = await urlService.createUrl(formData!);
      console.log(res);
      if (res) {
        navigate(`/url/analytics/${res.data.shortUrl}`);
      }
    } catch (error) {
      if (error instanceof Error) setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(formData);
    // got all data , apply some basic validation
    // create new url than visit on than url in new tab :)
    createNewUrl();
  };
  return (
    <div className="">
      {/* <button onClick={(e) => navigate(`/url/analytics/qZbHwGqx`)}>
        {" "}
        visit
      </button> */}
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          label="Long URL"
          required
          value={formData?.originalUrl}
          onChange={(e) =>
            setFormData((prevData) => ({
              ...prevData!,
              originalUrl: e.target.value,
            }))
          }
        />
        <Input
          type="text"
          label="Description"
          required
          value={formData?.description}
          onChange={(e) =>
            setFormData((prevData) => ({
              ...prevData!,
              description: e.target.value,
            }))
          }
        />
        <div className="flex justify-around ">
          <div className="flex items-center justify-center flex-col text-center">
            <Input
              type="checkbox"
              label="Protected ?"
              checked={formData?.isPasswordProtected ? true : false}
              onChange={(e) =>
                setFormData((prevData) => ({
                  ...prevData!,
                  isPasswordProtected: e.target.checked,
                }))
              }
            />
          </div>
          <Input
            type="password"
            label="Password"
            disabled={formData?.isPasswordProtected ? false : true}
            required={formData?.isPasswordProtected ? true : false}
            value={formData?.password}
            onChange={(e) =>
              setFormData((prevData) => ({
                ...prevData!,
                password: e.target.value,
              }))
            }
          />
        </div>
        <Button className="w-full">Create</Button>
        {error && <ErrorCmp message={error} />}
      </form>
    </div>
  );
}
