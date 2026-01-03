import type { WarrantType } from '../lib/types';

interface WarrantTypeSelectorProps {
    value: WarrantType;
    onChange: (type: WarrantType) => void;
}

export const WarrantTypeSelector = ({ value, onChange }: WarrantTypeSelectorProps) => {
    const baseBtn = "px-6 py-2.5 border border-blue-500/30 bg-transparent text-slate-400 cursor-pointer transition-all duration-300 font-semibold text-[13px] hover:bg-blue-500/10";
    const activeBtn = "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500";

    return (
        <div className="rounded-xl p-5 backdrop-blur-sm transition-all duration-300 bg-gradient-to-br from-slate-800/80 to-slate-900/90 border border-blue-500/15 hover:border-blue-500/30 hover:shadow-[0_8px_32px_rgba(59,130,246,0.1)]">
            <h3 className="m-0 mb-4 text-sm text-slate-400 tracking-wide">TIPO DE OPERACIÓN</h3>
            <div className="flex">
                <button
                    className={`${baseBtn} rounded-l-md ${value === 'PUT' ? activeBtn : ''}`}
                    onClick={() => onChange('PUT')}
                >
                    🔻 PUT (Ganar si suben tipos)
                </button>
                <button
                    className={`${baseBtn} rounded-r-md ${value === 'CALL' ? activeBtn : ''}`}
                    onClick={() => onChange('CALL')}
                >
                    🔺 CALL (Ganar si bajan tipos)
                </button>
            </div>
            <p className="mt-3 text-xs text-slate-500">
                {value === 'PUT'
                    ? '💡 Con un PUT, ganas cuando el precio del bono BAJA (tipos suben)'
                    : '💡 Con un CALL, ganas cuando el precio del bono SUBE (tipos bajan)'}
            </p>
        </div>
    );
};
