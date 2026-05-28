import type { AxiosError } from "axios";

type ApiErrorBody = {
  message?: string;
  errors?: { path: string; message: string }[];
};

/**
 * Extracts a human-readable error message from an Axios error or generic Error.
 */
export function getApiError(err: unknown, fallback = "Something went wrong. Please try again."): string {
  const axiosErr = err as AxiosError<ApiErrorBody>;
  if (axiosErr?.response?.data) {
    const body = axiosErr.response.data;
    // Zod 422 structured errors
    if (body.errors && Array.isArray(body.errors) && body.errors.length > 0) {
      return body.errors.map((e) => e.message).join(", ");
    }
    if (body.message) return body.message;
  }
  if (axiosErr?.message) return axiosErr.message;
  if (err instanceof Error) return err.message;
  return fallback;
}
