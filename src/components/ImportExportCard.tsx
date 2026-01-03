import type { SimulatorInput, SimulatorOutput } from '../lib/types';

interface ImportExportCardProps {
    currentInput: SimulatorInput;
    currentOutput: SimulatorOutput;
    onImport: (input: SimulatorInput) => void;
}

export const ImportExportCard = ({ currentInput, currentOutput, onImport }: ImportExportCardProps) => {

    const handleExportInput = () => {
        const json = JSON.stringify(currentInput, null, 2);
        downloadJSON(json, 'warrant-input.json');
    };

    const handleExportOutput = () => {
        const json = JSON.stringify(currentOutput, null, 2);
        downloadJSON(json, 'warrant-results.json');
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

                // Validar estructura básica
                if (data.warrant && data.bond && data.market && data.costs && data.time) {
                    onImport(data as SimulatorInput);
                } else {
                    alert('JSON inválido: debe contener warrant, bond, market, costs y time');
                }
            } catch (err) {
                alert('Error al leer el archivo JSON');
            }
        };
        input.click();
    };

    const handleCopyToClipboard = async () => {
        const json = JSON.stringify(currentOutput, null, 2);
        await navigator.clipboard.writeText(json);
        alert('Resultados copiados al portapapeles');
    };

    return (
        <div className="rounded-xl p-4 sm:p-5 backdrop-blur-sm bg-gradient-to-br from-slate-800/80 to-slate-900/90 border border-indigo-500/20">
            <h3 className="m-0 mb-3 sm:mb-4 text-xs sm:text-sm text-indigo-400 tracking-wide">💾 IMPORT / EXPORT</h3>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <button
                    onClick={handleImport}
                    className="px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 rounded-lg text-indigo-300 text-[11px] sm:text-xs font-semibold transition-colors"
                >
                    📥 Importar JSON
                </button>
                <button
                    onClick={handleExportInput}
                    className="px-3 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/30 rounded-lg text-slate-300 text-[11px] sm:text-xs font-semibold transition-colors"
                >
                    📤 Exportar Input
                </button>
                <button
                    onClick={handleExportOutput}
                    className="px-3 py-2 bg-green-600/20 hover:bg-green-600/40 border border-green-500/30 rounded-lg text-green-300 text-[11px] sm:text-xs font-semibold transition-colors"
                >
                    📊 Exportar Resultados
                </button>
                <button
                    onClick={handleCopyToClipboard}
                    className="px-3 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/30 rounded-lg text-slate-300 text-[11px] sm:text-xs font-semibold transition-colors"
                >
                    📋 Copiar JSON
                </button>
            </div>
        </div>
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
