import { useEffect, useState } from 'react';

function useNetworkState() {
    const [network, setNetwork] = useState<'offline' | 'online' | string>('resolving...');

    useEffect(() => {
        const setOnline = () => setNetwork('online');
        const setOffline = () => setNetwork('offline');

        if (!('onLine' in navigator)) {
            return;
        }

        navigator.onLine ? setOnline() : setOffline();

        window.addEventListener('online', setOnline);
        window.addEventListener('offline', setOffline);

        return () => {
            window.removeEventListener('online', setOnline);
            window.removeEventListener('offline', setOffline);
        };
    }, []);

    return { network };
}

export default useNetworkState;
