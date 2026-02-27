import { useState, useEffect, useCallback, useRef } from 'react';

import { getDashboardSummary } from '../services/api';

export const useDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const abortControllerRef = useRef(null);

    const refetch = useCallback(async () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        setLoading(true);
        setError(null);

        try {
            const result = await getDashboardSummary({ signal: abortControllerRef.current.signal });
            setData(result);
        } catch (err) {
            if (err.name !== 'CanceledError' && err.originalError?.name !== 'CanceledError') {
                setError(err);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refetch();

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [refetch]);

    return { data, loading, error, refetch };
};

import { getDistributors } from '../services/api';

export const useDistributors = (params = {}) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const abortControllerRef = useRef(null);

    const refetch = useCallback(async (currentParams = params) => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setLoading(true);
        setError(null);

        try {
            const result = await getDistributors(currentParams, { signal: abortControllerRef.current.signal });
            setData(result);
        } catch (err) {
            if (err.name !== 'CanceledError' && err.originalError?.name !== 'CanceledError') {
                setError(err);
            }
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => {
        refetch();
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [refetch]);

    return { data, loading, error, refetch };
};

import { getDistributorById } from '../services/api';

export const useDistributor = (id) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const abortControllerRef = useRef(null);

    const refetch = useCallback(async () => {
        if (!id) return;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setLoading(true);
        setError(null);

        try {
            const result = await getDistributorById(id, { signal: abortControllerRef.current.signal });
            setData(result);
        } catch (err) {
            if (err.name !== 'CanceledError' && err.originalError?.name !== 'CanceledError') {
                setError(err);
            }
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        refetch();
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [refetch]);

    return { data, loading, error, refetch };
};

import { postCreditRequest } from '../services/api';

export const useCreditEvaluation = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const abortControllerRef = useRef(null);

    const evaluate = useCallback(async (payload) => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setLoading(true);
        setError(null);

        try {
            const result = await postCreditRequest(payload, { signal: abortControllerRef.current.signal });
            setData(result);
            return result;
        } catch (err) {
            if (err.name !== 'CanceledError' && err.originalError?.name !== 'CanceledError') {
                setError(err);
                throw err;
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    return { data, loading, error, evaluate, refetch: evaluate };
};

import { getCreditHistory } from '../services/api';

export const useCreditHistory = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const abortControllerRef = useRef(null);

    const refetch = useCallback(async () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setLoading(true);
        setError(null);

        try {
            const result = await getCreditHistory({ signal: abortControllerRef.current.signal });
            setData(result);
        } catch (err) {
            if (err.name !== 'CanceledError' && err.originalError?.name !== 'CanceledError') {
                setError(err);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refetch();
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [refetch]);

    return { data, loading, error, refetch };
};

import { getRiskAlerts } from '../services/api';
import useAppStore from '../store/useAppStore';

export const useAlerts = () => {
    const { alertsCache, setAlertsCache, isCacheValid } = useAppStore();
    const [loading, setLoading] = useState(!isCacheValid('alerts'));
    const [error, setError] = useState(null);
    const abortControllerRef = useRef(null);

    const refetch = useCallback(async (ignoreCache = false) => {
        if (!ignoreCache && isCacheValid('alerts')) {
            setLoading(false);
            return;
        }

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setLoading(true);
        setError(null);

        try {
            const result = await getRiskAlerts({ signal: abortControllerRef.current.signal });
            setAlertsCache(result);
        } catch (err) {
            if (err.name !== 'CanceledError' && err.originalError?.name !== 'CanceledError') {
                setError(err);
            }
        } finally {
            setLoading(false);
        }
    }, [isCacheValid, setAlertsCache]);

    useEffect(() => {
        refetch();
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [refetch]);

    return { data: alertsCache, loading, error, refetch: () => refetch(true) };
};
