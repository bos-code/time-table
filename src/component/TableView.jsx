import { useEffect, useState } from "react";

function TimetableView() {
  const [timetable, setTimetable] = useState(null);

  useEffect(() => {
    // fetch timetable when component mounts
    async function fetchTimetable() {
      const response = await fetch(
        "https://your-time-table-production.up.railway.app/generate-timetable",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            days: 5,
            periods_per_day: 6,
            subjects: [
              { name: "Math", teacher: "Mr. A", periods_per_week: 5 },
              { name: "English", teacher: "Ms. B", periods_per_week: 4 },
            ],
          }),
        }
      );
      const data = await response.json();
      setTimetable(data.timetable);
    }

    fetchTimetable();
  }, []); // empty [] → runs only once when component mounts

  return (
    <div>
      <h2>Generated Timetable</h2>
      {timetable ? (
        <pre>{JSON.stringify(timetable, null, 2)}</pre>
      ) : (
        <p>Loading timetable...</p>
      )}
    </div>
  );
}

export default TimetableView;
