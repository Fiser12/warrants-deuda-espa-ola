import { useMemo } from 'react';
import { calcBondPrice, calcWarrantValue } from '../lib/financial';
import type { WarrantType } from '../lib/types';

interface UseThetaParams {
    warrantType: WarrantType;
    faceValue: number;
    bondCoupon: number;
    currentRate: number;
    bondMaturity: number;
    strike: number;
    volatility: number;
    remainingYears: number;
    riskFreeRate: number;
    quantity: number;
    ratio: number;
}

export const useTheta = ({
    warrantType, faceValue, bondCoupon, currentRate, bondMaturity,
    strike, volatility, remainingYears, riskFreeRate, quantity, ratio,
}: UseThetaParams): number => {
    return useMemo(() => {
        const bondPrice = calcBondPrice(faceValue, bondCoupon / 100, currentRate / 100, bondMaturity);
        const isPut = warrantType === 'PUT';
        const valueNow = calcWarrantValue(bondPrice, strike, volatility, remainingYears, riskFreeRate / 100, isPut);
        const valueTomorrow = calcWarrantValue(bondPrice, strike, volatility, Math.max(0, remainingYears - 1 / 365), riskFreeRate / 100, isPut);
        return (valueTomorrow - valueNow) * quantity * ratio;
    }, [warrantType, faceValue, bondCoupon, currentRate, bondMaturity, strike, volatility, remainingYears, riskFreeRate, quantity, ratio]);
};
