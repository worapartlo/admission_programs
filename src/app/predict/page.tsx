"use client";

import { useState, useEffect } from "react";

export default function SelectProgram() {
  const [scores, setScores] = useState({
    gpax: null,

    //Netsat Scores
    thai_101: null,
    eng_102: null,
    math_103: null,
    sci_201: null,
    chem_202: null,
    bio_203: null,
    phy_204: null,

    //TPAT TGAT scores
    tgat_90: null,
    tgat_91: null,
    tgat_92: null,
    tgat_93: null,
    tpat_30: null,

    //Compentency scores
    fr_011: null,
    de_012: null,
    zh_013: null,
    ja_014: null,
    ko_015: null,
    es_016: null,
    music_021: null,
    exp_visual_art_024: null,
    drawing_023: null,
    commu_drawing_025: null,
    commu_design_026: null,
    ar_041: null,
    design_042: null,
    art_051: null,
    physical_052: null,
    tech_for_med_vision_061: null,
    art_for_med_vision_062: null,
  });

  type Program = {
    faculty: string;
    program_id: number;
    program_name: string;
    total_score: number;
    min_score: number;
    gpax_required: number;
  };

  type ProgramWithPercentage = Program & {
    percentage?: number;
    chanceCategory?: string;
    chanceMessage?: string;
  };

  const [allResults, setAllResults] = useState<Program[]>([]);
  const [filteredResults, setFilteredResults] = useState<
    ProgramWithPercentage[]
  >([]);
  const [loading, setLoading] = useState(false);

  // Function to categorize chance based on percentage
  const categorizeChance = (
    percentage: number
  ): { category: string; message: string } => {
    if (percentage <= 0) {
      return {
        category: "no-chance",
        message:
          "📌 ขณะนี้คะแนนยังไม่ถึงเกณฑ์ที่ใช้พิจารณา แต่ยังมีเวลาในการพัฒนาและเตรียมตัวให้พร้อมมากขึ้นในอนาคต",
      };
    } else if (percentage > 0 && percentage <= 33) {
      return {
        category: "low-chance",
        message:
          "🌱 มีโอกาสสอบติดในระดับเริ่มต้น หากตั้งใจพัฒนาอย่างต่อเนื่อง โอกาสก็จะเพิ่มขึ้นได้แน่นอน",
      };
    } else if (percentage > 33 && percentage <= 66) {
      return {
        category: "medium-chance",
        message:
          "💡 มีโอกาสสอบติดในระดับปานกลาง ควรวางแผนให้รอบด้านและฝึกฝนให้สม่ำเสมอเพื่อเพิ่มความมั่นใจ",
      };
    } else {
      return {
        category: "high-chance",
        message:
          "✨ มีโอกาสสอบติดสูง หากรักษาความสม่ำเสมอและเตรียมตัวอย่างต่อเนื่อง ก็จะเข้าใกล้เป้าหมายมากยิ่งขึ้น",
      };
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setScores({
      ...scores,
      [name]: value === "" ? null : parseFloat(value),
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        "https://gratefully-neat-mastiff.ngrok-free.app/programs",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(scores),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setAllResults(data);

      // Filter results based on selected program name
      if (selectedProgram) {
        const filtered = data.filter(
          (program: Program) =>
            program.program_name === selectedProgram.program_name
        );

        // Calculate percentage for each filtered program and categorize chance
        const filteredWithPercentage = filtered.map((program: Program) => {
          const percentage =
            selectedProgram.max_score !== selectedProgram.min_score
              ? ((program.total_score - selectedProgram.min_score) /
                  (selectedProgram.max_score - selectedProgram.min_score)) *
                100
              : 0;

          const percentageValue = parseFloat(percentage.toFixed(2));
          const { category, message } = categorizeChance(percentageValue);

          console.log(
            `Program: ${program.program_name}, Faculty: ${program.faculty}`
          );
          console.log(
            `Total Score: ${program.total_score}, Min Score: ${selectedProgram.min_score}, Max Score: ${selectedProgram.max_score}`
          );
          console.log(`Percentage: ${percentageValue}%, Chance: ${message}`);

          return {
            ...program,
            percentage: percentageValue,
            chanceCategory: category,
            chanceMessage: message,
          };
        });

        setFilteredResults(filteredWithPercentage);
      } else {
        setFilteredResults(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  interface type_list_Program {
    id: number;
    program_id: number;
    program_name: string;
    faculty_name: string;
    min_score: number;
    max_score: number;
  }

  const [var_list_programs, setPrograms] = useState<type_list_Program[]>([]);
  const [selectedProgram, setSelectedProgram] =
    useState<type_list_Program | null>(null);

  useEffect(() => {
    fetch("https://gratefully-neat-mastiff.ngrok-free.app/list_programs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(var_list_programs),
    })
      .then(async (res) => {
        const contentType = res.headers.get("content-type");
        if (!res.ok || !contentType?.includes("application/json")) {
          throw new Error("Response is not valid JSON");
        }
        return res.json();
      })
      .then((data) => {
        setPrograms(data);
        setSelectedProgram(data[0]);
      })
      .catch((err) => {
        console.error("Error fetching data:", err.message);
      });
  }, []);

  // Filter results when selected program changes - using program_name for comparison
  useEffect(() => {
    if (selectedProgram && allResults.length > 0) {
      const filtered = allResults.filter(
        (program: Program) =>
          program.program_name === selectedProgram.program_name
      );

      // Calculate percentage for each filtered program and categorize chance
      const filteredWithPercentage = filtered.map((program: Program) => {
        const percentage =
          selectedProgram.max_score !== selectedProgram.min_score
            ? ((program.total_score - selectedProgram.min_score) /
                (selectedProgram.max_score - selectedProgram.min_score)) *
              100
            : 0;

        const percentageValue = parseFloat(percentage.toFixed(2));
        const { category, message } = categorizeChance(percentageValue);

        console.log(
          `Program: ${program.program_name}, Faculty: ${program.faculty}`
        );
        console.log(
          `Total Score: ${program.total_score}, Min Score: ${selectedProgram.min_score}, Max Score: ${selectedProgram.max_score}`
        );
        console.log(`Percentage: ${percentageValue}%, Chance: ${message}`);

        return {
          ...program,
          percentage: percentageValue,
          chanceCategory: category,
          chanceMessage: message,
        };
      });

      setFilteredResults(filteredWithPercentage);
    }
  }, [selectedProgram, allResults]);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(event.target.value);
    const program = var_list_programs.find((p) => p.program_id === selectedId);
    setSelectedProgram(program || null);
  };

  // Function to get background color based on chance category
  const getChanceBgColor = (category: string | undefined): string => {
    switch (category) {
      case "no-chance":
        return "bg-red-100";
      case "low-chance":
        return "bg-amber-50";
      case "medium-chance":
        return "bg-sky-100";
      case "high-chance":
        return "bg-green-100";
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col justify-center items-center p-2 m-4">
        <h1 className="font-bold text-2xl underline">โปรแกรมประเมินความเป็นไปได้ในการเข้าศึกษาตามหลักสูตร</h1>
      <form onSubmit={handleSubmit} className="my-8 w-1/2">
        <h1 className="text-xl font-bold mb-4">เลือกหลักสูตร</h1>
        {/* Dropdown เลือกโปรแกรม */}
        <select
          id="program-select"
          className="select border p-2 rounded"
          onChange={handleSelectChange}
          value={selectedProgram?.program_id || ""}
        >
          {var_list_programs.map((list_name_program) => (
            <option
              key={list_name_program.id}
              value={list_name_program.program_id}
            >
              {list_name_program.faculty_name} -{" "}
              {list_name_program.program_name}
            </option>
          ))}
        </select>

        {/* แสดงข้อมูลของโปรแกรมที่เลือก
      {selectedProgram && (
        <div className="mt-4 border p-4 rounded shadow">
          <p>
            <strong>Program ID:</strong> {selectedProgram.program_id}
          </p>
          <p>
            <strong>Program Name:</strong> {selectedProgram.program_name}
          </p>
          <p>
            <strong>Faculty Name:</strong> {selectedProgram.faculty_name}
          </p>
          <p>
            <strong>Min Score:</strong> {selectedProgram.min_score}
          </p>
          <p>
            <strong>Max Score:</strong> {selectedProgram.max_score}
          </p>
        </div>
      )}  */}

        <fieldset className="fieldset">
          <legend className="fieldset-legend text-lg">เกรดเฉลี่ย (GPAX)</legend>
          <input
            type="number"
            className="input"
            name="gpax"
            placeholder="Enter your GPAX"
            required
            min={0}
            max={4}
            step={0.01}
            value={scores.gpax || ""}
            onChange={handleInputChange}
          />
        </fieldset>

        {/* Netsat scores */}
        <div className="collapse bg-gray-100 border-base-300 border my-3">
          <input type="checkbox" />
          <div className="collapse-title">คะแนน NetSat (NetSat Scores)</div>
          <div className="collapse-content bg-gray-50">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Thai 101</legend>
              <input
                type="number"
                className="input"
                name="thai_101"
                placeholder="Enter your score"
                min={0}
                max={100}
                value={scores.thai_101 || ""}
                onChange={handleInputChange}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">English 102</legend>
              <input
                type="number"
                className="input"
                name="eng_102"
                placeholder="Enter your score"
                min={0}
                max={100}
                value={scores.eng_102 || ""}
                onChange={handleInputChange}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Math 103</legend>
              <input
                type="number"
                className="input"
                name="math_103"
                placeholder="Enter your score"
                min={0}
                max={100}
                value={scores.math_103 || ""}
                onChange={handleInputChange}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">
                Science and Technology 201
              </legend>
              <input
                type="number"
                className="input"
                name="sci_201"
                placeholder="Enter your score"
                min={0}
                max={100}
                value={scores.sci_201 || ""}
                onChange={handleInputChange}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Chemistry 202</legend>
              <input
                type="number"
                className="input"
                name="chem_202"
                placeholder="Enter your score"
                min={0}
                max={100}
                value={scores.chem_202 || ""}
                onChange={handleInputChange}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Biology 203</legend>
              <input
                type="number"
                className="input"
                name="bio_203"
                placeholder="Enter your score"
                min={0}
                max={100}
                value={scores.bio_203 || ""}
                onChange={handleInputChange}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Physics 204</legend>
              <input
                type="number"
                className="input"
                name="phy_204"
                placeholder="Enter your score"
                min={0}
                max={100}
                value={scores.phy_204 || ""}
                onChange={handleInputChange}
              />
            </fieldset>
          </div>
        </div>

        {/* Competency Scores */}
        <div className="collapse bg-gray-100 border-base-300 border my-3">
          <input type="checkbox" />
          <div className="collapse-title">คะแนนสมรรถนะ (Competency Scores)</div>
          <div className="collapse-content bg-gray-50">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">French 011</legend>
              <input
                type="number"
                className="input"
                name="fr_011"
                placeholder="Enter your score"
                min={0}
                max={100}
                value={scores.fr_011 || ""}
                onChange={handleInputChange}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">German 012</legend>
              <input
                type="number"
                className="input"
                name="de_012"
                placeholder="Enter your score"
                min={0}
                max={100}
                value={scores.de_012 || ""}
                onChange={handleInputChange}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Chinese 013</legend>
              <input
                type="number"
                className="input"
                name="zh_013"
                placeholder="Enter your score"
                min={0}
                max={100}
                value={scores.zh_013 || ""}
                onChange={handleInputChange}
              />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Japanese 014</legend>
              <input
                type="number"
                className="input"
                name="ja_014"
                placeholder="Enter your score"
                min={0}
                max={100}
                value={scores.ja_014 || ""}
                onChange={handleInputChange}
              />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Korean 015</legend>
              <input
                type="number"
                className="input"
                name="ko_015"
                placeholder="Enter your score"
                min={0}
                max={100}
                value={scores.ko_015 || ""}
                onChange={handleInputChange}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Spanish 016</legend>
              <input
                type="number"
                className="input"
                name="es_016"
                placeholder="Enter your score"
                max={100}
                value={scores.es_016 || ""}
                onChange={handleInputChange}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Music 021</legend>
              <input
                type="number"
                className="input"
                name="music_021"
                placeholder="Enter your score"
                min={0}
                max={100}
                value={scores.music_021 || ""}
                onChange={handleInputChange}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">
                Experimental Visual Art 024
              </legend>
              <input
                type="number"
                className="input"
                name="exp_visual_art_024"
                placeholder="Enter your score"
                min={0}
                max={100}
                value={scores.exp_visual_art_024 || ""}
                onChange={handleInputChange}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Drawing 023</legend>
              <input
                type="number"
                className="input"
                name="drawing_023"
                placeholder="Enter your score"
                min={0}
                max={100}
                value={scores.drawing_023 || ""}
                onChange={handleInputChange}
              />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">
                Communication Drawing 025
              </legend>
              <input
                type="number"
                className="input"
                name="commu_drawing_025"
                placeholder="Enter your score"
                min={0}
                max={100}
                value={scores.commu_drawing_025 || ""}
                onChange={handleInputChange}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">
                Communication Design 026
              </legend>
              <input
                type="number"
                className="input"
                name="commu_design_026"
                placeholder="Enter your score"
                max={100}
                value={scores.commu_design_026 || ""}
                onChange={handleInputChange}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Architecture 041</legend>
              <input
                type="number"
                className="input"
                name="ar_041"
                placeholder="Enter your score"
                min={0}
                max={100}
                value={scores.ar_041 || ""}
                onChange={handleInputChange}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Design 042</legend>
              <input
                type="number"
                className="input"
                name="design_042"
                placeholder="Enter your score"
                min={0}
                max={100}
                value={scores.design_042 || ""}
                onChange={handleInputChange}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Art 051</legend>
              <input
                type="number"
                className="input"
                name="art_051"
                placeholder="Enter your score"
                min={0}
                max={100}
                value={scores.art_051 || ""}
                onChange={handleInputChange}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Physical 052</legend>
              <input
                type="number"
                className="input"
                name="physical_052"
                placeholder="Enter your score"
                min={0}
                max={100}
                value={scores.physical_052 || ""}
                onChange={handleInputChange}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">
                Technology for Medical Vision 061
              </legend>
              <input
                type="number"
                className="input"
                name="tech_for_med_vision_061"
                placeholder="Enter your score"
                min={0}
                max={100}
                value={scores.tech_for_med_vision_061 || ""}
                onChange={handleInputChange}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">
                Art for Medical Vision 062
              </legend>
              <input
                type="number"
                className="input"
                name="art_for_med_vision_062"
                placeholder="Enter your score"
                min={0}
                max={100}
                value={scores.art_for_med_vision_062 || ""}
                onChange={handleInputChange}
              />
            </fieldset>
          </div>
        </div>

        {/* TGAT TPAT Scores */}
        <div className="collapse bg-gray-100 border-base-300 border my-3">
          <input type="checkbox" />
          <div className="collapse-title">
            คะแนน TGAT TPAT (TGAT TPAT Scores)
          </div>
          <div className="collapse-content bg-gray-50">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">TGAT 90</legend>
              <input
                type="number"
                className="input"
                name="tgat_90"
                placeholder="Enter your score"
                min={0}
                max={100}
                value={scores.tgat_90 || ""}
                onChange={handleInputChange}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">TGAT1 91</legend>
              <input
                type="number"
                className="input"
                name="tgat_91"
                placeholder="Enter your score"
                max={100}
                value={scores.tgat_91 || ""}
                onChange={handleInputChange}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">TGAT2 92</legend>
              <input
                type="number"
                className="input"
                name="tgat_92"
                placeholder="Enter your score"
                min={0}
                max={100}
                value={scores.tgat_92 || ""}
                onChange={handleInputChange}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">TGAT3 93</legend>
              <input
                type="number"
                className="input"
                name="tgat_93"
                placeholder="Enter your score"
                min={0}
                max={100}
                value={scores.tgat_93 || ""}
                onChange={handleInputChange}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">TPAT 30</legend>
              <input
                type="number"
                className="input"
                name="tpat_30"
                placeholder="Enter your score"
                min={0}
                max={100}
                value={scores.tpat_30 || ""}
                onChange={handleInputChange}
              />
            </fieldset>
          </div>
        </div>

        {/* button */}
        <div className="flex justify-center items-center scale-125 my-5">
          <button
            type="submit"
            className="btn btn-info text-white"
            disabled={!scores.gpax}
          >
            Get result
          </button>
        </div>
      </form>

      {/* คำอธิบายระดับโอกาส 
        <div className="my-4 flex flex-col gap-2">
          <h3 className="text-lg font-medium">ระดับโอกาสการสอบติด:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="p-2 bg-red-100 rounded">
              <span className="font-bold">0%</span> - ไม่มีโอกาสสอบติด
            </div>
            <div className="p-2 bg-yellow-100 rounded">
              <span className="font-bold">1-33%</span> - มีโอกาสสอบติดแต่ต้องพยายาม
            </div>
            <div className="p-2 bg-blue-100 rounded">
              <span className="font-bold">34-66%</span> - มีโอกาสสอบติดปานกลางแต่อย่าประมาท
            </div>
            <div className="p-2 bg-green-100 rounded">
              <span className="font-bold">67-100%</span> - มีโอกาสสอบติดสูงแต่อย่าประมาท
            </div>
          </div>
        </div> */}

      {/* Result 
        <div className="px-10 my-6 items-center justify-center text-center bg-lime-400">
          {allResults.length > 0 ? (
            <div className="w-full p-2 ml-4 md:px-0 bg-pink-300">
              <div className="flex flex-col mb-4">
                <h2 className="text-xl font-bold mb-2">
                  หลักสูตรที่เลือก: {selectedProgram?.program_name}
                </h2>
                <h3 className="text-lg font-medium mb-4">
                  ผลลัพธ์ที่ชื่อหลักสูตรตรงกัน ({filteredResults.length})
                </h3>
                {filteredResults.length > 0 ? (
                  <div className="overflow-x-auto mb-8">
                    <table className="min-w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border p-1">คณะ</th>
                          <th className="border p-1">รหัสหลักสูตร</th>
                          <th className="border p-1">ชื่อหลักสูตร</th>
                          <th className="border p-1">คะแนนรวม</th>
                          <th className="border p-1">คะแนนขั้นต่ำ</th>
                          <th className="border p-1">GPAX ขั้นต่ำ</th>
                          <th className="border p-1">เปอร์เซ็นต์</th>
                          <th className="border p-1">โอกาสสอบติด</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredResults.map((program, index) => (
                          <tr
                            key={index}
                            className={getChanceBgColor(program.chanceCategory)}
                          >
                            <td className="border p-2">{program.faculty}</td>
                            <td className="border p-2">{program.program_id}</td>
                            <td className="border p-2">{program.program_name}</td>
                            <td className="border p-2">{program.total_score}</td>
                            <td className="border p-2">{program.min_score}</td>
                            <td className="border p-2">{program.gpax_required}</td>
                            <td className="border p-2">
                              {program.percentage !== undefined ? `${program.percentage}%` : 'N/A'}
                            </td>
                            <td className="border p-2 font-medium">
                              {program.chanceMessage || 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>ไม่พบหลักสูตรที่มีชื่อตรงกับ {selectedProgram?.program_name}</p>
                )}
              </div>
            </div>
          ) : loading ? (
            <span className="loading loading-ring loading-xl text-success scale-200"></span>
          ) : (
            <p>ไม่มีผลลัพธ์ตามคะแนนที่ท่านกรอก</p>
          )}
        </div> */}
      {/* result 2 */}
      <div className="px-10 my-6 items-center justify-center text-center drop-shadow-xl rounded-xl">
        {allResults.length > 0 ? (
          <div className="w-full p-2 ml-4 md:px-0">
            <div className="flex flex-col mb-4">
              {filteredResults.length > 0 ? (
                <div className="overflow-x-auto mb-8">
                  {filteredResults.map((program) => (
                    <div
                      key={program.program_id}
                      className={`rounded-xl shadow-md p-6 mb-6 transition-all duration-300 ${getChanceBgColor(
                        program.chanceCategory
                      )}`}
                    >
                      <h3 className="text-center text-xl font-semibold text-gray-800 mb-2">
                        🎓 จากหลักสูตรที่เลือก:
                      </h3>
                      <h4 className="text-center text-lg font-bold text-orange-600 mb-1">
                        {program.faculty} - {program.program_name}
                      </h4>
                      <p className="text-center text-base text-gray-700">
                        {program.chanceMessage || "N/A"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>
                  ไม่พบหลักสูตรที่มีชื่อตรงกับ {selectedProgram?.program_name}
                </p>
              )}
            </div>
          </div>
        ) : loading ? (
          <span className="loading loading-ring loading-xl text-success scale-200"></span>
        ) : (
          <p>ไม่มีผลลัพธ์ตามคะแนนที่ท่านกรอก</p>
        )}
      </div>
    </div>
  );
}
