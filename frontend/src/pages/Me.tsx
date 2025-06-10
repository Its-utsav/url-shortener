import authService from "../service/auth";

export default function Me() {
  const lol = async () => {
    const res = await authService.getUserInfo();
    console.log(res);
  };
  lol();
  return <div></div>;
}
