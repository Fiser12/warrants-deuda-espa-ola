import { useState, useMemo, useCallback } from 'react';
import type { WarrantType, SimulatorInput, SimulatorOutput, SavedOperation } from '../lib/types';
import { runSimulation } from '../lib/simulator';
import {
    useWarrantCalculations,
    usePayoffData,
    useTimeDecayData,
    useCosts,
    useTheta,
    useBreakEven,
} from './index';

export function useSimulationState() {
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
    const [creditSpread, setCreditSpread] = useState(50); // bps

    // Derived simulation value
    const simulatedRate = riskFreeRate + (creditSpread / 100);

    // Time simulation
    const [elapsedDays, setElapsedDays] = useState(0);

    // Costs
    const [spreadPercent, setSpreadPercent] = useState(2.0);
    const [commissionPercent, setCommissionPercent] = useState(0.15);
    const [commissionFixed, setCommissionFixed] = useState(5);

    // Derived values
    const totalDays = Math.round(expiry * 365);
    const remainingYears = Math.max(0, (totalDays - elapsedDays) / 365);

    // Build input for export
    const currentInput: SimulatorInput = useMemo(() => ({
        warrant: { type: warrantType, strike, premium, ratio, expiry, volatility, quantity },
        bond: { coupon: bondCoupon, maturity: bondMaturity, currentRate, faceValue },
        market: { riskFreeRate, simulatedRate },
        costs: { spreadPercent, commissionPercent, commissionFixed },
        time: { elapsedDays },
    }), [warrantType, strike, premium, ratio, expiry, volatility, quantity, bondCoupon, bondMaturity, currentRate, faceValue, riskFreeRate, simulatedRate, spreadPercent, commissionPercent, commissionFixed, elapsedDays]);

    // Run simulation for export
    const currentOutput: SimulatorOutput = useMemo(() => runSimulation(currentInput), [currentInput]);

    // Import handler (for header menu or loading operations)
    const loadFromInput = useCallback((input: SimulatorInput) => {
        setWarrantType(input.warrant.type);
        setStrike(input.warrant.strike);
        setPremium(input.warrant.premium);
        setRatio(input.warrant.ratio);
        setExpiry(input.warrant.expiry);
        setVolatility(input.warrant.volatility);
        setQuantity(input.warrant.quantity);
        setBondCoupon(input.bond.coupon);
        setBondMaturity(input.bond.maturity);
        setCurrentRate(input.bond.currentRate);
        setFaceValue(input.bond.faceValue);
        setRiskFreeRate(input.market.riskFreeRate);

        const derivedSpread = Math.max(0, Math.round((input.market.simulatedRate - input.market.riskFreeRate) * 100));
        setCreditSpread(derivedSpread);

        setSpreadPercent(input.costs.spreadPercent);
        setCommissionPercent(input.costs.commissionPercent);
        setCommissionFixed(input.costs.commissionFixed);
        setElapsedDays(input.time.elapsedDays);
    }, []);

    // Hooks (for UI reactivity)
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

    return {
        // State
        warrantType, setWarrantType,
        strike, setStrike,
        premium, setPremium,
        ratio, setRatio,
        expiry, setExpiry,
        volatility, setVolatility,
        quantity, setQuantity,

        currentRate, setCurrentRate,
        bondCoupon, setBondCoupon,
        bondMaturity, setBondMaturity,
        faceValue, setFaceValue,

        riskFreeRate, setRiskFreeRate,
        creditSpread, setCreditSpread,
        simulatedRate,

        elapsedDays, setElapsedDays,

        spreadPercent, setSpreadPercent,
        commissionPercent, setCommissionPercent,
        commissionFixed, setCommissionFixed,

        // Derived
        currentInput,
        currentOutput,
        totalDays,
        remainingYears,

        // Calculated Data
        costs,
        theta,
        breakEvenRate,
        calculations,
        payoffData,
        timeDecayData,
        adjustedPnL,

        // Actions
        loadFromInput
    };
}
