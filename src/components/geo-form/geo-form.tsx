import React, { FormEvent, MutableRefObject, useCallback, useMemo, useRef } from 'react';

import './geo-form.css';

export type GetValues = () => PositionOptions;

const GeoForm: React.FC<{ getValues: MutableRefObject<GetValues>, className?: string }> = ({ getValues, className }) => {
    const positionOptionsRef = useRef<PositionOptions>({});
    const highAccuracyStates = useMemo<PositionOptions['enableHighAccuracy'][]>(() => [undefined, true, false], []);
    const submitRef = useRef<HTMLInputElement|null>(null);

    const parseBool = useCallback((value?: boolean) => {
        return value === undefined ? '' : value.toString();
    }, []);

    type Field = { name: string, value: any };

    const fieldParser = useCallback(({ name, value }: Field) => {
        switch (name) {
            case 'enableHighAccuracy':
                if (!value) {
                    return undefined;
                }

                return value === 'true';
            case 'maximumAge':
            case 'timeout':
                return value === '' ? undefined : parseInt(value, 10);
            default:
                return null;
        }
    }, []);

    const updateOption = useCallback((field: Field) => {
        const value = fieldParser(field);

        if (value === null) {
            return;
        }

        // @ts-ignore
        positionOptionsRef.current[field.name] = value;
    }, [fieldParser]);

    const onSubmit = useCallback((e: FormEvent) => {
        e.preventDefault();

        const form = Array.prototype.slice.call(e.target);

        form.forEach(updateOption);
    }, [updateOption]);

    const readFormValues = useCallback(() => {
        if (submitRef.current) {
            submitRef.current?.click();
        }

        return positionOptionsRef.current;
    }, []);

    getValues.current = readFormValues;

    return (
        <form onSubmit={onSubmit} className={`geo-form ${className || ''}`}>
            <label>enableHighAccuracy:&nbsp;
                <select name="enableHighAccuracy" defaultValue={parseBool(positionOptionsRef.current.enableHighAccuracy)}>
                    {highAccuracyStates.map(state => {
                        const value = parseBool(state);

                        return <option key={`eha_${value}`} value={value}>{value}</option>
                    })}
                </select>
            </label>
            <label>maximumAge:&nbsp;
                <input type="number" name="maximumAge" defaultValue={positionOptionsRef.current.maximumAge} />
            </label>
            <label>timeout:&nbsp;
                <input type="number" name="timeout" defaultValue={positionOptionsRef.current.timeout} />
            </label>
            <input type="submit" style={{ display: 'none' }} ref={submitRef} />
        </form>
    );
}

export default GeoForm;
