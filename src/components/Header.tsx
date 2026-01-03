import { useState } from 'react';
import type { WarrantType, SimulatorInput, SimulatorOutput } from '../lib/types';

interface HeaderProps {
    warrantType: WarrantType;
    currentInput?: SimulatorInput;
    currentOutput?: SimulatorOutput;
    onImport?: (input: SimulatorInput) => void;
}

export const Header = ({ warrantType, currentInput, currentOutput, onImport }: HeaderProps) => {
    const [menuOpen, setMenuOpen] = useState(false);

    const handleExportInput = () => {
        if (!currentInput) return;
        const json = JSON.stringify(currentInput, null, 2);
        downloadJSON(json, 'warrant-input.json');
        setMenuOpen(false);
    };

    const handleExportOutput = () => {
        if (!currentOutput) return;
        const json = JSON.stringify(currentOutput, null, 2);
        downloadJSON(json, 'warrant-results.json');
        setMenuOpen(false);
    };

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            try {
                const text = await file.text();
                const data = JSON.parse(text);

                if (data.warrant && data.bond && data.market && data.costs && data.time) {
                    onImport?.(data as SimulatorInput);
                } else {
                    alert('JSON inválido: debe contener warrant, bond, market, costs y time');
                }
            } catch {
                alert('Error al leer el archivo JSON');
            }
        };
        input.click();
        setMenuOpen(false);
    };

    const handleCopyToClipboard = async () => {
        if (!currentOutput) return;
        const json = JSON.stringify(currentOutput, null, 2);
        await navigator.clipboard.writeText(json);
        setMenuOpen(false);
    };

    return (
        <header className="relative mb-6 sm:mb-8 pb-4 sm:pb-5 border-b border-blue-500/20">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 sm:gap-4 mb-2">
                        <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 bg-green-500 rounded-full shadow-[0_0_12px_#22c55e] animate-[pulse-glow_2s_infinite]" />
                        <span className="text-slate-500 text-[10px] sm:text-xs tracking-[2px]">LIVE SIMULATION</span>
                    </div>
                    <h1 className="text-xl sm:text-[28px] font-bold m-0 tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        WARRANT SIMULATOR
                    </h1>
                    <p className="text-slate-500 mt-1.5 sm:mt-2 text-[11px] sm:text-[13px]">
                        Simulador de warrants sobre bonos · {warrantType === 'PUT' ? 'Posición Bajista' : 'Posición Alcista'}
                    </p>
                </div>

                {/* Menu button */}
                {currentInput && (
                    <div className="relative">
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="px-3 sm:px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600/50 rounded-lg text-slate-300 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2"
                        >
                            <span>💾</span>
                            <span className="hidden sm:inline">Archivo</span>
                            <span className="text-[10px]">▼</span>
                        </button>

                        {menuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setMenuOpen(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-600/50 rounded-lg shadow-xl z-50 overflow-hidden">
                                    <button
                                        onClick={handleImport}
                                        className="w-full px-4 py-2.5 text-left text-xs sm:text-sm text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-2"
                                    >
                                        📥 Importar JSON
                                    </button>
                                    <button
                                        onClick={handleExportInput}
                                        className="w-full px-4 py-2.5 text-left text-xs sm:text-sm text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-2"
                                    >
                                        📤 Exportar Input
                                    </button>
                                    <button
                                        onClick={handleExportOutput}
                                        className="w-full px-4 py-2.5 text-left text-xs sm:text-sm text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-2"
                                    >
                                        📊 Exportar Resultados
                                    </button>
                                    <div className="border-t border-slate-600/50" />
                                    <button
                                        onClick={handleCopyToClipboard}
                                        className="w-full px-4 py-2.5 text-left text-xs sm:text-sm text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-2"
                                    >
                                        📋 Copiar al portapapeles
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

function downloadJSON(content: string, filename: string) {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
