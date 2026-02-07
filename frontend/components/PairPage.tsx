import React, { useMemo, useState } from "react";
import { signInGoogleAndGetIdToken } from "../services/firebase";
import { confirmPair } from "../services/pairing";

const PairPage: React.FC = () => {
  const [status, setStatus] = useState("Ready");
  const [error, setError] = useState<string | null>(null);

  const pairCode = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("code") || "";
  }, []);

  const onPair = async () => {
    try {
      setError(null);
      setStatus("Signing in with Google…");
      const idToken = await signInGoogleAndGetIdToken();

      setStatus("Confirming pairing…");
      await confirmPair(pairCode, idToken);

      setStatus("Paired ✅ You can close this tab.");
    } catch (e: any) {
      setError(e?.message || String(e));
      setStatus("Failed ❌");
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", fontFamily: "Arial" }}>
      <h2>Pair 0Effort Extension</h2>
      <p>Pair code: <b>{pairCode || "(missing)"}</b></p>

      <button
        onClick={onPair}
        disabled={!pairCode}
        style={{ padding: 10, width: "100%" }}
      >
        Sign in with Google & Pair
      </button>

      <p style={{ marginTop: 12 }}>{status}</p>
      {error && <pre style={{ color: "crimson", whiteSpace: "pre-wrap" }}>{error}</pre>}
    </div>
  );
};

export default PairPage;
