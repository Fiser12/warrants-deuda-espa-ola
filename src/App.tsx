import { useState, useMemo, useCallback } from 'react';

import type { SavedOperation } from './lib/types';
import { useSavedOperations, useSimulationState } from './hooks';
import {
    Header,
    WarrantTypeSelector,
    WarrantPropsCard,
    MarketPropsCard,
    BondParamsCard,
    ScenarioSimulator,
    BondMetrics,
    PnLResult,
    PayoffChart,

    TimeSimulatorCard,
    TimeDecayChart,
    CostsCard,
    BreakEvenDisplay,
    Sidebar,
    ComparisonView,
} from './components';

export default function App() {
    // Saved operations
    const {
        operations,
        saveOperation,
        updateOperation,
        duplicateOperation,
        deleteOperation,
        renameOperation,
    } = useSavedOperations();

    const [currentOperationId, setCurrentOperationId] = useState<string | null>(null);
    const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showComparison, setShowComparison] = useState(false);

    // Core Simulation Logic
    const sim = useSimulationState();

    // Load operation into state (Wiring)
    const loadOperation = useCallback((operation: SavedOperation) => {
        sim.loadFromInput(operation.input);
        setCurrentOperationId(operation.id);
        setShowComparison(false);
    }, [sim]);

    // Import handler (Wiring)
    const handleImport = useCallback((input: any) => {
        sim.loadFromInput(input);
        setCurrentOperationId(null);
    }, [sim]);

    // Save New (Wiring)
    const handleSaveNew = useCallback((name?: string) => {
        const operation = saveOperation(sim.currentInput, name);
        setCurrentOperationId(operation.id);
    }, [sim.currentInput, saveOperation]);

    // Update (Wiring)
    const handleUpdate = useCallback(() => {
        if (currentOperationId) {
            updateOperation(currentOperationId, sim.currentInput);
        }
    }, [currentOperationId, sim.currentInput, updateOperation]);

    // Comparison Logic (View Logic)
    const handleToggleCompare = useCallback((id: string) => {
        setSelectedForCompare(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    }, []);

    const selectedOperations = useMemo(
        () => operations.filter(op => selectedForCompare.includes(op.id)),
        [operations, selectedForCompare]
    );

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-[#0a0e17] via-[#121a2d] to-[#0d1321]">
            {/* Sidebar - fixed */}
            {sidebarOpen && (
                <Sidebar
                    operations={operations}
                    currentOperationId={currentOperationId}
                    onSelect={loadOperation}
                    onSaveNew={handleSaveNew}
                    onUpdate={handleUpdate}
                    onDuplicate={duplicateOperation}
                    onDelete={deleteOperation}
                    onRename={renameOperation}
                    selectedForCompare={selectedForCompare}
                    onToggleCompare={handleToggleCompare}
                    onCompare={() => setShowComparison(true)}
                />
            )}

            {/* Main content */}
            <div className={`flex-1 min-h-screen relative overflow-hidden font-mono text-slate-200 transition-all duration-300 ${sidebarOpen ? 'ml-64' : ''}`}>
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

                {/* Toggle sidebar button */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className={`fixed top-0 z-40 p-2 bg-slate-800 hover:bg-slate-700 border-r border-b border-slate-600/50 rounded-br-lg text-slate-400 hover:text-white text-sm transition-all duration-300 ${sidebarOpen ? 'left-64' : 'left-0'}`}
                    title={sidebarOpen ? 'Ocultar panel' : 'Mostrar panel'}
                >
                    {sidebarOpen ? '◀' : '▶'}
                </button>

                {showComparison && selectedOperations.length > 0 ? (
                    <ComparisonView
                        operations={selectedOperations}
                        onClose={() => setShowComparison(false)}
                    />
                ) : (
                    <div className="p-3 sm:p-6 relative max-w-7xl mx-auto">
                        <Header
                            warrantType={sim.warrantType}
                            currentInput={sim.currentInput}
                            currentOutput={sim.currentOutput}
                            onImport={handleImport}
                        />

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                            {/* Columna 1: CONTRATO (Estático) */}
                            <div className="flex flex-col gap-4 sm:gap-5">
                                <WarrantTypeSelector value={sim.warrantType} onChange={sim.setWarrantType} />
                                <BondParamsCard
                                    currentRate={sim.currentRate} bondCoupon={sim.bondCoupon} bondMaturity={sim.bondMaturity}
                                    faceValue={sim.faceValue}
                                    onCurrentRateChange={sim.setCurrentRate} onBondCouponChange={sim.setBondCoupon}
                                    onBondMaturityChange={sim.setBondMaturity} onFaceValueChange={sim.setFaceValue}
                                />
                                <WarrantPropsCard
                                    strike={sim.strike} premium={sim.premium} ratio={sim.ratio} expiry={sim.expiry} quantity={sim.quantity}
                                    onStrikeChange={sim.setStrike} onPremiumChange={sim.setPremium} onRatioChange={sim.setRatio}
                                    onExpiryChange={sim.setExpiry} onQuantityChange={sim.setQuantity}
                                />
                                <CostsCard
                                    spreadPercent={sim.spreadPercent} commissionPercent={sim.commissionPercent} commissionFixed={sim.commissionFixed}
                                    onSpreadChange={sim.setSpreadPercent} onCommissionPercentChange={sim.setCommissionPercent}
                                    onCommissionFixedChange={sim.setCommissionFixed}
                                />
                            </div>

                            {/* Columna 2: MERCADO (Simulación) */}
                            <div className="flex flex-col gap-4 sm:gap-5">
                                <ScenarioSimulator
                                    simulatedRate={sim.riskFreeRate}
                                    onChange={sim.setRiskFreeRate}
                                    creditSpread={sim.creditSpread}
                                />
                                <MarketPropsCard
                                    volatility={sim.volatility} creditSpread={sim.creditSpread} riskFreeRate={sim.riskFreeRate}
                                    onVolatilityChange={sim.setVolatility} onCreditSpreadChange={sim.setCreditSpread}
                                />
                                <TimeSimulatorCard expiryYears={sim.expiry} elapsedDays={sim.elapsedDays} theta={sim.theta} onElapsedDaysChange={sim.setElapsedDays} />
                            </div>

                            {/* Columna 3: RESULTADOS */}
                            <div className="flex flex-col gap-4 sm:gap-5">
                                <BondMetrics currentBondPrice={sim.calculations.currentBondPrice} simulatedBondPrice={sim.calculations.simulatedBondPrice} />
                                <BreakEvenDisplay breakEvenRate={sim.breakEvenRate} currentRate={sim.currentRate} warrantType={sim.warrantType} />
                                <PnLResult
                                    totalInvestment={sim.adjustedPnL.totalInvestment}
                                    simulatedPosition={sim.adjustedPnL.simulatedPosition}
                                    profitLoss={sim.adjustedPnL.profitLoss}
                                    profitLossPercent={sim.adjustedPnL.profitLossPercent}
                                />
                                <PayoffChart data={sim.payoffData} currentRate={sim.currentRate} />
                                <TimeDecayChart data={sim.timeDecayData} currentDay={sim.elapsedDays} totalDays={sim.totalDays} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}