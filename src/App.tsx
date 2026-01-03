import { useState, useMemo } from 'react';

import type { WarrantType } from './lib/types';
import {
    useWarrantCalculations,
    usePayoffData,
    useTimeDecayData,
    useCosts,
    useTheta,
    useBreakEven,
} from './hooks';
import {
    Header,
    WarrantTypeSelector,
    WarrantParamsCard,
    BondParamsCard,
    ScenarioSimulator,
    BondMetrics,
    PnLResult,
    PayoffChart,
    BrokersFooter,
    MarketParamsCard,
    TimeSimulatorCard,
    TimeDecayChart,
    CostsCard,
    BreakEvenDisplay,
} from './components';

export default function App() {
    // Warrant params
    const [warrantType, setWarrantType] = useState<WarrantType>('PUT');
    const [strike, setStrike] = useState(100);
    const [premium, setPremium] = useState(2.5);
    const [ratio, setRatio] = useState(0.1);
    const [expiry, setExpiry] = useState(1);
    const [volatility, setVolatility] = useState(0.15);
    const [quantity, setQuantity] = useState(1000);

    // Bond params
    const [currentRate, setCurrentRate] = useState(3.5);
    const [bondCoupon, setBondCoupon] = useState(3.0);
    const [bondMaturity, setBondMaturity] = useState(10);
    const [faceValue, setFaceValue] = useState(100);

    // Market params
    const [riskFreeRate, setRiskFreeRate] = useState(3.0);
    const [simulatedRate, setSimulatedRate] = useState(4.0);

    // Time simulation
    const [elapsedDays, setElapsedDays] = useState(0);

    // Costs
    const [spreadPercent, setSpreadPercent] = useState(2.0);
    const [commissionPercent, setCommissionPercent] = useState(0.15);
    const [commissionFixed, setCommissionFixed] = useState(5);

    // Derived values
    const totalDays = Math.round(expiry * 365);
    const remainingYears = Math.max(0, (totalDays - elapsedDays) / 365);

    // Hooks
    const costs = useCosts({
        premium, quantity, ratio, spreadPercent, commissionPercent, commissionFixed,
    });

    const theta = useTheta({
        warrantType, faceValue, bondCoupon, currentRate, bondMaturity,
        strike, volatility, remainingYears, riskFreeRate, quantity, ratio,
    });

    const breakEvenRate = useBreakEven({
        warrantType, premium, quantity, ratio, totalCosts: costs.totalCosts,
        faceValue, bondCoupon, bondMaturity, strike, volatility, remainingYears, riskFreeRate,
    });

    const calculations = useWarrantCalculations({
        warrantType, strike, premium, ratio, expiry: remainingYears, volatility, quantity,
        currentRate, bondCoupon, bondMaturity, simulatedRate, riskFreeRate, faceValue,
    });

    const payoffData = usePayoffData({
        warrantType, strike, premium, ratio, expiry: remainingYears, volatility, quantity,
        bondCoupon, bondMaturity, faceValue,
    });

    const timeDecayData = useTimeDecayData({
        warrantType, strike, volatility, expiryYears: expiry, riskFreeRate,
        currentRate, bondCoupon, bondMaturity, faceValue,
    });

    // Adjusted P&L with costs
    const adjustedPnL = useMemo(() => ({
        totalInvestment: costs.netInvestment,
        simulatedPosition: calculations.simulatedPosition,
        profitLoss: calculations.simulatedPosition - costs.netInvestment,
        profitLossPercent: ((calculations.simulatedPosition - costs.netInvestment) / costs.netInvestment) * 100,
    }), [calculations.simulatedPosition, costs.netInvestment]);

    return (
        <div className="min-h-screen p-3 sm:p-6 relative overflow-hidden font-mono text-slate-200 bg-gradient-to-br from-[#0a0e17] via-[#121a2d] to-[#0d1321]">
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

            <div className="relative max-w-7xl mx-auto">
                <Header warrantType={warrantType} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Panel de configuración */}
                    <div className="flex flex-col gap-4 sm:gap-5">
                        <WarrantTypeSelector value={warrantType} onChange={setWarrantType} />
                        <WarrantParamsCard
                            strike={strike} premium={premium} ratio={ratio} expiry={expiry} quantity={quantity}
                            volatility={volatility}
                            onStrikeChange={setStrike} onPremiumChange={setPremium} onRatioChange={setRatio}
                            onExpiryChange={setExpiry} onQuantityChange={setQuantity} onVolatilityChange={setVolatility}
                        />
                        <BondParamsCard
                            currentRate={currentRate} bondCoupon={bondCoupon} bondMaturity={bondMaturity}
                            faceValue={faceValue}
                            onCurrentRateChange={setCurrentRate} onBondCouponChange={setBondCoupon}
                            onBondMaturityChange={setBondMaturity} onFaceValueChange={setFaceValue}
                        />
                        <MarketParamsCard riskFreeRate={riskFreeRate} onRiskFreeRateChange={setRiskFreeRate} />
                        <CostsCard
                            spreadPercent={spreadPercent} commissionPercent={commissionPercent} commissionFixed={commissionFixed}
                            onSpreadChange={setSpreadPercent} onCommissionPercentChange={setCommissionPercent}
                            onCommissionFixedChange={setCommissionFixed}
                        />
                    </div>

                    {/* Panel de resultados */}
                    <div className="flex flex-col gap-4 sm:gap-5">
                        <ScenarioSimulator simulatedRate={simulatedRate} currentRate={currentRate} onChange={setSimulatedRate} />
                        <TimeSimulatorCard expiryYears={expiry} elapsedDays={elapsedDays} theta={theta} onElapsedDaysChange={setElapsedDays} />
                        <BondMetrics currentBondPrice={calculations.currentBondPrice} simulatedBondPrice={calculations.simulatedBondPrice} />
                        <BreakEvenDisplay breakEvenRate={breakEvenRate} currentRate={currentRate} warrantType={warrantType} />
                        <PnLResult
                            totalInvestment={adjustedPnL.totalInvestment}
                            simulatedPosition={adjustedPnL.simulatedPosition}
                            profitLoss={adjustedPnL.profitLoss}
                            profitLossPercent={adjustedPnL.profitLossPercent}
                        />
                        <PayoffChart data={payoffData} currentRate={currentRate} />
                        <TimeDecayChart data={timeDecayData} currentDay={elapsedDays} totalDays={totalDays} />
                    </div>
                </div>

                <BrokersFooter />
            </div>
        </div>
    );
}