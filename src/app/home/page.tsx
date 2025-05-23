"use client";

import { useState } from "react";

export default function Home() {
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
    tgat1_91: null,
    tgat2_92: null,
    tgat3_93: null,
    tpat3_30: null,

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
  const [results, setResults] = useState<Program[]>([]);

  const [loading, setLoading] = useState(false);

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
      const response = await fetch("https://gratefully-neat-mastiff.ngrok-free.app/programs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scores),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
    console.log("Scores submitted:", scores);
    console.log("Results received:", results);

  };

  return (
    <div className="flex flex-col justify-center items-center p-2 m-4">
      <h1 className="text-2xl font-bold mb-4">โปรแกรมคำนวณคะแนนเข้าศึกษา</h1>
      <form onSubmit={handleSubmit} className="my-8 w-1/2">
        <fieldset className="fieldset py-4">
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
                name="tgat1_91"
                placeholder="Enter your score"
                max={100}
                value={scores.tgat1_91 || ""}
                onChange={handleInputChange}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">TGAT2 92</legend>
              <input
                type="number"
                className="input"
                name="tgat2_92"
                placeholder="Enter your score"
                min={0}
                max={100}
                value={scores.tgat2_92 || ""}
                onChange={handleInputChange}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">TGAT3 93</legend>
              <input
                type="number"
                className="input"
                name="tgat3_93"
                placeholder="Enter your score"
                min={0}
                max={100}
                value={scores.tgat3_93 || ""}
                onChange={handleInputChange}
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">TPAT 30</legend>
              <input
                type="number"
                className="input"
                name="tpat3_30"
                placeholder="Enter your score"
                min={0}
                max={100}
                value={scores.tpat3_30 || ""}
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

      {/* Result */}
      <div className="px-10">
        {results.length > 0 ? (
          <div className="w-full px-2 ml-4 md:px-0">
            <h2 className="text-xl font-bold mb-4">
              หลักสูตรที่ผ่านเกณฑ์ ({results.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-1">คณะ</th>
                    <th className="border p-1">รหัสหลักสูตร</th>
                    <th className="border p-1">ชื่อหลักสูตร</th>
                    <th className="border p-1">คะแนนรวม</th>
                    <th className="border p-1">คะแนนขั้นต่ำ</th>
                    <th className="border p-1">GPAX ขั้นต่ำ</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((program, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-gray-50" : ""}
                    >
                      <td className="border p-2">{program.faculty}</td>
                      <td className="border p-2">{program.program_id}</td>
                      <td className="border p-2">{program.program_name}</td>
                      <td className="border p-2">{program.total_score}</td>
                      <td className="border p-2">{program.min_score}</td>
                      <td className="border p-2">{program.gpax_required}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
