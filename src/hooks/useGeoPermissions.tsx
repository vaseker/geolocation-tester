import { useEffect, useState } from 'react';

function useGeoPermissions() {
    const [permission, setPermission] = useState<PermissionState | string>('resolving...');

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

    return { permission };
}

export default useGeoPermissions;
