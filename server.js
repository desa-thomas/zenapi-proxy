/**
 * Simple proxy server for the zenquotes API.
 *
 * This was necessay because the api would not enable CORS unless I paid them a trillion dollars </3
 *
 * There are two routes: /api/quote and /api/quoteofday that simply forward the response of the only
 * two free api endpoints from zenquotes. Fr their API prices are INSANE, $100 for a year...
 */

const express = require("express");
const dotenv = require("dotenv");
import cors from 'cors';

//Setup .env for production or development
const envFile =
  process.env.NODE_ENV === "production" ? ".env" : ".env.development";
dotenv.config({ path: envFile });
console.log("Using env file:", envFile);

const app = express();
const PORT = process.env.PORT || 6000;
const FRONTEND_HOST = process.env.FRONTEND_HOST;

//API endpoints
const getquotesURL = "https://zenquotes.io/api/authors";
const quoteofdayURL = "https://zenquotes.io/api/today";

app.use(cors({
  origin: FRONTEND_HOST 
}));

//logger for incoming requests
app.use((req, res, next) => {
  console.log(`Incoming: ${req.method} ${req.url}`);
  next();
});

/**
 * logger for response to requests
 */
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`[${res.statusCode}] ${req.method} ${req.originalUrl}`);
  });
  next();
});

/**
 * Get 'many' quotes proxy route.
 */
app.get("/api/quote", async (req, res) => {
  try {
    const response = await fetch(getquotesURL);
    const data = await response.json();

    //If server response is not okay, forward error
    if (!response.ok) {

      res.status(response.status).json(data);
    }

    //Only allow cors requests from my frontend host (local host, or my github pages)
    res.setHeader("Access-Control-Allow-Origin", FRONTEND_HOST);
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

    if(!response.ok){
        
        res.status(response.status).json(data); 
    }
    res.setHeader("Access-Control-Allow-Origin", FRONTEND_HOST);
    res.json(data); 

  } catch (error) {
    console.error("Error fetchinng quote of day", error);
    res.status(500).json({ error: "Failed ot fetch quote of day" });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
