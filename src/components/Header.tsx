import type { WarrantType } from '../lib/types';

interface HeaderProps {
    warrantType: WarrantType;
}

export const Header = ({ warrantType }: HeaderProps) => {
    return (
        <header className="relative mb-8 pb-5 border-b border-blue-500/20">
            <div className="flex items-center gap-4 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_12px_#22c55e] animate-[pulse-glow_2s_infinite]" />
                <span className="text-slate-500 text-xs tracking-[2px]">LIVE SIMULATION</span>
            </div>
            <h1 className="text-[28px] font-bold m-0 tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                WARRANT SIMULATOR
            </h1>
            <p className="text-slate-500 mt-2 text-[13px]">
                Deuda Soberana España · Bonos del Estado · {warrantType === 'PUT' ? 'Posición Bajista' : 'Posición Alcista'}
            </p>
        </header>
    );
};
