import { useMemo } from 'react';

interface UseCostsParams {
    premium: number;
    quantity: number;
    ratio: number;
    spreadPercent: number;
    commissionPercent: number;
    commissionFixed: number;
}

interface CostsResult {
    spreadCost: number;
    commission: number;
    totalCosts: number;
    grossInvestment: number;
    netInvestment: number;
}

export const useCosts = ({
    premium, quantity, ratio, spreadPercent, commissionPercent, commissionFixed,
}: UseCostsParams): CostsResult => {
    return useMemo(() => {
        const grossInvestment = premium * quantity * ratio;
        const spreadCost = grossInvestment * (spreadPercent / 100);
        const commissionCalc = grossInvestment * (commissionPercent / 100);
        const commission = Math.max(commissionFixed, commissionCalc) * 2; // Entrada + salida
        const totalCosts = spreadCost + commission;

        return {
            spreadCost,
            commission,
            totalCosts,
            grossInvestment,
            netInvestment: grossInvestment + totalCosts,
        };
    }, [premium, quantity, ratio, spreadPercent, commissionPercent, commissionFixed]);
};
