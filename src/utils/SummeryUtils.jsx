import Swal from "sweetalert2";

export const downloadJSON = (data) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "summary.json";
  link.click();
  Swal.fire("Exported", "JSON file downloaded!", "success");
};

export const exportCSV = (data) => {
  const rows = [
    ["Type", "Name", "Subject"],
    ...data.teachers.map((t) => ["Teacher", t.name, t.subject || ""]),
    ...data.subjects.map((s) => ["Subject", s.name, ""]),
  ];
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "summary.csv";
  link.click();
  Swal.fire("Exported", "CSV file downloaded!", "success");
};

export const printMovementBook = (data) => {
  const win = window.open("", "_blank");
  win.document.write("<h1>Movement Book</h1>");
  data.teachers.forEach((t) => {
    win.document.write(`<p>Teacher: ${t.name} - ${t.subject}</p>`);
  });
  data.subjects.forEach((s) => {
    win.document.write(`<p>Subject: ${s.name}</p>`);
  });
  win.print();
  Swal.fire("Printed", "Movement book sent to printer!", "success");
};
