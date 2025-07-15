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
        date.setHours(date.getHours() + 3);
        return date;
    };

    const tributos = Number(row?.Tributos || 0);
    const multa = Number(row?.Multa || 0);
    const juros = Number(row?.Juros || 0);

    const tributosValor = sum("Tributos");
    const multaValor = sum("Multa");
    const jurosValor = sum("Juros");
    const valorCausa = Number(row?.["Valor da Causa"] || 0);

    const mostrarSomenteValorCausa = tributosValor === 0 && multaValor === 0 && jurosValor === 0;

    const formatValue = (key: string, value: any): string => {
        if (key === "Valor da Causa") {
            const num = Number(value);
            return isNaN(num)
                ? `Sem ${key}`
                : num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        } else if (key === "Distribuição") {
            let data: Date | null = null;
            if (!isNaN(Number(value))) {
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
            return data ? data.toLocaleDateString("pt-BR") : `Sem ${key}`;
        } else {
            return value && String(value).trim() !== "" ? String(value) : `Sem ${key}`;
        }
    };

    const blocoChave = ["Espécie", "Valor da Causa", "Distribuição", "Prognóstico"];
    const dadosChave = blocoChave.map((campo) => ({
        key: campo,
        value: formatValue(campo, row?.[campo]),
    }));

    const demaisDados = Object.entries(row)
        .filter(([key]) => !["Tributos", "Multa", "Juros", "Processo", ...blocoChave].includes(key))
        .sort((a, b) => String(a[1] || "").length - String(b[1] || "").length);

    const allSmallTexts = demaisDados.every(([, value]) => String(value || "").length <= 300);

    return (
        <div ref={contentRef} id="dashboard-container">
            {showPDF && (
                <PDFExporter
                    fileName={fileName}
                    tabName={tabName}
                    selectedProcesso={selectedProcesso}
                    dados={row}
                    tributos={tributos}
                    multa={multa}
                    juros={juros}
                    onFinish={() => setShowPDF(false)}
                />
            )}

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

            <div id="dashboard-main">
                <div id="grafico-wrapper">
                    <PieChartCard
                        tributos={mostrarSomenteValorCausa ? 0 : tributosValor}
                        multa={mostrarSomenteValorCausa ? 0 : multaValor}
                        juros={mostrarSomenteValorCausa ? 0 : jurosValor}
                        valorCausa={mostrarSomenteValorCausa ? valorCausa : 0}
                    />
                </div>

                <div id="info-wrapper" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    {/* Caixa centralizada com dados principais */}
                    <div
                        className="info-card"
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, 1fr)",
                            gap: "16px",
                            width: "fit-content",
                            margin: "0 auto",
                        }}
                    >
                        {dadosChave.map(({ key, value }) => (
                            <div key={key}>
                                <strong className="info-label">{key}</strong>
                                <p className="info-value">{value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Demais dados adaptativos */}
                    <div
                        className="info-card-grid"
                        style={{
                            display: "grid",
                            gridTemplateColumns: allSmallTexts
                                ? "repeat(2, 480px)"
                                : "repeat(auto-fit, minmax(400px, 1fr))",
                            gap: "24px",
                            justifyContent: allSmallTexts ? "center" : "start",
                        }}
                    >
                        {demaisDados.map(([key, value]) => (
                            <div key={key} className="info-card">
                                <strong className="info-label">{key}</strong>
                                <p className="info-value">{formatValue(key, value)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
