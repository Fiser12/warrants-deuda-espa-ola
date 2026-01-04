import { renderHook } from '@testing-library/react';
import { useWarrantCalculations } from '../../hooks';
import { describe, it, expect } from 'vitest';

describe('useWarrantCalculations', () => {
    it('should calculate correct initial values for a PUT warrant', () => {
        const { result } = renderHook(() => useWarrantCalculations({
            warrantType: 'PUT',
            strike: 100,
            premium: 2.5,
            ratio: 0.1,
            expiry: 1.0,
            volatility: 0.15,
            quantity: 1000,
            currentRate: 3.5,
            bondCoupon: 3.0,
            bondMaturity: 10,
            simulatedRate: 3.0,
            riskFreeRate: 3.0,
            faceValue: 100,
        }));

        // Check if values are defined
        expect(result.current.currentBondPrice).toBeDefined();
        expect(result.current.simulatedBondPrice).toBeDefined();
        expect(result.current.simulatedWarrantValue).toBeDefined();
        expect(result.current.simulatedPosition).toBeDefined();

        // Basic calculation checks
        // At t=0, if simulatedRate (3.0%) < currentRate (3.5%), bond price should be higher in simulation (lower yield = higher price)
        // Wait, currentRate is market rate? currentBondPrice uses currentRate.
        // simulatedBondPrice uses simulatedRate.
        // Coupon 3.0% < current 3.5% -> Discount bond (price < face)
        expect(result.current.currentBondPrice).toBeLessThan(100);

        // Simulated 3.0% = Coupon 3.0% -> Par bond (price ~ 100)
        expect(result.current.simulatedBondPrice).toBeCloseTo(100, 1);
    });

    it('should calculate correct values for CALL warrant', () => {
        const { result } = renderHook(() => useWarrantCalculations({
            warrantType: 'CALL',
            strike: 100,
            premium: 2.5,
            ratio: 0.1,
            expiry: 1.0,
            volatility: 0.15,
            quantity: 1000,
            currentRate: 3.5,
            bondCoupon: 3.0,
            bondMaturity: 10,
            simulatedRate: 2.0, // Rates drop significantly
            riskFreeRate: 3.0,
            faceValue: 100,
        }));

        // Rate drops -> Bond Price Rises.
        // CALL on Bond Price (Strike 100).
        // Simulated Yield 2.0% (vs Coupon 3.0%) -> Bond > 100.
        // Bond Price should be > Strike (100). Call should be ITM.
        expect(result.current.simulatedBondPrice).toBeGreaterThan(100);

        // Call Value should include intrinsic value
        const intrinsic = (result.current.simulatedBondPrice - 100) * 0.1; // Ratio 0.1
        // Option price > intrinsic
        expect(result.current.simulatedWarrantValue).toBeGreaterThan(intrinsic);
    });

    it('should reflect Credit Spread impact', () => {
        // RiskFree 3.0% + Spread 0.5% = 3.5% Simulated
        const { result } = renderHook(() => useWarrantCalculations({
            warrantType: 'PUT',
            strike: 100,
            premium: 2.5,
            ratio: 0.1,
            expiry: 1.0,
            volatility: 0.15,
            quantity: 1000,
            currentRate: 3.5,
            bondCoupon: 3.0,
            bondMaturity: 10,
            simulatedRate: 3.5, // 3.0 + 0.5 spread
            riskFreeRate: 3.0,
            faceValue: 100,
        }));

        // Simulated Yield 3.5% > Coupon 3.0% -> Bond < 100
        expect(result.current.simulatedBondPrice).toBeLessThan(100);
    });
});
