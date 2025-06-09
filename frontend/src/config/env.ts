const env = {
  BACKEND_URL: String(import.meta.env.VITE_BACKEND_URL),
  IS_DEV: Boolean(import.meta.env.DEV),
};
export default env;
