import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import PieChartCard from "./PieChartCard";
import "./Dashboard.css"; // Importando estilos

interface DashboardProps {
    data: any[];
    tabName: string;
}

const Dashboard: React.FC<DashboardProps> = ({ data, tabName }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const processosUnicos = Array.from(new Set(data.map((row) => row["Processo"])));
    const [selectedProcesso, setSelectedProcesso] = useState<string>(processosUnicos[0]);
    const filtered = data.filter((row) => row["Processo"] === selectedProcesso);
    const row = filtered[0] || {};

    const sum = (col: string) =>
        filtered.reduce((acc, row) => acc + (Number(row[col]) || 0), 0);

    const exportPDF = async () => {
        if (!contentRef.current) return;
        const canvas = await html2canvas(contentRef.current);
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const width = pdf.internal.pageSize.getWidth();
        const height = (canvas.height * width) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, width, height);
        pdf.save(`relatorio_${tabName}_${selectedProcesso}.pdf`);
    };

    return (
        <div ref={contentRef} id="dashboard-container">
            {/* Cabeçalho com Título e Botões */}

            <div id="dashboard-actions">
                <button onClick={exportPDF} id="btn-export-pdf">
                    Exportar PDF
                </button>
            </div>

            <div id="dashboard-process-buttons">
                {processosUnicos.map((proc) => (
                    <button
                        key={proc}
                        className={`btn-processo ${proc === selectedProcesso ? "selected" : ""}`}
                        onClick={() => setSelectedProcesso(proc)}
                    >
                        {proc}
                    </button>
                ))}
            </div>

            {/* Gráfico e Informações lado a lado */}
            <div id="dashboard-main">
                <div id="grafico-wrapper">
                    <PieChartCard
                        tributos={sum("Tributos")}
                        juros={sum("Juros")}
                        multa={sum("Multa")}
                    />
                </div>

                <div id="info-wrapper">
                    {Object.entries(row)
                        .filter(([key]) =>
                            !["Tributos", "Multa", "Juros", "Processo", "Valor da Causa"].includes(key)
                        )
                        .map(([key, value]) => (
                            <div key={key} className="info-card">
                                <strong className="info-label">{key}</strong>
                                <p className="info-value">{String(value)}</p>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
