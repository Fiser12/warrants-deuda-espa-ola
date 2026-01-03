// Script de pruebas para el simulador
import { runSimulation, createDefaultInput } from './simulator';

console.log('=== PRUEBAS DEL SIMULADOR DE WARRANTS ===\n');

// Test 1: Escenario base PUT - tipos suben
console.log('--- TEST 1: PUT con tipos subiendo (3.5% → 4%) ---');
const test1 = createDefaultInput();
test1.warrant.type = 'PUT';
test1.bond.currentRate = 3.5;
test1.market.simulatedRate = 4.0;
const result1 = runSimulation(test1);
console.log(`Precio bono actual: ${result1.calculations.currentBondPrice.toFixed(2)}€`);
console.log(`Precio bono simulado: ${result1.calculations.simulatedBondPrice.toFixed(2)}€`);
console.log(`Valor warrant actual: ${result1.calculations.currentWarrantValue.toFixed(4)}€`);
console.log(`Valor warrant simulado: ${result1.calculations.simulatedWarrantValue.toFixed(4)}€`);
console.log(`Inversión neta: ${result1.adjustedPnL.totalInvestment.toFixed(2)}€`);
console.log(`P&L: ${result1.adjustedPnL.profitLoss.toFixed(2)}€ (${result1.adjustedPnL.profitLossPercent.toFixed(1)}%)`);
console.log(`Break-even: ${result1.breakEvenRate?.toFixed(2) ?? 'N/A'}%`);
console.log(`Theta: ${result1.theta.toFixed(2)}€/día`);
console.log('');

// Test 2: PUT con tipos bajando MUCHO (debería perder - bono muy por encima de strike)
console.log('--- TEST 2: PUT con tipos bajando mucho (3.5% → 1.5%) ---');
const test2 = createDefaultInput();
test2.warrant.type = 'PUT';
test2.bond.currentRate = 3.5;
test2.market.simulatedRate = 1.5;  // Bajada dramática
const result2 = runSimulation(test2);
console.log(`Precio bono: ${result2.calculations.currentBondPrice.toFixed(2)}€ → ${result2.calculations.simulatedBondPrice.toFixed(2)}€`);
console.log(`P&L: ${result2.adjustedPnL.profitLoss.toFixed(2)}€ (${result2.adjustedPnL.profitLossPercent.toFixed(1)}%)`);
console.log(`Esperado: PÉRDIDA (PUT pierde si precio bono >> strike)`);
console.log(`Resultado: ${result2.adjustedPnL.profitLoss < 0 ? '✅ CORRECTO' : '❌ ERROR - El bono necesita subir más sobre strike'}`);
console.log('');

// Test 3: CALL con tipos bajando (debería ganar)
console.log('--- TEST 3: CALL con tipos bajando (3.5% → 2.5%) ---');
const test3 = createDefaultInput();
test3.warrant.type = 'CALL';
test3.bond.currentRate = 3.5;
test3.market.simulatedRate = 2.5;
const result3 = runSimulation(test3);
console.log(`Precio bono: ${result3.calculations.currentBondPrice.toFixed(2)}€ → ${result3.calculations.simulatedBondPrice.toFixed(2)}€`);
console.log(`P&L: ${result3.adjustedPnL.profitLoss.toFixed(2)}€ (${result3.adjustedPnL.profitLossPercent.toFixed(1)}%)`);
console.log(`Esperado: BENEFICIO (CALL gana si precio sube = tipos bajan)`);
console.log(`Resultado: ${result3.adjustedPnL.profitLoss > 0 ? '✅ CORRECTO' : '❌ ERROR'}`);
console.log('');

// Test 4: CALL con tipos subiendo (debería perder)
console.log('--- TEST 4: CALL con tipos subiendo (3.5% → 5%) ---');
const test4 = createDefaultInput();
test4.warrant.type = 'CALL';
test4.bond.currentRate = 3.5;
test4.market.simulatedRate = 5.0;
const result4 = runSimulation(test4);
console.log(`Precio bono: ${result4.calculations.currentBondPrice.toFixed(2)}€ → ${result4.calculations.simulatedBondPrice.toFixed(2)}€`);
console.log(`P&L: ${result4.adjustedPnL.profitLoss.toFixed(2)}€ (${result4.adjustedPnL.profitLossPercent.toFixed(1)}%)`);
console.log(`Esperado: PÉRDIDA (CALL pierde si tipos suben)`);
console.log(`Resultado: ${result4.adjustedPnL.profitLoss < 0 ? '✅ CORRECTO' : '❌ ERROR'}`);
console.log('');

// Test 5: Efecto del tiempo transcurrido
console.log('--- TEST 5: Efecto del tiempo (0 días vs 180 días) ---');
const test5a = createDefaultInput();
test5a.time.elapsedDays = 0;
const result5a = runSimulation(test5a);

const test5b = createDefaultInput();
test5b.time.elapsedDays = 180;
const result5b = runSimulation(test5b);

console.log(`Días 0: Valor warrant = ${result5a.calculations.simulatedWarrantValue.toFixed(4)}€`);
console.log(`Días 180: Valor warrant = ${result5b.calculations.simulatedWarrantValue.toFixed(4)}€`);
console.log(`Esperado: Valor MENOR con más tiempo transcurrido (time decay)`);
console.log(`Resultado: ${result5b.calculations.simulatedWarrantValue < result5a.calculations.simulatedWarrantValue ? '✅ CORRECTO' : '❌ ERROR'}`);
console.log('');

// Test 6: Costes
console.log('--- TEST 6: Impacto de costes ---');
const test6a = createDefaultInput();
test6a.costs = { spreadPercent: 0, commissionPercent: 0, commissionFixed: 0 };
const result6a = runSimulation(test6a);

const test6b = createDefaultInput();
test6b.costs = { spreadPercent: 5, commissionPercent: 0.25, commissionFixed: 10 };
const result6b = runSimulation(test6b);

console.log(`Sin costes: Inversión = ${result6a.adjustedPnL.totalInvestment.toFixed(2)}€`);
console.log(`Con costes: Inversión = ${result6b.adjustedPnL.totalInvestment.toFixed(2)}€`);
console.log(`Diferencia: ${(result6b.adjustedPnL.totalInvestment - result6a.adjustedPnL.totalInvestment).toFixed(2)}€`);
console.log(`Esperado: Mayor inversión con costes`);
console.log(`Resultado: ${result6b.adjustedPnL.totalInvestment > result6a.adjustedPnL.totalInvestment ? '✅ CORRECTO' : '❌ ERROR'}`);
console.log('');

// Test 7: Verificar relación tipos-precio del bono
console.log('--- TEST 7: Relación inversa tipos-precio ---');
const bondPrices = [2, 3, 4, 5, 6].map(rate => {
    const t = createDefaultInput();
    t.bond.currentRate = rate;
    t.market.simulatedRate = rate;
    const r = runSimulation(t);
    return { rate, price: r.calculations.currentBondPrice };
});
console.log('Tipo → Precio bono:');
bondPrices.forEach(p => console.log(`  ${p.rate}% → ${p.price.toFixed(2)}€`));
const isInverse = bondPrices.every((p, i) => i === 0 || p.price < bondPrices[i - 1].price);
console.log(`Esperado: Precios DECRECIENTES al subir tipos`);
console.log(`Resultado: ${isInverse ? '✅ CORRECTO' : '❌ ERROR'}`);
console.log('');

// Test 8: Volatilidad más alta = warrant más caro
console.log('--- TEST 8: Volatilidad afecta precio ---');
const test8a = createDefaultInput();
test8a.warrant.volatility = 0.10;
const result8a = runSimulation(test8a);

const test8b = createDefaultInput();
test8b.warrant.volatility = 0.30;
const result8b = runSimulation(test8b);

console.log(`Vol 10%: Valor warrant = ${result8a.calculations.currentWarrantValue.toFixed(4)}€`);
console.log(`Vol 30%: Valor warrant = ${result8b.calculations.currentWarrantValue.toFixed(4)}€`);
console.log(`Esperado: Mayor valor con mayor volatilidad`);
console.log(`Resultado: ${result8b.calculations.currentWarrantValue > result8a.calculations.currentWarrantValue ? '✅ CORRECTO' : '❌ ERROR'}`);
console.log('');

console.log('=== FIN DE PRUEBAS ===');
