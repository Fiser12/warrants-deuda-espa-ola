import { describe, it, expect } from 'vitest';
import { normCDF, calcBondPrice, calcWarrantValue, calcGreeks, calcDuration, normPDF } from '../financial';

describe('financial.ts - Core Functions', () => {
    // ============================================
    // normCDF Tests
    // ============================================
    describe('normCDF', () => {
        it('should return 0.5 for x = 0', () => {
            expect(normCDF(0)).toBeCloseTo(0.5, 4);
        });

        it('should return ~0.8413 for x = 1', () => {
            expect(normCDF(1)).toBeCloseTo(0.8413, 3);
        });

        it('should return ~0.1587 for x = -1', () => {
            expect(normCDF(-1)).toBeCloseTo(0.1587, 3);
        });

        it('should return ~0.9772 for x = 2', () => {
            expect(normCDF(2)).toBeCloseTo(0.9772, 3);
        });

        it('should be symmetric: N(x) + N(-x) = 1', () => {
            const x = 1.5;
            expect(normCDF(x) + normCDF(-x)).toBeCloseTo(1, 4);
        });
    });

    // ============================================
    // calcBondPrice Tests
    // ============================================
    describe('calcBondPrice', () => {
        it('par bond: price = face value when coupon = yield', () => {
            const price = calcBondPrice(100, 0.05, 0.05, 10);
            expect(price).toBeCloseTo(100, 1);
        });

        it('discount bond: price < face value when coupon < yield', () => {
            const price = calcBondPrice(100, 0.03, 0.05, 10);
            expect(price).toBeLessThan(100);
        });

        it('premium bond: price > face value when coupon > yield', () => {
            const price = calcBondPrice(100, 0.07, 0.04, 10);
            expect(price).toBeGreaterThan(100);
        });

        it('short maturity reduces price sensitivity', () => {
            const short = calcBondPrice(100, 0.03, 0.05, 2);
            const long = calcBondPrice(100, 0.03, 0.05, 20);

            // Both are discount bonds, but long is more discounted
            expect(short).toBeGreaterThan(long);
        });

        it('zero yield results in high bond price', () => {
            const price = calcBondPrice(100, 0.03, 0.001, 10);
            expect(price).toBeGreaterThan(120); // Sum of all undiscounted coupons + face
        });

        it('should handle 1-year maturity', () => {
            const price = calcBondPrice(100, 0.05, 0.05, 1);
            // Only 1 coupon of 5 + face 100, discounted 1 year at 5%
            // PV = (5 + 100) / 1.05 = 100
            expect(price).toBeCloseTo(100, 1);
        });

        it('specific calculation: known values', () => {
            // 10-year bond, 4% coupon, 5% yield, 100 face
            // Expected price ~ 92.28 (approx)
            const price = calcBondPrice(100, 0.04, 0.05, 10);
            expect(price).toBeCloseTo(92.28, 0);
        });
    });

    // ============================================
    // calcWarrantValue Tests (Black-Scholes)
    // ============================================
    describe('calcWarrantValue', () => {
        it('CALL: ATM option has time value', () => {
            const value = calcWarrantValue(100, 100, 0.2, 1, 0.05, false);
            expect(value).toBeGreaterThan(0);
        });

        it('PUT: ATM option has time value', () => {
            const value = calcWarrantValue(100, 100, 0.2, 1, 0.05, true);
            expect(value).toBeGreaterThan(0);
        });

        it('CALL: ITM option value >= intrinsic', () => {
            const value = calcWarrantValue(120, 100, 0.2, 1, 0.05, false);
            expect(value).toBeGreaterThanOrEqual(20); // intrinsic = 120-100
        });

        it('PUT: ITM option has significant value', () => {
            const value = calcWarrantValue(80, 100, 0.2, 1, 0.05, true);
            // Deep ITM put has high value (intrinsic ~20, but discounted by time/rate)
            expect(value).toBeGreaterThan(15);
        });

        it('CALL: deep OTM has low value', () => {
            const value = calcWarrantValue(50, 100, 0.2, 0.25, 0.05, false);
            expect(value).toBeLessThan(0.1);
        });

        it('PUT: deep OTM has low value', () => {
            const value = calcWarrantValue(150, 100, 0.2, 0.25, 0.05, true);
            expect(value).toBeLessThan(0.1);
        });

        it('higher volatility = higher option value', () => {
            const lowVol = calcWarrantValue(100, 100, 0.1, 1, 0.05, false);
            const highVol = calcWarrantValue(100, 100, 0.4, 1, 0.05, false);
            expect(highVol).toBeGreaterThan(lowVol);
        });

        it('longer expiry = higher option value', () => {
            const short = calcWarrantValue(100, 100, 0.2, 0.25, 0.05, false);
            const long = calcWarrantValue(100, 100, 0.2, 2, 0.05, false);
            expect(long).toBeGreaterThan(short);
        });

        it('at expiry (T=0), value = intrinsic', () => {
            // ITM PUT
            const putValue = calcWarrantValue(80, 100, 0.2, 0, 0.05, true);
            expect(putValue).toBeCloseTo(20, 2);

            // OTM PUT
            const otmPut = calcWarrantValue(120, 100, 0.2, 0, 0.05, true);
            expect(otmPut).toBe(0);

            // ITM CALL
            const callValue = calcWarrantValue(120, 100, 0.2, 0, 0.05, false);
            expect(callValue).toBeCloseTo(20, 2);
        });

        it('put-call parity holds approximately', () => {
            const S = 100, K = 100, r = 0.05, T = 1, vol = 0.2;
            const callValue = calcWarrantValue(S, K, vol, T, r, false);
            const putValue = calcWarrantValue(S, K, vol, T, r, true);

            // C - P = S - K*e^(-rT)
            const expected = S - K * Math.exp(-r * T);
            expect(callValue - putValue).toBeCloseTo(expected, 1);
        });
    });

    // ============================================
    // calcGreeks Tests
    // ============================================
    describe('calcGreeks', () => {
        it('CALL delta is between 0 and 1', () => {
            const greeks = calcGreeks(100, 100, 0.2, 1, 0.05, false);
            expect(greeks.delta).toBeGreaterThan(0);
            expect(greeks.delta).toBeLessThan(1);
        });

        it('PUT delta is between -1 and 0', () => {
            const greeks = calcGreeks(100, 100, 0.2, 1, 0.05, true);
            expect(greeks.delta).toBeLessThan(0);
            expect(greeks.delta).toBeGreaterThan(-1);
        });

        it('gamma is always positive', () => {
            const callGreeks = calcGreeks(100, 100, 0.2, 1, 0.05, false);
            const putGreeks = calcGreeks(100, 100, 0.2, 1, 0.05, true);
            expect(callGreeks.gamma).toBeGreaterThan(0);
            expect(putGreeks.gamma).toBeGreaterThan(0);
        });

        it('vega is always positive', () => {
            const greeks = calcGreeks(100, 100, 0.2, 1, 0.05, false);
            expect(greeks.vega).toBeGreaterThan(0);
        });

        it('ATM options have highest gamma', () => {
            const itm = calcGreeks(120, 100, 0.2, 1, 0.05, false);
            const atm = calcGreeks(100, 100, 0.2, 1, 0.05, false);
            const otm = calcGreeks(80, 100, 0.2, 1, 0.05, false);

            expect(atm.gamma).toBeGreaterThan(itm.gamma);
            expect(atm.gamma).toBeGreaterThan(otm.gamma);
        });

        it('theta is returned per day (small value)', () => {
            const greeks = calcGreeks(100, 100, 0.2, 1, 0.05, false);
            // Theta per day should be small relative to option value
            expect(Math.abs(greeks.theta)).toBeLessThan(1);
        });

        it('expired options have zero greeks', () => {
            const greeks = calcGreeks(100, 100, 0.2, 0, 0.05, false);
            expect(greeks.delta).toBe(0);
            expect(greeks.gamma).toBe(0);
            expect(greeks.vega).toBe(0);
            expect(greeks.theta).toBe(0);
            expect(greeks.rho).toBe(0);
        });
    });

    // ============================================
    // calcDuration Tests
    // ============================================
    describe('calcDuration', () => {
        it('should return approximate duration', () => {
            expect(calcDuration(10)).toBe(8.5);
            expect(calcDuration(5)).toBe(4.25);
            expect(calcDuration(30)).toBe(25.5);
        });
    });

    // ============================================
    // normPDF Tests
    // ============================================
    describe('normPDF', () => {
        it('should return max value at x = 0', () => {
            const atZero = normPDF(0);
            const atOne = normPDF(1);
            expect(atZero).toBeGreaterThan(atOne);
        });

        it('should be symmetric', () => {
            expect(normPDF(1)).toBeCloseTo(normPDF(-1), 6);
            expect(normPDF(2)).toBeCloseTo(normPDF(-2), 6);
        });

        it('should return ~0.3989 at x = 0', () => {
            expect(normPDF(0)).toBeCloseTo(0.3989, 3);
        });
    });
});
