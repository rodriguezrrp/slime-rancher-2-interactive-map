import "./index.css";
import App from "./App.tsx";
import { CurrentMapProvider } from "./CurrentMapContext.tsx";
import { FoundProvider } from "./FoundContext.tsx";
import React from "react";
import ReactDOM from "react-dom/client";
import { UserPinsProvider } from "./components/UserPinsContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <FoundProvider>
            <UserPinsProvider>
                <CurrentMapProvider>
                    <App />
                </CurrentMapProvider>
            </UserPinsProvider>
        </FoundProvider>
    </React.StrictMode>,
);
