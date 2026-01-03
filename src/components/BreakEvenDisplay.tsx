interface BreakEvenDisplayProps {
    breakEvenRate: number | null;
    currentRate: number;
    warrantType: 'PUT' | 'CALL';
}

export const BreakEvenDisplay = ({ breakEvenRate, currentRate, warrantType }: BreakEvenDisplayProps) => {
    if (breakEvenRate === null) {
        return (
            <div className="rounded-xl p-4 sm:p-5 bg-gradient-to-br from-slate-800/80 to-slate-900/90 border border-cyan-500/15">
                <h3 className="m-0 mb-3 text-xs sm:text-sm text-cyan-400 tracking-wide">🎯 BREAK-EVEN</h3>
                <div className="text-center py-3">
                    <div className="text-slate-500 text-xs sm:text-sm">No hay break-even en este rango</div>
                </div>
            </div>
        );
    }

    const diff = breakEvenRate - currentRate;
    const direction = warrantType === 'PUT' ? 'suban' : 'bajen';
    const needsMove = Math.abs(diff);

    return (
        <div className="rounded-xl p-4 sm:p-5 bg-gradient-to-br from-slate-800/80 to-slate-900/90 border border-cyan-500/30">
            <h3 className="m-0 mb-3 text-xs sm:text-sm text-cyan-400 tracking-wide">🎯 BREAK-EVEN</h3>
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="bg-slate-900/50 rounded-lg p-2 sm:p-3 text-center">
                    <div className="text-[9px] sm:text-[10px] text-slate-500 mb-1">TIPO BREAK-EVEN</div>
                    <div className="text-lg sm:text-2xl font-bold text-cyan-400">{breakEvenRate.toFixed(2)}%</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-2 sm:p-3 text-center">
                    <div className="text-[9px] sm:text-[10px] text-slate-500 mb-1">MOVIMIENTO</div>
                    <div className={`text-lg sm:text-2xl font-bold ${diff > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {diff > 0 ? '+' : ''}{diff.toFixed(2)}pp
                    </div>
                </div>
            </div>
            <p className="mt-2 sm:mt-3 text-[10px] sm:text-xs text-slate-500 text-center">
                Los tipos deben {direction} <strong>{needsMove.toFixed(2)}pp</strong> para recuperar la inversión
            </p>
        </div>
    );
};
