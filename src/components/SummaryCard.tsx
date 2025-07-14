import React from "react";

interface SummaryCardProps {
    label: string;
    value: number;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value }) => {
    const formatted = value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });

    return (
        <div>
            <div className="text-sm text-gray-500">{label}</div>
            <div className="text-xl font-semibold text-gray-800">{formatted}</div>
        </div>
    );
};

export default SummaryCard;
