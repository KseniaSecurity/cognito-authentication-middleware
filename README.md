# cognito-authentication-middleware

It's a middleware for cognito authentication based on [cognito-express](https://www.npmjs.com/package/cognito-express).

## How to use

```
import authentication from 'cognito-authentication-middleware'
...
const app = express()
const awsRegion = 'Your AWS region'
const cognitoUserPoolId = 'Your Cognito User Pool Id'
app.use(authentication(awsRegion, cognitoUserPoolId))
```

The authenticated user will be available on request.user field.