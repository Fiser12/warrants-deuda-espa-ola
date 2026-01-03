import { useMemo } from 'react';
import { calcBondPrice, calcWarrantValue } from '../lib/financial';
import type { WarrantType } from '../lib/types';

interface TimeDecayDataPoint {
    day: number;
    remainingDays: number;
    warrantValue: number;
    intrinsicValue: number;
    timeValue: number;
}

interface UseTimeDecayDataParams {
    warrantType: WarrantType;
    strike: number;
    volatility: number;
    expiryYears: number;
    riskFreeRate: number;
    currentRate: number;
    bondCoupon: number;
    bondMaturity: number;
    faceValue: number;
}

export const useTimeDecayData = ({
    warrantType, strike, volatility, expiryYears, riskFreeRate,
    currentRate, bondCoupon, bondMaturity, faceValue,
}: UseTimeDecayDataParams): TimeDecayDataPoint[] => {
    return useMemo(() => {
        const data: TimeDecayDataPoint[] = [];
        const isPut = warrantType === 'PUT';
        const totalDays = Math.round(expiryYears * 365);

        // Calcular precio del bono actual
        const bondPrice = calcBondPrice(faceValue, bondCoupon / 100, currentRate / 100, bondMaturity);

        // Valor intrínseco (constante, no depende del tiempo)
        const intrinsicValue = isPut
            ? Math.max(0, strike - bondPrice)
            : Math.max(0, bondPrice - strike);

        // Generar puntos cada ciertos días
        const step = Math.max(1, Math.floor(totalDays / 50));

        for (let day = 0; day <= totalDays; day += step) {
            const remainingDays = totalDays - day;
            const remainingYears = remainingDays / 365;

            // Calcular valor del warrant con el tiempo restante
            const warrantValue = calcWarrantValue(
                bondPrice, strike, volatility, remainingYears, riskFreeRate / 100, isPut
            );

            const timeValue = Math.max(0, warrantValue - intrinsicValue);

            data.push({
                day,
                remainingDays,
                warrantValue,
                intrinsicValue,
                timeValue,
            });
        }

        // Asegurar que incluimos el último día
        if (data[data.length - 1]?.day !== totalDays) {
            const warrantValue = intrinsicValue; // Al vencimiento solo queda valor intrínseco
            data.push({
                day: totalDays,
                remainingDays: 0,
                warrantValue,
                intrinsicValue,
                timeValue: 0,
            });
        }

        return data;
    }, [warrantType, strike, volatility, expiryYears, riskFreeRate, currentRate, bondCoupon, bondMaturity, faceValue]);
};
