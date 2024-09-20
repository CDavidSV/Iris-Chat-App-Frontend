import { ReactNode, createContext, useContext, useEffect, useRef, useState } from "react";
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import UAParser from "ua-parser-js";
import { APIError, User } from "@/models/interfaces";
import { clearLocalStorage } from "@/util/util.helpers";

interface APIContextType {
    loggedIn: boolean;
    irisPublicAPI: AxiosInstance
    irisAPI: AxiosInstance
    signup(email: string, username: string, password: string): Promise<APIError[] | null>;
    login(email: string, password: string): Promise<APIError[] | any | null>;
    logout(): void;
    user: User | null;
    setUserData: (userData: User) => void;
    clearUserData: () => void;
}

interface APISession {
    accessToken: string;
    tokenSetAt: number;
    expiresIn: number;
}

interface RequestQueueObj {
    resolve: (value: InternalAxiosRequestConfig<any> | PromiseLike<InternalAxiosRequestConfig<any>>) => void
    reject: (reason?: any) => void
    config: InternalAxiosRequestConfig<any>
}

export const APIContext = createContext<APIContextType>({
    loggedIn: true,
    irisPublicAPI: axios.create(),
    irisAPI: axios.create(),
    signup: async () => null,
    login: async () => null,
    logout: async () => false,
    user: null,
    setUserData: () => {},
    clearUserData: () => {}
});

export default function APIProvider({ children }: { children: ReactNode }) {
    const [loggedIn, setLoggedIn] = useState<boolean>(() => {
        return localStorage.getItem("s_id") !== null && localStorage.getItem("r_t") !== null; // Sets the initial value of loggedIn
    });
    const [user, setUser] = useState<User | null>(null);

    const apiSession = useRef<APISession | null>(null);

    const irisPublicAPI = axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL,
    });

    const irisAPI = axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL,
    });

    const queuedRequests: RequestQueueObj[] = [];
    let isRefreshing = false;

    const processQueue = (err: any | null = null) => {
        for (const request of queuedRequests) {
            if (err) {
                request.reject(err)
            }

            if (apiSession.current) {
                request.config.headers["Authorization"] = `Bearer ${apiSession.current.accessToken}`;
            }
            request.resolve(request.config);
        }

        queuedRequests.length = 0;
    }

    const refreshToken = async (sessionID: string, token: string): Promise<boolean> => {
        isRefreshing = true;

        try {
            const res = await irisPublicAPI.post("auth/token", {
                sessionID: sessionID,
                token: token,
            }, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            });

            // Handle response and store new tokens
            localStorage.setItem("r_t", res.data.tokens.refreshToken);

            apiSession.current = {
                accessToken: res.data.tokens.accessToken, // New access token
                tokenSetAt: Date.now(),
                expiresIn: res.data.tokens.expiresIn
            };

            isRefreshing = false;
            processQueue();
        } catch (err) {
            isRefreshing = false;
            
            processQueue(err);
            setLoggedIn(false); 
            clearLocalStorage();
            clearUserData();
            apiSession.current = null;
            
            return false
        }

        return true;
    }

    useEffect(() => {
        const user = localStorage.getItem("user");

        if (!user) {
            return;
        }

        const parsedUser = JSON.parse(user);
        setUserData({
            userID: parsedUser.userID,
            username: parsedUser.username,
            displayName: parsedUser.displayName,
            email: parsedUser.email,
            customStatus: parsedUser.customStatus,
            joinedAt: parsedUser.joinedAt,
            updatedAt: parsedUser.updatedAt,
            profilePictureURL: parsedUser.profilePictureURL
        });

        // refetch user data
        if (!loggedIn) return;

        irisAPI.get("users/me").then((res) => {
            setUserData({
                userID: res.data.userID,
                username: res.data.username,
                displayName: res.data.displayName,
                email: res.data.email,
                customStatus: res.data.customStatus,
                joinedAt: res.data.joinedAt,
                updatedAt: res.data.updatedAt,
                profilePictureURL: res.data.profilePictureURL
            });
        }).catch(err => console.error(err));
    }, []);

    const setUserData = (userData: User) => {
        setUser((user) => ({
            ...user,
            ...userData
        }));

        localStorage.setItem("user", JSON.stringify(userData));
    };

    const clearUserData = () => {
        setUser(null);

        localStorage.removeItem("user");
    }

    irisAPI.interceptors.request.use(async (config) => {
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                queuedRequests.push({ resolve, reject, config });
            });
        }

        // Check if token is expired
        if (!apiSession.current || Date.now() >= apiSession.current.tokenSetAt + apiSession.current.expiresIn) {  
            // Refresh token
            const sessionID = localStorage.getItem("s_id");
            const token = localStorage.getItem("r_t");

            if (!sessionID || !token) {
                setLoggedIn(false);
                clearLocalStorage();
                clearUserData();
                apiSession.current = null;

                return config;
            }

            await refreshToken(sessionID, token);
        }

        if (apiSession.current) {
            config.headers["Authorization"] = `Bearer ${apiSession.current.accessToken}`;
        }
        
        return config;
    });

    const signup = async (email: string, username: string, password: string): Promise<APIError[] | any | null> => {
        let parser = new UAParser(navigator.userAgent);
        
        try {
            const signupRes = await irisPublicAPI.post("auth/signup", {
                email: email,
                username: username,
                password: password,
                platform: parser.getResult().browser.name,
                os: parser.getResult().os.name,
            }, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            });

            localStorage.setItem("r_t", signupRes.data.tokens.refreshToken);
            localStorage.setItem("s_id", signupRes.data.sessionID);
            setUserData(signupRes.data.user);

            apiSession.current = {
                accessToken: signupRes.data.tokens.accessToken,
                tokenSetAt: Date.now(),
                expiresIn: signupRes.data.tokens.expiresIn
            };
            setLoggedIn(true);

            return null;
        } catch (err) {
            console.error(err);
            if (axios.isAxiosError(err)) {
                return err.response?.data.errors as APIError[] || [];
            }
            return err;
        }
    }

    const login = async (email: string, password: string): Promise<AxiosError[] | any | null> => {
        let parser = new UAParser(navigator.userAgent);
        
        try {
            const loginRes = await irisPublicAPI.post("auth/login", {
                username: email,
                password: password,
                platform: parser.getResult().browser.name,
                os: parser.getResult().os.name,
            }, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            });
            
            localStorage.setItem("r_t", loginRes.data.tokens.refreshToken);
            localStorage.setItem("s_id", loginRes.data.sessionID);
            setUserData(loginRes.data.user);

            apiSession.current = {
                accessToken: loginRes.data.tokens.accessToken,
                tokenSetAt: Date.now(),
                expiresIn: loginRes.data.tokens.expiresIn
            };
            setLoggedIn(true);

            return null;
        } catch (err) {
            console.error(err);
            if (axios.isAxiosError(err)) {
                return err.response?.data.errors as APIError[] || [];
            }
            return err;
        }
    }

    const logout = async () => {
        try {
            await irisAPI.post("auth/logout");
        } catch (err) {
            console.error(err);
        }

        setLoggedIn(false);
        clearLocalStorage();
        clearUserData();
        apiSession.current = null;
    }

    return (
        <APIContext.Provider value={{
            irisPublicAPI,
            irisAPI,
            loggedIn,
            user,
            login,
            logout,
            signup,
            clearUserData,
            setUserData
        }}>
            {children}
        </APIContext.Provider>
    );
}

export function useAPI() {
    const { irisPublicAPI, irisAPI } = useContext(APIContext);

    return { irisPublicAPI, irisAPI };
}

export function useAuth() {
    const { loggedIn, login, logout, signup } = useContext(APIContext);

    return { loggedIn, login, logout, signup };
}

export function useUser() {
    const { user, setUserData, clearUserData } = useContext(APIContext);

    return { user, setUserData, clearUserData };
}