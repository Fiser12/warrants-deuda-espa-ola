import type { CSSProperties } from 'react';

interface SliderInputProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
    formatValue?: (value: number) => string;
    color?: string;
    style?: CSSProperties;
}

export const SliderInput = ({
    label,
    value,
    min,
    max,
    step,
    onChange,
    formatValue,
    color = '#60a5fa',
    style,
}: SliderInputProps) => {
    const displayValue = formatValue ? formatValue(value) : String(value);

    return (
        <div>
            {label && (
                <div className="flex justify-between mb-2">
                    <label className="text-xs text-slate-500">{label}</label>
                    <span className="text-sm font-semibold" style={{ color }}>{displayValue}</span>
                </div>
            )}
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-1.5 rounded cursor-pointer appearance-none bg-gradient-to-r from-slate-700 to-blue-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-blue-400 [&::-webkit-slider-thumb]:to-blue-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(59,130,246,0.5)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-200 [&::-webkit-slider-thumb]:hover:scale-110"
                style={style}
            />
        </div>
    );
};
