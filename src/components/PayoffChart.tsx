import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart,
} from 'recharts';
import { formatCurrency } from '../lib/formatters';
import type { PayoffDataPoint } from '../lib/types';

interface PayoffChartProps {
    data: PayoffDataPoint[];
    currentRate: number;
}

export const PayoffChart = ({ data, currentRate }: PayoffChartProps) => {
    return (
        <div className="rounded-xl p-5 backdrop-blur-sm transition-all duration-300 bg-gradient-to-br from-slate-800/80 to-slate-900/90 border border-blue-500/15 hover:border-blue-500/30 hover:shadow-[0_8px_32px_rgba(59,130,246,0.1)]">
            <h3 className="m-0 mb-4 text-sm text-slate-400 tracking-wide">📈 CURVA DE PAYOFF</h3>
            <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
                        <XAxis dataKey="rate" stroke="#64748b" fontSize={11} tickFormatter={(v: string) => `${v}%`} />
                        <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                        <Tooltip
                            contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', fontSize: '12px' }}
                            formatter={(value: number) => [formatCurrency(value), 'P&L']}
                            labelFormatter={(label: string) => `Tipo: ${label}%`}
                        />
                        <ReferenceLine y={0} stroke="#64748b" strokeDasharray="5 5" />
                        <ReferenceLine x={currentRate.toFixed(2)} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Actual', fill: '#f59e0b', fontSize: 10 }} />
                        <Area type="monotone" dataKey="pnl" stroke="#3b82f6" strokeWidth={2} fill="url(#positiveGradient)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-slate-500 mt-3 text-center">Eje X: Tipo de interés (%) · Eje Y: Beneficio/Pérdida (€)</p>
        </div>
    );
};
