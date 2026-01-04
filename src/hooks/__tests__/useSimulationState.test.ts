import { renderHook, act } from '@testing-library/react';
import { useSimulationState } from '../../hooks';
import { describe, it, expect } from 'vitest';

describe('useSimulationState', () => {
    it('should initialize with default values', () => {
        const { result } = renderHook(() => useSimulationState());

        expect(result.current.warrantType).toBe('PUT');
        expect(result.current.strike).toBe(100);
        expect(result.current.riskFreeRate).toBe(3.0);
        expect(result.current.creditSpread).toBe(50);

        // Check derived simulated rate (3.0% + 50bps = 3.5%)
        expect(result.current.simulatedRate).toBe(3.5);
    });

    it('should update state and recalculate derived values', () => {
        const { result } = renderHook(() => useSimulationState());

        // Update RiskFree Rate
        act(() => {
            result.current.setRiskFreeRate(2.0);
        });
        expect(result.current.riskFreeRate).toBe(2.0);
        // Simulated: 2.0% + 50bps = 2.5%
        expect(result.current.simulatedRate).toBe(2.5);

        // Update Credit Spread
        act(() => {
            result.current.setCreditSpread(100); // 1.0%
        });
        expect(result.current.creditSpread).toBe(100);
        // Simulated: 2.0% + 1.0% = 3.0%
        expect(result.current.simulatedRate).toBe(3.0);
    });

    it('should integrate with hook calculations', () => {
        const { result } = renderHook(() => useSimulationState());

        // With default PUT, Strike 100, Bond Coupon 3.0, Maturity 10Y
        // Simulated Rate 3.5% (Risk 3.0 + Spread 0.5)
        // Check that calculations are populated
        expect(result.current.calculations).toBeDefined();
        // Since Simulated (3.5%) > Coupon (3.0%), Bond Price < 100
        expect(result.current.calculations.simulatedBondPrice).toBeLessThan(100);
    });

    it('should handle loadFromInput correctly', () => {
        const { result } = renderHook(() => useSimulationState());

        const mockInput = {
            warrant: { type: 'CALL', strike: 120, premium: 3.0, ratio: 0.2, expiry: 2, volatility: 0.2, quantity: 500 },
            bond: { coupon: 4.0, maturity: 5, currentRate: 4.5, faceValue: 100 },
            market: { riskFreeRate: 1.5, simulatedRate: 2.0 }, // Spread 0.5% (50bps)
            costs: { spreadPercent: 1.0, commissionPercent: 0.1, commissionFixed: 2 },
            time: { elapsedDays: 10 }
        };

        act(() => {
            // @ts-ignore - Minimal mock input
            result.current.loadFromInput(mockInput);
        });

        expect(result.current.warrantType).toBe('CALL');
        expect(result.current.strike).toBe(120);
        expect(result.current.riskFreeRate).toBe(1.5);
        expect(result.current.expiry).toBe(2);

        // Assert derived credit spread
        // Simulated 2.0 - RiskFree 1.5 = 0.5 = 50bps
        expect(result.current.creditSpread).toBe(50);
    });
});
