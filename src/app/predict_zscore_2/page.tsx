"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
//import Modal1 from "../components/modal1";

export default function PredictZScore2() {
  // baseURL สำหรับเรียก API โดยดึงมาจากไฟล์ .env
  const baseURL = process.env.NEXT_PUBLIC_API_URL;

  // เก็บค่าคะแนนจากแบบฟอร์มใน state โดยตั้งค่าเริ่มต้นเป็น null
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
  // ประเภทข้อมูลของจาก api list_programs
  type Program = {
    faculty: string;
    program_id: number;
    program_name: string;
    total_score: number;
    min_score: number;
    gpax_required: number;
  };

  // เพิ่มข้อมูลเกี่ยวกับโอกาสสอบติดเข้าไปใน Program
  type ProgramWithZscore = Program & {
    z_score?: number; // คิดเป็นเปอร์เซ็นต์ของคะแนนเทียบกับ min-max
    chanceCategory?: string; // หมวดหมู่โอกาสสอบติด
    chanceMessage?: string; // ข้อความให้กำลังใจ
  };

  // State สำหรับเก็บผลลัพธ์ทั้งหมดและผลที่กรองแล้ว
  const [allResults, setAllResults] = useState<Program[]>([]);
  const [filteredResults, setFilteredResults] = useState<ProgramWithZscore[]>(
    []
  );
  const [loading, setLoading] = useState(false); // ใช้สำหรับแสดง loading ระหว่างรอผล

  // ฟังก์ชันจัดหมวดหมู่คำพูดโอกาสสอบติดตามช่วงz-score
  const categorizeChance = (
    z_score: number
  ): { category: string; message: string } => {
    if (z_score <= -1) {
      return {
        category: "no-chance",
        message:
          "📌 ขณะนี้คะแนนยังไม่ถึงเกณฑ์ที่ใช้พิจารณา 📌\nแต่ยังมีเวลาในการพัฒนาและเตรียมตัวให้พร้อมมากขึ้นในอนาคต",
      };
    } else if (z_score < 0) {
      return {
        category: "low-chance",
        message:
          "🌱 มีโอกาสสอบติดในระดับเริ่มต้น 🌱\nหากตั้งใจพัฒนาอย่างต่อเนื่อง โอกาสก็จะเพิ่มขึ้นได้แน่นอน",
      };
    } else if (z_score < 1) {
      return {
        category: "medium-chance",
        message:
          "💡 มีโอกาสสอบติดในระดับปานกลาง 💡\nควรวางแผนให้รอบด้านและฝึกฝนให้สม่ำเสมอเพื่อเพิ่มความมั่นใจ",
      };
    } else {
      return {
        category: "high-chance",
        message:
          "✨ มีโอกาสสอบติดสูง ✨\nหากรักษาความสม่ำเสมอและเตรียมตัวอย่างต่อเนื่อง ก็จะเข้าใกล้เป้าหมายมากยิ่งขึ้น",
      };
    }
  };

  // เมื่อผู้ใช้กรอกข้อมูลคะแนนแต่ละช่อง จะเรียกฟังก์ชันนี้
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let parsedValue = value === "" ? null : parseFloat(value);

    if (parsedValue !== null) {
      // ถ้าเป็น gpax ให้ไม่เกิน 4
      if (name === "gpax") {
        parsedValue = Math.min(parsedValue, 4);
      } else {
        // ฟิลด์อื่น ๆ ให้ไม่เกิน 100
        parsedValue = Math.min(parsedValue, 100);
      }
    }

    setScores({
      ...scores,
      [name]: parsedValue,
    });
  };

  // เมื่อผู้ใช้กดปุ่ม submit เพื่อส่งคะแนนไปยัง backend
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log("Handle submit pass");
    e.preventDefault();
    setLoading(true); // เริ่มโหลด

    try {
      const response = await fetch(`${baseURL}/programs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scores), // ส่งคะแนนทั้งหมดไปยัง backend
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setAllResults(data); // เก็บข้อมูลโปรแกรมทั้งหมดที่ได้จาก backend

      console.log("Respone pass");
      // กรองเฉพาะโปรแกรมที่ตรงกับโปรแกรมที่ผู้ใช้เลือก
      if (selectedProgram) {
        /*const filtered = data.filter(
          (program: Program) => {
        const isMatch = program.program_name.trim().toLowerCase() === selectedProgram.program_name.trim().toLowerCase();
        console.log(`Matching Program: ${program.program_name} === ${selectedProgram.program_name}: ${isMatch}`);
        return isMatch;
          },
          console.log("Filtered pass")
        );*/
        const filtered = data.filter(
          (program: Program) =>
            program.program_name.trim().toLowerCase() ===
            selectedProgram.program_name.trim().toLowerCase()
        );

        // คำนวณเปอร์เซ็นต์และจัดกลุ่มโอกาสสอบติด
        const filteredWithZscore = filtered.map((program: Program) => {
          const z_score =
            selectedProgram.sd_avg !== 0
              ? (program.total_score - selectedProgram.mean_avg) /
                selectedProgram.sd_avg
              : 0;

          const z_scoreValue = parseFloat(z_score.toFixed(2));
          const { category, message } = categorizeChance(z_scoreValue);

          console.log("Handle submit");
          console.log(
            `Program: ${program.program_name}, Faculty: ${program.faculty}, Total Score: ${program.total_score}, Mean avg: ${selectedProgram.mean_avg}, SD avg: ${selectedProgram.sd_avg}, z_score: ${z_scoreValue}, Chance: ${message}`
          );

          return {
            ...program,
            z_score: z_scoreValue,
            chanceCategory: category,
            chanceMessage: message,
          };
        });

        setFilteredResults(filteredWithZscore);
      } else {
        setFilteredResults(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false); // จบการโหลด
    }
  };

  // ประเภทข้อมูลของ list โปรแกรมที่แสดงใน <select>
  interface type_list_Program {
    id: number;
    faculty: string;
    program_id: number;
    program_name: string;
    program_name_trimmed: string;
    subject_codes: string[];
    subject_names: string[];
    mean_avg: number;
    sd_avg: number;
    total_subjects: number;
    has_zscore_data: boolean;
    matched_with: string;
    max_weight_subjects?: string[];
  }

  // เก็บรายการโปรแกรมทั้งหมดและโปรแกรมที่เลือก
  const [var_list_programs, setPrograms] = useState<type_list_Program[]>([]);
  const [selectedProgram, setSelectedProgram] =
    useState<type_list_Program | null>(null);

  // ดึงข้อมูล list_programs จาก API มาแสดงใน dropdown
  useEffect(() => {
    fetch(`${baseURL}/programs_list`, {
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
        setSelectedProgram(data[0]); // ตั้งค่า default โปรแกรมแรก
      })
      .catch((err) => {
        console.error("Error fetching data:", err.message);
      });
  }, []);

  // คำนวณโอกาสสอบติดใหม่เมื่อเปลี่ยนโปรแกรมที่เลือก
  useEffect(() => {
    if (selectedProgram && allResults.length > 0) {
      const filtered = allResults.filter(
        (program: Program) =>
          program.program_name.trim().toLowerCase() ===
          selectedProgram.program_name.trim().toLowerCase()
      );

      // Calculate percentage for each filtered program and categorize chance
      const filteredWithZscore = filtered.map((program: Program) => {
        const z_score =
          selectedProgram.sd_avg !== 0
            ? (program.total_score - selectedProgram.mean_avg) /
              selectedProgram.sd_avg
            : 0;

        const z_scoreValue = parseFloat(z_score.toFixed(2));
        const { category, message } = categorizeChance(z_scoreValue);

        console.log("Update data");
        console.log(
          `Program: ${program.program_name}, Faculty: ${program.faculty}, Total Score: ${program.total_score}, Mean avg: ${selectedProgram.mean_avg}, SD avg: ${selectedProgram.sd_avg}, z_score: ${z_scoreValue}, Chance: ${message}`
        );

        return {
          ...program,
          z_score: z_scoreValue,
          chanceCategory: category,
          chanceMessage: message,
        };
      });

      setFilteredResults(filteredWithZscore);
    }
  }, [selectedProgram, allResults]);

  // เมื่อผู้ใช้เลือกโปรแกรมใน <select>
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(event.target.value);
    const program = var_list_programs.find((p) => p.program_id === selectedId);
    setSelectedProgram(program || null);
  };

  // เปลี่ยนสีพื้นหลังตามระดับโอกาสสอบติด
  const getChanceBgColor = (category: string | undefined): string => {
    switch (category) {
      case "no-chance":
        return "bg-red-50 border border-red-200";
      case "low-chance":
        return "bg-amber-50 border border-amber-200";
      case "medium-chance":
        return "bg-sky-50 border border-sky-200";
      case "high-chance":
        return "bg-green-50 border border-green-200";
      default:
        return "";
    }
  };

  return (
    <section className="bg-gradient-to-l from-slate-100 to-gray-100 min-h-screen">
      <div className="drawer">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />
        {/* Page content here */}
        <div className="drawer-content">
          {/* logo */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-full max-w-sm px-4 sm:max-w-md md:max-w-lg">
              <Image
                className="mt-10 max-w-full h-auto"
                src="/kku netsat insight.png"
                alt="webicon"
                width={1287}
                height={432}
              />
            </div>
            <div>
              <label
                htmlFor="my-drawer"
                className="btn btn-md btn-warning drawer-button m-5 hover:scale-105 transition-transform duration-300"
                title="How to use & related websites"
              >
                📖 วิธีการใช้งาน & เว็บไซต์ที่เกี่ยวข้อง
              </label>
            </div>
          </div>

          {/* select program */}
          <div className="flex flex-col items-center justify-center m-2">
            <div className="bg-base-200 card m-3 shadow-md md:w-2xl sm:w-full">
              <div className="card-body">
                <p className="card-title">🎓 เลือกหลักสูตรที่สนใจ</p>
                <select
                  id="program-select"
                  className="select"
                  onChange={handleSelectChange}
                  value={selectedProgram?.program_id || ""}
                >
                  {Object.entries(
                    //.reduce() เพื่อสร้างอ็อบเจกต์ใหม่ที่จัดกลุ่มข้อมูลตาม faculty_name groups คืออ็อบเจกต์ผลลัพธ์ที่เรากำลังสร้าง
                    var_list_programs.reduce((groups, program) => {
                      if (!groups[program.faculty]) {
                        groups[program.faculty] = [];
                      }
                      groups[program.faculty].push(program);
                      return groups;

                      //Record<string, typeof var_list_programs> คือ type บอกว่า key เป็น string และ value เป็น array ของ program object
                    }, {} as Record<string, typeof var_list_programs>)
                  ).map(([faculty, programs]) => (
                    <optgroup key={faculty} label={faculty}>
                      {programs.map((program) => (
                        <option key={program.id} value={program.program_id}>
                          {program.program_name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>

                {/* แสดงข้อมูลของโปรแกรมที่เลือก*/}
                {selectedProgram && (
                  <div className="collapse collapse-arrow bg-base-200 border border-base-300">
                    <input type="checkbox" name="my-accordion-2" />
                    <div className="collapse-title font-semibold">
                      รายวิชาที่ต้องประเมิน (Required subjects)
                    </div>
                    <div className="collapse-content text-sm">
                      <div className="grid grid-cols-3 grid-rows-2 gap-2">
                        {selectedProgram.subject_names.map(
                          (subjectName, index) => (
                            <div
                              key={index}
                              className="text-amber-800 p-5 rounded-lg bg-amber-50 border border-amber-200 hover:scale-105 transition-transform duration-300"
                            >
                              {selectedProgram.subject_codes[index]}:
                              {subjectName}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* field input score */}
          <div className="flex flex-col items-center justify-center m-2">
            <div className="bg-base-200 card m-3 shadow-md md:w-2xl sm:w-full">
              <div className="card-body swap-on">
                {/* GPAX */}
                <fieldset className="fieldset">
                  <legend className="fieldset-legend text-lg">
                    📖 เกรดเฉลี่ย (GPAX)
                  </legend>
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

                <div className="divider"></div>

                <p className="font-bold text-xl">✏️ กรอกคะแนน</p>
                {/* Netsat score */}
                <div className="collapse collapse-arrow bg-base-100 border border-base-300 shadow-md">
                  <input type="checkbox" name="my-accordion-2" />
                  <div className="collapse-title">
                    คะแนน NetSat (NetSat Scores)
                  </div>
                  <div className="collapse-content bg-gray-50">
                    <div className="grid grid-cols-2 grid-rows-1 gap-2">
                      <div>
                        <fieldset className="fieldset">
                          <legend className="fieldset-legend text-xs">
                            101 ความฉลาดรู้ทั่วไป ทางด้านภาษาไทย
                          </legend>
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
                      </div>
                      <div>
                        <fieldset className="fieldset">
                          <legend className="fieldset-legend text-xs">
                            102 ความฉลาดรู้ทั่วไป ทางด้านภาษาอังกฤษ
                          </legend>
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
                      </div>
                    </div>

                    <div className="grid grid-cols-2 grid-rows-1 gap-2">
                      <div>
                        <fieldset className="fieldset">
                          <legend className="fieldset-legend text-xs">
                            103 ความฉลาดรู้ทั่วไป ทางด้านคณิตศาสตร์
                          </legend>
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
                      </div>
                      <div>
                        <fieldset className="fieldset">
                          <legend className="fieldset-legend text-xs">
                            201 ความฉลาดรู้เฉพาะด้าน ด้านวิทยาศาสตร์และเทคโนโลยี
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
                      </div>
                    </div>

                    <div className="grid grid-cols-2 grid-rows-1 gap-2">
                      <div>
                        <fieldset className="fieldset">
                          <legend className="fieldset-legend text-xs">
                            202 ความฉลาดรู้เฉพาะด้าน ด้านเคมี
                          </legend>
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
                      </div>
                      <div>
                        <fieldset className="fieldset">
                          <legend className="fieldset-legend text-xs">
                            203 ความฉลาดรู้เฉพาะด้าน ด้านชีววิทยา
                          </legend>
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
                      </div>
                    </div>

                    <div className="grid grid-cols-2 grid-rows-1 gap-2">
                      <div>
                        <fieldset className="fieldset">
                          <legend className="fieldset-legend text-xs">
                            204 ความฉลาดรู้เฉพาะด้าน ด้านฟิสิกส์
                          </legend>
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
                  </div>
                </div>

                {/* TGAT & TPAT score */}
                <div className="collapse collapse-arrow bg-base-100 border border-base-300 shadow-md">
                  <input type="checkbox" name="my-accordion-2" />
                  <div className="collapse-title">
                    คะแนน TGAT TPAT (TGAT TPAT Scores)
                  </div>
                  <div className="collapse-content bg-gray-50">
                    <div className="grid grid-cols-2 grid-rows-1 gap-2">
                      <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                          TGAT 90 ความถนัดทั่วไป
                        </legend>
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
                        <legend className="fieldset-legend">
                          TGAT1 91 ความฉลาดรู้่ทั่วไป-การสื่อสารภาษาอังกฤษ
                        </legend>
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
                    </div>

                    <div className="grid grid-cols-2 grid-rows-1 gap-2">
                      <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                          TGAT2 92 ความถนัดทั่วไป-การคิดอย่างมีเหตุผล
                        </legend>
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
                        <legend className="fieldset-legend">
                          TGAT3 93 ความถนัดทั่วไป-สมรรถนะการทำงาน
                        </legend>
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
                    </div>

                    <div className="grid grid-cols-2 grid-rows-1 gap-2">
                      <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                          TPAT 30 ความถนัดทางวิทยาศาสตร์ เทคโนโลยี
                          วิศวกรรมศาสตร์
                        </legend>
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
                </div>

                {/* Competency score */}
                <div className="collapse collapse-arrow bg-base-100 border border-base-300 shadow-md">
                  <input type="checkbox" name="my-accordion-2" />
                  <div className="collapse-title">
                    คะแนนสมรรถนะ (Competency Scores)
                  </div>
                  <div className="collapse-content bg-gray-50">
                    <div className="grid grid-cols-2 grid-rows-1 gap-2">
                      <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                          011 สมรรถนะเฉพาะด้านภาษาฝรั่งเศษ
                        </legend>
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
                        <legend className="fieldset-legend">
                          012 สมรรถนะเฉพาะด้านภาษาเยอรมัน
                        </legend>
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
                    </div>
                    <div className="grid grid-cols-2 grid-rows-1 gap-2">
                      <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                          013 สมรรถนะเฉพาะด้านภาษาจีน
                        </legend>
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
                        <legend className="fieldset-legend">
                          014 สมรรถนะเฉพาะด้านภาษาญี่ปุ่น
                        </legend>
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
                    </div>
                    <div className="grid grid-cols-2 grid-rows-1 gap-2">
                      <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                          015 สมรรถนะเฉพาะด้านภาษาเกาหลี
                        </legend>
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
                        <legend className="fieldset-legend">
                          016 สมรรถนะเฉพาะด้านภาษาสเปน
                        </legend>
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
                    </div>
                    <div className="grid grid-cols-2 grid-rows-1 gap-2">
                      <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                          021 สมรรถนะด้านดนตรี
                        </legend>
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
                          024 สมรรถนะด้านการทดลองทางทัศนศิลป์
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
                    </div>
                    <div className="grid grid-cols-2 grid-rows-1 gap-2">
                      <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                          023 สมรรถนะด้านการวาดเส้น
                        </legend>
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
                          025 สมรรถนะด้านวาดเส้นเพื่อการสื่อสาร
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
                    </div>
                    <div className="grid grid-cols-2 grid-rows-1 gap-2">
                      <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                          026 สมรรถนะด้านการออกแบบเพื่อการสื่อสาร
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
                        <legend className="fieldset-legend">
                          041 สมรรถนะเฉพาะด้านสถาปัตยกรรมศาสตร์
                        </legend>
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
                    </div>
                    <div className="grid grid-cols-2 grid-rows-1 gap-2">
                      <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                          042 สมรรถนะเฉพาะด้านการออกแบบ
                        </legend>
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
                        <legend className="fieldset-legend">
                          051 ความถนัดทางศิลป์
                        </legend>
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
                    </div>
                    <div className="grid grid-cols-2 grid-rows-1 gap-2">
                      <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                          052 สมรรถนะทางกาย
                        </legend>
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
                          061 สมรรถนะด้านเทคโนโลยีสำหรับเวชนิทัศน์
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
                    </div>
                    <div className="grid grid-cols-2 grid-rows-1 gap-2">
                      <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                          062 สมรรถนะด้านศิลป์สำหรับเวชนิทัศน์
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
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="flex items-center justify-center"
                >
                  <button
                    className="text-white btn btn-success w-1/2 m-5 p-6 hover:scale-105 transition-transform duration-300"
                    type="submit"
                  >
                    📝 ประเมินผลลัพธ์ (Get Result)
                  </button>
                </form>

                {/* Result display */}
                {loading ? (
                  <div className="flex justify-center items-center">
                    <span className="loading loading-ring loading-xl text-success"></span>
                  </div>
                ) : (
                  filteredResults.map((result, index) => (
                    <div
                      key={index}
                      className={`card ${getChanceBgColor(
                        result.chanceCategory
                      )} shadow-xl m-5`}
                    >
                      <div className="card-body">
                        {/* For TSX uncomment the commented types below */}
                        {/*<div
                          className="radial-progress bg-neutral text-neutral-content border-neutral border-4"
                          style={
                            {
                              "--value": result.total_score.toFixed(2),
                            } as React.CSSProperties
                          }
                          role="progressbar"
                        >
                          {result.total_score.toFixed(2)}
                        </div>*/}
                        <div className="whitespace-pre-line text-center">
                          {result.chanceMessage}
                        </div>
                        <div className="divider"></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="font-semibold">คณะ:</p>
                            <p>{result.faculty}</p>
                          </div>
                          <div>
                            <p className="font-semibold">หลักสูตร:</p>
                            <p>{result.program_name}</p>
                          </div>
                        </div>
                        <div className="divider"></div>
                        <div>
                          <p className="font-semibold">
                            ลองเพิ่มคะแนนวิชาเหล่านี้ดูดีไหม?:
                          </p>
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            {selectedProgram?.max_weight_subjects?.map(
                              (subjectName: string, index: number) => (
                                <div
                                  key={index}
                                  className="text-slate-800 p-5 rounded-lg bg-slate-50 border border-slate-200 hover:scale-105 transition-transform duration-300"
                                >
                                  {selectedProgram?.subject_codes?.[index]}:
                                  {subjectName}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>

        <div className="drawer-side">
          <label
            htmlFor="my-drawer"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <div className="menu bg-base-200 text-base-content min-h-full w-80 p-0">
            {/* Netsat web link */}
            <div>
              <div className="relative w-full bg-[url('/netsat.png')] bg-cover bg-center">
                {/* Overlay เบลอ */}
                <div className="absolute inset-0 bg-orange-950/50 backdrop-blur-sm z-10"></div>

                {/* Content วางไว้เหนือ blur layer */}
                <div className="relative z-20 p-6 text-white">
                  <p className="mt-5 font-bold text-lg">NETSAT website</p>
                  <p>
                    เว็บไซต์ NETSAT
                    เพื่อเข้าสู่ระบบสมัครสอบและรายละเอียดเพิ่มเติม
                  </p>
                  <a
                    href="https://netsat.kku.ac.th/home/"
                    className="inline-flex items-center px-4 py-2 bg-white/20 rounded-lg transition duration-300 hover:bg-white/30 hover:scale-105 mt-3"
                  >
                    เยี่ยมชมเว็บไซต์ →
                  </a>
                </div>
              </div>
            </div>

            {/* Admission web link */}
            <div>
              <div className="relative w-full bg-[url('/admission.png')] bg-cover bg-center">
                {/* Overlay เบลอ */}
                <div className="absolute inset-0 bg-yellow-950/50 backdrop-blur-sm z-10"></div>

                {/* Content วางไว้เหนือ blur layer */}
                <div className="relative z-20 p-6 text-white">
                  <p className="mt-5 font-bold text-lg"> ADMISSION website</p>
                  <p>
                    เว็บไซต์ Admission
                    เพื่ออ่านรายละเอียดการรับสมัครและรายละเอียดเพิ่มเติม
                  </p>
                  <a
                    href="https://admissions.kku.ac.th/"
                    className="inline-flex items-center px-4 py-2 bg-white/20 rounded-lg transition duration-300 hover:bg-white/30 hover:scale-105 mt-3"
                  >
                    เยี่ยมชมเว็บไซต์ →
                  </a>
                </div>
              </div>
            </div>

            {/* วิธีการใช้งาน */}
            <div>
              <div className="p-8 bg-slate-50">
                <h3 className="text-xl font-bold text-slate-800 mb-6">
                  📚 วิธีการใช้งาน
                </h3>
                <div className="space-y-4">
                  {[
                    "เลือกหลักสูตรที่ต้องการประเมิน",
                    "กรอกคะแนน GPAX และคะแนน NetSat, สมรรถนะ, TGAT TPAT",
                    'กดปุ่ม "แสดงผลลัพธ์" เพื่อดูผลลัพธ์',
                    "ผลลัพธ์จะแสดงความเป็นไปได้ในการเข้าศึกษาในหลักสูตรที่เลือก",
                  ].map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <p className="text-slate-600">{step}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-amber-800 text-sm">
                    <span className="font-medium">⚠️ หมายเหตุ:</span>{" "}
                    โปรดตรวจสอบคะแนนให้ครบถ้วนตามที่หลักสูตรแต่ละสาขาวิชากำหนด
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
