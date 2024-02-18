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
import { PublicConnection } from './public-connection';
import AsyncStorage from "@react-native-async-storage/async-storage";

function tryAndDefault<T>(exec: () => T, defaultValue: T) {
  try {
    return exec();
  } catch (e) {
    console.error('Error occurred: ', e);
    return defaultValue;
  }
}

export type ConnectionType = AxiosInstance & {
  login: <T = any>(accessToken: string, refreshToken: string) => Promise<T>;
  logout: () => Promise<void>;
};

export type ConnectionData = {
  axiosInstance: ConnectionType;
  user?: any | null | undefined;
};

export const Connection = React.createContext<ConnectionData>({} as any);

type ConnectionProviderProps = {
  baseUrl: string;
  getSession: () => Promise<string | null>;
  setSession: (session: string | null) => Promise<void>;
};
export const ConnectionProvider: FC<
  PropsWithChildren<ConnectionProviderProps>
> = (props) => {
  const accessTokenRef = useRef<string | undefined>(undefined);
  const [user, setUser] = useState<any | null | undefined>(undefined);
  AsyncStorage.getItem('@auth-session').then(val => console.log('SESSION', val)).catch(reason => console.log('SESSION ERROR', reason));

  // useEffect(() => {
  //   accessTokenRef.current = cookies.accessToken;
  //   const u: any = cookies.refreshToken
  //     ? JwtDecode(cookies.refreshToken)
  //     : null;
  //   if (JSON.stringify(u?.user) !== JSON.stringify(user)) {
  //     setUser(u?.user ?? null);
  //   }
  // }, [cookies.accessToken, cookies.refreshToken, user]);

  useEffect(() => {
    const handler = async () => {
      const value = await props.getSession();
      if (value) {
        const tokens = JSON.parse(value);
        const refreshDecoded: any = JwtDecode(tokens.refreshToken);
        accessTokenRef.current = tokens.accessToken;
        setUser(refreshDecoded.user)
      }
    };
    handler().then();
  }, []);

  const axiosInstance = useMemo(() => {
    const axiosPublic = PublicConnection.init(props.baseUrl);
    const axiosPrivate = PublicConnection.init(props.baseUrl);

    const setTokens = async (accessToken: string, refreshToken: string) => {
      const refreshDecoded: any = JwtDecode(refreshToken);
      const accessDecoded: any = JwtDecode(accessToken);
      accessTokenRef.current = accessToken;
      const user: any = refreshDecoded.user;
      setUser(user);
      console.log('USER', refreshDecoded, user);
      await props.setSession(JSON.stringify({accessToken, refreshToken}));
      return user;
    };

    const refreshTokenFn = async () => {
      const value = await props.getSession();
      if (!value) {
        return undefined;
      }
      const currentRefreshToken = JSON.parse(value).refreshToken;
      try {
        const response = await axiosPublic.post('/auth/refresh-token', {
          refreshToken: currentRefreshToken,
        });

        const { refreshToken, accessToken } = response.data;

        if (!accessToken) {
          await props.setSession(null);
          accessTokenRef.current = undefined;
          return { refreshToken, accessToken };
        }

        setTokens(accessToken, refreshToken);

        return { refreshToken, accessToken };
      } catch (error) {
        await props.setSession(null);
        return { refreshToken: undefined, accessToken: undefined };
      }
    };

    const maxAge = 10000;

    const memoizedRefreshToken = mem(refreshTokenFn, {
      maxAge,
    });

    axiosPrivate.interceptors.request.use(
      async (config) => {
        let accessToken = accessTokenRef.current;
        if (!accessToken) {
          const value = await props.getSession();
          if (!value) {
            return config;
          }
          const refreshToken = JSON.parse(value).refreshToken;
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

        if (error?.response?.status === 401 && !config?.sent) {
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
    conn.logout = async () => {
      await props.setSession(null);
      accessTokenRef.current = undefined;
      setUser(undefined);
    };
    return conn;
  }, [
    props.baseUrl,
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
