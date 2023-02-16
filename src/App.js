import React from "react";
import { TextEditor3 } from "./components/TextEditor3";
import logo from "./images/logo-midpage.png";

function App() {
  const password = "tothemoon";
  const [passwordEntered, setPasswordEntered] = React.useState(false);
  return (
    <div>
      <img src={logo} height={100} width={300} style={{ marginLeft: 15 }} />
      {passwordEntered ? (
        <div style={{ marginLeft: 40, alignContent: "center" }}>
          <TextEditor3 />
        </div>
      ) : (
        <div
          style={{
            alignContent: "center",
            alignItems: "center",
            width: "100%",
            alignSelf: "center",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <h1 style={{ maxWidth: "fit-content" }}>Enter Password</h1>
          <input
            style={{ padding: 10, width: 200, borderRadius: 5 }}
            type="password"
            hidden={false}
            placeholder="where?"
            onChange={(e) => {
              if (e.target.value === password) {
                setPasswordEntered(true);
              }
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
