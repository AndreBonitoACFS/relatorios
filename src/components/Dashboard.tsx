import React, { useRef, useState } from "react";
import PieChartCard from "./PieChartCard";
import "./Dashboard.css";
import PDFExporter from "./PDFExporter";

interface DashboardProps {
    data: any[];
    tabName: string;
    fileName: string;
}

const Dashboard: React.FC<DashboardProps> = ({ data, tabName, fileName }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const processosUnicos = Array.from(new Set(data.map((row) => row["Processo"])));
    const [selectedProcesso, setSelectedProcesso] = useState<string>(processosUnicos[0]);
    const [showPDF, setShowPDF] = useState(false);

    const filtered = data.filter((row) => row["Processo"] === selectedProcesso);
    const row = filtered[0] || {};

    const sum = (col: string) =>
        filtered.reduce((acc, row) => acc + (Number(row[col]) || 0), 0);

    const excelDateToJS = (serial: number): Date => {
        const utc_days = Math.floor(serial - 25569);
        const utc_value = utc_days * 86400;
        const date = new Date(utc_value * 1000);
        date.setHours(date.getHours() + 3); // Corrige para UTC-3
        return date;
    };

    const dados = {
        Espécie: row?.Espécie || "Sem Espécie",
        Objeto: row?.Objeto || "Sem Objeto",
        Demanda: row?.Demanda || "Sem Demanda",
        "Valor da Causa": row?.["Valor da Causa"] || "Sem Valor",
        Distribuição: row?.Distribuição || "Sem Data",
        Juízo: row?.Juízo || "Sem Juízo",
        Liminar: row?.Liminar || "Sem Liminar",
        Sentença: row?.Sentença || "Sem Sentença",
        Recursos: row?.Recursos || "Sem Recursos",
        "Estágio Atual": row?.["Estágio Atual"] || "Sem Estágio",
        Prognóstico: row?.Prognóstico || "Sem Prognóstico",
        Relatório: row?.Relatório || "Sem Relatório",
    };

    const tributos = Number(row?.Tributos || 0);
    const multa = Number(row?.Multa || 0);
    const juros = Number(row?.Juros || 0);

    const tributosValor = sum("Tributos");
    const multaValor = sum("Multa");
    const jurosValor = sum("Juros");
    const valorCausa = Number(row?.["Valor da Causa"] || 0);

    const mostrarSomenteValorCausa = tributosValor === 0 && multaValor === 0 && jurosValor === 0;

    return (
        <div ref={contentRef} id="dashboard-container">
            {/* PDF invisível (gerado no background) */}
            {showPDF && (
                <PDFExporter
                    fileName={fileName}
                    tabName={tabName}
                    selectedProcesso={selectedProcesso}
                    dados={dados}
                    tributos={tributos}
                    multa={multa}
                    juros={juros}
                    onFinish={() => setShowPDF(false)}
                />
            )}

            {/* Lateral esquerda */}
            <div id="sidebar-wrapper">
                <div id="dashboard-actions">
                    <button onClick={() => setShowPDF(true)} id="btn-export-pdf">
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
            </div>

            {/* Conteúdo principal */}
            <div id="dashboard-main">
                <div id="grafico-wrapper">
                    <PieChartCard
                        tributos={mostrarSomenteValorCausa ? 0 : tributosValor}
                        multa={mostrarSomenteValorCausa ? 0 : multaValor}
                        juros={mostrarSomenteValorCausa ? 0 : jurosValor}
                        valorCausa={mostrarSomenteValorCausa ? valorCausa : 0}
                    />
                </div>

                <div id="info-wrapper">
                    {Object.entries(row)
                        .filter(([key]) => !["Tributos", "Multa", "Juros", "Processo"].includes(key))
                        .map(([key, value]) => {
                            let displayValue: string;

                            if (key === "Valor da Causa") {
                                const valor = Number(value);
                                displayValue = isNaN(valor)
                                    ? `Sem ${key}`
                                    : valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
                            } else if (key === "Distribuição") {
                                let data: Date | null = null;

                                if (!isNaN(Number(value))) {
                                    // valor numérico (serial do Excel)
                                    data = excelDateToJS(Number(value));
                                } else if (typeof value === "string") {
                                    const partes = value.split("/");
                                    if (partes.length === 3) {
                                        const [dia, mes, ano] = partes.map(Number);
                                        if (!isNaN(dia) && !isNaN(mes) && !isNaN(ano)) {
                                            data = new Date(ano, mes - 1, dia);
                                        }
                                    }
                                }

                                displayValue = data
                                    ? data.toLocaleDateString("pt-BR")
                                    : `Sem ${key}`;
                            } else {
                                displayValue =
                                    value && String(value).trim() !== ""
                                        ? String(value)
                                        : `Sem ${key}`;
                            }

                            return (
                                <div key={key} className="info-card">
                                    <strong className="info-label">{key}</strong>
                                    <p className="info-value">{displayValue}</p>
                                </div>
                            );
                        })}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
