import { formatCurrency } from '../lib/formatters';

interface PnLResultProps {
    totalInvestment: number;
    simulatedPosition: number;
    profitLoss: number;
    profitLossPercent: number;
}

export const PnLResult = ({ totalInvestment, simulatedPosition, profitLoss, profitLossPercent }: PnLResultProps) => {
    const isProfit = profitLoss >= 0;

    return (
        <div className={`rounded-xl p-4 sm:p-5 ${isProfit
            ? 'bg-gradient-to-br from-green-500/10 to-slate-900/90 border border-green-500/40'
            : 'bg-gradient-to-br from-red-500/10 to-slate-900/90 border border-red-500/40'}`}
        >
            <h3 className="m-0 mb-4 sm:mb-5 text-xs sm:text-sm text-slate-400 tracking-wide">📊 RESULTADO</h3>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                    <div className="text-[10px] sm:text-[11px] text-slate-500 mb-1">INVERSIÓN</div>
                    <div className="text-base sm:text-lg font-semibold text-slate-400">{formatCurrency(totalInvestment)}</div>
                </div>
                <div>
                    <div className="text-[10px] sm:text-[11px] text-slate-500 mb-1">VALOR POSICIÓN</div>
                    <div className="text-base sm:text-lg font-semibold text-blue-400">{formatCurrency(simulatedPosition)}</div>
                </div>
            </div>

            <div className="mt-4 sm:mt-5 p-3 sm:p-5 bg-black/30 rounded-lg text-center">
                <div className="text-[10px] sm:text-[11px] text-slate-500 mb-1 sm:mb-2">BENEFICIO / PÉRDIDA</div>
                <div className={`text-2xl sm:text-4xl font-bold ${isProfit ? 'text-green-500 drop-shadow-[0_0_20px_rgba(34,197,94,0.5)]' : 'text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]'}`}>
                    {isProfit ? '+' : ''}{formatCurrency(profitLoss)}
                </div>
                <div className={`text-sm sm:text-base font-semibold mt-1 ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                    ({profitLossPercent >= 0 ? '+' : ''}{profitLossPercent.toFixed(1)}%)
                </div>
            </div>
        </div>
    );
};
