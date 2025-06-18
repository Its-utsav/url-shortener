const getFormValidationErrors = (errorObj: { [key: string]: string }) => {
  return Object.values(errorObj).join(", ");
};
export { getFormValidationErrors };
