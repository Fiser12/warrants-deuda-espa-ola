import { SliderInput } from './SliderInput';
import { useMarketDataSync } from '../hooks';

interface BondParamsCardProps {
    currentRate: number;
    bondCoupon: number;
    bondMaturity: number;
    faceValue: number;
    onCurrentRateChange: (value: number) => void;
    onBondCouponChange: (value: number) => void;
    onBondMaturityChange: (value: number) => void;
    onFaceValueChange: (value: number) => void;
}

export const BondParamsCard = ({
    currentRate, bondCoupon, bondMaturity, faceValue,
    onCurrentRateChange, onBondCouponChange, onBondMaturityChange, onFaceValueChange,
}: BondParamsCardProps) => {

    const {
        selectedCountry, setSelectedCountry,
        selectedBenchmark, setSelectedBenchmark,
        isLoading, lastUpdated, sync, hasApiKey
    } = useMarketDataSync(onCurrentRateChange);

    return (
        <div className="rounded-xl p-5 backdrop-blur-sm transition-all duration-300 bg-gradient-to-br from-slate-800/80 to-slate-900/90 border border-blue-500/15 hover:border-blue-500/30 hover:shadow-[0_8px_32px_rgba(59,130,246,0.1)]">
            <div className="flex justify-between items-center mb-5">
                <h3 className="m-0 text-sm text-slate-400 tracking-wide">BONO SUBYACENTE</h3>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                        {lastUpdated && (
                            <span className="text-[10px] text-slate-500 hidden xl:inline">
                                {lastUpdated}
                            </span>
                        )}

                        {/* Country Selector */}
                        <select
                            className="bg-slate-900 border border-slate-700 text-slate-300 text-[10px] rounded px-2 py-1 outline-none focus:border-blue-500 max-w-[80px]"
                            value={selectedCountry}
                            onChange={(e) => setSelectedCountry(e.target.value as any)}
                            onClick={(e) => e.stopPropagation()}
                            title="Seleccionar País/Zona"
                        >
                            <option value="us">🇺🇸 US</option>
                            <option value="de">🇩🇪 DE</option>
                            <option value="fr">🇫🇷 FR</option>
                            <option value="it">🇮🇹 IT</option>
                            <option value="es">🇪🇸 ES</option>
                            <option value="nl">🇳🇱 NL</option>
                            <option value="eu">🇪🇺 EU</option>
                        </select>

                        {/* Benchmark Selector */}
                        <select
                            className="bg-slate-900 border border-slate-700 text-slate-300 text-[10px] rounded px-2 py-1 outline-none focus:border-blue-500"
                            value={selectedBenchmark}
                            onChange={(e) => setSelectedBenchmark(e.target.value as any)}
                            onClick={(e) => e.stopPropagation()}
                            title={['us', 'de', 'eu'].includes(selectedCountry) ? "Seleccionar Vencimiento" : "Solo 10Y disponible (ECB)"}
                            disabled={!['us', 'de', 'eu'].includes(selectedCountry)}
                        >
                            {['us', 'de', 'eu'].includes(selectedCountry) ? (
                                <>
                                    <option value="3month">3M</option>
                                    <option value="2year">2Y</option>
                                    <option value="5year">5Y</option>
                                    <option value="10year">10Y</option>
                                    <option value="30year">30Y</option>
                                </>
                            ) : (
                                <option value="10year">10Y</option>
                            )}
                        </select>

                        <button
                            onClick={sync}
                            disabled={isLoading}
                            className={`text-[10px] uppercase font-bold px-2 py-1 rounded border transition-colors ${(selectedCountry !== 'us' || hasApiKey)
                                ? 'bg-blue-900/30 border-blue-500/30 text-blue-400 hover:bg-blue-900/50 hover:text-blue-300 cursor-pointer'
                                : 'bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed'
                                }`}
                            title={selectedCountry === 'us' && !hasApiKey ? "Requiere API Key" : "Sincronizar ahora"}
                        >
                            {isLoading ? '...' : '↻'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid gap-5">
                <SliderInput
                    label="Tipo actual (TIR)"
                    value={currentRate}
                    min={1}
                    max={7}
                    step={0.01}
                    onChange={onCurrentRateChange}
                    formatValue={(v) => `${v.toFixed(2)}%`}
                    colorClass="text-amber-500"
                    tooltip="Rentabilidad actual del bono en el mercado. Puedes sincronizar este valor con el mercado real usando el botón Sync."
                />
                <SliderInput
                    label="Cupón del bono"
                    value={bondCoupon}
                    min={0}
                    max={6}
                    step={0.25}
                    onChange={onBondCouponChange}
                    formatValue={(v) => `${v.toFixed(2)}%`}
                    colorClass="text-amber-500"
                    tooltip="Interés anual que paga el bono sobre su valor nominal. Un bono con cupón alto es menos sensible a cambios de tipos que uno con cupón bajo."
                />
                <SliderInput
                    label="Vencimiento del bono"
                    value={bondMaturity}
                    min={2}
                    max={30}
                    step={1}
                    onChange={onBondMaturityChange}
                    formatValue={(v) => `${v} años`}
                    colorClass="text-amber-500"
                    tooltip="Años hasta que el bono devuelve el principal. Bonos a largo plazo son más sensibles a cambios de tipos (mayor duración)."
                />
                <SliderInput
                    label="Valor nominal"
                    value={faceValue}
                    min={100}
                    max={10000}
                    step={100}
                    onChange={onFaceValueChange}
                    formatValue={(v) => `${v.toLocaleString()}€`}
                    colorClass="text-amber-500"
                    tooltip="Importe que recibes al vencimiento del bono. El nominal típico suele ser 1.000€."
                />
            </div>
        </div>
    );
};
