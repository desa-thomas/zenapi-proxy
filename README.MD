 Simple proxy server for the zenquotes API.
 
 This was necessay because the api would not enable CORS unless I paid them a trillion dollars </3
 
 There are two routes: /api/quote and /api/quoteofday that simply forward the response of the only
 two free api endpoints from zenquotes.

It also caches the quote of the day in memory until it expires.
