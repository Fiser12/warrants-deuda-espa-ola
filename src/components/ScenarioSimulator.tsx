import { SliderInput } from './SliderInput';

interface ScenarioSimulatorProps {
    simulatedRate: number;
    currentRate: number;
    onChange: (value: number) => void;
}

export const ScenarioSimulator = ({ simulatedRate, currentRate, onChange }: ScenarioSimulatorProps) => {
    const rateDirection = simulatedRate > currentRate ? '▲ SUBEN' : simulatedRate < currentRate ? '▼ BAJAN' : '= IGUAL';

    return (
        <div className="rounded-xl p-5 backdrop-blur-sm transition-all duration-300 bg-gradient-to-br from-slate-800/80 to-slate-900/90 border border-amber-500/30 hover:border-amber-500/50 hover:shadow-[0_8px_32px_rgba(234,179,8,0.1)]">
            <h3 className="m-0 mb-4 text-sm text-amber-400 tracking-wide">⚡ SIMULADOR DE ESCENARIO</h3>
            <div>
                <div className="flex justify-between mb-2">
                    <label className="text-xs text-slate-500">Tipo de interés simulado</label>
                    <span className={`text-xl font-bold ${simulatedRate > currentRate ? 'text-red-500' : 'text-green-500'}`}>
                        {simulatedRate.toFixed(2)}%
                    </span>
                </div>
                <SliderInput
                    label=""
                    value={simulatedRate}
                    min={1}
                    max={7}
                    step={0.1}
                    onChange={onChange}
                    sliderClass="!bg-gradient-to-r !from-green-500 !via-amber-500 !to-red-500"
                    tooltip="Arrastra para simular diferentes escenarios de tipos de interés. Verde = tipos bajan (bueno para CALL). Rojo = tipos suben (bueno para PUT)."
                />
                <div className="flex justify-between mt-1 text-[11px] text-slate-500">
                    <span>1%</span>
                    <span>Tipos {rateDirection}</span>
                    <span>7%</span>
                </div>
            </div>
        </div>
    );
};
