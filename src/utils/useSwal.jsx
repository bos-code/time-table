import Swal from "sweetalert2";

export const handleEditTeacher = (teacher) => {
  Swal.fire("Edit Teacher", `Editing ${teacher.name}`, "info");
};

export const handleRemoveTeacher = (id) => {
  Swal.fire("Remove Teacher", `Teacher with id ${id} removed`, "warning");
};

export const handleEditSubject = (subject) => {
  Swal.fire("Edit Subject", `Editing ${subject.name}`, "info");
};

export const handleRemoveSubject = (id) => {
  Swal.fire("Remove Subject", `Subject with id ${id} removed`, "warning");
};
