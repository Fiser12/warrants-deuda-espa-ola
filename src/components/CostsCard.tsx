import { SliderInput } from './SliderInput';

interface CostsCardProps {
    spreadPercent: number;
    commissionPercent: number;
    commissionFixed: number;
    onSpreadChange: (value: number) => void;
    onCommissionPercentChange: (value: number) => void;
    onCommissionFixedChange: (value: number) => void;
}

export const CostsCard = ({
    spreadPercent,
    commissionPercent,
    commissionFixed,
    onSpreadChange,
    onCommissionPercentChange,
    onCommissionFixedChange,
}: CostsCardProps) => {
    return (
        <div className="rounded-xl p-5 backdrop-blur-sm transition-all duration-300 bg-gradient-to-br from-slate-800/80 to-slate-900/90 border border-orange-500/15 hover:border-orange-500/30 hover:shadow-[0_8px_32px_rgba(249,115,22,0.1)]">
            <h3 className="m-0 mb-5 text-sm text-orange-400 tracking-wide">💸 COSTES DE OPERACIÓN</h3>
            <div className="grid gap-5">
                <SliderInput
                    label="Spread Bid-Ask"
                    value={spreadPercent}
                    min={0}
                    max={10}
                    step={0.1}
                    onChange={onSpreadChange}
                    formatValue={(v) => `${v.toFixed(1)}%`}
                    colorClass="text-orange-400"
                    tooltip="Diferencia entre precio de compra y venta del warrant. Un spread del 3% significa que pierdes 3% solo al entrar. Los warrants poco líquidos pueden tener spreads del 5-10%."
                />
                <SliderInput
                    label="Comisión del broker (%)"
                    value={commissionPercent}
                    min={0}
                    max={1}
                    step={0.01}
                    onChange={onCommissionPercentChange}
                    formatValue={(v) => `${v.toFixed(2)}%`}
                    colorClass="text-orange-400"
                    tooltip="Porcentaje que cobra tu broker sobre el valor de la operación. Típico: 0.10% - 0.25%."
                />
                <SliderInput
                    label="Comisión mínima (€)"
                    value={commissionFixed}
                    min={0}
                    max={20}
                    step={0.5}
                    onChange={onCommissionFixedChange}
                    formatValue={(v) => `${v.toFixed(2)}€`}
                    colorClass="text-orange-400"
                    tooltip="Comisión mínima por operación. Si el % sería menor que esto, se aplica este mínimo. Típico: 3€ - 10€."
                />
            </div>
        </div>
    );
};
