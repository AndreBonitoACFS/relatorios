import { useState } from "react";
import * as XLSX from "xlsx";
import Dashboard from "./components/Dashboard";
import PDFExporter from "./components/PDFExporter";

function App() {
  const [data, setData] = useState<any>({ Judicial: [], Administrativo: [] });
  const [selectedTab, setSelectedTab] = useState<"Judicial" | "Administrativo">("Judicial");
  const [fileName, setFileName] = useState<string>("");
  const [selectedProcesso, setSelectedProcesso] = useState<string>("");
  const [showPDF, setShowPDF] = useState(false);

  const handleFileUpload = (file: File) => {
    let name = file.name.replace(".xlsx", "").replace(/ - Relatório$/i, "");
    setFileName(name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const ab = e.target?.result;
      const workbook = XLSX.read(ab, { type: "binary" });
      const newData: any = {};

      ["Judicial", "Administrativo"].forEach((sheet) => {
        const ws = workbook.Sheets[sheet];
        const json = XLSX.utils.sheet_to_json(ws, { defval: "" });
        newData[sheet] = json;
      });

      setData(newData);
      const primeiros = newData[selectedTab];
      if (primeiros && primeiros.length > 0) {
        setSelectedProcesso(primeiros[0]["Processo"]);
      }
    };
    reader.readAsBinaryString(file);
  };

  const selectedData = data[selectedTab] || [];

  const processosUnicos = Array.from(new Set(selectedData.map((row: any) => row["Processo"])));

  const dadosSelecionados = selectedData.find((row: any) => row["Processo"] === selectedProcesso);

  return (
    <div className="flex flex-row min-h-screen w-screen bg-gray-100">
      {/* Sidebar fixa */}
      <div className="w-[300px] bg-white p-6 flex flex-col items-center gap-6">
        <img src="/logo.png" alt="Logo da empresa" style={{ height: "160px" }} className="mx-auto" />

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
            className={`px-4 py-2 rounded ${selectedTab === "Judicial" ? "bg-blue-600 text-white" : "bg-white border"}`}
            onClick={() => setSelectedTab("Judicial")}
          >
            Judicial
          </button>
          <button
            className={`px-4 py-2 rounded ${selectedTab === "Administrativo" ? "bg-blue-600 text-white" : "bg-white border"}`}
            onClick={() => setSelectedTab("Administrativo")}
          >
            Administrativo
          </button>
        </div>

        {/* Botão Exportar PDF */}
        {selectedData.length > 0 && (
          <button
            onClick={() => setShowPDF(true)}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
          >
            Exportar PDF
          </button>
        )}

        {/* Botões dos processos */}
        {selectedData.length > 0 && (
          <div className="flex flex-col w-full gap-2 mt-4 overflow-auto max-h-[300px]">
            {processosUnicos.map((proc) => (
              <button
                key={proc as string}
                className={`px-2 py-1 text-sm rounded ${proc === selectedProcesso ? "bg-blue-500 text-white" : "bg-gray-200"
                  }`}
                onClick={() => setSelectedProcesso(proc as string)}
              >
                {proc as string}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 p-8 overflow-x-auto min-w-[9000px]">
        <h1 className="text-3xl font-bold text-gray-800 text-center" style={{ display: "flex", justifyContent: "center" }}>
          {fileName.replace(/ - Relatório$/i, "")}
        </h1>

        {selectedData.length > 0 && (
          <Dashboard
            data={selectedData}
            tabName={selectedTab}
            fileName={fileName}
            selectedProcesso={selectedProcesso}
          />
        )}

        {showPDF && dadosSelecionados && (
          <PDFExporter
            fileName={fileName}
            tabName={selectedTab}
            selectedProcesso={selectedProcesso}
            dados={dadosSelecionados}
            tributos={Number(dadosSelecionados.Tributos || 0)}
            multa={Number(dadosSelecionados.Multa || 0)}
            juros={Number(dadosSelecionados.Juros || 0)}
            onFinish={() => setShowPDF(false)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
