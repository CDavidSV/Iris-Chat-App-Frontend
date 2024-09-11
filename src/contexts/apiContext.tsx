import { ReactNode, createContext, useContext, useRef, useState } from "react";
import axios, { AxiosError, AxiosInstance } from "axios";
import UAParser from "ua-parser-js";
import { APIError } from "@/models/interfaces";

interface APIContextType {
    loggedIn: boolean;
    irisPublicAPI: AxiosInstance
    irisAPI: AxiosInstance
    signup(email: string, username: string, password: string): Promise<APIError | null>;
    login(email: string, password: string): Promise<APIError | any | null>;
    logout(): void;
}

export const APIContext = createContext<APIContextType>({
    loggedIn: true,
    irisPublicAPI: axios.create(),
    irisAPI: axios.create(),
    signup: async () => null,
    login: async () => null,
    logout: async () => false
});

interface APISession {
    accessToken: string;
    tokenSetAt: number;
    expiresIn: number;
}

export default function APIProvider({ children }: { children: ReactNode }) {
    const [loggedIn, setLoggedIn] = useState<boolean>(true);
    const apiSession = useRef<APISession | null>(null);

    const irisPublicAPI = axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL,
    });

    const irisAPI = axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL,
    });

    irisAPI.interceptors.request.use(async (config) => {
        if (!apiSession.current) {
            return config;
        }
        
        let token: string = apiSession.current.accessToken;
        
        // Check if token is expired
        if (Date.now() >= apiSession.current.tokenSetAt + apiSession.current.expiresIn) {
            // Refresh token
            try {
                const res = await irisPublicAPI.post("auth/token", {
                    sessionID: "",
                    token: "",
                }, {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                });

                // Handle response and store new tokens

            } catch (err) {
                return config
            }
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

            localStorage.setItem("tokens", JSON.stringify(signupRes.data.tokens));
            localStorage.setItem("user", JSON.stringify(signupRes.data.user));
            localStorage.setItem("s_id", signupRes.data.sessionID);

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
                return err.response?.data.errors as APIError[];
            }
            return err;
        }
    }

    const login = async (email: string, password: string): Promise<AxiosError | any | null> => {
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
            
            localStorage.setItem("tokens", JSON.stringify(loginRes.data.tokens));
            localStorage.setItem("user", JSON.stringify(loginRes.data.user));
            localStorage.setItem("s_id", loginRes.data.sessionID);

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
                return err;
            }
            return err;
        }
    }

    const logout = () => {
    }

    return (
        <APIContext.Provider value={{
            irisPublicAPI,
            irisAPI,
            loggedIn,
            login,
            logout,
            signup
        }}>
            {children}
        </APIContext.Provider>
    );
}

export function useAPI() {
    const { irisPublicAPI, irisAPI } = useContext(APIContext);

    return { irisPublicAPI, irisAPI };
}