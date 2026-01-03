import { SliderInput } from './SliderInput';
import { formatCurrency } from '../lib/formatters';

interface TimeSimulatorCardProps {
    expiryYears: number;
    elapsedDays: number;
    theta: number;
    onElapsedDaysChange: (days: number) => void;
}

export const TimeSimulatorCard = ({
    expiryYears,
    elapsedDays,
    theta,
    onElapsedDaysChange,
}: TimeSimulatorCardProps) => {
    const totalDays = Math.round(expiryYears * 365);
    const remainingDays = Math.max(0, totalDays - elapsedDays);
    const remainingYears = remainingDays / 365;

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + remainingDays);

    const progress = totalDays > 0 ? (elapsedDays / totalDays) * 100 : 0;

    return (
        <div className="rounded-xl p-4 sm:p-5 backdrop-blur-sm transition-all duration-300 bg-gradient-to-br from-slate-800/80 to-slate-900/90 border border-rose-500/30 hover:border-rose-500/50 hover:shadow-[0_8px_32px_rgba(244,63,94,0.1)]">
            <h3 className="m-0 mb-3 sm:mb-4 text-xs sm:text-sm text-rose-400 tracking-wide">⏱️ SIMULACIÓN TEMPORAL</h3>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="bg-slate-900/50 rounded-lg p-2 sm:p-3 text-center">
                    <div className="text-[8px] sm:text-[10px] text-slate-500 mb-1">VENCE</div>
                    <div className="text-[11px] sm:text-sm font-bold text-rose-400">
                        {expiryDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                    </div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-2 sm:p-3 text-center">
                    <div className="text-[8px] sm:text-[10px] text-slate-500 mb-1">DÍAS</div>
                    <div className={`text-[11px] sm:text-sm font-bold ${remainingDays < 30 ? 'text-red-500' : remainingDays < 90 ? 'text-amber-500' : 'text-green-500'}`}>
                        {remainingDays}d
                    </div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-2 sm:p-3 text-center">
                    <div className="text-[8px] sm:text-[10px] text-slate-500 mb-1">THETA</div>
                    <div className="text-[11px] sm:text-sm font-bold text-red-400">
                        {formatCurrency(-Math.abs(theta))}
                    </div>
                </div>
            </div>

            <div className="mb-3 sm:mb-4">
                <div className="flex justify-between text-[9px] sm:text-[10px] text-slate-500 mb-1">
                    <span>Inicio</span>
                    <span>{progress.toFixed(0)}%</span>
                    <span>Vto.</span>
                </div>
                <div className="h-1.5 sm:h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-green-500 via-amber-500 to-red-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <SliderInput
                label="Días transcurridos"
                value={elapsedDays}
                min={0}
                max={totalDays}
                step={1}
                onChange={onElapsedDaysChange}
                formatValue={(v) => `${v}d (${remainingYears.toFixed(2)}a)`}
                colorClass="text-rose-400"
                tooltip="Simula el paso del tiempo para ver cómo decae el valor temporal."
            />
        </div>
    );
};
