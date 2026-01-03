interface BondMetricsProps {
    currentBondPrice: number;
    simulatedBondPrice: number;
}

export const BondMetrics = ({ currentBondPrice, simulatedBondPrice }: BondMetricsProps) => {
    const priceDropped = simulatedBondPrice < currentBondPrice;

    return (
        <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg p-4 bg-gradient-to-br from-slate-800/60 to-slate-900/70 border border-slate-600/20">
                <div className="text-[11px] text-slate-500 mb-1">PRECIO BONO ACTUAL</div>
                <div className="text-[22px] font-bold text-blue-400">{currentBondPrice.toFixed(2)}€</div>
            </div>
            <div className="rounded-lg p-4 bg-gradient-to-br from-slate-800/60 to-slate-900/70 border border-slate-600/20">
                <div className="text-[11px] text-slate-500 mb-1">PRECIO BONO SIMULADO</div>
                <div className={`text-[22px] font-bold ${priceDropped ? 'text-red-500' : 'text-green-500'}`}>
                    {simulatedBondPrice.toFixed(2)}€
                </div>
            </div>
        </div>
    );
};
