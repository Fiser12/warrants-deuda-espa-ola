import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, Line, ComposedChart,
} from 'recharts';
import { formatCurrency } from '../lib/formatters';

interface TimeDecayDataPoint {
    day: number;
    remainingDays: number;
    warrantValue: number;
    intrinsicValue: number;
    timeValue: number;
}

interface TimeDecayChartProps {
    data: TimeDecayDataPoint[];
    currentDay: number;
    totalDays: number;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ value: number; dataKey: string }>;
    label?: number;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (!active || !payload?.length) return null;

    const warrantValue = payload.find(p => p.dataKey === 'warrantValue')?.value ?? 0;
    const intrinsicValue = payload.find(p => p.dataKey === 'intrinsicValue')?.value ?? 0;
    const timeValue = payload.find(p => p.dataKey === 'timeValue')?.value ?? 0;

    return (
        <div className="bg-slate-900/95 border border-rose-500/30 rounded-lg p-3 text-xs">
            <p className="text-slate-400 mb-2">Día {label}</p>
            <p className="text-blue-400">Valor total: {formatCurrency(warrantValue)}</p>
            <p className="text-green-400">V. intrínseco: {formatCurrency(intrinsicValue)}</p>
            <p className="text-purple-400">V. temporal: {formatCurrency(timeValue)}</p>
        </div>
    );
};

export const TimeDecayChart = ({ data, currentDay }: TimeDecayChartProps) => {
    return (
        <div className="rounded-xl p-5 backdrop-blur-sm transition-all duration-300 bg-gradient-to-br from-slate-800/80 to-slate-900/90 border border-rose-500/15 hover:border-rose-500/30 hover:shadow-[0_8px_32px_rgba(244,63,94,0.1)]">
            <h3 className="m-0 mb-4 text-sm text-slate-400 tracking-wide">📉 DECAIMIENTO TEMPORAL (THETA)</h3>
            <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="timeValueGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
                        <XAxis
                            dataKey="day"
                            stroke="#64748b"
                            fontSize={10}
                            tickFormatter={(v: number) => `${v}d`}
                        />
                        <YAxis
                            stroke="#64748b"
                            fontSize={10}
                            tickFormatter={(v: number) => `${v.toFixed(1)}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="intrinsicValue"
                            stroke="#22c55e"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                        />
                        <Area
                            type="monotone"
                            dataKey="timeValue"
                            stroke="#a855f7"
                            strokeWidth={2}
                            fill="url(#timeValueGradient)"
                        />
                        <Line
                            type="monotone"
                            dataKey="warrantValue"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={false}
                        />
                        <ReferenceLine
                            x={currentDay}
                            stroke="#f43f5e"
                            strokeWidth={2}
                            strokeDasharray="3 3"
                            label={{ value: 'HOY', fill: '#f43f5e', fontSize: 10, position: 'top' }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
            <div className="flex justify-between mt-3 text-[10px]">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-blue-500" />
                    <span className="text-slate-500">Valor total</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-green-500" />
                    <span className="text-slate-500">V. intrínseco</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-purple-500" />
                    <span className="text-slate-500">V. temporal</span>
                </div>
            </div>
        </div>
    );
};
