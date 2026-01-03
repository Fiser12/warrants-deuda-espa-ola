import { useMemo } from 'react';
import { calcBondPrice, calcWarrantValue } from '../lib/financial';
import type { WarrantType } from '../lib/types';

interface UseBreakEvenParams {
    warrantType: WarrantType;
    premium: number;
    quantity: number;
    ratio: number;
    totalCosts: number;
    faceValue: number;
    bondCoupon: number;
    bondMaturity: number;
    strike: number;
    volatility: number;
    remainingYears: number;
    riskFreeRate: number;
}

export const useBreakEven = ({
    warrantType, premium, quantity, ratio, totalCosts,
    faceValue, bondCoupon, bondMaturity, strike, volatility, remainingYears, riskFreeRate,
}: UseBreakEvenParams): number | null => {
    return useMemo(() => {
        const investment = premium * quantity * ratio + totalCosts;
        const isPut = warrantType === 'PUT';

        // Buscar punto de break-even iterando sobre tipos
        // Para PUT: buscamos tipos más altos (precio baja)
        // Para CALL: buscamos tipos más bajos (precio sube)
        const start = isPut ? 0.5 : 10;
        const end = isPut ? 10 : 0.5;
        const step = isPut ? 0.01 : -0.01;

        for (let rate = start; isPut ? rate <= end : rate >= end; rate += step) {
            const bondPrice = calcBondPrice(faceValue, bondCoupon / 100, rate / 100, bondMaturity);
            const warrantValue = calcWarrantValue(bondPrice, strike, volatility, remainingYears, riskFreeRate / 100, isPut);
            const position = warrantValue * quantity * ratio;

            if (position >= investment) {
                return rate;
            }
        }

        return null;
    }, [warrantType, premium, quantity, ratio, totalCosts, faceValue, bondCoupon, bondMaturity, strike, volatility, remainingYears, riskFreeRate]);
};
