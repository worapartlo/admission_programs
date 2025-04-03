"use client"; // บอกให้ Next.js ใช้งานคอมโพเนนต์นี้บนฝั่งไคลเอนต์

import { useState, useEffect } from "react";

export default function SelectProgram() {
  interface Program {
    id: number;
    program_id: number;
    program_name: string;
  }

  const [programs, setPrograms] = useState<Program[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/list_programs") // แทนที่ URL ด้วยของจริง
      .then((res) => res.json())
      .then((data) => setPrograms(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="flex justify-center items-center p-2 m-4">
      <div className="flex justify-center items-center">
        <select defaultValue="Pick a color" id="program-select" className="select">
        {programs.map((program) => (
            <option key={program.id} value={program.program_id}>
              {program.program_name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
