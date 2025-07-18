import React from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

interface PieChartCardProps {
    tributos: number;
    juros: number;
    multa: number;
    valorCausa?: number;
}

const COLORS = ["#343c47", "#7c8593", "#dbe0e0"];

// Label externo que evita corte do "R$"
const renderLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    value,
}: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 20;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text
            x={x}
            y={y}
            fill="#111827"
            fontSize={11}
            textAnchor={x > cx ? "start" : "end"}
            dominantBaseline="central"
        >
            {`R$ ${value.toLocaleString("pt-BR")}`}
        </text>
    );
};

const PieChartCard: React.FC<PieChartCardProps> = ({
    tributos,
    juros,
    multa,
    valorCausa,
}) => {
    const data =
        valorCausa && tributos === 0 && multa === 0 && juros === 0
            ? [{ name: "Valor da Causa", value: valorCausa }]
            : [
                { name: "Tributos", value: tributos },
                { name: "Juros", value: juros },
                { name: "Multa", value: multa },
            ];

    return (
        <div>
            {/* <h3 className="text-lg font-semibold text-gray-700 mb-4">
                {valorCausa && tributos === 0 && multa === 0 && juros === 0
                    ? "Valor da Causa"
                    : "Distribuição de Valores"}
            </h3> */}

            <ResponsiveContainer width={400} height={280}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        outerRadius={100}
                        innerRadius={40}
                        paddingAngle={2}
                        label={renderLabel}
                    >
                        {data.map((_, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: any) =>
                            `R$ ${Number(value).toLocaleString("pt-BR")}`
                        }
                    />
                    <Legend
                        layout="horizontal"
                        align="center"
                        verticalAlign="bottom"
                        iconType="circle"
                        formatter={(value: string) => (
                            <span className="text-gray-700 text-sm">{value}</span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PieChartCard;
