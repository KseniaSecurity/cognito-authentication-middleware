# cognito-authentication-middleware

It's a middleware for cognito authentication.

It provides a function:

- authentication(awsRegion, cognitoUserPoolId)(req, res, next)

The cognito access token must be provided by request header using authorization or x-access-token field (Bearer).

The authenticated user will be available on request.user field.