/**
 * Simple proxy server for the zenquotes API.
 *
 * This was necessay because the api would not enable CORS unless I paid them a trillion dollars </3
 *
 * There are two routes: /api/quote and /api/quoteofday that simply forward the response of the only
 * two free api endpoints from zenquotes. Fr their API prices are INSANE, $100 for a year...
 */

const express = require("express");
const cors = require("cors");
const os = require("os");
const https = require("https"); 
const fs = require("fs"); 

const app = express();
const PORT = 1984;
const FRONTEND_HOSTS = [
  "http://localhost:5500",
  "https://wisewords.tdesa.dev",
  "http://words-of-wonder.tdesa.dev",
  "http://tdesa.duckdns.org:5500",
];

//API endpoints
const getquotesURL = "https://zenquotes.io/api/quotes";
const quoteofdayURL = "https://zenquotes.io/api/today";

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || FRONTEND_HOSTS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

//logger for incoming requests
app.use((req, res, next) => {
  console.log(`Incoming: ${req.method} ${req.url}`);
  next();
});

/**
 * logger for response to requests
 */
app.use((req, res, next) => {
  res.on("finish", () => {
    console.log(`[${res.statusCode}] ${req.method} ${req.originalUrl} `);
  });
  next();
});

/**
 * Get 'many' quotes proxy route.
 */
app.get("/api/quotes", async (req, res) => {
  try {
    const response = await fetch(getquotesURL);
    const data = await response.json();

    //If server response is not okay, forward error
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    //Only allow cors requests from my frontend host (local host, or my github pages)
    // res.setHeader("Access-Control-Allow-Origin", FRONTEND_HOST);
    res.json(data);
  } catch (error) {
    console.error("Error fetching quote:", error);
    res.status(500).json({ error: "Failed to fetch quote" });
  }
});

/**
 * Get quote of day proxy route
 */
app.get("/api/quoteofday", async (req, res) => {
  try {
    const response = await fetch(quoteofdayURL);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    // res.setHeader("Access-Control-Allow-Origin", FRONTEND_HOST);
    res.json(data);
  } catch (error) {
    console.error("Error fetchinng quote of day", error);
    res.status(500).json({ error: "Failed ot fetch quote of day" });
  }
});


//load certification if running on my server
const hostname = os.hostname();
if (hostname.includes("pi")) {
  const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/tomsapi.duckdns.org/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/tomsapi.duckdns.org/fullchain.pem')
};

https.createServer(options, app).listen(443, ()=>{
  console.log('Proxy server running on port 443 (HTTPS')
})
}
//development server
else{
  app.listen(PORT, "0.0.0.0", () => {
  console.log(`Proxy server running on port ${PORT}`);
});

}
