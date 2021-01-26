import React, { useCallback, useEffect, useRef, useState } from 'react';

import GeoForm, { GetValues } from './components/geo-form/geo-form';

import './App.css';

function App() {
    const [isGeolocationAPI] = useState('geolocation' in navigator);
    const [permission, setPermission] = useState<PermissionState | string>('resolving...');
    const [, rerender] = useState(0);
    const readFormValuesRef = useRef<GetValues>(() => ({}));

    type GeoLocationState = {
        startedAt: Date,
        finishedAt?: Date,
        options: PositionOptions,
        position?: GeolocationPosition,
        error?: GeolocationPositionError
    };

    const geoStates = useRef<GeoLocationState[]>([]);

    useEffect(() => {
        let permissionStatus: PermissionStatus;
        const permissionListener = function() {
            setPermission(permissionStatus.state);
        };

        if ('permissions' in navigator) {
            navigator.permissions
                .query({
                    name: 'geolocation'
                })
                .then(function(status) {
                    permissionStatus = status;
                    setPermission(permissionStatus.state);
                    permissionStatus.addEventListener('change', permissionListener);
                });
        } else {
            setPermission('permissions API unavailable');
        }

        return () => {
            if (!permissionStatus) {
                return;
            }

            permissionStatus.removeEventListener('change', permissionListener);
        };
    }, []);

    const geolocationSuccess = useCallback((state: GeoLocationState, position: GeolocationPosition) => {
        state.finishedAt = new Date();
        state.position = position;

        rerender(Math.random());
    }, []);

    const geolocationError = useCallback((state: GeoLocationState, error: GeolocationPositionError) => {
        state.finishedAt = new Date();
        state.error = error;

        rerender(Math.random());
    }, []);

    const getCurrentPosition = useCallback(() => {
        const options = readFormValuesRef.current();
        const state: GeoLocationState = { startedAt: new Date(), options: { ...options } };

        geoStates.current.push(state);

        navigator.geolocation.getCurrentPosition(position => {
            geolocationSuccess(state, position);
        }, error => {
            geolocationError(state, error);
        }, options);

        rerender(Math.random());
    }, [geolocationError, geolocationSuccess]);

    const printOptions = useCallback(({ enableHighAccuracy, maximumAge, timeout }: PositionOptions) => ({
        enableHighAccuracy: enableHighAccuracy === undefined ? 'undefined' : enableHighAccuracy,
        maximumAge: maximumAge === undefined ? 'undefined' : maximumAge,
        timeout: timeout === undefined ? 'undefined' : timeout
    }), []);

    const printPosition = useCallback(({ timestamp, coords }: GeolocationPosition): GeolocationPosition => ({
        timestamp,
        coords: {
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: coords.accuracy,
            altitude: coords.altitude,
            altitudeAccuracy: coords.altitudeAccuracy,
            heading: coords.heading,
            speed: coords.speed
        }
    }), []);

    const printError = useCallback(({ code, message, PERMISSION_DENIED, POSITION_UNAVAILABLE, TIMEOUT }: GeolocationPositionError): GeolocationPositionError => ({
        code,
        message,
        PERMISSION_DENIED,
        POSITION_UNAVAILABLE,
        TIMEOUT
    }), []);

    const print = useCallback((json: object) => (
        <pre>{JSON.stringify(json, null, 2)}</pre>
    ), []);

    return (
        <div className="App">
            <GeoForm getValues={readFormValuesRef} className="fix" />

            <div>Geolocation API: {!isGeolocationAPI && 'un'}available</div>
            <div>Geolocation Permission: {permission}</div>

            <ol className="list">{geoStates.current.map((geoState, i) => {
                const isFinished = geoState.finishedAt !== undefined;
                const stateName = isFinished ? 'finished' : 'progress';
                const key = `${i}_${stateName}`;
                const finishedIn = geoState.finishedAt ? geoState.finishedAt.getTime() - geoState.startedAt.getTime() :
                    undefined;

                return (
                    <li key={key} className={`${stateName}`}>
                        Started: {geoState.startedAt.toLocaleTimeString()};
                        Finished: {geoState.finishedAt?.toLocaleTimeString() || 'not yet'}
                        {finishedIn !== undefined && ` in ${finishedIn}ms`};
                        Options: {print(printOptions(geoState.options))}
                        {geoState.error && (<>Error: {print(printError(geoState.error))}</>)}
                        {geoState.position && (<>Position:  {print(printPosition(geoState.position))}</>)}
                    </li>
                );
            })
            }</ol>

            <button onClick={getCurrentPosition}>getCurrentPosition</button>
        </div>
    );
}

export default App;
