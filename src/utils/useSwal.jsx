import Swal from "sweetalert2";

export async function confirmAction({
  title = "Are you sure?",
  text = "",
  confirmText = "Yes",
  cancelText = "Cancel",
  danger = false,
} = {}) {
  const result = await Swal.fire({
    title,
    text,
    icon: danger ? "warning" : "question",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: danger ? "#ef4444" : "#4f46e5",
    reverseButtons: true,
  });
  return result.isConfirmed;
}
