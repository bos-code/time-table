import Swal from "sweetalert2";

export const sendTestJson = async (data) => {
  try {
    const res = await fetch("/api/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to send");

    Swal.fire("Success", "Data sent to backend!", "success");
  } catch (err) {
    Swal.fire("Error", err.message, "error");
  }
};
