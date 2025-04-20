# Readme

## Routes


### User Routes

| Route                        | Method | Description                                                         |
| ---------------------------- | ------ | ------------------------------------------------------------------- |
| `/api/v1/users/register`     | POST   | Creates a new user account.                                         |
| `/api/v1/users/login`        | POST   | Authenticates an existing user and generates access/refresh tokens. |
| `/api/v1/users/logout`       | POST   | Invalidates the user's current session/token.                       |
| `/api/v1/users/refreshToken` | POST   | Generates a new access token using a refresh token.                 |


### Url Routes

| Route                              | Method | Description                                      |
| ---------------------------------- | ------ | ------------------------------------------------ |
| `/api/v1/urls/`                    | POST   | Creates a new short url                          |
| `/api/v1/urls/:shortUrl`           | GET    | Redirect to Original Url                         |
| `/api/v1/urls/:shortUrl`           | PATCH  | Update short url                                 |
| `/api/v1/urls/:shortUrl`           | DELETE | Delete short url                                 |
| `/api/v1/urls/password/:shortUrl`  | POST   | For password protected short url verify password |
| `/api/v1/urls/analytics/:shortUrl` | GET    | Get analytics of short url                       |



