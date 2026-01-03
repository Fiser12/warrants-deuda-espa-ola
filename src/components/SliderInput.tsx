import { useState, useEffect } from 'react';

interface SliderInputProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
    formatValue?: (value: number) => string;
    parseValue?: (formatted: string) => number;
    colorClass?: string;
    sliderClass?: string;
    unit?: string;
    tooltip?: string;
}

export const SliderInput = ({
    label,
    value,
    min,
    max,
    step,
    onChange,
    formatValue,
    parseValue,
    colorClass = 'text-blue-400',
    sliderClass = '',
    unit = '',
    tooltip,
}: SliderInputProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(String(value));
    const [showTooltip, setShowTooltip] = useState(false);

    useEffect(() => {
        if (!isEditing) {
            setInputValue(String(value));
        }
    }, [value, isEditing]);

    const displayValue = formatValue ? formatValue(value) : `${value}${unit}`;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleInputBlur = () => {
        setIsEditing(false);
        let parsed: number;

        if (parseValue) {
            parsed = parseValue(inputValue);
        } else {
            parsed = parseFloat(inputValue.replace(/[^0-9.-]/g, ''));
        }

        if (!isNaN(parsed)) {
            const stepped = Math.round(parsed / step) * step;
            onChange(stepped);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleInputBlur();
        }
        if (e.key === 'Escape') {
            setIsEditing(false);
            setInputValue(String(value));
        }
    };

    const sliderValue = Math.min(max, Math.max(min, value));
    const isOutOfRange = value < min || value > max;

    return (
        <div>
            {label && (
                <div className="flex justify-between mb-2 items-center">
                    <div className="flex items-center gap-1.5">
                        <label className="text-xs text-slate-500">{label}</label>
                        {tooltip && (
                            <div className="relative">
                                <button
                                    type="button"
                                    className="w-4 h-4 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-slate-200 text-[10px] font-bold flex items-center justify-center transition-colors"
                                    onMouseEnter={() => setShowTooltip(true)}
                                    onMouseLeave={() => setShowTooltip(false)}
                                    onClick={() => setShowTooltip(!showTooltip)}
                                >
                                    ?
                                </button>
                                {showTooltip && (
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 z-50 w-64 p-3 bg-slate-800 border border-slate-600 rounded-lg shadow-xl text-xs text-slate-300 leading-relaxed">
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-800 border-l border-b border-slate-600 rotate-45" />
                                        {tooltip}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    {isEditing ? (
                        <input
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            onBlur={handleInputBlur}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            className={`text-sm font-semibold bg-transparent border-b border-blue-500 outline-none w-20 text-right ${colorClass}`}
                        />
                    ) : (
                        <span
                            className={`text-sm font-semibold cursor-pointer hover:underline ${colorClass} ${isOutOfRange ? 'text-orange-400' : ''}`}
                            onClick={() => setIsEditing(true)}
                            title={isOutOfRange ? `Fuera del rango del slider (${min}-${max})` : 'Click para editar'}
                        >
                            {displayValue}
                        </span>
                    )}
                </div>
            )}
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={sliderValue}
                onChange={(e) => onChange(Number(e.target.value))}
                className={`w-full h-1.5 rounded cursor-pointer appearance-none bg-gradient-to-r from-slate-700 to-blue-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-blue-400 [&::-webkit-slider-thumb]:to-blue-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(59,130,246,0.5)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-200 [&::-webkit-slider-thumb]:hover:scale-110 ${sliderClass}`}
            />
        </div>
    );
};
