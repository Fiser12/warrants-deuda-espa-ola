import { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { MarketDataService } from '../lib/marketData';

export type CountryCode = 'us' | 'es' | 'de' | 'eu' | 'fr' | 'it' | 'nl';
export type BenchmarkCode = '3month' | '2year' | '5year' | '10year' | '30year';

export function useMarketDataSync(onRateUpdate: (rate: number) => void) {
    const { apiKey, hasApiKey } = useSettings();
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string | null>(() => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('av_last_sync_date');
    });

    const [selectedBenchmark, setSelectedBenchmark] = useState<BenchmarkCode>('10year');
    const [selectedCountry, setSelectedCountry] = useState<CountryCode>('us');

    const sync = async () => {
        // US requires API Key, others do not
        if (selectedCountry === 'us' && !hasApiKey) {
            alert('Para EEUU (Alpha Vantage) necesitas configurar tu API Key en los ajustes (⚙️). Europa/ECB es gratuito.');
            return;
        }

        setIsLoading(true);
        const service = new MarketDataService(selectedCountry === 'us' ? apiKey : 'skipped');

        try {
            const result = await service.fetchBondYield(selectedBenchmark, selectedCountry);

            onRateUpdate(result.value);

            const dateStr = new Date().toLocaleString();
            const lastUpdatedStr = `${dateStr} (${selectedCountry.toUpperCase()})`;
            setLastUpdated(lastUpdatedStr);
            localStorage.setItem('av_last_sync_date', dateStr);
        } catch (error: any) {
            alert(`Error al sincronizar: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        selectedCountry,
        setSelectedCountry,
        selectedBenchmark,
        setSelectedBenchmark,
        isLoading,
        lastUpdated,
        sync,
        hasApiKey
    };
}
