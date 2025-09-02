import React, { useEffect, useState } from "react";

const TimetableFetcher = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timetable, setTimetable] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          "https://time-table-production.up.railway.app/api/generate"
        );

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "Failed to fetch timetable");
        }

        const data = await response.json();
        setTimetable(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Error fetching timetable");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <p className="text-gray-600">Loading timetable...</p>;
  }

  if (error) {
    return <p className="text-red-600">Error: {error}</p>;
  }

  if (!timetable) {
    return <p className="text-gray-600">No timetable available.</p>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Generated Timetable</h2>
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Teacher</th>
            <th className="border px-4 py-2">Class</th>
            <th className="border px-4 py-2">Subject</th>
            <th className="border px-4 py-2">Period</th>
          </tr>
        </thead>
        <tbody>
          {timetable.assignments && timetable.assignments.length > 0 ? (
            timetable.assignments.map((row, index) => (
              <tr key={index}>
                <td className="border px-4 py-2">{row.teacher}</td>
                <td className="border px-4 py-2">{row.className}</td>
                <td className="border px-4 py-2">{row.subject}</td>
                <td className="border px-4 py-2">{row.period}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="border px-4 py-2 text-center" colSpan="4">
                No assignments found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TimetableFetcher;
