export const initialState = {
  teachers: [],
  subjects: [],
  classes: [],
};

export function timetableReducer(state, action) {
  switch (action.type) {
    case "ADD_TEACHER":
      return {
        ...state,
        teachers: [
          ...state.teachers,
          { id: Date.now(), name: action.payload.name },
        ],
      };
    case "ADD_SUBJECT":
      return {
        ...state,
        subjects: [
          ...state.subjects,
          { id: Date.now(), name: action.payload.name },
        ],
      };
    case "ADD_CLASS":
      return {
        ...state,
        classes: [
          ...state.classes,
          { id: Date.now(), name: action.payload.name },
        ],
      };
    default:
      return state;
  }
}
