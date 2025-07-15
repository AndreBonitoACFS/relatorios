import { useState } from "react";
import * as XLSX from "xlsx";
import Dashboard from "./components/Dashboard";

function App() {
  const [data, setData] = useState<any>({ Judicial: [], Administrativo: [] });
  const [selectedTab, setSelectedTab] = useState<"Judicial" | "Administrativo">("Judicial");
  const [fileName, setFileName] = useState<string>("");

  const handleFileUpload = (file: File) => {
    setFileName(file.name.replace(".xlsx", ""));

    const reader = new FileReader();
    reader.onload = (e) => {
      const ab = e.target?.result;
      const workbook = XLSX.read(ab, { type: "binary" });
      const newData: any = {};

      ["Judicial", "Administrativo"].forEach((sheet) => {
        const ws = workbook.Sheets[sheet];
        newData[sheet] = XLSX.utils.sheet_to_json(ws, { defval: "" });
      });

      setData(newData);
    };
    reader.readAsBinaryString(file);
  };

  const selectedData = data[selectedTab] || [];

  return (
    <div className="flex flex-row min-h-screen w-screen bg-gray-100">
      {/* Sidebar fixa */}
      <div className="w-[300px] bg-white p-6 flex flex-col items-center gap-6">
        <img
          src="/src/assets/logo.png"
          alt="Logo da empresa"
          style={{ height: "160px", width: "auto" }}
          className="mx-auto"
        />

        <input
          type="file"
          accept=".xlsx"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
          className="w-full text-sm"
        />

        <div className="flex flex-col gap-2 w-full">
          <button
            className={`px-4 py-2 rounded ${selectedTab === "Judicial" ? "bg-blue-600 text-white" : "bg-white border"
              }`}
            onClick={() => setSelectedTab("Judicial")}
          >
            Judicial
          </button>
          <button
            className={`px-4 py-2 rounded ${selectedTab === "Administrativo" ? "bg-blue-600 text-white" : "bg-white border"
              }`}
            onClick={() => setSelectedTab("Administrativo")}
          >
            Administrativo
          </button>
        </div>
      </div>

      {/* Conteúdo fixo ao lado */}
      <div className="flex-1 p-8 overflow-x-auto min-w-[9000px]">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">{fileName}</h1>

        {selectedData.length > 0 && (
          <Dashboard
            data={data[selectedTab]}
            tabName={selectedTab}
            fileName={fileName}
          />
        )}
      </div>
    </div>
  );
}

export default App;
