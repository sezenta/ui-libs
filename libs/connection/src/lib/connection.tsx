'use client';
import React, {
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import axios, { AxiosInstance } from 'axios';
import JwtDecode from 'jwt-decode';
import mem from 'mem';
import { useCookies } from 'react-cookie';
import { PublicConnection } from './public-connection';

function tryAndDefault<T>(exec: () => T, defaultValue: T) {
  try {
    return exec();
  } catch (e) {
    console.error('Error occurred: ', e);
    return defaultValue;
  }
}

export type ConnectionType = AxiosInstance & {
  login: <T = any>(accessToken: string, refreshToken: string) => T;
  logout: () => void;
};

export type ConnectionData = {
  axiosInstance: ConnectionType;
  user?: any | null | undefined;
};

export const Connection = React.createContext<ConnectionData>({} as any);

type ConnectionProviderProps = {
  baseUrl: string;
  cookieDomain: string;
  refreshToken?: string;
};
export const ConnectionProvider: FC<
  PropsWithChildren<ConnectionProviderProps>
> = (props) => {
  const [cookies, setCookie, removeCookie] = useCookies([
    'accessToken',
    'refreshToken',
  ]);
  const accessTokenRef = useRef(cookies.accessToken);
  const accessTokenExp = useRef(tryAndDefault(() => {
    return cookies.accessToken
      ? (JwtDecode(cookies.accessToken) as any).exp
      : null;
  }, null));
  const [user, setUser] = useState<any | null | undefined>(
    tryAndDefault(() => {
      return props.refreshToken
        ? (JwtDecode(props.refreshToken) as any).user
        : cookies.refreshToken ? (JwtDecode(cookies.refreshToken) as any).user : null;
    }, null),
  );
  useEffect(() => {
    accessTokenRef.current = cookies.accessToken;
    accessTokenExp.current = tryAndDefault(() => {
      return cookies.accessToken
        ? (JwtDecode(cookies.accessToken) as any).exp * 1000
        : null;
    }, null);
    const u: any = cookies.refreshToken
      ? JwtDecode(cookies.refreshToken)
      : null;
    if (JSON.stringify(u?.user) !== JSON.stringify(user)) {
      setUser(u?.user ?? null);
    }
  }, [cookies.accessToken, cookies.refreshToken, user]);

  const axiosInstance = useMemo(() => {
    const axiosPublic = PublicConnection.init(props.baseUrl);
    const axiosPrivate = PublicConnection.init(props.baseUrl);

    const setTokens = (accessToken: string, refreshToken: string) => {
      const refreshDecoded: any = JwtDecode(refreshToken);
      const accessDecoded: any = JwtDecode(accessToken);
      accessTokenRef.current = accessToken;
      accessTokenExp.current = tryAndDefault(() => {
        return accessToken
          ? (JwtDecode(accessToken) as any).exp * 1000
          : null;
      }, null);
      const user: any = refreshDecoded.user;
      setUser(user);
      console.log('USER', refreshDecoded, user);

      setCookie('accessToken', accessToken, {
        path: '/',
        expires: new Date(accessDecoded.exp * 1000),
        domain: props.cookieDomain,
      });
      setCookie('refreshToken', refreshToken, {
        path: '/',
        expires: new Date(refreshDecoded.exp * 1000),
        domain: props.cookieDomain,
      });
      return user;
    };

    const refreshTokenFn = async () => {
      const currentRefreshToken = cookies.refreshToken;
      if (!currentRefreshToken) {
        return undefined;
      }

      try {
        const response = await axiosPublic.post('/auth/refresh-token', {
          refreshToken: currentRefreshToken,
        });

        const { refreshToken, accessToken } = response.data;

        if (!accessToken) {
          removeCookie('accessToken', {
            path: '/',
            domain: props.cookieDomain,
          });
          removeCookie('refreshToken', {
            path: '/',
            domain: props.cookieDomain,
          });
          accessTokenRef.current = undefined;
          accessTokenExp.current = null;
          return { refreshToken, accessToken };
        }

        setTokens(accessToken, refreshToken);

        return { refreshToken, accessToken };
      } catch (error: any) {
        if (error?.response?.status === 401) {
          removeCookie('accessToken', { path: '/', domain: props.cookieDomain });
          removeCookie('refreshToken', { path: '/', domain: props.cookieDomain });
          return { refreshToken: undefined, accessToken: undefined };
        }
        throw error;
      }
    };

    const maxAge = 10000;

    const memoizedRefreshToken = mem(refreshTokenFn, {
      maxAge,
    });

    axiosPrivate.interceptors.request.use(
      async (config) => {
        let accessToken = accessTokenRef.current;
        if (!accessToken || accessTokenExp.current === null || accessTokenExp.current < Date.now() - 60000) {
          const refreshToken = cookies.refreshToken;
          if (!refreshToken) {
            return config;
          }
          const result = await memoizedRefreshToken();
          accessToken = result?.accessToken;
        }

        if (!accessToken) {
          return config;
        }

        config.headers.set('authorization', `Bearer ${accessToken}`);

        return config;
      },
      (error) => Promise.reject(error),
    );

    axiosPrivate.interceptors.response.use(
      (response) => {
        console.log(
          'Received Resp',
          response?.headers,
          response?.headers['x-refresh-token'] === 'true',
        );
        if (response?.headers['x-refresh-token'] === 'true') {
          refreshTokenFn().then();
        }
        return response;
      },
      async (error) => {
        const config = error?.config;

        if (error?.response?.status === 401 && error?.response?.data?.code === 'TOKEN_EXPIRED' && !config?.sent) {
          config.sent = true;

          const result = await memoizedRefreshToken();

          if (result?.accessToken) {
            config.headers = {
              ...config.headers,
              authorization: `Bearer ${result?.accessToken}`,
            };
          }

          return axios(config);
        }
        return Promise.reject(error);
      },
    );

    const conn: ConnectionType = axiosPrivate as any;
    conn.login = setTokens;
    conn.logout = () => {
      removeCookie('accessToken', { path: '/', domain: props.cookieDomain });
      removeCookie('refreshToken', { path: '/', domain: props.cookieDomain });
    };
    return conn;
  }, [
    cookies.refreshToken,
    props.baseUrl,
    props.cookieDomain,
    removeCookie,
    setCookie,
  ]);

  const val = useMemo(() => ({ axiosInstance, user }), [axiosInstance, user]);
  return (
    <Connection.Provider value={val}>{props.children}</Connection.Provider>
  );
};

export const useConnection = () => {
  return useContext(Connection).axiosInstance;
};

export const useUser = <T = any>(): T | undefined => {
  return useContext(Connection).user;
};
