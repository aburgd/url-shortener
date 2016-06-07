# url-shortener

[FCC project](https://www.freecodecamp.com/challenges/url-shortener-microservice) using [MongoDB](https://www.mongodb.com/) and [Express.js](http://expressjs.com/) to shorten and store URLs.

Visit or issue a GET request to `/new/url` where `url` is the URL you want shortened. If the provided URL is valid, a "shortened" URL will be provided under the `short_url` key of the JSON response which can be visited to redirect you to the original url.

#### Response format

Valid URL:

```
{
  "original_url": "...",
  "short_url": "..."
}
```

Invalid URL:

```
{
  "error": "Format of provided URL is invalid. Remember to use an http:// or https:// prefix.",
  "provided_url": "..."
}
```
