import { useState } from 'react';
import type { SavedOperation } from '../lib/types';

interface SidebarProps {
    operations: SavedOperation[];
    currentOperationId: string | null;
    onSelect: (operation: SavedOperation) => void;
    onSaveNew: (name?: string) => void;
    onUpdate: () => void;
    onDuplicate: (id: string) => void;
    onDelete: (id: string) => void;
    onRename: (id: string, name: string) => void;
    selectedForCompare: string[];
    onToggleCompare: (id: string) => void;
    onCompare: () => void;
}

export const Sidebar = ({
    operations,
    currentOperationId,
    onSelect,
    onSaveNew,
    onUpdate,
    onDuplicate,
    onDelete,
    onRename,
    selectedForCompare,
    onToggleCompare,
    onCompare,
}: SidebarProps) => {
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    const handleStartEdit = (op: SavedOperation) => {
        setEditingId(op.id);
        setEditName(op.name);
        setMenuOpenId(null);
    };

    const handleSaveEdit = () => {
        if (editingId && editName.trim()) {
            onRename(editingId, editName.trim());
        }
        setEditingId(null);
    };

    return (
        <div className="w-64 bg-slate-900/95 border-r border-slate-700/50 fixed inset-y-0 left-0 z-50 backdrop-blur-md shadow-2xl flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-700/50 flex-shrink-0 space-y-2">
                <h2 className="text-sm font-semibold text-slate-300 tracking-wide">OPERACIONES</h2>

                {currentOperationId ? (
                    <div className="flex gap-2">
                        <button
                            onClick={() => onUpdate()}
                            className="flex-1 px-2 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white text-xs font-semibold transition-colors shadow-lg active:scale-95 transform duration-100 flex items-center justify-center gap-1"
                            title="Actualizar operación actual"
                        >
                            Guardar
                        </button>
                        <button
                            onClick={() => onSaveNew()}
                            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-xs font-semibold transition-colors active:scale-95 transform duration-100"
                            title="Guardar como nueva copia"
                        >
                            Copia
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => onSaveNew()}
                        className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-xs font-semibold transition-colors shadow-lg shadow-blue-500/20 active:scale-95 transform duration-100"
                    >
                        Guardar nueva
                    </button>
                )}
            </div>

            {/* Operations list - Scroll area */}
            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {operations.length === 0 ? (
                    <div className="text-center text-slate-500 text-xs py-10 px-4">
                        Guarda escenarios para compararlos más tarde
                    </div>
                ) : (
                    <div className="space-y-1 pb-4">
                        {operations.map(op => (
                            <div
                                key={op.id}
                                className={`group relative rounded-lg p-3 cursor-pointer transition-all border ${currentOperationId === op.id
                                    ? 'bg-blue-600/20 border-blue-500/40 shadow-inner'
                                    : 'hover:bg-slate-800/60 border-transparent hover:border-slate-700/50'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Checkbox for compare */}
                                    <div className="pt-0.5" onClick={e => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={selectedForCompare.includes(op.id)}
                                            onChange={() => onToggleCompare(op.id)}
                                            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                                        />
                                    </div>

                                    {/* Name & Details */}
                                    <div
                                        className="flex-1 min-w-0"
                                        onClick={() => onSelect(op)}
                                    >
                                        {editingId === op.id ? (
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={e => setEditName(e.target.value)}
                                                onBlur={handleSaveEdit}
                                                onKeyDown={e => e.key === 'Enter' && handleSaveEdit()}
                                                autoFocus
                                                className="w-full bg-slate-800 border border-blue-500 rounded px-1.5 py-0.5 text-xs text-white outline-none"
                                                onClick={e => e.stopPropagation()}
                                            />
                                        ) : (
                                            <>
                                                <div className="text-xs font-bold text-slate-200 truncate leading-tight mb-1">
                                                    {op.name}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                                    <span className={`px-1 rounded text-[9px] font-bold ${op.input.warrant.type === 'CALL' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                        {op.input.warrant.type}
                                                    </span>
                                                    <span>Strike {op.input.warrant.strike}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Menu button */}
                                    <button
                                        onClick={e => {
                                            e.stopPropagation();
                                            setMenuOpenId(menuOpenId === op.id ? null : op.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-opacity"
                                    >
                                        ⋮
                                    </button>
                                </div>

                                {/* Dropdown menu */}
                                {menuOpenId === op.id && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setMenuOpenId(null);
                                            }}
                                        />
                                        <div className="absolute right-2 top-8 w-32 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50 overflow-hidden py-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStartEdit(op);
                                                }}
                                                className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                                            >
                                                ✏️ Renombrar
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDuplicate(op.id);
                                                    setMenuOpenId(null);
                                                }}
                                                className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                                            >
                                                📋 Duplicar
                                            </button>
                                            <div className="border-t border-slate-700 my-1" />
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(op.id);
                                                    setMenuOpenId(null);
                                                }}
                                                className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-slate-700 flex items-center gap-2"
                                            >
                                                🗑️ Eliminar
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Compare footer - Fixed at bottom */}
            <div className="p-4 border-t border-slate-700/50 bg-slate-900/95 flex-shrink-0 z-10">
                <button
                    onClick={onCompare}
                    disabled={selectedForCompare.length < 2}
                    className={`w-full px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wide transition-all shadow-lg transform active:scale-95 ${selectedForCompare.length >= 2
                        ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        }`}
                >
                    {selectedForCompare.length < 2
                        ? 'Selecciona 2+ para comparar'
                        : `Comparar (${selectedForCompare.length}) estrategias`
                    }
                </button>
            </div>
        </div>
    );
};
