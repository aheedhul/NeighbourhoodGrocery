import client from "./client";

export async function fetchAssignments() {
  const { data } = await client.get("/deliveries");
  return data;
}

export async function claimAssignment(assignmentId: string) {
  const { data } = await client.post(`/deliveries/${assignmentId}/claim`);
  return data;
}

export async function updateAssignmentStatus(assignmentId: string, status: string) {
  const { data } = await client.patch(`/deliveries/${assignmentId}/status`, { status });
  return data;
}
