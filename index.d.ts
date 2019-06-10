import { Request, Response } from 'express'

export interface Request extends Request {
    user: { username: string }
}

export default (awsRegion: string, cognitoUserPoolId: string) => (req: Request, res: Response, next: any) => Void