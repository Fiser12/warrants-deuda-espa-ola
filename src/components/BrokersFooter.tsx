export const BrokersFooter = () => {
    return (
        <footer className="mt-8 p-5 rounded-xl bg-slate-800/50 border border-slate-600/20">
            <h4 className="m-0 mb-3 text-[13px] text-slate-400">🏦 BROKERS CON WARRANTS SOBRE DEUDA ESPAÑOLA</h4>
            <div className="flex gap-6 flex-wrap text-xs text-slate-500">
                <div><strong className="text-blue-400">Andbank</strong> · Warrants Société Générale</div>
                <div><strong className="text-blue-400">Renta 4</strong> · Amplio catálogo warrants</div>
                <div><strong className="text-blue-400">BBVA Trader</strong> · Warrants BBVA</div>
                <div><strong className="text-blue-400">Bankinter</strong> · Derivados y warrants</div>
                <div><strong className="text-blue-400">Interactive Brokers</strong> · Opciones sobre futuros de bonos</div>
            </div>
            <p className="mt-4 text-[11px] text-slate-600 leading-relaxed">
                ⚠️ <strong>Aviso:</strong> Los warrants son productos complejos de alto riesgo. Puedes perder toda tu inversión.
                Este simulador es solo educativo y no constituye asesoramiento financiero. Consulta con un profesional antes de invertir.
            </p>
        </footer>
    );
};
