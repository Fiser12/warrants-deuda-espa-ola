import { describe, it, expect } from 'vitest';
import { runSimulation, createDefaultInput, validateInput } from '../simulator';

describe('runSimulation - Core Functionality', () => {
    // ============================================
    // 1. BOND PRICING TESTS
    // ============================================
    describe('Bond Pricing', () => {
        it('should price a par bond correctly (coupon = yield)', () => {
            const input = createDefaultInput();
            input.bond.coupon = 3.0;
            input.bond.currentRate = 3.0;
            input.bond.faceValue = 100;
            input.bond.maturity = 10;

            const output = runSimulation(input);
            // Par bond (coupon == yield) should trade at face value
            expect(output.calculations.currentBondPrice).toBeCloseTo(100, 0);
        });

        it('should price a discount bond correctly (coupon < yield)', () => {
            const input = createDefaultInput();
            input.bond.coupon = 2.0;  // 2% coupon
            input.bond.currentRate = 4.0; // 4% yield
            input.bond.faceValue = 100;
            input.bond.maturity = 10;

            const output = runSimulation(input);
            // If yield > coupon, bond trades at discount
            expect(output.calculations.currentBondPrice).toBeLessThan(100);
        });

        it('should price a premium bond correctly (coupon > yield)', () => {
            const input = createDefaultInput();
            input.bond.coupon = 5.0;  // 5% coupon
            input.bond.currentRate = 2.0; // 2% yield
            input.bond.faceValue = 100;
            input.bond.maturity = 10;

            const output = runSimulation(input);
            // If coupon > yield, bond trades at premium
            expect(output.calculations.currentBondPrice).toBeGreaterThan(100);
        });

        it('should show bond price sensitivity to maturity', () => {
            const shortMaturity = createDefaultInput();
            shortMaturity.bond.maturity = 2;
            shortMaturity.bond.coupon = 3.0;
            shortMaturity.bond.currentRate = 5.0;

            const longMaturity = createDefaultInput();
            longMaturity.bond.maturity = 20;
            longMaturity.bond.coupon = 3.0;
            longMaturity.bond.currentRate = 5.0;

            const shortResult = runSimulation(shortMaturity);
            const longResult = runSimulation(longMaturity);

            // Longer maturity = more price sensitivity = lower price at discount
            expect(longResult.calculations.currentBondPrice).toBeLessThan(
                shortResult.calculations.currentBondPrice
            );
        });
    });

    // ============================================
    // 2. PUT WARRANT SCENARIOS
    // ============================================
    describe('PUT Warrant Scenarios', () => {
        it('PUT: should profit when rates rise significantly', () => {
            const input = createDefaultInput();
            input.warrant.type = 'PUT';
            input.warrant.strike = 100;
            input.bond.coupon = 3.0;
            input.bond.currentRate = 3.0;
            input.market.simulatedRate = 6.0; // Rates rise 300bps!

            const output = runSimulation(input);

            // Rising rates = falling bond prices = PUT is ITM
            expect(output.calculations.simulatedBondPrice).toBeLessThan(100);
            expect(output.calculations.intrinsicValue).toBeGreaterThan(0);
            expect(output.adjustedPnL.profitLoss).toBeGreaterThan(0);
        });

        it('PUT: should lose when rates fall', () => {
            const input = createDefaultInput();
            input.warrant.type = 'PUT';
            input.warrant.strike = 100;
            input.bond.coupon = 3.0;
            input.bond.currentRate = 3.0;
            input.market.simulatedRate = 1.5; // Rates fall

            const output = runSimulation(input);

            // Falling rates = rising bond prices = PUT is OTM
            expect(output.calculations.simulatedBondPrice).toBeGreaterThan(100);
            expect(output.calculations.intrinsicValue).toBe(0);
        });

        it('PUT: Deep ITM scenario (crisis simulation)', () => {
            const input = createDefaultInput();
            input.warrant.type = 'PUT';
            input.warrant.strike = 100;
            input.warrant.quantity = 1000;
            input.bond.coupon = 3.0;
            input.bond.currentRate = 3.0;
            input.market.simulatedRate = 10.0; // Sovereign debt crisis!

            const output = runSimulation(input);

            // Extreme rate rise = massive bond depreciation
            expect(output.calculations.simulatedBondPrice).toBeLessThan(60);
            expect(output.calculations.intrinsicValue).toBeGreaterThan(30);
            expect(output.adjustedPnL.profitLossPercent).toBeGreaterThan(100);
        });
    });

    // ============================================
    // 3. CALL WARRANT SCENARIOS
    // ============================================
    describe('CALL Warrant Scenarios', () => {
        it('CALL: should profit when rates fall significantly', () => {
            const input = createDefaultInput();
            input.warrant.type = 'CALL';
            input.warrant.strike = 100;
            input.bond.coupon = 3.0;
            input.bond.currentRate = 4.0;
            input.market.simulatedRate = 1.5; // ECB cuts rates

            const output = runSimulation(input);

            // Falling rates = rising bond prices = CALL is ITM
            expect(output.calculations.simulatedBondPrice).toBeGreaterThan(100);
            expect(output.calculations.intrinsicValue).toBeGreaterThan(0);
            expect(output.adjustedPnL.profitLoss).toBeGreaterThan(0);
        });

        it('CALL: should lose when rates rise', () => {
            const input = createDefaultInput();
            input.warrant.type = 'CALL';
            input.warrant.strike = 100;
            input.bond.coupon = 3.0;
            input.bond.currentRate = 3.0;
            input.market.simulatedRate = 5.0; // Rates rise

            const output = runSimulation(input);

            // Rising rates = falling bond prices = CALL is OTM
            expect(output.calculations.simulatedBondPrice).toBeLessThan(100);
            expect(output.calculations.intrinsicValue).toBe(0);
        });

        it('CALL: Deep ITM with rate cuts (QE scenario)', () => {
            const input = createDefaultInput();
            input.warrant.type = 'CALL';
            input.warrant.strike = 100;
            input.bond.coupon = 3.0;
            input.bond.currentRate = 3.0;
            input.market.simulatedRate = 0.5; // Near-zero rate policy

            const output = runSimulation(input);

            expect(output.calculations.simulatedBondPrice).toBeGreaterThan(120);
            expect(output.calculations.intrinsicValue).toBeGreaterThan(20);
        });
    });

    // ============================================
    // 4. CREDIT SPREAD IMPACT
    // ============================================
    describe('Credit Spread Impact', () => {
        it('should show widening spread reduces bond price', () => {
            const baseCase = createDefaultInput();
            baseCase.market.riskFreeRate = 2.0;
            baseCase.market.simulatedRate = 2.0; // No spread

            const spreadCase = createDefaultInput();
            spreadCase.market.riskFreeRate = 2.0;
            spreadCase.market.simulatedRate = 4.0; // 200bps spread

            const baseResult = runSimulation(baseCase);
            const spreadResult = runSimulation(spreadCase);

            expect(spreadResult.calculations.simulatedBondPrice).toBeLessThan(
                baseResult.calculations.simulatedBondPrice
            );
        });

        it('PUT benefits from spread widening (sovereign crisis)', () => {
            const input = createDefaultInput();
            input.warrant.type = 'PUT';
            input.warrant.strike = 100;
            input.market.riskFreeRate = 2.0;
            input.market.simulatedRate = 5.0; // RiskFree 2% + Spread 3%

            const output = runSimulation(input);

            expect(output.adjustedPnL.profitLoss).toBeGreaterThan(0);
        });
    });

    // ============================================
    // 5. TIME DECAY (THETA)
    // ============================================
    describe('Time Decay', () => {
        it('warrant value should decrease as time passes', () => {
            const day0 = createDefaultInput();
            day0.time.elapsedDays = 0;

            const day180 = createDefaultInput();
            day180.time.elapsedDays = 180;

            const result0 = runSimulation(day0);
            const result180 = runSimulation(day180);

            // Time value decreases -> warrant value decreases
            expect(result180.calculations.currentWarrantValue).toBeLessThan(
                result0.calculations.currentWarrantValue
            );
        });

        it('theta should be negative (time decay)', () => {
            const input = createDefaultInput();
            const output = runSimulation(input);

            // Theta represents daily loss of value
            expect(output.theta).toBeLessThan(0);
        });

        it('at expiry, warrant equals intrinsic value only', () => {
            const input = createDefaultInput();
            input.warrant.expiry = 1; // 1 year
            input.time.elapsedDays = 365; // Fully elapsed

            const output = runSimulation(input);

            // At expiry, remaining time = 0
            expect(output.remainingDays).toBe(0);
            expect(output.remainingYears).toBe(0);
        });
    });

    // ============================================
    // 6. GREEKS VALIDATION
    // ============================================
    describe('Greeks', () => {
        it('PUT delta should be negative', () => {
            const input = createDefaultInput();
            input.warrant.type = 'PUT';

            const output = runSimulation(input);

            expect(output.greeks.delta).toBeLessThan(0);
        });

        it('CALL delta should be positive', () => {
            const input = createDefaultInput();
            input.warrant.type = 'CALL';

            const output = runSimulation(input);

            expect(output.greeks.delta).toBeGreaterThan(0);
        });

        it('gamma should always be positive', () => {
            const putInput = createDefaultInput();
            putInput.warrant.type = 'PUT';

            const callInput = createDefaultInput();
            callInput.warrant.type = 'CALL';

            expect(runSimulation(putInput).greeks.gamma).toBeGreaterThan(0);
            expect(runSimulation(callInput).greeks.gamma).toBeGreaterThan(0);
        });

        it('higher volatility = higher vega', () => {
            const lowVol = createDefaultInput();
            lowVol.warrant.volatility = 0.10;

            const highVol = createDefaultInput();
            highVol.warrant.volatility = 0.30;

            // While vega itself depends on volatility in the formula,
            // the absolute option value should be higher with more vol
            const lowResult = runSimulation(lowVol);
            const highResult = runSimulation(highVol);

            expect(highResult.calculations.currentWarrantValue).toBeGreaterThan(
                lowResult.calculations.currentWarrantValue
            );
        });
    });

    // ============================================
    // 7. COST CALCULATIONS
    // ============================================
    describe('Cost Calculations', () => {
        it('should calculate spread cost correctly', () => {
            const input = createDefaultInput();
            input.warrant.premium = 2.0;
            input.warrant.quantity = 1000;
            input.warrant.ratio = 0.1;
            input.costs.spreadPercent = 2.0;

            const output = runSimulation(input);

            // grossInvestment = 2.0 * 1000 * 0.1 = 200
            // spreadCost = 200 * 0.02 = 4
            expect(output.costs.grossInvestment).toBe(200);
            expect(output.costs.spreadCost).toBe(4);
        });

        it('should use fixed commission when higher than percentage', () => {
            const input = createDefaultInput();
            input.warrant.premium = 1.0;
            input.warrant.quantity = 100;
            input.warrant.ratio = 0.1;
            input.costs.commissionPercent = 0.15;
            input.costs.commissionFixed = 5;

            const output = runSimulation(input);

            // grossInvestment = 1 * 100 * 0.1 = 10
            // commissionCalc = 10 * 0.0015 = 0.015
            // commission = max(5, 0.015) * 2 = 10
            expect(output.costs.commission).toBe(10);
        });
    });

    // ============================================
    // 8. BREAK-EVEN RATE
    // ============================================
    describe('Break-Even Rate', () => {
        it('should calculate break-even for PUT', () => {
            const input = createDefaultInput();
            input.warrant.type = 'PUT';
            input.warrant.strike = 100;

            const output = runSimulation(input);

            // Break-even should exist for reasonable inputs
            expect(output.breakEvenRate).not.toBeNull();
            expect(output.breakEvenRate).toBeGreaterThan(0);
        });

        it('should calculate break-even for CALL', () => {
            const input = createDefaultInput();
            input.warrant.type = 'CALL';
            input.warrant.strike = 100;

            const output = runSimulation(input);

            // Break-even should exist and be a reasonable rate
            // (Note: CALL break-even search goes from 10% down)
            expect(output.breakEvenRate).not.toBeNull();
            if (output.breakEvenRate !== null) {
                expect(output.breakEvenRate).toBeGreaterThan(0);
                expect(output.breakEvenRate).toBeLessThan(10);
            }
        });
    });

    // ============================================
    // 9. EDGE CASES
    // ============================================
    describe('Edge Cases', () => {
        it('should handle zero volatility gracefully', () => {
            const input = createDefaultInput();
            input.warrant.volatility = 0.001; // Near-zero

            expect(() => runSimulation(input)).not.toThrow();
        });

        it('should handle very long maturity', () => {
            const input = createDefaultInput();
            input.bond.maturity = 30;
            input.warrant.expiry = 2;

            expect(() => runSimulation(input)).not.toThrow();
        });

        it('should handle negative rates', () => {
            const input = createDefaultInput();
            input.market.simulatedRate = -0.5; // Negative yield

            const output = runSimulation(input);

            // Negative yield = very high bond price
            expect(output.calculations.simulatedBondPrice).toBeGreaterThan(100);
        });
    });

    // ============================================
    // 10. INPUT VALIDATION 
    // ============================================
    describe('Input Validation', () => {
        it('validateInput should accept valid input', () => {
            const input = createDefaultInput();
            expect(validateInput(input)).toBe(true);
        });

        it('validateInput should reject invalid input', () => {
            expect(validateInput(null)).toBe(false);
            expect(validateInput({})).toBe(false);
            expect(validateInput({ warrant: {} })).toBe(false);
        });
    });
});

// ============================================
// PARAMETRIC TESTS - MULTIPLE SCENARIOS
// ============================================
describe('runSimulation - Parametric Scenarios', () => {
    const rateScenarios = [
        { name: 'Extreme Crisis', simulatedRate: 12.0, expectedPutProfit: true },
        { name: 'Moderate Rise', simulatedRate: 5.0, expectedPutProfit: true },
        { name: 'Rate Cut', simulatedRate: 2.0, expectedPutProfit: false },
        { name: 'QE Program', simulatedRate: 0.5, expectedPutProfit: false },
    ];

    rateScenarios.forEach(({ name, simulatedRate, expectedPutProfit }) => {
        it(`PUT Scenario: ${name} (simulated ${simulatedRate}%)`, () => {
            const input = createDefaultInput();
            input.warrant.type = 'PUT';
            input.bond.currentRate = 3.5;
            input.market.simulatedRate = simulatedRate;

            const output = runSimulation(input);

            if (expectedPutProfit) {
                expect(output.adjustedPnL.profitLoss).toBeGreaterThan(0);
            } else {
                expect(output.adjustedPnL.profitLoss).toBeLessThanOrEqual(0);
            }
        });
    });

    const strikeScenarios = [80, 90, 100, 110, 120];

    strikeScenarios.forEach(strike => {
        it(`Strike ${strike}: PUT intrinsic value calculation`, () => {
            const input = createDefaultInput();
            input.warrant.type = 'PUT';
            input.warrant.strike = strike;
            input.market.simulatedRate = 5.0;

            const output = runSimulation(input);

            const expected = Math.max(0, strike - output.calculations.simulatedBondPrice);
            expect(output.calculations.intrinsicValue).toBeCloseTo(expected, 2);
        });
    });
});

// ============================================
// FINANCIAL SANITY CHECKS
// These tests ensure the simulator doesn't produce economically absurd results
// ============================================
describe('runSimulation - Financial Sanity Checks', () => {
    // ============================================
    // CRITICAL: PUT must NOT profit when rates fall
    // ============================================
    describe('PUT Logic Consistency', () => {
        it('❌ PUT must NOT profit when rates fall (would be economically absurd)', () => {
            const input = createDefaultInput();
            input.warrant.type = 'PUT';
            input.warrant.strike = 100;
            input.warrant.premium = 2.5;
            input.bond.coupon = 3.0;
            input.bond.currentRate = 3.5;
            input.market.simulatedRate = 1.0; // RATES FALL SIGNIFICANTLY

            const output = runSimulation(input);

            // When rates fall:
            // 1. Bond price rises above strike (100)
            // 2. PUT intrinsic value should be ZERO
            // 3. PUT holder should LOSE money (premium paid)
            expect(output.calculations.simulatedBondPrice).toBeGreaterThan(100);
            expect(output.calculations.intrinsicValue).toBe(0);
            expect(output.adjustedPnL.profitLoss).toBeLessThan(0);
        });

        it('❌ PUT must NOT have positive intrinsic when bond price > strike', () => {
            const input = createDefaultInput();
            input.warrant.type = 'PUT';
            input.warrant.strike = 100;
            input.market.simulatedRate = 0.5; // Very low rates = high bond price

            const output = runSimulation(input);

            // Bond price > Strike → PUT intrinsic = 0
            expect(output.calculations.simulatedBondPrice).toBeGreaterThan(100);
            expect(output.calculations.intrinsicValue).toBe(0);
        });

        it('✅ PUT intrinsic = Strike - BondPrice when ITM', () => {
            const input = createDefaultInput();
            input.warrant.type = 'PUT';
            input.warrant.strike = 100;
            input.market.simulatedRate = 7.0; // High rates = low bond price

            const output = runSimulation(input);

            // Intrinsic = max(0, K - S)
            const expectedIntrinsic = Math.max(0, 100 - output.calculations.simulatedBondPrice);
            expect(output.calculations.intrinsicValue).toBeCloseTo(expectedIntrinsic, 2);
        });
    });

    // ============================================
    // CRITICAL: CALL must NOT profit when rates rise
    // ============================================
    describe('CALL Logic Consistency', () => {
        it('❌ CALL must NOT profit when rates rise (would be economically absurd)', () => {
            const input = createDefaultInput();
            input.warrant.type = 'CALL';
            input.warrant.strike = 100;
            input.warrant.premium = 2.5;
            input.bond.coupon = 3.0;
            input.bond.currentRate = 3.0;
            input.market.simulatedRate = 8.0; // RATES RISE SIGNIFICANTLY

            const output = runSimulation(input);

            // When rates rise:
            // 1. Bond price falls below strike (100)
            // 2. CALL intrinsic value should be ZERO
            // 3. CALL holder should LOSE money (premium paid)
            expect(output.calculations.simulatedBondPrice).toBeLessThan(100);
            expect(output.calculations.intrinsicValue).toBe(0);
            expect(output.adjustedPnL.profitLoss).toBeLessThan(0);
        });

        it('❌ CALL must NOT have positive intrinsic when bond price < strike', () => {
            const input = createDefaultInput();
            input.warrant.type = 'CALL';
            input.warrant.strike = 100;
            input.market.simulatedRate = 6.0; // High rates = low bond price

            const output = runSimulation(input);

            // Bond price < Strike → CALL intrinsic = 0
            expect(output.calculations.simulatedBondPrice).toBeLessThan(100);
            expect(output.calculations.intrinsicValue).toBe(0);
        });

        it('✅ CALL intrinsic = BondPrice - Strike when ITM', () => {
            const input = createDefaultInput();
            input.warrant.type = 'CALL';
            input.warrant.strike = 100;
            input.market.simulatedRate = 1.0; // Low rates = high bond price

            const output = runSimulation(input);

            // Intrinsic = max(0, S - K)
            const expectedIntrinsic = Math.max(0, output.calculations.simulatedBondPrice - 100);
            expect(output.calculations.intrinsicValue).toBeCloseTo(expectedIntrinsic, 2);
        });
    });

    // ============================================
    // SHORT-TERM BOND SCENARIOS
    // ============================================
    describe('Short-Term Bond Behavior', () => {
        it('2-year bond: price less sensitive to rate changes', () => {
            const shortBond = createDefaultInput();
            shortBond.bond.maturity = 2;
            shortBond.bond.coupon = 3.0;
            shortBond.bond.currentRate = 3.0;
            shortBond.market.simulatedRate = 5.0; // +200bps

            const longBond = createDefaultInput();
            longBond.bond.maturity = 10;
            longBond.bond.coupon = 3.0;
            longBond.bond.currentRate = 3.0;
            longBond.market.simulatedRate = 5.0; // +200bps

            const shortResult = runSimulation(shortBond);
            const longResult = runSimulation(longBond);

            // Both should show price decline, but short bond less affected
            expect(shortResult.calculations.simulatedBondPrice).toBeLessThan(100);
            expect(longResult.calculations.simulatedBondPrice).toBeLessThan(100);
            expect(shortResult.calculations.simulatedBondPrice).toBeGreaterThan(
                longResult.calculations.simulatedBondPrice
            );
        });

        it('1-year bond: minimal price impact from rate changes', () => {
            const input = createDefaultInput();
            input.bond.maturity = 1;
            input.bond.coupon = 3.0;
            input.bond.currentRate = 3.0;
            input.market.simulatedRate = 6.0; // +300bps shock

            const output = runSimulation(input);

            // 1-year bond should be close to par despite rate change
            // Because it's about to mature, duration is low
            expect(output.calculations.simulatedBondPrice).toBeGreaterThan(95);
            expect(output.calculations.simulatedBondPrice).toBeLessThan(100);
        });

        it('PUT on short-term bond: limited profit potential', () => {
            const input = createDefaultInput();
            input.warrant.type = 'PUT';
            input.warrant.strike = 100;
            input.bond.maturity = 2;
            input.market.simulatedRate = 8.0; // +500bps crisis

            const output = runSimulation(input);

            // Short bond = less price decline = less PUT profit
            // Intrinsic value should be modest even with big rate move
            expect(output.calculations.intrinsicValue).toBeLessThan(10);
        });

        it('PUT on long-term bond: amplified profit potential', () => {
            const input = createDefaultInput();
            input.warrant.type = 'PUT';
            input.warrant.strike = 100;
            input.bond.maturity = 20;
            input.market.simulatedRate = 8.0; // +500bps crisis

            const output = runSimulation(input);

            // Long bond = more price decline = more PUT profit
            expect(output.calculations.intrinsicValue).toBeGreaterThan(30);
        });
    });

    // ============================================
    // RATE DIRECTION CONSISTENCY
    // Tests verify relative value changes, not absolute profit (which depends on premium)
    // ============================================
    describe('Rate Direction Consistency', () => {
        it('Higher simulated rate → higher PUT intrinsic value', () => {
            const lowRate = createDefaultInput();
            lowRate.warrant.type = 'PUT';
            lowRate.warrant.strike = 100;
            lowRate.market.simulatedRate = 3.0;

            const highRate = createDefaultInput();
            highRate.warrant.type = 'PUT';
            highRate.warrant.strike = 100;
            highRate.market.simulatedRate = 7.0;

            const lowResult = runSimulation(lowRate);
            const highResult = runSimulation(highRate);

            // Higher rate = lower bond price = PUT gains value
            expect(highResult.calculations.intrinsicValue).toBeGreaterThan(
                lowResult.calculations.intrinsicValue
            );
        });

        it('Lower simulated rate → higher CALL intrinsic value', () => {
            const highRate = createDefaultInput();
            highRate.warrant.type = 'CALL';
            highRate.warrant.strike = 100;
            highRate.market.simulatedRate = 5.0;

            const lowRate = createDefaultInput();
            lowRate.warrant.type = 'CALL';
            lowRate.warrant.strike = 100;
            lowRate.market.simulatedRate = 1.0;

            const highResult = runSimulation(highRate);
            const lowResult = runSimulation(lowRate);

            // Lower rate = higher bond price = CALL gains value  
            expect(lowResult.calculations.intrinsicValue).toBeGreaterThan(
                highResult.calculations.intrinsicValue
            );
        });

        it('PUT and CALL move in opposite directions', () => {
            const input = createDefaultInput();
            input.warrant.strike = 100;

            // Scenario 1: Rates up (bond price down)
            input.market.simulatedRate = 6.0;
            input.warrant.type = 'PUT';
            const putUp = runSimulation(input);
            input.warrant.type = 'CALL';
            const callUp = runSimulation(input);

            // Scenario 2: Rates down (bond price up)
            input.market.simulatedRate = 1.5;
            input.warrant.type = 'PUT';
            const putDown = runSimulation(input);
            input.warrant.type = 'CALL';
            const callDown = runSimulation(input);

            // When rates rise: PUT gains, CALL loses
            expect(putUp.calculations.intrinsicValue).toBeGreaterThan(putDown.calculations.intrinsicValue);
            expect(callDown.calculations.intrinsicValue).toBeGreaterThan(callUp.calculations.intrinsicValue);
        });
    });


    // ============================================
    // BOND PRICE BOUNDS
    // ============================================
    describe('Bond Price Sanity Bounds', () => {
        it('bond price should never be negative', () => {
            const scenarios = [
                { coupon: 0, rate: 20 },
                { coupon: 1, rate: 15 },
                { coupon: 5, rate: 25 },
            ];

            scenarios.forEach(({ coupon, rate }) => {
                const input = createDefaultInput();
                input.bond.coupon = coupon;
                input.market.simulatedRate = rate;

                const output = runSimulation(input);
                expect(output.calculations.simulatedBondPrice).toBeGreaterThan(0);
            });
        });

        it('zero-coupon bond price should equal discounted face value', () => {
            const input = createDefaultInput();
            input.bond.coupon = 0; // Zero coupon
            input.bond.faceValue = 100;
            input.bond.maturity = 10;
            input.bond.currentRate = 5.0;

            const output = runSimulation(input);

            // PV = FV / (1+r)^n = 100 / 1.05^10 ≈ 61.39
            expect(output.calculations.currentBondPrice).toBeCloseTo(61.39, 0);
        });
    });

    // ============================================
    // WARRANT VALUE BOUNDS
    // ============================================
    describe('Warrant Value Sanity Bounds', () => {
        it('warrant value should never be negative', () => {
            const input = createDefaultInput();
            const output = runSimulation(input);

            expect(output.calculations.currentWarrantValue).toBeGreaterThanOrEqual(0);
            expect(output.calculations.simulatedWarrantValue).toBeGreaterThanOrEqual(0);
        });

        it('OTM option should still have time value', () => {
            const input = createDefaultInput();
            input.warrant.type = 'PUT';
            input.warrant.strike = 100;
            input.market.simulatedRate = 1.0; // OTM (bond price > strike)
            input.warrant.expiry = 1.0; // 1 year remaining

            const output = runSimulation(input);

            // Even OTM, there should be some time value
            expect(output.calculations.simulatedWarrantValue).toBeGreaterThan(0);
        });
    });
});

// ============================================
// MATHEMATICAL VALIDATION TESTS
// Ensures Black-Scholes and bond math are correct
// ============================================
describe('runSimulation - Mathematical Validation', () => {
    // ============================================
    // GREEKS MATHEMATICAL BOUNDS
    // ============================================
    describe('Greeks Mathematical Properties', () => {
        it('CALL delta should be in [0, 1]', () => {
            const scenarios = [
                { strike: 80, vol: 0.1 },  // Deep ITM
                { strike: 100, vol: 0.2 }, // ATM
                { strike: 120, vol: 0.3 }, // OTM
            ];

            scenarios.forEach(({ strike, vol }) => {
                const input = createDefaultInput();
                input.warrant.type = 'CALL';
                input.warrant.strike = strike;
                input.warrant.volatility = vol;

                const output = runSimulation(input);

                expect(output.greeks.delta).toBeGreaterThanOrEqual(0);
                expect(output.greeks.delta).toBeLessThanOrEqual(1);
            });
        });

        it('PUT delta should be in [-1, 0]', () => {
            const scenarios = [
                { strike: 80, vol: 0.1 },
                { strike: 100, vol: 0.2 },
                { strike: 120, vol: 0.3 },
            ];

            scenarios.forEach(({ strike, vol }) => {
                const input = createDefaultInput();
                input.warrant.type = 'PUT';
                input.warrant.strike = strike;
                input.warrant.volatility = vol;

                const output = runSimulation(input);

                expect(output.greeks.delta).toBeGreaterThanOrEqual(-1);
                expect(output.greeks.delta).toBeLessThanOrEqual(0);
            });
        });

        it('gamma should be highest for ATM options', () => {
            const itm = createDefaultInput();
            itm.warrant.type = 'CALL';
            itm.warrant.strike = 80; // Deep ITM

            const atm = createDefaultInput();
            atm.warrant.type = 'CALL';
            atm.warrant.strike = 96; // ~ATM (current bond price ~96)

            const otm = createDefaultInput();
            otm.warrant.type = 'CALL';
            otm.warrant.strike = 120; // OTM

            const itmResult = runSimulation(itm);
            const atmResult = runSimulation(atm);
            const otmResult = runSimulation(otm);

            // ATM has highest gamma
            expect(atmResult.greeks.gamma).toBeGreaterThan(itmResult.greeks.gamma);
            expect(atmResult.greeks.gamma).toBeGreaterThan(otmResult.greeks.gamma);
        });

        it('vega should be positive (more vol = more value)', () => {
            const input = createDefaultInput();
            const output = runSimulation(input);

            expect(output.greeks.vega).toBeGreaterThan(0);
        });
    });

    // ============================================
    // TIME DECAY CURVE SHAPE
    // ============================================
    describe('Time Decay Properties', () => {
        it('theta decay accelerates near expiry', () => {
            const day0 = createDefaultInput();
            day0.warrant.expiry = 1;
            day0.time.elapsedDays = 0;

            const day300 = createDefaultInput();
            day300.warrant.expiry = 1;
            day300.time.elapsedDays = 300; // Near expiry

            const result0 = runSimulation(day0);
            const result300 = runSimulation(day300);

            // Theta magnitude should be larger near expiry
            expect(Math.abs(result300.theta)).toBeGreaterThan(Math.abs(result0.theta));
        });

        it('time value should decrease monotonically', () => {
            const days = [0, 60, 120, 180, 240, 300];
            const values: number[] = [];

            days.forEach(d => {
                const input = createDefaultInput();
                input.time.elapsedDays = d;
                const output = runSimulation(input);
                values.push(output.calculations.currentWarrantValue);
            });

            // Each subsequent value should be <= previous
            for (let i = 1; i < values.length; i++) {
                expect(values[i]).toBeLessThanOrEqual(values[i - 1]);
            }
        });
    });

    // ============================================
    // PUT-CALL PARITY (Approximate)
    // ============================================
    describe('Put-Call Parity', () => {
        it('C - P ≈ S - K*e^(-rT) (within tolerance)', () => {
            const input = createDefaultInput();
            input.warrant.strike = 100;
            input.warrant.expiry = 1;
            input.market.riskFreeRate = 3.0;

            // Get CALL value
            input.warrant.type = 'CALL';
            const callOutput = runSimulation(input);
            const C = callOutput.calculations.currentWarrantValue;

            // Get PUT value
            input.warrant.type = 'PUT';
            const putOutput = runSimulation(input);
            const P = putOutput.calculations.currentWarrantValue;

            const S = callOutput.calculations.currentBondPrice;
            const K = 100;
            const r = 0.03;
            const T = 1;

            // C - P = S - K*e^(-rT)
            const expected = S - K * Math.exp(-r * T);
            const actual = C - P;

            // Should be within 0.5 (small tolerance for calculation differences)
            expect(actual).toBeCloseTo(expected, 0);
        });
    });

    // ============================================
    // DURATION AND PRICE SENSITIVITY
    // ============================================
    describe('Duration Properties', () => {
        it('duration increases with maturity', () => {
            const short = createDefaultInput();
            short.bond.maturity = 2;

            const medium = createDefaultInput();
            medium.bond.maturity = 10;

            const long = createDefaultInput();
            long.bond.maturity = 30;

            const shortResult = runSimulation(short);
            const mediumResult = runSimulation(medium);
            const longResult = runSimulation(long);

            expect(mediumResult.calculations.duration).toBeGreaterThan(shortResult.calculations.duration);
            expect(longResult.calculations.duration).toBeGreaterThan(mediumResult.calculations.duration);
        });

        it('priceChange sign matches rate direction', () => {
            const rateUp = createDefaultInput();
            rateUp.bond.currentRate = 3.0;
            rateUp.market.simulatedRate = 5.0; // +200bps

            const rateDown = createDefaultInput();
            rateDown.bond.currentRate = 5.0;
            rateDown.market.simulatedRate = 3.0; // -200bps

            const upResult = runSimulation(rateUp);
            const downResult = runSimulation(rateDown);

            // Rates up = negative priceChange
            expect(upResult.calculations.priceChange).toBeLessThan(0);
            // Rates down = positive priceChange
            expect(downResult.calculations.priceChange).toBeGreaterThan(0);
        });
    });

    // ============================================
    // VOLATILITY IMPACT
    // ============================================
    describe('Volatility Impact', () => {
        it('higher volatility always increases option value', () => {
            const vols = [0.05, 0.10, 0.20, 0.30, 0.50];
            const values: number[] = [];

            vols.forEach(v => {
                const input = createDefaultInput();
                input.warrant.volatility = v;
                const output = runSimulation(input);
                values.push(output.calculations.currentWarrantValue);
            });

            // Each value should be >= previous
            for (let i = 1; i < values.length; i++) {
                expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]);
            }
        });
    });

    // ============================================
    // REAL-WORLD VALIDATION
    // Compare with known real bond prices
    // ============================================
    describe('Real-World Price Validation', () => {
        it('Spanish 10Y bond at 3% coupon, 4% yield should be ~92', () => {
            const input = createDefaultInput();
            input.bond.coupon = 3.0;
            input.bond.currentRate = 4.0;
            input.bond.maturity = 10;
            input.bond.faceValue = 100;

            const output = runSimulation(input);

            // Real bond pricing: ~91.89
            expect(output.calculations.currentBondPrice).toBeCloseTo(91.89, 0);
        });

        it('German 5Y bond at 1.5% coupon, 2.5% yield should be ~95', () => {
            const input = createDefaultInput();
            input.bond.coupon = 1.5;
            input.bond.currentRate = 2.5;
            input.bond.maturity = 5;
            input.bond.faceValue = 100;

            const output = runSimulation(input);

            // Should be ~95.35
            expect(output.calculations.currentBondPrice).toBeCloseTo(95.35, 0);
        });

        it('US 30Y Treasury at 4% coupon, 5% yield should be ~84.5', () => {
            const input = createDefaultInput();
            input.bond.coupon = 4.0;
            input.bond.currentRate = 5.0;
            input.bond.maturity = 30;
            input.bond.faceValue = 100;

            const output = runSimulation(input);

            // Should be ~84.62
            expect(output.calculations.currentBondPrice).toBeCloseTo(84.62, 0);
        });
    });

    // ============================================
    // STRESS TESTS
    // ============================================
    describe('Stress Tests - Extreme Values', () => {
        it('handles extreme rate shock (500bps up)', () => {
            const input = createDefaultInput();
            input.bond.currentRate = 3.0;
            input.market.simulatedRate = 8.0;
            input.warrant.type = 'PUT';

            const output = runSimulation(input);

            expect(output.calculations.simulatedBondPrice).toBeGreaterThan(0);
            expect(output.calculations.intrinsicValue).toBeGreaterThan(0);
        });

        it('handles very high volatility (80%)', () => {
            const input = createDefaultInput();
            input.warrant.volatility = 0.80;

            const output = runSimulation(input);

            expect(output.calculations.currentWarrantValue).toBeGreaterThan(0);
            expect(output.greeks.vega).toBeGreaterThan(0);
        });

        it('handles very long expiry (5 years)', () => {
            const input = createDefaultInput();
            input.warrant.expiry = 5;

            const output = runSimulation(input);

            expect(output.calculations.currentWarrantValue).toBeGreaterThan(0);
            expect(output.remainingDays).toBe(1825);
        });

        it('handles large position size', () => {
            const input = createDefaultInput();
            input.warrant.quantity = 100000;

            const output = runSimulation(input);

            expect(output.costs.grossInvestment).toBe(25000); // 2.5 * 100000 * 0.1
        });
    });

    // ============================================
    // COST CONSISTENCY
    // ============================================
    describe('Cost Calculation Consistency', () => {
        it('netInvestment = grossInvestment + totalCosts', () => {
            const input = createDefaultInput();
            const output = runSimulation(input);

            expect(output.costs.netInvestment).toBeCloseTo(
                output.costs.grossInvestment + output.costs.totalCosts,
                2
            );
        });

        it('totalCosts = spreadCost + commission', () => {
            const input = createDefaultInput();
            const output = runSimulation(input);

            expect(output.costs.totalCosts).toBeCloseTo(
                output.costs.spreadCost + output.costs.commission,
                2
            );
        });

        it('PnL accounts for costs correctly', () => {
            const input = createDefaultInput();
            const output = runSimulation(input);

            // adjustedPnL uses netInvestment (with costs)
            const expectedPnL = output.calculations.simulatedPosition - output.costs.netInvestment;
            expect(output.adjustedPnL.profitLoss).toBeCloseTo(expectedPnL, 2);
        });
    });

    // ============================================
    // REGRESSION TESTS
    // Lock in known outputs for default inputs
    // ============================================
    describe('Regression Tests', () => {
        it('default input produces expected output structure', () => {
            const input = createDefaultInput();
            const output = runSimulation(input);

            // Verify all expected properties exist
            expect(output.calculations).toBeDefined();
            expect(output.costs).toBeDefined();
            expect(output.greeks).toBeDefined();
            expect(output.adjustedPnL).toBeDefined();
            expect(output.theta).toBeDefined();
            expect(output.breakEvenRate).toBeDefined();
            expect(output.timestamp).toBeDefined();
        });

        it('default PUT produces consistent values', () => {
            const input = createDefaultInput();
            const output = runSimulation(input);

            // Lock in approximate expected values
            expect(output.calculations.currentBondPrice).toBeCloseTo(96.26, 0);
            expect(output.greeks.delta).toBeLessThan(0); // PUT delta negative
            expect(output.greeks.gamma).toBeGreaterThan(0);
        });
    });
});

// ============================================
// INTEGRATION TESTS
// Full workflow validation
// ============================================
describe('runSimulation - Integration Tests', () => {
    it('complete workflow: input → simulation → PnL', () => {
        const input = createDefaultInput();
        input.warrant.type = 'PUT';
        input.warrant.premium = 3.0;
        input.warrant.quantity = 500;
        input.warrant.ratio = 0.1;
        input.bond.coupon = 2.5;
        input.bond.currentRate = 3.0;
        input.market.simulatedRate = 5.0;

        const output = runSimulation(input);

        // Verify chain of calculations
        // 1. Bond price calculated
        expect(output.calculations.currentBondPrice).toBeDefined();
        expect(output.calculations.simulatedBondPrice).toBeDefined();

        // 2. Warrant value calculated
        expect(output.calculations.currentWarrantValue).toBeDefined();
        expect(output.calculations.simulatedWarrantValue).toBeDefined();

        // 3. Position values calculated
        expect(output.calculations.simulatedPosition).toBeDefined();

        // 4. Costs calculated
        expect(output.costs.grossInvestment).toBe(3.0 * 500 * 0.1);

        // 5. PnL calculated
        expect(output.adjustedPnL.profitLoss).toBeDefined();
        expect(output.adjustedPnL.profitLossPercent).toBeDefined();
    });

    it('all Greeks have consistent signs', () => {
        const input = createDefaultInput();
        input.warrant.type = 'PUT';

        const output = runSimulation(input);

        // PUT: delta < 0, gamma > 0, vega > 0, theta < 0 (typically)
        expect(output.greeks.delta).toBeLessThan(0);
        expect(output.greeks.gamma).toBeGreaterThan(0);
        expect(output.greeks.vega).toBeGreaterThan(0);
    });
});
