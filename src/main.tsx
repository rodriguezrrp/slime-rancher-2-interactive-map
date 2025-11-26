import "./index.css";
import App from "./App.tsx";
import { CurrentMapProvider } from "./CurrentMapContext.tsx";
import { FoundProvider } from "./FoundContext.tsx";
import React from "react";
import ReactDOM from "react-dom/client";
import { UserPinsProvider } from "./components/UserPinsContext.tsx";
import { UserSelectedPinProvider } from "./components/UserSelectedPinContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <FoundProvider>
            <UserPinsProvider>
                <UserSelectedPinProvider>
                    <CurrentMapProvider>
                        <App />
                    </CurrentMapProvider>
                </UserSelectedPinProvider>
            </UserPinsProvider>
        </FoundProvider>
    </React.StrictMode>,
);
