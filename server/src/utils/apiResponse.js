/**
 * Standardised API response helper.
 * Usage: res.status(200).json(apiResponse(data, 'Success message'))
 */
export const apiResponse = (data, message = "Success", meta = {}) => ({
  success: true,
  message,
  data,
  ...meta,
});
